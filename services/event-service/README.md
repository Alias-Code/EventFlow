# Event Service

Service de gestion des événements pour la plateforme EventFlow.

## Fonctionnalités

- Création et publication d'événements
- Modification d'événements
- Annulation d'événements
- Recherche et filtrage avancés (date, lieu, catégorie, prix)
- Catégorisation par type (conférence, concert, formation, sport, etc.)

## Technologies

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- RabbitMQ (événements asynchrones)

## Événements Publiés

- `EventCreatedEvent` - Publié lors de la création d'un événement
- `EventUpdatedEvent` - Publié lors de la modification d'un événement
- `EventCancelledEvent` - Publié lors de l'annulation d'un événement

## API Endpoints

- `GET /events` - Liste des événements avec filtres
- `GET /events/:id` - Détails d'un événement
- `POST /events` - Créer un événement
- `PUT /events/:id` - Modifier un événement
- `DELETE /events/:id` - Annuler un événement
- `GET /health` - Health check

## Installation

```bash
npm install
npx prisma generate
npm run start:dev
```

## Port

3002
