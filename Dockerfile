# Stage 1: Build the production bundle
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts || npm install

COPY . .
RUN npm run build

# Stage 2: Minimal production static runtime with non-root user
FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S cinesearch -u 1001 -G nodejs
RUN npm install -g serve@14

COPY --from=builder --chown=cinesearch:nodejs /app/dist ./dist

USER cinesearch

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]