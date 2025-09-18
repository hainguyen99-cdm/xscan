########################
# Build stage
########################
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm install --legacy-peer-deps --include=dev
COPY . .
# Build app (must succeed to produce standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
# Ensure prerender manifest exists to allow `next start`
RUN node -e "const fs=require('fs');const dir='.next';const file=dir+'/prerender-manifest.json';if(!fs.existsSync(dir)){fs.mkdirSync(dir,{recursive:true});}if(!fs.existsSync(file)){fs.writeFileSync(file, JSON.stringify({version:3,routes:{},dynamicRoutes:{},notFoundRoutes:[],preview:{previewModeId:'',previewModeSigningKey:'',previewModeEncryptionKey:''}}, null, 2));}"
# Reduce image size before copying to runner
RUN npm prune --omit=dev && npm cache clean --force

########################
# Runtime stage (standalone)
########################
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Use Next.js standalone output to avoid copying node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/prerender-manifest.json ./.next/prerender-manifest.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["npm", "start"]


