import { WageSearcher } from '../lib/search';
import type { WageRow, SearchIndex } from '../lib/types';

// Mock fetch for testing
const mockWages: WageRow[] = [
  {
    occupation: 'Software Engineer',
    stats: { 'Gross – Median': 75000, 'Gross – P25': 60000 },
    source: { sheet: 'Sheet1', row: 1 }
  },
  {
    occupation: 'Registered Nurse',
    stats: { 'Gross – Median': 65000, 'Gross – P75': 80000 },
    source: { sheet: 'Sheet1', row: 2 }
  },
  {
    occupation: 'Software Developer',
    stats: { 'Gross – Median': 78000 },
    source: { sheet: 'Sheet1', row: 3 }
  }
];

const mockIndex: SearchIndex[] = [
  {
    occupation: 'Software Engineer',
    tokens: ['software', 'engineer', 'developer', 'programmer'],
    rowIndex: 0
  },
  {
    occupation: 'Registered Nurse',
    tokens: ['registered', 'nurse', 'rn', 'nursing'],
    rowIndex: 1
  },
  {
    occupation: 'Software Developer',
    tokens: ['software', 'developer', 'programmer', 'coder'],
    rowIndex: 2
  }
];

global.fetch = jest.fn();

describe('WageSearcher', () => {
  let searcher: WageSearcher;

  beforeEach(() => {
    searcher = new WageSearcher();
    (fetch as jest.Mock).mockClear();
  });

  it('should find exact matches', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWages
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndex
      });

    const result = await searcher.findExact('Software Engineer');
    expect(result?.occupation).toBe('Software Engineer');
  });

  it('should handle fuzzy search for software engineer variants', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWages
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndex
      });

    const results = await searcher.search('developer');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.item.occupation.includes('Software'))).toBe(true);
  });

  it('should handle nurse variations', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWages
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndex
      });

    const results = await searcher.search('nurse');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.occupation).toBe('Registered Nurse');
  });

  it('should export CSV correctly', async () => {
    const csv = await searcher.exportToCsv([mockWages[0]]);
    expect(csv).toContain('Occupation');
    expect(csv).toContain('Software Engineer');
    expect(csv).toContain('75000');
  });

  it('should handle synonym expansion', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWages
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndex
      });

    const results = await searcher.search('programmer');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return empty results for invalid queries', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWages
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndex
      });

    const results = await searcher.search('');
    expect(results.length).toBe(0);
  });

  it('should limit results correctly', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWages
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndex
      });

    const results = await searcher.search('software', 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it('should get suggestions with correct format', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWages
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndex
      });

    const suggestions = await searcher.getSuggestions('soft');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]).toHaveProperty('occupation');
    expect(suggestions[0]).toHaveProperty('score');
    expect(suggestions[0]).toHaveProperty('rowIndex');
  });
});