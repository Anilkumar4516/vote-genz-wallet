# Production multi-stage build for Vote Wallet Admin Console
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

FROM base AS dependencies
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/shared-types ./packages/shared-types/
COPY packages/api-client ./packages/api-client/
RUN pnpm install --frozen-lockfile || npm install

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN cd apps/admin && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3002
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/admin/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next ./.next
COPY --from=builder /app/apps/admin/node_modules ./node_modules
COPY --from=builder /app/apps/admin/package.json ./package.json

USER nextjs
EXPOSE 3002

CMD ["npm", "start"]
