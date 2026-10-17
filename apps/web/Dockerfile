# Multi-stage production build for Vote Wallet Web App
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types ./packages/shared-types/
COPY packages/api-client ./packages/api-client/
RUN pnpm install --frozen-lockfile || npm install

# Build stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN cd apps/web && npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./package.json

USER nextjs
EXPOSE 3000

CMD ["npm", "start"]
