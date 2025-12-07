FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN npx prisma generate

RUN pnpm run build

EXPOSE 3001

CMD ["pnpm", "run", "start:prod"]
