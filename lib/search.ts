import Fuse from 'fuse.js';
import type { WageRow, SearchIndex, SearchResult, SearchSuggestion } from './types';

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

    const results = await this.search(query, limit);
    
    return results.map(result => ({
      occupation: result.item.occupation,
      score: result.score,
      rowIndex: this.wages.indexOf(result.item)
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