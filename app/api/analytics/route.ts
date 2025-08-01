import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'search-analytics.json');
const RECENT_SEARCHES_FILE = path.join(process.cwd(), 'data', 'recent-searches.json');

interface SearchAnalytics {
  [query: string]: {
    count: number;
    lastSearched: string;
    firstSearched: string;
  };
}

interface RecentSearch {
  query: string;
  timestamp: string;
  hasResults: boolean;
}

// Load recent searches from file
function loadRecentSearches(): RecentSearch[] {
  try {
    if (fs.existsSync(RECENT_SEARCHES_FILE)) {
      const data = fs.readFileSync(RECENT_SEARCHES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading recent searches:', error);
  }
  return [];
}

// Save recent searches to file
function saveRecentSearches(searches: RecentSearch[]): void {
  try {
    if (!fs.existsSync(path.dirname(RECENT_SEARCHES_FILE))) {
      fs.mkdirSync(path.dirname(RECENT_SEARCHES_FILE), { recursive: true });
    }
    fs.writeFileSync(RECENT_SEARCHES_FILE, JSON.stringify(searches, null, 2));
  } catch (error) {
    console.error('Error saving recent searches:', error);
  }
}

function ensureAnalyticsFile(): SearchAnalytics {
  try {
    if (!fs.existsSync(path.dirname(ANALYTICS_FILE))) {
      fs.mkdirSync(path.dirname(ANALYTICS_FILE), { recursive: true });
    }
    
    if (!fs.existsSync(ANALYTICS_FILE)) {
      const initialData: SearchAnalytics = {};
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    
    const data = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading analytics file:', error);
    return {};
  }
}

function saveAnalytics(data: SearchAnalytics): void {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving analytics:', error);
  }
}

function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b(salary|wage|pay|income)\b/g, '')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { query, hasResults = false } = await request.json();
    
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    const normalizedQuery = normalizeQuery(query);
    if (normalizedQuery.length < 2) {
      return NextResponse.json({ success: true }); // Don't track very short queries
    }

    const analytics = ensureAnalyticsFile();
    const now = new Date().toISOString();

    // Update analytics
    if (analytics[normalizedQuery]) {
      analytics[normalizedQuery].count++;
      analytics[normalizedQuery].lastSearched = now;
    } else {
      analytics[normalizedQuery] = {
        count: 1,
        firstSearched: now,
        lastSearched: now,
      };
    }

    saveAnalytics(analytics);

    // Add to recent searches (keep original query for display)
    const recentSearch: RecentSearch = {
      query: query.trim(),
      timestamp: now,
      hasResults
    };

    let recentSearches = loadRecentSearches();
    recentSearches.unshift(recentSearch); // Add to beginning
    recentSearches = recentSearches.slice(0, 50); // Keep only last 50 searches
    saveRecentSearches(recentSearches);

    // Track in Google Analytics if available
    if (process.env.NEXT_PUBLIC_GA_ID) {
      // This will be handled client-side
    }

    return NextResponse.json({ 
      success: true,
      normalizedQuery,
      hasResults 
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const minCount = parseInt(searchParams.get('minCount') || '1', 10);
    const type = searchParams.get('type') || 'top'; // 'top' or 'recent'

    const analytics = ensureAnalyticsFile();

    if (type === 'recent') {
      // Return recent searches
      const recentLimit = Math.min(limit, 20);
      const recentSearches = loadRecentSearches();
      return NextResponse.json({
        recentSearches: recentSearches.slice(0, recentLimit)
      });
    }
    
    // Get top searches
    const topSearches = Object.entries(analytics)
      .filter(([_, data]) => data.count >= minCount)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, Math.min(limit, 50))
      .map(([query, data]) => ({
        query,
        count: data.count,
        lastSearched: data.lastSearched,
      }));

    // Get some stats
    const totalQueries = Object.keys(analytics).length;
    const totalSearches = Object.values(analytics).reduce((sum, data) => sum + data.count, 0);

    return NextResponse.json({
      topSearches,
      recentSearches: loadRecentSearches().slice(0, 10), // Include recent searches in main response
      stats: {
        totalQueries,
        totalSearches,
        averageSearchesPerQuery: totalQueries > 0 ? Math.round(totalSearches / totalQueries * 100) / 100 : 0,
      }
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}