import { NextResponse } from 'next/server';

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004';

// GET /api/payments/ticket/:ticketId - Récupérer les paiements pour un ticket
export async function GET(request, { params }) {
  try {
    const { ticketId } = await params;
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${PAYMENT_SERVICE_URL}/payments/ticket/${ticketId}`, {
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
