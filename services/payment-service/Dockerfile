FROM node:20-alpine

WORKDIR /app/services/payment-service

COPY services/payment-service/package*.json ./
RUN npm install

COPY services/payment-service ./
COPY prisma /app/prisma

# Génère le client Prisma pour le schéma payments
RUN npx prisma generate --schema /app/prisma/payments/schema.prisma

RUN npm run build

EXPOSE 3004

CMD ["npm", "start"]
