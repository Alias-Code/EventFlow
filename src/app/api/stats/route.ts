import { NextResponse, NextRequest } from 'next/server';

const STATS_SERVICE_URL = process.env.STATS_SERVICE_URL || 'http://stats-service:3005';

/**
 * Proxy vers le microservice Stats
 * Route : /api/stats
 */

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';
    
    const url = path 
      ? `${STATS_SERVICE_URL}/stats/${path}`
      : `${STATS_SERVICE_URL}/stats`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Service de statistiques indisponible', message: errorMessage },
      { status: 503 }
    );
  }
}

