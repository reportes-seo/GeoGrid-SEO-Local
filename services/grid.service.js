/**
 * Grid service
 * Handles grid coordinate calculations and data preparation
 */

const { generateGridCoordinates } = require('../utils/coordinates.utils');
const { getPositionColor, getTextColor, getDisplayText } = require('../utils/colors.utils');
const { calculateAllMetrics } = require('../utils/metrics.utils');
const logger = require('../utils/logger.utils');

/**
 * Generate grid data with positions and colors
 * @param {Object} gridConfig - Grid configuration
 * @returns {Object} Grid data
 */
function generateGridData(gridConfig) {
  const { centerLat, centerLng, gridSize, radiusKm, positions } = gridConfig;

  logger.debug('Generating grid data', { gridSize, radiusKm, totalPositions: positions.length });

  // Generate grid coordinates
  const coordinates = generateGridCoordinates(centerLat, centerLng, gridSize, radiusKm);

  // Combine coordinates with positions
  const gridPoints = coordinates.map((coord, index) => {
    const position = positions[index];

    return {
      lat: coord.lat,
      lng: coord.lng,
      index: coord.index,
      row: coord.row,
      col: coord.col,
      position: position,
      color: getPositionColor(position),
      textColor: getTextColor(position),
      displayText: getDisplayText(position)
    };
  });

  // Calculate metrics
  const metrics = calculateAllMetrics(positions);

  logger.debug('Grid data generated', {
    points: gridPoints.length,
    geoRank: metrics.geoRank,
    coverage: metrics.coverage.percentage
  });

  return {
    points: gridPoints,
    metrics: metrics,
    center: {
      lat: centerLat,
      lng: centerLng
    },
    bounds: calculateBounds(gridPoints),
    gridSize: gridSize,
    radiusKm: radiusKm
  };
}

/**
 * Calculate map bounds from grid points
 * @param {Array} gridPoints - Array of grid points
 * @returns {Object} Bounds
 */
function calculateBounds(gridPoints) {
  const lats = gridPoints.map(p => p.lat);
  const lngs = gridPoints.map(p => p.lng);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs)
  };
}

/**
 * Get grid summary statistics
 * @param {Object} gridData - Grid data
 * @returns {Object} Summary
 */
function getGridSummary(gridData) {
  return {
    totalPoints: gridData.points.length,
    gridSize: gridData.gridSize,
    radiusKm: gridData.radiusKm,
    center: gridData.center,
    bounds: gridData.bounds,
    metrics: {
      geoRank: gridData.metrics.geoRank,
      avgPosition: gridData.metrics.avgPosition,
      localPackPct: gridData.metrics.localPackPct,
      coverage: gridData.metrics.coverage.percentage
    }
  };
}

module.exports = {
  generateGridData,
  calculateBounds,
  getGridSummary
};
