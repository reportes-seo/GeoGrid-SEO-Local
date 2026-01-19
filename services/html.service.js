/**
 * HTML service
 * Generates HTML content for the GeoGrid report
 */

const { generateHTML } = require('../views/templates/geogrid.template');
const { generateGridData } = require('./grid.service');
const logger = require('../utils/logger.utils');

/**
 * Generate report HTML
 * @param {Object} gridConfig - Grid configuration
 * @param {Object} renderOptions - Render options
 * @returns {string} HTML content
 */
function generateReportHTML(gridConfig, renderOptions) {
  logger.debug('Generating report HTML');

  try {
    // Generate grid data with metrics
    const gridData = generateGridData(gridConfig);

    // Generate HTML
    const html = generateHTML(gridConfig, gridData, renderOptions);

    logger.debug('Report HTML generated', {
      htmlLength: html.length,
      gridPoints: gridData.points.length
    });

    return {
      html,
      gridData,
      metadata: {
        generatedAt: new Date().toISOString(),
        gridSize: gridConfig.gridSize,
        totalPoints: gridData.points.length,
        metrics: gridData.metrics
      }
    };
  } catch (error) {
    logger.error('Failed to generate report HTML', { error: error.message });
    throw new Error(`HTML generation failed: ${error.message}`);
  }
}

module.exports = {
  generateReportHTML
};
