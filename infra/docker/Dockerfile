# Multi-Stage Production Dockerfile for Vote Wallet API & Services
# Stage 1: Dependencies & Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install native dependencies required for build tools
RUN apk add --no-cache python3 make g++

COPY apps/web/package*.json ./apps/web/
WORKDIR /usr/src/app/apps/web
RUN npm ci --omit=dev

# Stage 2: Production Distroless / Minimal Alpine Runner
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Security: Run as unprivileged node user
USER node

# Copy dependencies and application source code
COPY --chown=node:node --from=builder /usr/src/app/apps/web/node_modules ./apps/web/node_modules
COPY --chown=node:node apps ./apps
COPY --chown=node:node services ./services
COPY --chown=node:node db ./db
COPY --chown=node:node package*.json ./

WORKDIR /usr/src/app/apps/web

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

CMD ["node", "index.js"]
