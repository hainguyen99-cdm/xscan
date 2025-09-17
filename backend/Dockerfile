########################
# Build stage
########################
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
RUN apk add --no-cache libc6-compat
COPY package*.json ./
# Install full + dev deps to build (no lockfile present)
RUN npm install --legacy-peer-deps --include=dev
COPY . .
RUN npm run build

########################
# Runtime stage
########################
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001
# Only copy required artifacts
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --legacy-peer-deps
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD wget -qO- http://localhost:3001/api/health || exit 1
CMD ["node", "dist/src/main.js"]