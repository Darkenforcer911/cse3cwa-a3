FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y python3 make g++ openssl && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

COPY . .

ENV DATABASE_URL="file:./dev.db"

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]