########################
# Build stage
########################
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm install --legacy-peer-deps --include=dev
COPY . .
# Ensure standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

########################
# Runtime stage (standalone)
########################
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]


