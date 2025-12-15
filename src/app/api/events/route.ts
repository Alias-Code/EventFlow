import { NextResponse, NextRequest } from 'next/server';

/**
 * Proxy vers le microservice Events
 * Route : /api/events
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const authHeader = request.headers.get('authorization');
    
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:3002';
    const url = queryString ? `${eventServiceUrl}/events?${queryString}` : `${eventServiceUrl}/events`;
    
    const response = await fetch(url, {
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
      { error: 'Service des événements indisponible', message: errorMessage },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    // Récupérer l'organizerId depuis le token si non fourni
    let organizerId = body.organizerId;
    if (!organizerId && authHeader) {
      try {
        const profileResponse = await fetch(`${process.env.AUTH_SERVICE_URL || 'http://auth-service:3001'}/auth/profile`, {
          headers: { 'Authorization': authHeader },
        });
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          organizerId = profile.id || profile.userId;
        }
      } catch (e) {
        // Ignore profile fetch errors
      }
    }
    
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:3002';
    const response = await fetch(`${eventServiceUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify({ ...body, organizerId: organizerId || 'system' }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Service des événements indisponible', message: errorMessage },
      { status: 503 }
    );
  }
}
