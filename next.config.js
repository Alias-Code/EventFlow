/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // API Gateway: Redirection vers le service d'Authentification
        source: '/api/auth/:path*',
        destination: process.env.AUTH_SERVICE_URL 
          ? `${process.env.AUTH_SERVICE_URL}/auth/:path*`
          : 'http://auth-service:3001/auth/:path*',
      },
      {
        // API Gateway: Redirection vers le service Événements
        source: '/api/events/:path*',
        destination: process.env.EVENT_SERVICE_URL
          ? `${process.env.EVENT_SERVICE_URL}/events/:path*`
          : 'http://event-service:3002/events/:path*',
      },
      {
        // API Gateway: Redirection vers le service Billetterie
        source: '/api/tickets/:path*',
        destination: process.env.TICKET_SERVICE_URL
          ? `${process.env.TICKET_SERVICE_URL}/tickets/:path*`
          : 'http://ticket-service:3003/tickets/:path*',
      },
      {
        // API Gateway: Redirection vers le service Paiement
        source: '/api/payments/:path*',
        destination: process.env.PAYMENT_SERVICE_URL
          ? `${process.env.PAYMENT_SERVICE_URL}/payments/:path*`
          : 'http://payment-service:3004/payments/:path*',
      },
      {
        // API Gateway: Redirection vers le service Notifications
        source: '/api/notifications/:path*',
        destination: process.env.NOTIFICATION_SERVICE_URL
          ? `${process.env.NOTIFICATION_SERVICE_URL}/notifications/:path*`
          : 'http://notification-service:3005/notifications/:path*',
      },
    ];
  },
};

export default nextConfig;
