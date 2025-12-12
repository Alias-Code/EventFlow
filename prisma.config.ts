import { config as loadEnv } from 'dotenv';
import path from 'path';
import { defineConfig } from '@prisma/config';

// Charger explicitement le .env à partir de la racine du projet
loadEnv({ path: path.join(process.cwd(), '.env') });

// Valider les variables d'environnement pour éviter les valeurs undefined
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`Env var ${name} manquante pour Prisma (prisma.config.ts)`);
  }
  return v.trim();
}

const datasources = {
  eventsDb: { url: requireEnv('EVENTS_DATABASE_URL') },
  ticketsDb: { url: requireEnv('TICKETS_DATABASE_URL') },
  paymentsDb: { url: requireEnv('PAYMENTS_DATABASE_URL') },
  notificationsDb: { url: requireEnv('NOTIFICATIONS_DATABASE_URL') },
  usersDb: { url: requireEnv('USERS_DATABASE_URL') },
};

// Prisma 7 : préciser le datasource ciblé via PRISMA_MIGRATE_DATASOURCE (sinon eventsDb).
const datasource =
  process.env.PRISMA_MIGRATE_DATASOURCE?.trim() || 'eventsDb';

export default defineConfig({
  datasource,
  datasources,
});

