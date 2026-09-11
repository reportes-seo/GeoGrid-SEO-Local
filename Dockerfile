# Base image
#
# Node 22 LTS es OBLIGATORIO, no una preferencia: Puppeteer 25 es ESM puro
# ("type": "module") y declara engines >=22.12.0. Este proyecto es CommonJS, asi
# que depende de require(esm), que Node habilito por defecto en la 22.12.
# Con node:18 el arranque muere con ERR_REQUIRE_ESM al cargar puppeteer.
# Node 18 esta ademas fuera de soporte desde 2025.
#
# La etiqueta fija bookworm a proposito: en trixie varios paquetes de abajo
# cambiaron de nombre (libasound2 -> libasound2t64) y el build romperia.
FROM node:22-bookworm-slim

# Chromium y lo minimo para renderizar texto.
# El paquete chromium de Debian ya arrastra sus propias librerias (nss, atk,
# cups, x11...), asi que no se listan una a una: esa lista se rompia en cada
# cambio de release de Debian.
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-dejavu-core \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer environment variables
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Create necessary directories for Puppeteer with correct permissions
RUN mkdir -p /app/.cache && \
    chown -R node:node /app

# Run as non-root user
USER node

# Start server
CMD ["node", "server.js"]
