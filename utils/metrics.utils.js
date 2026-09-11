/**
 * Metrics utility
 * Calculates SEO local ranking metrics
 *
 * Los tramos de posicion NO se definen aqui: se derivan de POSITION_RANGES
 * (utils/colors.utils.js), que es la unica fuente de verdad del sistema.
 */

const { POSITION_RANGES, NOT_FOUND_RANGE, isFoundPosition, getRange } = require('./colors.utils');

/**
 * Last position considered part of the Local Pack (Google's top 3 block)
 */
const LOCAL_PACK_MAX = POSITION_RANGES.find(range => range.key === 'localPack').max;

/**
 * Calculate GeoRank - proprietary visibility metric
 * Formula: 1 / average_position (higher = better)
 * @param {Array<number|null>} positions - Array of positions
 * @returns {number} GeoRank value (0.00 - 1.00)
 */
function calculateGeoRank(positions) {
  const validPositions = positions.filter(isFoundPosition);

  if (validPositions.length === 0) {
    return 0.00;
  }

  const avgPosition = validPositions.reduce((sum, pos) => sum + pos, 0) / validPositions.length;
  const geoRank = 1 / avgPosition;

  // Normalize to 0-1 scale (cap at 1.0 for position 1)
  return Math.min(parseFloat(geoRank.toFixed(4)), 1.00);
}

/**
 * Calculate average position where business appears
 * @param {Array<number|null>} positions - Array of positions
 * @returns {number|null} Average position or null if not found anywhere
 */
function calculateAvgPosition(positions) {
  const validPositions = positions.filter(isFoundPosition);

  if (validPositions.length === 0) {
    return null;
  }

  const sum = validPositions.reduce((acc, pos) => acc + pos, 0);
  const avg = sum / validPositions.length;

  return parseFloat(avg.toFixed(2));
}

/**
 * Calculate percentage of points where business is in Local Pack (top 3)
 * @param {Array<number|null>} positions - Array of positions
 * @param {number} totalPoints - Total number of grid points
 * @returns {number} Percentage (0-100)
 */
function calculateLocalPackPercentage(positions, totalPoints) {
  if (!totalPoints) {
    return 0.00;
  }

  const localPackPositions = positions.filter(
    p => isFoundPosition(p) && p >= 1 && p <= LOCAL_PACK_MAX
  );
  const percentage = (localPackPositions.length / totalPoints) * 100;

  return parseFloat(percentage.toFixed(2));
}

/**
 * Calculate coverage - points where business was found
 * @param {Array<number|null>} positions - Array of positions
 * @param {number} totalPoints - Total number of grid points
 * @returns {{found: number, total: number, percentage: number}}
 */
function calculateCoverage(positions, totalPoints) {
  const foundPositions = positions.filter(isFoundPosition);
  const percentage = totalPoints ? (foundPositions.length / totalPoints) * 100 : 0;

  return {
    found: foundPositions.length,
    total: totalPoints,
    percentage: parseFloat(percentage.toFixed(2))
  };
}

/**
 * Calculate distribution of positions by range
 * @param {Array<number|null>} positions - Array of positions
 * @returns {Object} Distribution by range
 */
function calculateDistribution(positions) {
  // Una clave por tramo definido en POSITION_RANGES, inicializadas a 0
  const distribution = {};
  [...POSITION_RANGES, NOT_FOUND_RANGE].forEach(range => {
    distribution[range.key] = 0;
  });

  positions.forEach(pos => {
    distribution[getRange(pos).key]++;
  });

  return distribution;
}

/**
 * Calculate all metrics at once
 * @param {Array<number|null>} positions - Array of positions
 * @returns {Object} All metrics
 */
function calculateAllMetrics(positions) {
  const totalPoints = positions.length;
  const coverage = calculateCoverage(positions, totalPoints);
  const distribution = calculateDistribution(positions);

  return {
    geoRank: calculateGeoRank(positions),
    avgPosition: calculateAvgPosition(positions),
    localPackPct: calculateLocalPackPercentage(positions, totalPoints),
    coverage: coverage,
    foundIn: coverage.found,
    totalPoints: totalPoints,
    distribution: distribution
  };
}

/**
 * Format metric for display
 * @param {string} metricName - Name of the metric
 * @param {any} value - Metric value
 * @returns {string} Formatted metric
 */
function formatMetric(metricName, value) {
  switch (metricName) {
    case 'geoRank':
      return value !== null ? value.toFixed(2) : '0.00';
    case 'avgPosition':
      return value !== null ? value.toFixed(1) : 'N/A';
    case 'localPackPct':
      return `${value.toFixed(0)}%`;
    case 'coverage':
      return `${value.percentage.toFixed(0)}%`;
    default:
      return String(value);
  }
}

/**
 * Get metric label
 * @param {string} metricName - Name of the metric
 * @returns {string} Human-readable label
 */
function getMetricLabel(metricName) {
  const labels = {
    geoRank: 'GeoRank',
    avgPosition: 'Posición Media',
    localPackPct: 'Local Pack',
    coverage: 'Cobertura'
  };

  return labels[metricName] || metricName;
}

module.exports = {
  calculateGeoRank,
  calculateAvgPosition,
  calculateLocalPackPercentage,
  calculateCoverage,
  calculateDistribution,
  calculateAllMetrics,
  formatMetric,
  getMetricLabel
};
