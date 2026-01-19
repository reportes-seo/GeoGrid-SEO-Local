/**
 * Puppeteer configuration
 * Browser and page settings
 */

const envConfig = require('./env.config');

const puppeteerConfig = {
  // Browser launch options
  launch: {
    headless: envConfig.puppeteer.headless,
    executablePath: envConfig.puppeteer.executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    }
  },

  // Page navigation options
  navigation: {
    waitUntil: 'networkidle0',
    timeout: envConfig.puppeteer.timeout
  },

  // Screenshot default options
  screenshot: {
    type: envConfig.screenshot.format,
    quality: envConfig.screenshot.quality,
    encoding: 'binary',
    fullPage: false
  },

  // Performance optimizations
  performance: {
    maxPages: 10,
    pageIdleTimeout: 60000,
    cleanupInterval: 300000
  }
};

module.exports = puppeteerConfig;
