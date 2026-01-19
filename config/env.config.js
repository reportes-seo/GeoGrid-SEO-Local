/**
 * Environment configuration
 * Validates and provides environment variables with defaults
 */

require('dotenv').config();

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
