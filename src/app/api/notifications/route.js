import { NextResponse } from 'next/server';

/**
 * Route vide pour le service Notifications (à implémenter)
 * Route : /api/notifications
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'Service de notifications - En cours de développement',
      status: 'NON_IMPLÉMENTÉ',
    },
    { status: 501 }
  );
}
