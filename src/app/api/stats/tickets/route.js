import { NextResponse } from 'next/server';

/**
 * Proxy vers les statistiques de billets
 * Route : /api/stats/tickets
 */
export async function GET() {
  try {
    const statsServiceUrl = process.env.STATS_SERVICE_URL || 'http://stats-service:3005';
    const response = await fetch(`${statsServiceUrl}/stats/tickets`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des stats billets' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Service de statistiques indisponible', message: error.message },
      { status: 503 }
    );
  }
}

