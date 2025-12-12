import { NextResponse, NextRequest } from 'next/server';

/**
 * Proxy vers le microservice Tickets
 * Route : /api/tickets
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const ticketServiceUrl = process.env.TICKET_SERVICE_URL || 'http://ticket-service:3003';
    const url = queryString ? `${ticketServiceUrl}/tickets?${queryString}` : `${ticketServiceUrl}/tickets`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Service de billetterie indisponible', message: errorMessage },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const ticketServiceUrl = process.env.TICKET_SERVICE_URL || 'http://ticket-service:3003';
    const response = await fetch(`${ticketServiceUrl}/tickets`, {
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
      { error: 'Service de billetterie indisponible', message: errorMessage },
      { status: 503 }
    );
  }
}
