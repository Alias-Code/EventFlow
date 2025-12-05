import { NextResponse } from 'next/server';

/**
 * Proxy vers le microservice Payments
 * Route : /api/payments
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004';
    const response = await fetch(`${paymentServiceUrl}/payments`, {
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
      { error: 'Service de paiement indisponible', message: error.message },
      { status: 503 }
    );
  }
}
