# API Gateway - EventFlow

Ce dossier contient toutes les routes API qui servent de proxy vers les microservices backend.

## Structure des routes

```
api/
├── health/          # Health check du Gateway
├── auth/
│   ├── login/       # POST /api/auth/login
│   └── register/    # POST /api/auth/register
├── events/
│   ├── route.js     # GET, POST /api/events
│   └── [id]/        # GET, PUT, DELETE /api/events/:id
├── tickets/
│   └── route.js     # GET, POST /api/tickets
├── payments/
│   └── route.js     # POST /api/payments
└── notifications/   # À venir
```

## Fonctionnement

Chaque route agit comme un **proxy transparent** :
1. Reçoit la requête du client
2. La transmet au microservice approprié
3. Renvoie la réponse au client
4. Gère les erreurs si le service est indisponible (503)

## Exemples d'utilisation

### Authentication
```javascript
// Inscription
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  }),
});

// Connexion
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  }),
});
```

### Événements
```javascript
// Liste tous les événements
const response = await fetch('/api/events');
const events = await response.json();

// Filtrer par catégorie
const response = await fetch('/api/events?category=concert');

// Créer un événement
const response = await fetch('/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Concert Rock',
    date: '2025-12-25',
    location: 'Paris',
    capacity: 500,
    price: 45.99
  }),
});

// Modifier un événement
const response = await fetch('/api/events/123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Concert Rock - Nouvelle date'
  }),
});

// Supprimer un événement
const response = await fetch('/api/events/123', {
  method: 'DELETE',
});
```

### Billetterie
```javascript
// Réserver un billet
const response = await fetch('/api/tickets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventId: '123',
    userId: 'user-456',
    quantity: 2
  }),
});
```

### Paiements
```javascript
// Effectuer un paiement
const response = await fetch('/api/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ticketId: 'ticket-789',
    amount: 91.98,
    method: 'card'
  }),
});
```

### Statistiques
```javascript
// Toutes les statistiques
const response = await fetch('/api/stats');
const allStats = await response.json();

// Statistiques sur les événements uniquement
const eventsStats = await fetch('/api/stats/events');
const events = await eventsStats.json();
// { total: 42, created: 40, updated: 2, cancelled: 0 }

// Statistiques sur les billets uniquement
const ticketsStats = await fetch('/api/stats/tickets');
const tickets = await ticketsStats.json();
// { booked: 320, cancelled: 15, amount: 15432.5 }

// Statistiques sur les paiements uniquement
const paymentsStats = await fetch('/api/stats/payments');
const payments = await paymentsStats.json();
// { processed: 290, failed: 12, revenue: 15432.5 }
```

## Configuration

Les URLs des microservices sont configurées dans `.env.local` :
```env
AUTH_SERVICE_URL=http://auth-service:3001
EVENT_SERVICE_URL=http://event-service:3002
TICKET_SERVICE_URL=http://ticket-service:3003
PAYMENT_SERVICE_URL=http://payment-service:3004
STATS_SERVICE_URL=http://stats-service:3005
```
