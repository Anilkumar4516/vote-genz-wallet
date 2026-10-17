# Multi-stage production build for Vote Wallet Web App
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies & Build stage
FROM base AS builder
COPY package*.json ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN npm --prefix packages/shared-types install && npm --prefix packages/shared-types run build && \
    npm --prefix packages/api-client install && npm --prefix packages/api-client run build && \
    npm --prefix apps/web install && npm --prefix apps/web run build

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

