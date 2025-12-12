import { NextResponse } from 'next/server';

/**
 * Proxy vers le microservice Statistiques
 * Route : /api/stats
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const statsServiceUrl = process.env.STATS_SERVICE_URL || 'http://stats-service:3005';
    const url = queryString ? `${statsServiceUrl}/stats?${queryString}` : `${statsServiceUrl}/stats`;

    // Récupérer le token JWT depuis les headers
    const authHeader = request.headers.get('authorization');
    const headers = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, { headers });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Service de statistiques indisponible', message: error.message },
      { status: 503 }
    );
  }
}

