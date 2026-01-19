/**
 * Metrics utility
 * Calculates SEO local ranking metrics
 */

/**
 * Calculate GeoRank - proprietary visibility metric
 * Formula: 1 / average_position (higher = better)
 * @param {Array<number|null>} positions - Array of positions
 * @returns {number} GeoRank value (0.00 - 1.00)
 */
function calculateGeoRank(positions) {
  const validPositions = positions.filter(p => p !== null && p !== undefined && typeof p === 'number');

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
  const validPositions = positions.filter(p => p !== null && p !== undefined && typeof p === 'number');

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
  const localPackPositions = positions.filter(p => p !== null && p >= 1 && p <= 3);
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
  const foundPositions = positions.filter(p => p !== null && p !== undefined && typeof p === 'number');
  const percentage = (foundPositions.length / totalPoints) * 100;

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
  const distribution = {
    position1: 0,
    localPack: 0,      // 2-3
    top7: 0,           // 4-7
    top10: 0,          // 8-10
    page1: 0,          // 11-20
    page2Plus: 0,      // 21+
    notFound: 0
  };

  positions.forEach(pos => {
    if (pos === null || pos === undefined) {
      distribution.notFound++;
    } else if (pos === 1) {
      distribution.position1++;
    } else if (pos >= 2 && pos <= 3) {
      distribution.localPack++;
    } else if (pos >= 4 && pos <= 7) {
      distribution.top7++;
    } else if (pos >= 8 && pos <= 10) {
      distribution.top10++;
    } else if (pos >= 11 && pos <= 20) {
      distribution.page1++;
    } else if (pos >= 21) {
      distribution.page2Plus++;
    }
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
