/**
 * Health controller
 * Handles health check endpoints
 */

const browserService = require('../services/browser.service');
const logger = require('../utils/logger.utils');

/**
 * Main health check
 */
async function getHealth(req, res) {
  const browserStats = browserService.getStats();
  const memoryUsage = process.memoryUsage();

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024)
    },
    browser: {
      connected: browserStats.isConnected,
      pages: browserStats.pages,
      uptime: browserStats.uptime
    }
  };

  logger.debug('Health check requested', health);

  res.json(health);
}

/**
 * Readiness probe (for Kubernetes)
 */
async function getReady(req, res) {
  try {
    const browserStats = browserService.getStats();

    if (!browserStats.isConnected) {
      // Try to initialize browser
      await browserService.getBrowser();
    }

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });

    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Liveness probe (for Kubernetes)
 */
async function getLive(req, res) {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getHealth,
  getReady,
  getLive
};
