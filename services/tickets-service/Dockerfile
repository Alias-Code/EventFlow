FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY services/tickets-service/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY services/tickets-service/ .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 3006

CMD ["node", "dist/main.js"]
