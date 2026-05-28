FROM node:24-bookworm-slim AS deps

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

FROM deps AS build

COPY nest-cli.json tsconfig*.json ./
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev && npm cache clean --force

FROM node:24-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=mysql://cinemate:cinemate@mysql:3306/cinemate
ENV DRIZZLE_MIGRATIONS_DIR=/app/drizzle
ENV APP_BASE_URL=http://localhost:3000
ENV OBJECT_STORAGE_ENDPOINT=http://rustfs:9000
ENV OBJECT_STORAGE_REGION=us-east-1
ENV OBJECT_STORAGE_ACCESS_KEY=rustfsadmin
ENV OBJECT_STORAGE_SECRET_KEY=rustfsadmin
ENV OBJECT_STORAGE_BUCKET=cinemate-images
ENV IDEMPOTENCY_FLAG=false
ENV IDEMPOTENCY_TTL_HOURS=24
ENV APP_LOGGING_FLAG=false
ENV APP_LOGGING_SLOW_MS=1000

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nestjs \
  && chown -R nestjs:nodejs /app

COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --chown=nestjs:nodejs drizzle ./drizzle
COPY --chown=nestjs:nodejs package*.json ./

USER nestjs

EXPOSE 3000

CMD ["npm", "run", "start:docker"]
