import { NextResponse } from 'next/server';

/**
 * Proxy vers les statistiques d'événements
 * Route : /api/stats/events
 */
export async function GET() {
  try {
    const statsServiceUrl = process.env.STATS_SERVICE_URL || 'http://stats-service:3005';
    const response = await fetch(`${statsServiceUrl}/stats/events`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des stats événements' },
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

