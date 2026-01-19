/**
 * Error middleware
 * Global error handler
 */

const logger = require('../utils/logger.utils');
const envConfig = require('../config/env.config');

/**
 * Custom error classes
 */
class RenderError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RenderError';
    this.statusCode = 500;
  }
}

class BrowserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BrowserError';
    this.statusCode = 503;
  }
}

/**
 * Error code mapping
 */
const ERROR_CODES = {
  ValidationError: 'VALIDATION_ERROR',
  RenderError: 'RENDER_ERROR',
  BrowserError: 'BROWSER_ERROR',
  Error: 'INTERNAL_ERROR'
};

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  // Log error
  logger.error('Request error', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    stack: envConfig.isDevelopment ? err.stack : undefined
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  const errorCode = ERROR_CODES[err.name] || ERROR_CODES.Error;

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'Internal server error'
    }
  };

  // Add details in development or for validation errors
  if (envConfig.isDevelopment || err.name === 'ValidationError') {
    if (err.details && err.details.length > 0) {
      errorResponse.error.details = err.details;
    }

    if (envConfig.isDevelopment && err.stack) {
      errorResponse.error.stack = err.stack;
    }
  }

  // Send response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 handler
 */
function notFoundHandler(req, res) {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
}

/**
 * Async handler wrapper
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  RenderError,
  BrowserError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
