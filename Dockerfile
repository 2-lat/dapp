FROM node:22-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache python3 make g++ libc6-compat py3-setuptools

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml ./

RUN npm i -g corepack@latest
RUN corepack enable && corepack prepare pnpm@10.8.1 --activate
RUN pnpm i

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# This will do the trick, use the corresponding env file for each environment.
COPY .env .env

RUN npm i -g corepack@latest
RUN corepack enable && corepack prepare pnpm@10.8.1 --activate
RUN pnpm db:generate
RUN pnpm build

# # 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/src/env.js ./src/env.js
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/.env ./.env
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --chown=nextjs:nodejs bin/readiness.sh ./bin/readiness.sh
COPY --chown=nextjs:nodejs bin/liveness.sh ./bin/liveness.sh

# # Automatically leverage output traces to reduce image size
# # https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/.next .

# COPY bin/readiness.sh /app/bin/readiness.sh
# COPY bin/liveness.sh /app/bin/liveness.sh
# RUN chmod +x /app/bin/*.sh
RUN npm i -g corepack@latest
RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME 0.0.0.0

CMD pnpm start