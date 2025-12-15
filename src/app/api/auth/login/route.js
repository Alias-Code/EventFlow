import { NextResponse } from 'next/server';

/**
 * Proxy vers le microservice Auth
 * Route : /api/auth/login
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
    const response = await fetch(`${authServiceUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Service d\'authentification indisponible', message: error.message },
      { status: 503 }
    );
  }
}
