'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EventFlow API Gateway',
    version: '1.0.0',
    description: 'API Gateway pour la plateforme EventFlow - Gestion d\'événements en microservices',
    contact: {
      name: 'EventFlow Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Serveur de développement local',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentification et gestion des utilisateurs' },
    { name: 'Events', description: 'Gestion du catalogue d\'événements' },
    { name: 'Tickets', description: 'Réservations et billets' },
    { name: 'Payments', description: 'Traitement des paiements' },
    { name: 'Stats', description: 'Statistiques de la plateforme' },
    { name: 'Health', description: 'Health checks' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Entrez votre token JWT obtenu via /api/auth/login',
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Inscription d\'un nouvel utilisateur',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', minLength: 6, example: 'password123' },
                  name: { type: 'string', example: 'John Doe' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Utilisateur créé avec succès' },
          400: { description: 'Données invalides' },
          503: { description: 'Service d\'authentification indisponible' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Connexion d\'un utilisateur',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { 
            description: 'Connexion réussie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: { type: 'object' },
                  },
                },
              },
            },
          },
          401: { description: 'Identifiants invalides' },
          503: { description: 'Service d\'authentification indisponible' },
        },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Récupérer le profil de l\'utilisateur connecté',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { 
            description: 'Profil utilisateur',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Non authentifié' },
          503: { description: 'Service d\'authentification indisponible' },
        },
      },
    },
    '/events': {
      get: {
        tags: ['Events'],
        summary: 'Liste tous les événements',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filtrer par catégorie' },
          { name: 'date', in: 'query', schema: { type: 'string' }, description: 'Filtrer par date' },
        ],
        responses: {
          200: { 
            description: 'Liste des événements',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
          503: { description: 'Service des événements indisponible' },
        },
      },
      post: {
        tags: ['Events'],
        summary: 'Créer un nouvel événement',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'date', 'location', 'capacity', 'price'],
                properties: {
                  title: { type: 'string', example: 'Concert Rock' },
                  description: { type: 'string', example: 'Un super concert' },
                  date: { type: 'string', format: 'date-time', example: '2025-12-25T20:00:00Z' },
                  location: { type: 'string', example: 'Paris, Olympia' },
                  category: { type: 'string', example: 'music' },
                  capacity: { type: 'integer', example: 500 },
                  price: { type: 'number', example: 45.99 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Événement créé avec succès' },
          400: { description: 'Données invalides' },
          503: { description: 'Service des événements indisponible' },
        },
      },
    },
    '/events/{id}': {
      get: {
        tags: ['Events'],
        summary: 'Récupérer un événement par ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { 
            description: 'Détails de l\'événement',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          404: { description: 'Événement non trouvé' },
          503: { description: 'Service des événements indisponible' },
        },
      },
      put: {
        tags: ['Events'],
        summary: 'Modifier un événement',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  date: { type: 'string', format: 'date-time' },
                  location: { type: 'string' },
                  category: { type: 'string' },
                  capacity: { type: 'integer' },
                  price: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Événement modifié avec succès' },
          404: { description: 'Événement non trouvé' },
          503: { description: 'Service des événements indisponible' },
        },
      },
      delete: {
        tags: ['Events'],
        summary: 'Supprimer un événement',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Événement supprimé avec succès' },
          404: { description: 'Événement non trouvé' },
          503: { description: 'Service des événements indisponible' },
        },
      },
    },
    '/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'Liste les billets/réservations',
        parameters: [
          { name: 'userId', in: 'query', schema: { type: 'string' }, description: 'Filtrer par utilisateur' },
          { name: 'eventId', in: 'query', schema: { type: 'string' }, description: 'Filtrer par événement' },
        ],
        responses: {
          200: { 
            description: 'Liste des billets',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
          503: { description: 'Service de billetterie indisponible' },
        },
      },
      post: {
        tags: ['Tickets'],
        summary: 'Réserver un billet',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['eventId', 'userId', 'quantity'],
                properties: {
                  eventId: { type: 'string', example: 'evt_123' },
                  userId: { type: 'string', example: 'user_456' },
                  quantity: { type: 'integer', example: 2 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Billet réservé avec succès' },
          400: { description: 'Données invalides ou places insuffisantes' },
          503: { description: 'Service de billetterie indisponible' },
        },
      },
    },
    '/payments': {
      get: {
        tags: ['Payments'],
        summary: 'Liste tous les paiements',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 }, description: 'Nombre de résultats' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Décalage pour pagination' },
        ],
        responses: {
          200: { 
            description: 'Liste des paiements',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
          503: { description: 'Service de paiement indisponible' },
        },
      },
      post: {
        tags: ['Payments'],
        summary: 'Créer un nouveau paiement',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ticketId', 'eventId', 'amount'],
                properties: {
                  ticketId: { type: 'string', example: 'ticket_789' },
                  eventId: { type: 'string', example: 'evt_123' },
                  amount: { type: 'number', example: 91.98 },
                  paymentMethod: { type: 'string', enum: ['CARD', 'PAYPAL', 'BANK_TRANSFER', 'FREE'], example: 'CARD' },
                  currency: { type: 'string', default: 'EUR', example: 'EUR' },
                  metadata: { type: 'object', description: 'Métadonnées optionnelles' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Paiement créé avec succès' },
          400: { description: 'Données invalides' },
          503: { description: 'Service de paiement indisponible' },
        },
      },
    },
    '/payments/{id}': {
      get: {
        tags: ['Payments'],
        summary: 'Récupérer un paiement par ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID du paiement' },
        ],
        responses: {
          200: { 
            description: 'Détails du paiement',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          404: { description: 'Paiement non trouvé' },
          503: { description: 'Service de paiement indisponible' },
        },
      },
    },
    '/payments/me': {
      get: {
        tags: ['Payments'],
        summary: 'Récupérer mes paiements (utilisateur connecté)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { 
            description: 'Liste des paiements de l\'utilisateur',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
          401: { description: 'Non authentifié' },
          503: { description: 'Service de paiement indisponible' },
        },
      },
    },
    '/payments/{id}/process': {
      post: {
        tags: ['Payments'],
        summary: 'Traiter un paiement en attente',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID du paiement' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['transactionId'],
                properties: {
                  transactionId: { type: 'string', example: 'txn_abc123' },
                  processorMetadata: { type: 'object', description: 'Métadonnées du processeur de paiement' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Paiement traité avec succès' },
          400: { description: 'Paiement ne peut pas être traité' },
          404: { description: 'Paiement non trouvé' },
          503: { description: 'Service de paiement indisponible' },
        },
      },
    },
    '/payments/{id}/refund': {
      post: {
        tags: ['Payments'],
        summary: 'Rembourser un paiement',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID du paiement' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['reason'],
                properties: {
                  reason: { type: 'string', example: 'Annulation de la réservation' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Paiement remboursé avec succès' },
          400: { description: 'Paiement ne peut pas être remboursé' },
          404: { description: 'Paiement non trouvé' },
          503: { description: 'Service de paiement indisponible' },
        },
      },
    },
    '/payments/ticket/{ticketId}': {
      get: {
        tags: ['Payments'],
        summary: 'Récupérer les paiements pour un ticket',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'ticketId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID du ticket' },
        ],
        responses: {
          200: { 
            description: 'Liste des paiements pour le ticket',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
          503: { description: 'Service de paiement indisponible' },
        },
      },
    },
    '/payments/event/{eventId}': {
      get: {
        tags: ['Payments'],
        summary: 'Récupérer les paiements pour un événement',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'eventId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de l\'événement' },
        ],
        responses: {
          200: { 
            description: 'Liste des paiements pour l\'événement',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
          503: { description: 'Service de paiement indisponible' },
        },
      },
    },
    '/stats': {
      get: {
        tags: ['Stats'],
        summary: 'Récupérer toutes les statistiques',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Statistiques complètes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    events: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        created: { type: 'integer' },
                        updated: { type: 'integer' },
                        cancelled: { type: 'integer' },
                      },
                    },
                    tickets: {
                      type: 'object',
                      properties: {
                        booked: { type: 'integer' },
                        cancelled: { type: 'integer' },
                        amount: { type: 'number' },
                      },
                    },
                    payments: {
                      type: 'object',
                      properties: {
                        processed: { type: 'integer' },
                        failed: { type: 'integer' },
                        revenue: { type: 'number' },
                      },
                    },
                    generatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          401: { description: 'Non authentifié' },
          503: { description: 'Service de statistiques indisponible' },
        },
      },
    },
    '/stats/events': {
      get: {
        tags: ['Stats'],
        summary: 'Statistiques sur les événements uniquement',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Statistiques événements',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer' },
                    created: { type: 'integer' },
                    updated: { type: 'integer' },
                    cancelled: { type: 'integer' },
                  },
                },
              },
            },
          },
          401: { description: 'Non authentifié' },
          503: { description: 'Service de statistiques indisponible' },
        },
      },
    },
    '/stats/tickets': {
      get: {
        tags: ['Stats'],
        summary: 'Statistiques sur les billets uniquement',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Statistiques billets',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    booked: { type: 'integer' },
                    cancelled: { type: 'integer' },
                    amount: { type: 'number' },
                  },
                },
              },
            },
          },
          401: { description: 'Non authentifié' },
          503: { description: 'Service de statistiques indisponible' },
        },
      },
    },
    '/stats/payments': {
      get: {
        tags: ['Stats'],
        summary: 'Statistiques sur les paiements uniquement',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Statistiques paiements',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    processed: { type: 'integer' },
                    failed: { type: 'integer' },
                    revenue: { type: 'number' },
                  },
                },
              },
            },
          },
          401: { description: 'Non authentifié' },
          503: { description: 'Service de statistiques indisponible' },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check du Gateway',
        responses: {
          200: { 
            description: 'Gateway opérationnel',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    services: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default function ApiDocsPage() {
  return (
    <div>
      <SwaggerUI 
        spec={swaggerSpec}
        persistAuthorization={true}
        deepLinking={true}
        displayRequestDuration={true}
      />
    </div>
  );
}
