/**
 * Server entry point
 * Starts the HTTP server and handles graceful shutdown
 */

const app = require('./app');
const browserService = require('./services/browser.service');
const envConfig = require('./config/env.config');
const logger = require('./utils/logger.utils');

const PORT = envConfig.port;
const HOST = envConfig.host;

let server;

/**
 * Start server
 */
async function start() {
  try {
    logger.info('Starting GeoGrid Server...', {
      env: envConfig.nodeEnv,
      port: PORT,
      host: HOST
    });

    // Initialize browser
    logger.info('Initializing browser...');
    await browserService.getBrowser();
    logger.info('Browser initialized successfully');

    // Start HTTP server
    server = app.listen(PORT, HOST, () => {
      logger.info(`Server running at http://${HOST}:${PORT}`, {
        env: envConfig.nodeEnv,
        nodeVersion: process.version
      });
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error', { error: error.message });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown(signal) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  // Give ongoing requests time to complete
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Shutdown browser
  try {
    await browserService.shutdown();
    logger.info('Browser service shut down');
  } catch (error) {
    logger.error('Error shutting down browser', { error: error.message });
  }

  logger.info('Graceful shutdown complete');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', {
    reason: reason,
    promise: promise
  });
  shutdown('unhandledRejection');
});

// Start the server
start();
