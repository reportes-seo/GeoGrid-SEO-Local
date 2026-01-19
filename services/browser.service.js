/**
 * Browser service (Singleton)
 * Manages a single Puppeteer browser instance
 */

const puppeteer = require('puppeteer');
const puppeteerConfig = require('../config/puppeteer.config');
const logger = require('../utils/logger.utils');

class BrowserService {
  constructor() {
    this.browser = null;
    this.pages = new Set();
    this.startTime = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.isShuttingDown = false;

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Get or create browser instance
   * @returns {Promise<Browser>}
   */
  async getBrowser() {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    logger.info('Creating new browser instance');

    try {
      this.browser = await puppeteer.launch(puppeteerConfig.launch);
      this.startTime = Date.now();
      this.reconnectAttempts = 0;

      // Handle browser disconnection
      this.browser.on('disconnected', () => {
        logger.warn('Browser disconnected');
        this.browser = null;
      });

      logger.info('Browser instance created successfully');
      return this.browser;
    } catch (error) {
      logger.error('Failed to create browser instance', { error: error.message });
      throw new Error(`Browser creation failed: ${error.message}`);
    }
  }

  /**
   * Create a new page with standard configuration
   * @returns {Promise<Page>}
   */
  async newPage() {
    const browser = await this.getBrowser();

    try {
      const page = await browser.newPage();
      this.pages.add(page);

      // Set default timeout
      page.setDefaultTimeout(puppeteerConfig.navigation.timeout);

      // Block unnecessary resources for faster loading (but allow images for map tiles)
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        // Allow documents, scripts, stylesheets, images (for map tiles), and API calls
        if (['document', 'script', 'stylesheet', 'xhr', 'fetch', 'image'].includes(resourceType)) {
          request.continue();
        } else {
          // Block fonts, media, websockets, etc.
          request.abort();
        }
      });

      // Handle page errors
      page.on('error', (error) => {
        logger.error('Page error', { error: error.message });
      });

      page.on('pageerror', (error) => {
        logger.error('Page JavaScript error', { error: error.message });
      });

      logger.debug('New page created', { totalPages: this.pages.size });
      return page;
    } catch (error) {
      logger.error('Failed to create new page', { error: error.message });
      throw new Error(`Page creation failed: ${error.message}`);
    }
  }

  /**
   * Close a page cleanly
   * @param {Page} page
   */
  async closePage(page) {
    if (!page) return;

    try {
      this.pages.delete(page);
      await page.close();
      logger.debug('Page closed', { totalPages: this.pages.size });
    } catch (error) {
      logger.error('Failed to close page', { error: error.message });
    }
  }

  /**
   * Restart browser instance
   */
  async restart() {
    logger.info('Restarting browser');

    try {
      await this.shutdown();
      await this.getBrowser();
      logger.info('Browser restarted successfully');
    } catch (error) {
      logger.error('Failed to restart browser', { error: error.message });
      throw error;
    }
  }

  /**
   * Shutdown browser and cleanup
   */
  async shutdown() {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    logger.info('Shutting down browser service');

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Close all pages
    const pagePromises = Array.from(this.pages).map(page => this.closePage(page));
    await Promise.all(pagePromises);

    // Close browser
    if (this.browser) {
      try {
        await this.browser.close();
        logger.info('Browser closed');
      } catch (error) {
        logger.error('Error closing browser', { error: error.message });
      }
      this.browser = null;
    }

    this.isShuttingDown = false;
  }

  /**
   * Get browser statistics
   * @returns {Object}
   */
  getStats() {
    const uptime = this.startTime ? Date.now() - this.startTime : 0;

    return {
      isConnected: this.browser && this.browser.isConnected(),
      pages: this.pages.size,
      uptime: Math.floor(uptime / 1000),
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Start cleanup interval to remove orphaned pages
   */
  startCleanupInterval() {
    const interval = puppeteerConfig.performance.cleanupInterval || 300000;

    this.cleanupInterval = setInterval(async () => {
      if (this.pages.size > puppeteerConfig.performance.maxPages) {
        logger.warn('Too many pages open, cleaning up', { pages: this.pages.size });

        // Close oldest pages
        const pagesToClose = Array.from(this.pages).slice(0, this.pages.size - puppeteerConfig.performance.maxPages);
        await Promise.all(pagesToClose.map(page => this.closePage(page)));
      }
    }, interval);
  }
}

// Export singleton instance
module.exports = new BrowserService();
