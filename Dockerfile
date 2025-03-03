# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y lockfile primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el proyecto
COPY . .

# Build de la app
RUN npm run build

# Limpiar deps dev (opcional, si te preocupa el peso)
RUN npm prune --production

# Etapa 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario desde el builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.ts
COPY --from=builder /app/package*.json ./

# Exponer puerto
EXPOSE 3000

# Comando de arranque
CMD ["npm", "start"]
