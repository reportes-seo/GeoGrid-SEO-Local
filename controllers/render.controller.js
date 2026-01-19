/**
 * Render controller
 * Handles report rendering endpoints
 */

const { generateReportHTML } = require('../services/html.service');
const { captureScreenshot, captureScreenshotBase64 } = require('../services/screenshot.service');
const logger = require('../utils/logger.utils');

/**
 * Render report as PNG image
 */
async function renderImage(req, res) {
  const { gridConfig, renderOptions } = req.validatedData;

  logger.info('Rendering image', {
    keyword: gridConfig.keyword,
    business: gridConfig.business,
    gridSize: gridConfig.gridSize
  });

  try {
    // Generate HTML
    const { html, gridData } = generateReportHTML(gridConfig, renderOptions);

    // Capture screenshot
    const screenshot = await captureScreenshot(html, renderOptions);

    // Set headers
    res.setHeader('Content-Type', `image/${renderOptions.format}`);
    res.setHeader('Content-Length', screenshot.buffer.length);
    res.setHeader('X-Render-Time', `${screenshot.renderTime}ms`);
    res.setHeader('X-Grid-Points', gridData.points.length);
    res.setHeader('X-GeoRank', gridData.metrics.geoRank.toFixed(2));

    // Send image
    res.send(screenshot.buffer);

    logger.info('Image rendered successfully', {
      renderTime: screenshot.renderTime,
      size: screenshot.size,
      format: renderOptions.format
    });
  } catch (error) {
    logger.error('Image render failed', { error: error.message });
    throw error;
  }
}

/**
 * Render report as base64 JSON response
 */
async function renderBase64(req, res) {
  const { gridConfig, renderOptions } = req.validatedData;

  logger.info('Rendering base64', {
    keyword: gridConfig.keyword,
    business: gridConfig.business,
    gridSize: gridConfig.gridSize
  });

  try {
    // Generate HTML
    const { html, gridData } = generateReportHTML(gridConfig, renderOptions);

    // Capture screenshot as base64
    const screenshot = await captureScreenshotBase64(html, renderOptions);

    // Build response
    const response = {
      success: true,
      data: screenshot.data,
      metadata: {
        renderTime: screenshot.renderTime,
        size: screenshot.size,
        format: screenshot.format,
        gridPoints: gridData.points.length
      },
      metrics: {
        geoRank: gridData.metrics.geoRank,
        avgPosition: gridData.metrics.avgPosition,
        localPackPct: gridData.metrics.localPackPct,
        coverage: gridData.metrics.coverage.percentage
      }
    };

    // Set headers
    res.setHeader('X-Render-Time', `${screenshot.renderTime}ms`);
    res.setHeader('X-Grid-Points', gridData.points.length);
    res.setHeader('X-GeoRank', gridData.metrics.geoRank.toFixed(2));

    res.json(response);

    logger.info('Base64 rendered successfully', {
      renderTime: screenshot.renderTime,
      size: screenshot.size
    });
  } catch (error) {
    logger.error('Base64 render failed', { error: error.message });
    throw error;
  }
}

module.exports = {
  renderImage,
  renderBase64
};
