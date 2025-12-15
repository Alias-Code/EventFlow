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
    { name: 'Notifications', description: 'Notifications (à venir)' },
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
  security: [
    {
      bearerAuth: [],
    },
  ],
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
          200: { description: 'Connexion réussie' },
          401: { description: 'Identifiants invalides' },
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
          200: { description: 'Liste des événements' },
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
          200: { description: 'Détails de l\'événement' },
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
          200: { description: 'Liste des billets' },
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
      post: {
        tags: ['Payments'],
        summary: 'Effectuer un paiement',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ticketId', 'amount', 'method'],
                properties: {
                  ticketId: { type: 'string', example: 'ticket_789' },
                  amount: { type: 'number', example: 91.98 },
                  method: { type: 'string', enum: ['card', 'paypal', 'bank_transfer'], example: 'card' },
                  currency: { type: 'string', default: 'EUR', example: 'EUR' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Paiement traité avec succès' },
          400: { description: 'Données invalides' },
          402: { description: 'Paiement refusé' },
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
        },
      },
    },
    '/notifications/send': {
      post: {
        tags: ['Notifications'],
        summary: 'Envoyer une notification email',
        description: 'Envoie une notification email aux utilisateurs. Supporte les templates prédéfinis ou les emails personnalisés.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    type: 'object',
                    title: 'Avec template',
                    required: ['type', 'data'],
                    properties: {
                      type: {
                        type: 'string',
                        enum: ['ticketBooked', 'paymentSuccess', 'eventCancelled', 'paymentFailed'],
                        example: 'ticketBooked',
                        description: 'Type de notification avec template',
                      },
                      data: {
                        type: 'object',
                        example: {
                          eventName: 'Concert - Coldplay',
                          userName: 'Anas Mougammadou',
                          userEmail: 'mougammadou.anas@gmail.com',
                          eventDate: '2025-12-25T20:00:00Z',
                          eventLocation: 'Stade de France, Paris',
                          ticketId: 'TKT-ABC123456',
                        },
                        description: 'Données pour le template (varient selon le type)',
                      },
                    },
                  },
                  {
                    type: 'object',
                    title: 'Email personnalisé',
                    required: ['to', 'subject', 'html'],
                    properties: {
                      to: {
                        type: 'string',
                        format: 'email',
                        example: 'user@example.com',
                        description: 'Email destinataire',
                      },
                      subject: {
                        type: 'string',
                        example: 'Votre réservation a été confirmée',
                        description: 'Sujet de l\'email',
                      },
                      html: {
                        type: 'string',
                        example: '<h1>Confirmation</h1><p>Votre réservation est confirmée</p>',
                        description: 'Contenu HTML de l\'email',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Email envoyé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    messageId: {
                      type: 'string',
                      example: 'msg_1234567890',
                      description: 'ID unique du message envoyé',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Requête invalide',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Invalid notification type' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Erreur serveur lors de l\'envoi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Failed to send email: SMTP error',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check du Gateway',
        responses: {
          200: { description: 'Gateway opérationnel' },
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

