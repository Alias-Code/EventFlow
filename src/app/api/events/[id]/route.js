import { NextResponse } from 'next/server';

/**
 * Proxy vers le microservice Events
 * Route : /api/events/[id]
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:3002';
    const response = await fetch(`${eventServiceUrl}/events/${id}`);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Service des événements indisponible', message: error.message },
      { status: 503 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:3002';
    const response = await fetch(`${eventServiceUrl}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Service des événements indisponible', message: error.message },
      { status: 503 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://event-service:3002';
    const response = await fetch(`${eventServiceUrl}/events/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Service des événements indisponible', message: error.message },
      { status: 503 }
    );
  }
}
