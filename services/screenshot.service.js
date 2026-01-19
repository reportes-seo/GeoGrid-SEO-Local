/**
 * Screenshot service
 * Captures screenshots of the GeoGrid report
 */

const browserService = require('./browser.service');
const puppeteerConfig = require('../config/puppeteer.config');
const logger = require('../utils/logger.utils');

/**
 * Sleep helper function (replacement for deprecated waitForTimeout)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Capture screenshot from HTML content
 * @param {string} html - HTML content
 * @param {Object} renderOptions - Render options
 * @returns {Promise<Buffer>} Screenshot buffer
 */
async function captureScreenshot(html, renderOptions) {
  const { width, height, format, quality } = renderOptions;

  logger.debug('Starting screenshot capture', { width, height, format });

  let page = null;
  const startTime = Date.now();

  try {
    // Create new page
    page = await browserService.newPage();

    // Set viewport
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 1
    });

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: puppeteerConfig.navigation.timeout
    });

    // Wait for map to be ready
    await page.waitForFunction(
      () => window.GEOGRID_READY === true || window.GEOGRID_ERROR,
      { timeout: 15000 }
    );

    // Check for errors
    const hasError = await page.evaluate(() => window.GEOGRID_ERROR);
    if (hasError) {
      throw new Error(`Map initialization error: ${hasError}`);
    }

    // Wait additional time for tiles to fully load and render
    await sleep(2000);

    // Get actual content height to ensure everything fits in the screenshot
    const contentHeight = await page.evaluate(() => {
      const container = document.querySelector('.container');
      return container ? container.scrollHeight : document.body.scrollHeight;
    });

    // Adjust viewport height if content is taller than current viewport
    if (contentHeight > height) {
      await page.setViewport({
        width,
        height: contentHeight,
        deviceScaleFactor: 1
      });
      logger.debug('Adjusted viewport height for full content', {
        originalHeight: height,
        contentHeight
      });
    }

    // Capture screenshot
    const screenshotOptions = {
      type: format,
      encoding: 'binary',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: width,
        height: contentHeight > height ? contentHeight : height
      }
    };

    // Add quality for jpeg/webp
    if (format === 'jpeg' || format === 'webp') {
      screenshotOptions.quality = quality;
    }

    const screenshot = await page.screenshot(screenshotOptions);

    const renderTime = Date.now() - startTime;
    logger.info('Screenshot captured successfully', {
      renderTime,
      size: screenshot.length,
      format
    });

    return {
      buffer: screenshot,
      renderTime,
      size: screenshot.length,
      format
    };
  } catch (error) {
    logger.error('Screenshot capture failed', {
      error: error.message,
      elapsed: Date.now() - startTime
    });
    throw new Error(`Screenshot capture failed: ${error.message}`);
  } finally {
    // Always close the page
    if (page) {
      await browserService.closePage(page);
    }
  }
}

/**
 * Capture screenshot and return as base64
 * @param {string} html - HTML content
 * @param {Object} renderOptions - Render options
 * @returns {Promise<Object>} Screenshot data with base64
 */
async function captureScreenshotBase64(html, renderOptions) {
  const result = await captureScreenshot(html, renderOptions);

  return {
    data: result.buffer.toString('base64'),
    renderTime: result.renderTime,
    size: result.size,
    format: result.format
  };
}

module.exports = {
  captureScreenshot,
  captureScreenshotBase64
};
