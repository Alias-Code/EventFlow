import { NextResponse } from 'next/server';

/**
 * Proxy vers les statistiques de paiements
 * Route : /api/stats/payments
 */
export async function GET(request) {
  try {
    const statsServiceUrl = process.env.STATS_SERVICE_URL || 'http://stats-service:3005';
    
    // Récupérer le token JWT depuis les headers
    const authHeader = request.headers.get('authorization');
    const headers = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${statsServiceUrl}/stats/payments`, { headers });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des stats paiements' },
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

