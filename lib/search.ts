import Fuse from 'fuse.js';
import type { WageRow, SearchIndex, SearchResult, SearchSuggestion, MultiYearWageData, WageGrowthStats, WageTrendPoint } from './types';

export class WageSearcher {
  private wages: WageRow[] = [];
  private index: SearchIndex[] = [];
  private fuse: Fuse<SearchIndex> | null = null;
  private synonyms: Record<string, string[]> = {};
  private isLoaded = false;

  constructor() {
    this.synonyms = {
      'software engineer': ['developer', 'programmer', 'software developer', 'coder'],
      'developer': ['software engineer', 'programmer', 'software developer'],
      'salesperson': ['sales associate', 'sales representative', 'sales rep'],
      'sales associate': ['salesperson', 'sales representative', 'sales rep'],
      'nurse': ['registered nurse', 'nursing professional', 'rn'],
      'teacher': ['educator', 'instructor', 'professor'],
      'manager': ['supervisor', 'team lead', 'team leader'],
      'analyst': ['data analyst', 'business analyst', 'research analyst'],
      'consultant': ['advisor', 'specialist', 'expert'],
      'technician': ['tech', 'specialist', 'support specialist']
    };
  }

  async loadData(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const [wagesResponse, indexResponse] = await Promise.all([
        fetch('/data/wages.json'),
        fetch('/data/index.json')
      ]);

      if (!wagesResponse.ok || !indexResponse.ok) {
        throw new Error('Failed to load search data');
      }

      this.wages = await wagesResponse.json();
      this.index = await indexResponse.json();

      this.fuse = new Fuse(this.index, {
        keys: [
          { name: 'occupation', weight: 0.7 },
          { name: 'tokens', weight: 0.3 }
        ],
        threshold: 0.4,
        distance: 100,
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 2
      });

      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load search data:', error);
      throw error;
    }
  }

  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  private expandQuery(query: string): string[] {
    const normalized = this.normalizeQuery(query);
    const queries = [normalized];
    
    for (const [key, values] of Object.entries(this.synonyms)) {
      if (normalized.includes(key.toLowerCase())) {
        values.forEach(synonym => {
          queries.push(normalized.replace(key.toLowerCase(), synonym.toLowerCase()));
        });
      }
      
      values.forEach(value => {
        if (normalized.includes(value.toLowerCase())) {
          queries.push(normalized.replace(value.toLowerCase(), key.toLowerCase()));
        }
      });
    }
    
    return Array.from(new Set(queries));
  }

  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    await this.loadData();
    
    if (!this.fuse || !query.trim()) {
      return [];
    }

    const expandedQueries = this.expandQuery(query);
    const allResults = new Map<number, SearchResult>();

    for (const expandedQuery of expandedQueries) {
      const results = this.fuse.search(expandedQuery, { limit: limit * 2 });
      
      results.forEach(result => {
        const rowIndex = result.item.rowIndex;
        const score = result.score || 0;
        
        if (!allResults.has(rowIndex) || (allResults.get(rowIndex)?.score || 1) > score) {
          allResults.set(rowIndex, {
            item: this.wages[rowIndex],
            score
          });
        }
      });
    }

    return Array.from(allResults.values())
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }

  async getSuggestions(query: string, limit: number = 8): Promise<SearchSuggestion[]> {
    await this.loadData();
    
    if (!this.fuse || query.trim().length < 2) {
      return [];
    }

    // Get more results to account for multiple years, then deduplicate
    const results = await this.search(query, limit * 4);
    
    // Group by normalized occupation name to remove duplicates
    const occupationMap = new Map<string, { bestResult: SearchResult; rowIndex: number }>();
    
    results.forEach(result => {
      const normalizedOccupation = result.item.occupation
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const currentRowIndex = this.wages.indexOf(result.item);
      
      if (!occupationMap.has(normalizedOccupation) || 
          result.score < occupationMap.get(normalizedOccupation)!.bestResult.score) {
        // Keep the result with the best (lowest) score, or prioritize most recent year if scores are equal
        const existing = occupationMap.get(normalizedOccupation);
        if (!existing || result.score < existing.bestResult.score || 
            (result.score === existing.bestResult.score && result.item.year > existing.bestResult.item.year)) {
          occupationMap.set(normalizedOccupation, {
            bestResult: result,
            rowIndex: currentRowIndex
          });
        }
      }
    });
    
    // Convert back to SearchSuggestion array and sort by score
    return Array.from(occupationMap.values())
      .sort((a, b) => a.bestResult.score - b.bestResult.score)
      .slice(0, limit)
      .map(({ bestResult, rowIndex }) => ({
        occupation: bestResult.item.occupation,
        score: bestResult.score,
        rowIndex
      }));
  }

  async findExact(occupation: string): Promise<WageRow | null> {
    await this.loadData();
    
    const normalized = this.normalizeQuery(occupation);
    const found = this.wages.find(wage => 
      this.normalizeQuery(wage.occupation) === normalized
    );
    
    return found || null;
  }

  getWageByIndex(index: number): WageRow | null {
    if (index >= 0 && index < this.wages.length) {
      return this.wages[index];
    }
    return null;
  }

  async searchMultiYear(query: string, limit: number = 10): Promise<MultiYearWageData[]> {
    await this.loadData();
    
    if (!this.fuse || !query.trim()) {
      return [];
    }

    // Get search results - increase limit to ensure we get all years for each occupation
    const searchResults = await this.search(query, limit * 8); // Get more results to account for multiple years
    
    // Group by occupation with more flexible matching
    const occupationMap = new Map<string, MultiYearWageData>();
    
    searchResults.forEach(result => {
      const wage = result.item;
      // More aggressive normalization for grouping
      const normalizedOccupation = wage.occupation
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      if (!occupationMap.has(normalizedOccupation)) {
        occupationMap.set(normalizedOccupation, {
          occupation: wage.occupation, // Keep original occupation name for display
          group: wage.group,
          yearlyData: []
        });
      }
      
      const multiYearData = occupationMap.get(normalizedOccupation)!;
      multiYearData.yearlyData.push({
        year: wage.year,
        stats: wage.stats,
        source: wage.source
      });
    });
    
    // Sort yearly data by year and limit results
    const results = Array.from(occupationMap.values())
      .map(data => ({
        ...data,
        yearlyData: data.yearlyData.sort((a, b) => a.year - b.year)
      }))
      .sort((a, b) => {
        // Prioritize occupations with more years of data
        if (a.yearlyData.length !== b.yearlyData.length) {
          return b.yearlyData.length - a.yearlyData.length;
        }
        // Then sort by occupation name
        return a.occupation.localeCompare(b.occupation);
      })
      .slice(0, limit);
    
    console.log(`Multi-year search for "${query}": Found ${results.length} occupations`);
    results.forEach(result => {
      console.log(`- ${result.occupation}: ${result.yearlyData.length} years (${result.yearlyData.map(d => d.year).join(', ')})`);
    });
    
    return results;
  }

  calculateWageGrowth(yearlyData: MultiYearWageData['yearlyData']): WageGrowthStats | null {
    if (yearlyData.length < 2) return null;
    
    const medianWages = yearlyData
      .map(data => ({
        year: data.year,
        wage: data.stats['Median  ($)'] || data.stats['Median ($)'] || null
      }))
      .filter(item => item.wage !== null)
      .sort((a, b) => a.year - b.year);
    
    if (medianWages.length < 2) return null;
    
    const firstWage = medianWages[0].wage!;
    const lastWage = medianWages[medianWages.length - 1].wage!;
    const totalChange = lastWage - firstWage;
    const totalChangePercent = (totalChange / firstWage) * 100;
    const years = medianWages[medianWages.length - 1].year - medianWages[0].year;
    const averageAnnualGrowth = years > 0 ? (Math.pow(lastWage / firstWage, 1 / years) - 1) * 100 : 0;
    
    // Find best and worst performing years
    let bestYear = medianWages[0].year;
    let worstYear = medianWages[0].year;
    let maxIncrease = 0;
    let maxDecrease = 0;
    
    for (let i = 1; i < medianWages.length; i++) {
      const prevWage = medianWages[i - 1].wage!;
      const currentWage = medianWages[i].wage!;
      const change = currentWage - prevWage;
      
      if (change > maxIncrease) {
        maxIncrease = change;
        bestYear = medianWages[i].year;
      }
      if (change < maxDecrease) {
        maxDecrease = change;
        worstYear = medianWages[i].year;
      }
    }
    
    return {
      totalChange,
      totalChangePercent,
      averageAnnualGrowth,
      bestYear,
      worstYear
    };
  }

  getWageTrendData(yearlyData: MultiYearWageData['yearlyData']): WageTrendPoint[] {
    return yearlyData
      .map(data => ({
        year: data.year,
        wage: data.stats['Median  ($)'] || data.stats['Median ($)'] || null,
        formattedWage: data.stats['Median  ($)'] || data.stats['Median ($)'] 
          ? `$${(data.stats['Median  ($)'] || data.stats['Median ($)'])?.toLocaleString()}` 
          : 'N/A'
      }))
      .sort((a, b) => a.year - b.year);
  }

  async exportToCsv(wageRows: WageRow[]): Promise<string> {
    if (wageRows.length === 0) return '';

    const allStats = new Set<string>();
    wageRows.forEach(wage => {
      Object.keys(wage.stats).forEach(key => {
        if (key.toLowerCase().includes('gross')) {
          allStats.add(key);
        }
      });
    });

    const headers = ['Occupation', 'Group', ...Array.from(allStats)];
    const csvRows = [headers.join(',')];

    wageRows.forEach(wage => {
      const row = [
        `"${wage.occupation}"`,
        `"${wage.group || ''}"`,
        ...Array.from(allStats).map(stat => {
          const value = wage.stats[stat];
          return value !== null ? value.toString() : '';
        })
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }
}

export const wageSearcher = new WageSearcher();