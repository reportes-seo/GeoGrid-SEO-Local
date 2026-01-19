/**
 * Application configuration
 * General app settings
 */

const envConfig = require('./env.config');

const appConfig = {
  // Server
  server: {
    port: envConfig.port,
    host: envConfig.host,
    env: envConfig.nodeEnv
  },

  // CORS settings
  cors: {
    origin: envConfig.isProduction ? false : '*',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // Compression
  compression: {
    level: 6,
    threshold: 1024
  },

  // Request limits
  limits: {
    jsonLimit: '5mb',
    urlEncodedLimit: '5mb',
    parameterLimit: 1000
  },

  // Timeouts
  timeouts: {
    request: 60000,
    render: 30000,
    browser: envConfig.puppeteer.timeout
  },

  // Defaults
  defaults: envConfig.defaults,

  // Feature flags
  features: {
    enablePreview: true,
    enableBase64Response: true,
    enableMetrics: true
  }
};

module.exports = appConfig;
