FROM node:20-alpine

WORKDIR /app/services/stats-service

COPY services/stats-service/package*.json ./
RUN npm install

COPY services/stats-service ./
COPY prisma /app/prisma

# Génère le client Prisma pour le schéma stats
RUN npx prisma generate --schema /app/prisma/stats/schema.prisma

RUN npm run build

EXPOSE 3005

CMD ["npm", "start"]

