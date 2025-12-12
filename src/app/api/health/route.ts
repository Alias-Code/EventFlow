import { NextResponse, NextRequest } from 'next/server';

/**
 * Health check centralisé - Vérifie l'état de tous les microservices
 * Route : GET /api/health
 */
export async function GET() {
  const services = [
    { name: 'auth', url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001' },
    { name: 'events', url: process.env.EVENT_SERVICE_URL || 'http://event-service:3002' },
    { name: 'tickets', url: process.env.TICKET_SERVICE_URL || 'http://ticket-service:3003' },
    { name: 'payments', url: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004' },
    { name: 'notifications', url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005' },
  ];

  const checks = await Promise.allSettled(
    services.map(async (service) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout
        
        const response = await fetch(`${service.url}/health`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeout);
        
        return {
          name: service.name,
          status: response.ok ? 'OK' : 'ERREUR',
          url: service.url,
          statusCode: response.status,
        };
      } catch (error) {
        return {
          name: service.name,
          status: 'INDISPONIBLE',
          url: service.url,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    })
  );

  const results = checks.map((result) => result.status === 'fulfilled' ? result.value : result.reason);
  const allHealthy = results.every((r) => r.status === 'OK');

  return NextResponse.json(
    {
      gateway: 'OK',
      timestamp: new Date().toISOString(),
      services: results,
      allServiceHealthy: allHealthy,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
