import { NextRequest, NextResponse } from 'next/server';
import { wageSearcher } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const suggestionsParam = searchParams.get('suggestions');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const isSuggestions = suggestionsParam === 'true';

    if (isSuggestions) {
      const suggestions = await wageSearcher.getSuggestions(query.trim(), Math.min(limit, 20));
      return NextResponse.json({ suggestions });
    } else {
      const results = await wageSearcher.search(query.trim(), Math.min(limit, 50));
      return NextResponse.json({ 
        results: results.map(r => r.item),
        query: query.trim(),
        count: results.length
      });
    }
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 10, suggestions = false } = body;
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (suggestions) {
      const suggestionResults = await wageSearcher.getSuggestions(query.trim(), Math.min(limit, 20));
      return NextResponse.json({ suggestions: suggestionResults });
    } else {
      const results = await wageSearcher.search(query.trim(), Math.min(limit, 50));
      return NextResponse.json({ 
        results: results.map(r => r.item),
        query: query.trim(),
        count: results.length
      });
    }
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}