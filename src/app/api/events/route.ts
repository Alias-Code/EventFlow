import { NextResponse, NextRequest } from 'next/server';

/**
 * Proxy vers le microservice Events
 * Route : /api/events
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:3002';
    const url = queryString ? `${eventServiceUrl}/events?${queryString}` : `${eventServiceUrl}/events`;
    
    const response = await fetch(url);
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
    
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:3002';
    const response = await fetch(`${eventServiceUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
