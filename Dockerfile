FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/dist dist
CMD ["node","dist/app.js"]
