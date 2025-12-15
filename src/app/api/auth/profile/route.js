import { NextResponse } from 'next/server';

/**
 * Proxy vers le microservice Auth
 * Route : /api/auth/profile
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
    const response = await fetch(`${authServiceUrl}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
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
