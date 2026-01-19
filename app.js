/**
 * Express application configuration
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const appConfig = require('./config/app.config');
const routes = require('./routes');
const rateLimitMiddleware = require('./middleware/rateLimit.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger.utils');

// Create Express app
const app = express();

// Trust proxy (for rate limiting with IP addresses)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for preview HTML
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors(appConfig.cors));

// Compression
app.use(compression(appConfig.compression));

// Body parsers
app.use(express.json({
  limit: appConfig.limits.jsonLimit
}));
app.use(express.urlencoded({
  extended: true,
  limit: appConfig.limits.urlEncodedLimit,
  parameterLimit: appConfig.limits.parameterLimit
}));

// Rate limiting
app.use(rateLimitMiddleware);

// Request logging (development only)
if (appConfig.server.env !== 'production') {
  app.use((req, res, next) => {
    logger.debug('Incoming request', {
      method: req.method,
      path: req.path,
      ip: req.ip
    });
    next();
  });
}

// Mount routes
app.use('/', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
