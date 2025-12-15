import { NextResponse } from 'next/server';

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004';

// GET /api/payments/me - Récupérer mes paiements
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${PAYMENT_SERVICE_URL}/payments/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
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
