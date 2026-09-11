/**
 * Environment configuration
 * Validates and provides environment variables with defaults
 */

// quiet: dotenv 17 imprime un banner promocional al cargar; fuera de los logs.
require('dotenv').config({ quiet: true });

const { buildTileUrl, getAttributionFor } = require('../utils/tiles.utils');

// Lo unico que se configura por entorno es la CLAVE. La URL completa (con sus
// {z}/{x}/{y}) la construye el codigo, y la atribucion legal se deduce de ella.
// TILE_URL sigue soportada como escape para un proveedor distinto de CARTO.
const tileUrl = process.env.TILE_URL || buildTileUrl(process.env.TILE_API_KEY);

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',

  // Puppeteer
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    timeout: parseInt(process.env.PUPPETEER_TIMEOUT, 10) || 30000
  },

  // Tiles del mapa (proveedor configurable: cambiarlo NO exige tocar codigo)
  //
  // Default: OpenStreetMap oficial, sin API key. CARTO se descarto como default
  // porque desde 2026 estampa "API KEY REQUIRED" sobre los tiles gratuitos, y esa
  // marca de agua acababa dentro de los informes de cliente.
  // Para usar un proveedor de pago basta con definir TILE_URL y TILE_ATTRIBUTION.
  tiles: {
    url: tileUrl,
    // La atribucion es HTML y obligatoria por licencia, pero no se pide por entorno:
    // se deduce del proveedor que aparezca en TILE_URL (utils/tiles.utils.js).
    // TILE_ATTRIBUTION queda como escape para un proveedor no reconocido.
    attribution: process.env.TILE_ATTRIBUTION || getAttributionFor(tileUrl),
    subdomains: process.env.TILE_SUBDOMAINS || 'abc'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  // Defaults
  defaults: {
    gridSize: parseInt(process.env.DEFAULT_GRID_SIZE, 10) || 9,
    radiusKm: parseFloat(process.env.DEFAULT_RADIUS_KM) || 4.0,
    markerSize: parseInt(process.env.DEFAULT_MARKER_SIZE, 10) || 28,
    brandText: process.env.DEFAULT_BRAND_TEXT || 'EquipoSEO'
  },

  // Screenshot
  screenshot: {
    width: parseInt(process.env.DEFAULT_WIDTH, 10) || 800,
    height: parseInt(process.env.DEFAULT_HEIGHT, 10) || 1100,
    format: process.env.DEFAULT_FORMAT || 'png',
    quality: parseInt(process.env.DEFAULT_QUALITY, 10) || 90
  },

  // Security
  security: {
    apiKeyEnabled: process.env.API_KEY_ENABLED === 'true',
    apiKeys: process.env.API_KEYS ? process.env.API_KEYS.split(',').map(key => key.trim()) : []
  },

  // Environment checks
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'INFO'
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const errors = [];

  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.push('PORT must be a valid port number (1-65535)');
  }

  if (config.defaults.gridSize < 3 || config.defaults.gridSize > 15) {
    errors.push('DEFAULT_GRID_SIZE must be between 3 and 15');
  }

  if (config.defaults.radiusKm < 0.5 || config.defaults.radiusKm > 20) {
    errors.push('DEFAULT_RADIUS_KM must be between 0.5 and 20');
  }

  // Validate security configuration
  if (config.security.apiKeyEnabled && config.security.apiKeys.length === 0) {
    errors.push('API_KEY_ENABLED is true but no API_KEYS are configured');
  }

  if (config.security.apiKeyEnabled && config.security.apiKeys.some(key => key.length < 32)) {
    errors.push('All API keys must be at least 32 characters long for security');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Validate on load
validateConfig();

module.exports = config;
