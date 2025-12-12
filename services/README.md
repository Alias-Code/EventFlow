# Services Microservices

Ce dossier contient tous les microservices de l'application EventFlow.

## Structure

```
services/
├── stats-service/          # Service de statistiques (consommateur)
├── events-service/         # Service événements (producteur)
├── tickets-service/        # Service billetterie (producteur + consommateur)
├── payments-service/       # Service paiement (producteur + consommateur)
├── notifications-service/  # Service notifications (consommateur)
└── users-service/          # Service utilisateurs (authentification)
```

## Intégration RabbitMQ

**Chaque service doit copier le module RabbitMQ depuis `stats-service`.**

### 📋 Étapes rapides :

1. **Copier le fichier** :
   ```
   services/stats-service/src/rabbit/rabbit.service.ts
   → services/[votre-service]/src/rabbit/rabbit.service.ts
   ```

2. **Ajouter les dépendances** dans `package.json` :
   ```json
   {
     "dependencies": {
       "amqplib": "^0.10.9"
     },
     "devDependencies": {
       "@types/amqplib": "^0.10.6"
     }
   }
   ```

3. **Ajouter la variable d'environnement** :
   ```yaml
   environment:
     - RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672
   ```

4. **Modifier les logs** dans `rabbit.service.ts` :
   - Remplacer `[stats-service]` par `[votre-service]`

### 📖 Documentation complète

Voir `services/RABBITMQ_TEMPLATE.md` pour :
- Exemples d'utilisation (publier/consommer)
- Liste des routing keys
- Checklist complète

## Services par rôle

### Producteurs (publient des événements)
- **events-service** : `event.created`, `event.updated`, `event.cancelled`
- **tickets-service** : `ticket.booked`, `ticket.cancelled`
- **payments-service** : `payment.processed`, `payment.failed`

### Consommateurs (écoutent des événements)
- **stats-service** : `event.*`, `ticket.*`, `payment.*`
- **notifications-service** : `event.*`, `ticket.*`, `payment.*`
- **tickets-service** : `event.updated`, `event.cancelled`, `payment.*`
- **payments-service** : `ticket.booked`, `ticket.cancelled`

