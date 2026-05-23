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
ENV DATABASE_URL=/app/data/cinemate.db
ENV DRIZZLE_MIGRATIONS_DIR=/app/drizzle

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nestjs \
  && mkdir -p /app/data \
  && chown -R nestjs:nodejs /app

COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --chown=nestjs:nodejs drizzle ./drizzle
COPY --chown=nestjs:nodejs package*.json ./

USER nestjs

EXPOSE 3000

CMD ["npm", "run", "start:docker"]
