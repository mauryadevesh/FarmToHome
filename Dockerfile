# Multi-stage Dockerfile for FarmToHome
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm install

# Copy source code and build frontend bundle
COPY . .
RUN npm run build

# Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY package*.json ./
RUN npm install --omit=dev

COPY server.js ./
COPY api ./api
COPY supabase ./supabase
COPY --from=builder /app/build ./build
COPY --from=builder /app/farmtohome_products.csv ./farmtohome_products.csv

EXPOSE 5001

CMD ["node", "server.js"]
