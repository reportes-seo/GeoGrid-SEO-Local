/**
 * Rate limit middleware
 * Simple in-memory rate limiting
 */

const envConfig = require('../config/env.config');
const logger = require('../utils/logger.utils');

class RateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();

    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), this.windowMs);
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create request log for this identifier
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const requestLog = this.requests.get(identifier);

    // Remove old requests outside the window
    const recentRequests = requestLog.filter(timestamp => timestamp > windowStart);
    this.requests.set(identifier, recentRequests);

    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }

    const requestLog = this.requests.get(identifier);
    const recentRequests = requestLog.filter(timestamp => timestamp > windowStart);

    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, requestLog] of this.requests.entries()) {
      const recentRequests = requestLog.filter(timestamp => timestamp > windowStart);

      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }

    logger.debug('Rate limiter cleanup', { activeIdentifiers: this.requests.size });
  }
}

// Create global rate limiter instance
const rateLimiter = new RateLimiter(
  envConfig.rateLimit.windowMs,
  envConfig.rateLimit.maxRequests
);

/**
 * Rate limit middleware
 */
function rateLimitMiddleware(req, res, next) {
  // Use IP address as identifier
  const identifier = req.ip || req.connection.remoteAddress || 'unknown';

  if (!rateLimiter.isAllowed(identifier)) {
    const remaining = rateLimiter.getRemaining(identifier);

    logger.warn('Rate limit exceeded', { identifier });

    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(envConfig.rateLimit.windowMs / 1000)
      }
    });
  }

  // Add rate limit headers
  const remaining = rateLimiter.getRemaining(identifier);
  res.setHeader('X-RateLimit-Limit', envConfig.rateLimit.maxRequests);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', Date.now() + envConfig.rateLimit.windowMs);

  next();
}

module.exports = rateLimitMiddleware;
