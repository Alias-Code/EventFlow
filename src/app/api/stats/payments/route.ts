import { NextResponse, NextRequest } from 'next/server';

const STATS_SERVICE_URL = process.env.STATS_SERVICE_URL || 'http://stats-service:3005';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${STATS_SERVICE_URL}/stats/payments`, {
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

