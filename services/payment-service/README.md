# Payment Service

Service de gestion des paiements pour la plateforme EventFlow.

## Description

Le Payment Service est un microservice NestJS responsable du traitement des paiements liés aux réservations de billets. Il gère le cycle de vie complet des paiements : création, traitement, confirmation et remboursement.

## Architecture

```
src/
├── main.ts                    # Point d'entrée + configuration Swagger
├── app.module.ts              # Module racine
├── auth/
│   └── jwt.strategy.ts        # Stratégie d'authentification JWT
├── prisma/
│   ├── prisma.module.ts       # Module Prisma global
│   └── prisma.service.ts      # Client Prisma
├── rabbit/
│   └── rabbit.service.ts      # Service de communication RabbitMQ
└── payment/
    ├── payment.module.ts      # Module Payment
    ├── payment.controller.ts  # Contrôleurs REST
    ├── payment.service.ts     # Logique métier
    └── dto/
        ├── create-payment.dto.ts
        ├── process-payment.dto.ts
        └── index.ts
```

## Configuration

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `PORT` | Port d'écoute du service | `3004` |
| `PAYMENTS_DATABASE_URL` | URL de connexion PostgreSQL | - |
| `RABBITMQ_URL` | URL de connexion RabbitMQ | `amqp://admin:admin@rabbitmq:5672` |
| `JWT_SECRET` | Clé secrète JWT | `secretKey` |

### Exemple de fichier .env

```env
PORT=3004
PAYMENTS_DATABASE_URL=postgresql://admin:admin@localhost:5434/eventflow_payments
RABBITMQ_URL=amqp://admin:admin@localhost:5672
JWT_SECRET=secretKey
```

## Modèle de données

### Payment

| Champ | Type | Description |
|-------|------|-------------|
| `id` | String | Identifiant unique (CUID) |
| `ticketId` | String | ID du ticket associé |
| `userId` | String | ID de l'utilisateur |
| `eventId` | String | ID de l'événement |
| `amount` | Float | Montant du paiement |
| `currency` | String | Devise (défaut: EUR) |
| `status` | PaymentStatus | État du paiement |
| `paymentMethod` | PaymentMethod | Méthode de paiement |
| `transactionId` | String? | ID de transaction externe |
| `failureReason` | String? | Raison de l'échec |
| `refundedAt` | DateTime? | Date du remboursement |
| `refundReason` | String? | Raison du remboursement |
| `metadata` | Json? | Métadonnées additionnelles |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Date de mise à jour |

### PaymentStatus (États)

```
PENDING → PROCESSING → COMPLETED
                    ↘ FAILED
                    ↘ CANCELLED
COMPLETED → REFUNDED
```

| État | Description |
|------|-------------|
| `PENDING` | Paiement créé, en attente de traitement |
| `PROCESSING` | Paiement en cours de traitement |
| `COMPLETED` | Paiement confirmé avec succès |
| `FAILED` | Paiement échoué |
| `REFUNDED` | Paiement remboursé |
| `CANCELLED` | Paiement annulé |

### PaymentMethod (Méthodes)

| Méthode | Description |
|---------|-------------|
| `CARD` | Carte bancaire |
| `PAYPAL` | PayPal |
| `BANK_TRANSFER` | Virement bancaire |
| `FREE` | Gratuit (montant = 0) |

## API REST

### Endpoints

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/health` | Health check | Non |
| `POST` | `/payments` | Créer un paiement | Oui |
| `POST` | `/payments/:id/process` | Traiter un paiement | Oui |
| `POST` | `/payments/:id/refund` | Rembourser un paiement | Oui |
| `GET` | `/payments` | Lister tous les paiements | Oui |
| `GET` | `/payments/me` | Lister mes paiements | Oui |
| `GET` | `/payments/:id` | Récupérer un paiement | Oui |
| `GET` | `/payments/ticket/:ticketId` | Paiements par ticket | Oui |
| `GET` | `/payments/event/:eventId` | Paiements par événement | Oui |

### Exemples de requêtes

#### Créer un paiement

```bash
curl -X POST http://localhost:3004/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "ticket_123",
    "eventId": "event_456",
    "amount": 50.00,
    "currency": "EUR",
    "paymentMethod": "CARD"
  }'
```

#### Traiter un paiement

```bash
curl -X POST http://localhost:3004/payments/payment_789/process \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "txn_stripe_abc123"
  }'
```

#### Rembourser un paiement

```bash
curl -X POST http://localhost:3004/payments/payment_789/refund \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Événement annulé"
  }'
```

## Communication Event-Driven (RabbitMQ)

### Événements consommés

| Routing Key | Description | Action |
|-------------|-------------|--------|
| `ticket.booked` | Ticket réservé | Crée un paiement en attente |
| `ticket.cancelled` | Ticket annulé | Annule ou rembourse le paiement |
| `event.cancelled` | Événement annulé | Rembourse tous les paiements de l'événement |

### Événements publiés

| Routing Key | Description | Payload |
|-------------|-------------|---------|
| `payment.processed` | Paiement confirmé | `{ paymentId, ticketId, userId, eventId, amount, currency, transactionId, processedAt }` |
| `payment.failed` | Paiement échoué | `{ paymentId, ticketId, userId, eventId, amount, failureReason, failedAt }` |
| `payment.refunded` | Paiement remboursé | `{ paymentId, ticketId, userId, eventId, amount, reason, refundedAt }` |

### Idempotence

Le service utilise une table `ProcessedEvent` pour garantir l'idempotence du traitement des événements. Chaque `messageId` est enregistré après traitement pour éviter les doublons.

## Installation et démarrage

### Prérequis

- Node.js 20+
- PostgreSQL 16
- RabbitMQ 3

### Installation locale

```bash
cd services/payment-service

# Installer les dépendances
npm install

# Générer le client Prisma
npm run generate:payments

# Lancer en développement
npm run start:dev
```

### Avec Docker

```bash
# Depuis la racine du projet
docker-compose up -d payments-db rabbitmq payment-service
```

### Migration de la base de données

```bash
# Depuis la racine du projet
PRISMA_MIGRATE_DATASOURCE=paymentsDb npx prisma migrate dev --schema prisma/payments/schema.prisma --name init
```

## Documentation Swagger

La documentation Swagger est disponible à l'adresse :

```
http://localhost:3004/api/docs
```

## Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture
npm run test:cov
```

## Flux de paiement typique

```
1. L'utilisateur réserve un ticket
   └── ticket-service publie "ticket.booked"

2. payment-service reçoit l'événement
   └── Crée un Payment en status PENDING

3. Le frontend appelle POST /payments/:id/process
   └── Le paiement passe en PROCESSING
   └── Simulation du traitement (en prod: appel Stripe/PayPal)
   └── Status devient COMPLETED ou FAILED

4. payment-service publie "payment.processed" ou "payment.failed"
   └── ticket-service met à jour le status du ticket
   └── notification-service envoie un email de confirmation
```

## Intégration avec les autres services

```
┌─────────────────┐     ticket.booked      ┌─────────────────┐
│                 │ ──────────────────────▶│                 │
│ Ticket Service  │                        │ Payment Service │
│                 │◀────────────────────── │                 │
└─────────────────┘   payment.processed    └─────────────────┘
                                                   │
                      payment.processed            │
                      payment.failed               │
                      payment.refunded             ▼
                                           ┌─────────────────┐
                                           │  Notification   │
                                           │    Service      │
                                           └─────────────────┘
```
