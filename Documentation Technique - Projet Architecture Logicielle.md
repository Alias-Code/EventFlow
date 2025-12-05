# Documentation Technique - Projet Architecture Logicielle

## Table des matières

1. [Introduction](#1-introduction)
2. [Description détaillée des fonctionnalités](#2-description-détaillée-des-fonctionnalités)
3. [Justification des choix architecturaux](#3-justification-des-choix-architecturaux)
4. [Modélisation UML](#4-modélisation-uml)
5. [Modèle de données et entités principales](#5-modèle-de-données-et-entités-principales)
6. [Événements métier et flux](#6-événements-métier-et-flux)
7. [Infrastructure technique et déploiement](#7-infrastructure-technique-et-déploiement)
8. [Guide d’installation et d’utilisation](#8-guide-dinstallation-et-dutilisation)
9. [Analyse comparative : Microservices vs Monolithe](#9-analyse-comparative--microservices-vs-monolithe)
10. [Conclusion](#10-conclusion)

---

## 1. Introduction

### 1.1 Contexte du projet

Dans le cadre du module **Architecture Logicielle**, ce projet consiste à concevoir et mettre en œuvre une plateforme de gestion d’événements en ligne reposant sur une **architecture microservices** moderne.

Le projet illustre la capacité à :

- Analyser un besoin métier.
- Proposer une architecture logicielle structurée.
- Modéliser l’ensemble du système avec des diagrammes UML cohérents.
- Implémenter un backend distribué basé sur la communication asynchrone.
- Fournir une documentation technique complète et rigoureuse.

La solution développée, **EventFlow**, permet aux utilisateurs de rechercher, réserver et payer des billets pour des événements variés (conférences, concerts, formations…), tandis que les organisateurs disposent d’outils pour créer, gérer et annuler leurs événements.

### 1.2 Objectifs pédagogiques

Ce projet mobilise plusieurs compétences essentielles du développement logiciel moderne :

- Compréhension et implémentation d’une **architecture microservices**.
- Mise en œuvre d’une **architecture event-driven** (pilotée par événements) à l’aide d’un broker de messages (RabbitMQ).
- Modélisation UML avancée.
- Déploiement d’un système distribué via **Docker**.
- Justification argumentée des choix techniques et architecturaux.

---

## 2. Description détaillée des fonctionnalités

### 2.1 Fonctionnalités pour les participants

- **Recherche d’événements** : Filtrage par nom, date, lieu, catégorie.
- **Consultation** : Accès aux détails des fiches événement.
- **Réservation** : Sélection et réservation de billets.
- **Paiement** : Processus de paiement sécurisé (simulé).
- **Notifications** : Réception automatique d'emails (confirmation, rappel, annulation).
- **Historique** : Accès à la liste personnelle des réservations.

### 2.2 Fonctionnalités pour les organisateurs

- **Gestion d'événements** : Création avec titre, description, date, lieu, capacité et prix.
- **Administration** : Modification ou annulation d’un événement existant.
- **Suivi** : Visualisation des réservations en temps réel.

### 2.3 Fonctionnalités transverses

- **Authentification** : Gestion des utilisateurs et sécurité.
- **Cycle de vie du billet** : Gestion des états (réservé, payé, validé, annulé).
- **Gestion financière** : Traitement automatique des paiements et remboursements.
- **Système de notifications** : Déclenchement basé sur les événements métier.

---

## 3. Justification des choix architecturaux

### 3.1 Pourquoi une architecture microservices ?

L'approche microservices a été retenue pour :

1. **Découplage fonctionnel** : Chaque domaine (Événements, Billetterie, Paiement, Notifications) est isolé.
2. **Résilience** : Une panne sur un service n’impacte pas la totalité du système.
3. **Scalabilité** : Chaque service peut être dimensionné indépendamment (ex: le service Billetterie lors d'une forte affluence).
4. **Évolutivité** : Facilite la maintenance et l'ajout de fonctionnalités par des équipes distinctes.
5. **Standards industriels** : Alignement avec les pratiques des grandes plateformes (Netflix, Uber, etc.).

### 3.2 Pourquoi une architecture event-driven ?

L'utilisation de **RabbitMQ** pour la communication asynchrone permet :

- Un **découplage fort** entre les services.
- Une **meilleure tolérance aux pannes** (les messages sont mis en file d'attente si un service est indisponible).
- Une **traçabilité** des actions métier.
- L'ajout facile de nouveaux consommateurs (ex: un service d'analyse) sans modifier les producteurs.

### 3.3 Choix technologiques

- **NestJS (Backend)** : Framework modulaire, TypeScript natif, excellente intégration avec RabbitMQ et structure adaptée aux microservices.
- **Next.js (Frontend + Gateway)** : Rendu hybride (SSR/SSG), routage API intégré pour agir comme Gateway, séparation claire avec le backend.
- **PostgreSQL** : Base de données relationnelle robuste pour la persistance des données.
- **Docker** : Conteneurisation pour un déploiement iso-prod et une gestion simplifiée des dépendances.

---

## 4. Modélisation UML

### 4.1 Diagramme de cas d’utilisation

*Interactions entre Participant, Organisateur et Administrateur.*

> ![1764929042965](image/DocumentationTechnique-ProjetArchitectureLogicielle/1764929042965.png)
>
> *Cas principaux : Créer événement, modifier, rechercher, réserver, payer, notifier, annuler.*

### 4.2 Diagrammes de classes

Modélisation des entités par contexte métier :

- **Événements** : `Event`, `Category`
- **Billets** : `Ticket`, `Reservation`
- **Paiements** : `Payment`, `Transaction`
- **Notifications** : `Notification`, `Message`
- **Utilisateurs** : `User`, `Role`

### 4.3 Diagrammes de séquence

Scénarios clés du système :

1. **Réservation nominale** : Réservation d’un billet -> Paiement -> Confirmation.

   ![1764929170793](image/DocumentationTechnique-ProjetArchitectureLogicielle/1764929170793.png)
2. **Annulation** : Annulation d’un événement -> Propagation -> Remboursement.

   ![1764929233768](image/DocumentationTechnique-ProjetArchitectureLogicielle/1764929233768.png)
3. **Gestion d'erreur** : Paiement échoué -> Annulation du ticket.

![1764929254024](image/DocumentationTechnique-ProjetArchitectureLogicielle/1764929254024.png)

4.4 Diagramme de composants

Vue d'ensemble des modules logiciels et de leurs dépendances.

### 4.5 Diagramme de déploiement

Architecture physique :

- Conteneurs Docker (Microservices NestJS).
- Bases de données PostgreSQL (isolées par service).
- Broker RabbitMQ.
- Frontend Next.js.
- Réseau interne Docker.

### 4.6 Diagrammes d’activité

Flux de travail complexes :

- Workflow de réservation complète.

  ![1764929315527](image/DocumentationTechnique-ProjetArchitectureLogicielle/1764929315527.png)
- Workflow de remboursement automatique.

  ![1764929331634](image/DocumentationTechnique-ProjetArchitectureLogicielle/1764929331634.png)

### 4.7 Diagrammes d’état

Cycle de vie des objets métier :

- **Billet** : `Réservé` → `En attente paiement` → `Payé` → `Utilisé` / `Annulé`

  ![1764929351189](image/DocumentationTechnique-ProjetArchitectureLogicielle/1764929351189.png)
- **Paiement** : `Initié` → `En cours` → `Succès` / `Échec` / `Remboursé`

  ![1764929379725](image/DocumentationTechnique-ProjetArchitectureLogicielle/1764929379725.png)
- **Événement** : `Brouillon` → `Publié` → `Terminé` / `Annulé`

  ![1764929402564](image/DocumentationTechnique-ProjetArchitectureLogicielle/1764929402564.png)

## 5. Modèle de données et entités principales

Chaque microservice possède sa propre base de données pour garantir l'indépendance (Pattern Database-per-Service).

### Events Service

- **Event** : `id`, `title`, `description`, `date`, `location`, `capacity`, `price`, `status`

### Tickets Service

- **Ticket** : `id`, `eventId`, `userId`, `price`, `status`
- **Reservation** : `id`, `ticketId`, `createdAt`

### Payments Service

- **Payment** : `id`, `ticketId`, `amount`, `status`, `createdAt`

### Notifications Service

- **MessageLog** : `id`, `eventType`, `payload`, `timestamp`

---

## 6. Événements métier et flux

### 6.1 Liste des événements (Event Bus)

Le système repose sur l'échange de messages standardisés :

- `EventCreatedEvent`
- `EventUpdatedEvent`
- `EventCancelledEvent`
- `TicketBookedEvent`
- `TicketCancelledEvent`
- `PaymentProcessedEvent`
- `PaymentFailedEvent`

### 6.2 Exemple de flux : Réservation

1. **Ticket Service** : Reçoit la demande, crée le ticket (état `PENDING`) et publie `TicketBookedEvent`.
2. **Payment Service** : Consomme l'événement, initie le paiement.
   - *Succès* : Publie `PaymentProcessedEvent`.
   - *Échec* : Publie `PaymentFailedEvent`.
3. **Ticket Service** :
   - Reçoit `PaymentProcessedEvent` -> Valide le ticket (`CONFIRMED`).
   - Reçoit `PaymentFailedEvent` -> Annule le ticket (`CANCELLED`).
4. **Notifications Service** : Écoute tous les événements pour envoyer les emails appropriés aux utilisateurs.

---

## 7. Infrastructure technique et déploiement

### 7.1 Architecture Docker

L'infrastructure est entièrement conteneurisée :

- **Services** : Un conteneur par microservice NestJS.
- **Messaging** : Un conteneur RabbitMQ.
- **Persistance** : Trois conteneurs PostgreSQL indépendants (Events, Tickets, Payments).
- **Frontend/Gateway** : Un conteneur Next.js.

### 7.2 Orchestration

Le fichier `docker-compose.yml` orchestre le démarrage, les réseaux et les volumes persistants.

### 7.3 Déploiement local

Commandes pour lancer l'environnement :

```bash
# Cloner le projet
git clone <url-du-repo>

# Installer les dépendances
pnpm install

# Lancer la stack complète
docker-compose up --build
```

**Accès :**

- **Frontend** : `http://localhost:3000`
- **RabbitMQ Management** : `http://localhost:15672` (Guest/Guest)

---

## 8. Guide d’installation et d’utilisation

### 8.1 Prérequis

- Node.js (v18+)
- Docker & Docker Compose
- pnpm (`npm install -g pnpm`)

### 8.2 Configuration

Les variables d'environnement sont définies dans les fichiers `.env` de chaque service :

- URLs des microservices.
- Chaînes de connexion PostgreSQL.
- URL de connexion RabbitMQ (`amqp://guest:guest@rabbitmq:5672`).

### 8.3 Utilisation

1. Accéder au frontend.
2. Créer un compte ou se connecter.
3. Parcourir les événements et effectuer une réservation.
4. Vérifier les logs des microservices pour voir passer les événements RabbitMQ.

---

## 9. Analyse comparative : Microservices vs Monolithe

### 9.1 Monolithe

**Avantages** :

- Simplicité de développement et de déploiement initial.
- Base de données unique (transactions ACID simples).
- Latence réseau nulle entre les modules.

**Inconvénients** :

- Couplage fort : une modification peut tout casser.
- Scalabilité limitée (tout ou rien).
- Dette technique s'accumulant plus vite.

### 9.2 Microservices (Choix du projet)

**Avantages** :

- **Scalabilité fine** : On ne scale que ce qui est nécessaire.
- **Résilience** : Isolation des pannes.
- **Agilité** : Déploiements indépendants et technologies hétérogènes possibles.

**Limites** :

- Complexité de l'infrastructure (Docker, Orchestration).
- Gestion de la cohérence des données (Eventual Consistency).
- Besoin de monitoring accru.

---

## 10. Conclusion

Ce projet **EventFlow** a permis de concrétiser les concepts avancés d’architecture logicielle :

- Architecture distribuée et découplée.
- Communication asynchrone robuste.
- Modélisation rigoureuse.
- Industrialisation via Docker.

La plateforme constitue une base solide, évolutive et résiliente, prête pour de futures évolutions (ajout de services, monitoring avancé, CI/CD).
