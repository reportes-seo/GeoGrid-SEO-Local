/**
 * Authentication middleware
 * Validates API key for protected endpoints
 */

const logger = require('../utils/logger.utils');
const envConfig = require('../config/env.config');

/**
 * Custom authentication error
 */
class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

/**
 * Validate API key from request headers
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function validateApiKey(req, res, next) {
  try {
    // Get API key from headers (multiple formats supported)
    const apiKey =
      req.headers['x-api-key'] ||
      req.headers['authorization']?.replace('Bearer ', '') ||
      req.query.api_key;

    // Check if API key authentication is enabled
    if (!envConfig.security.apiKeyEnabled) {
      logger.debug('API key authentication is disabled');
      return next();
    }

    // Check if API key is provided
    if (!apiKey) {
      logger.warn('Missing API key', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });

      throw new AuthenticationError('API key is required. Provide it via X-API-Key header, Authorization Bearer token, or api_key query parameter');
    }

    // Validate API key
    const validApiKeys = envConfig.security.apiKeys;

    if (!validApiKeys.includes(apiKey)) {
      logger.warn('Invalid API key attempt', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        keyPrefix: apiKey.substring(0, 8) + '...'
      });

      throw new AuthenticationError('Invalid API key');
    }

    // API key is valid
    logger.debug('API key validated successfully', {
      ip: req.ip,
      path: req.path
    });

    // Attach API key info to request for logging
    req.apiKeyValidated = true;
    req.apiKeyPrefix = apiKey.substring(0, 8);

    next();
  } catch (error) {
    // Handle authentication errors
    if (error instanceof AuthenticationError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: error.message
        }
      });
    }

    // Other errors
    next(error);
  }
}

/**
 * Optional API key validation (doesn't block if missing)
 * Used for endpoints where auth is recommended but not required
 */
function optionalApiKey(req, res, next) {
  try {
    const apiKey =
      req.headers['x-api-key'] ||
      req.headers['authorization']?.replace('Bearer ', '') ||
      req.query.api_key;

    if (apiKey && envConfig.security.apiKeyEnabled) {
      const validApiKeys = envConfig.security.apiKeys;

      if (validApiKeys.includes(apiKey)) {
        req.apiKeyValidated = true;
        req.apiKeyPrefix = apiKey.substring(0, 8);
        logger.debug('Optional API key validated');
      } else {
        logger.warn('Invalid optional API key provided', { ip: req.ip });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  AuthenticationError,
  validateApiKey,
  optionalApiKey
};
