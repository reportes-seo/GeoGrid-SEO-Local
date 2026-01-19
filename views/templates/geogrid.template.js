/**
 * GeoGrid template
 * Main HTML template for the report
 */

const { escapeHtml } = require('../../utils/escapeHtml.utils');
const { getLegendItems } = require('../../utils/colors.utils');
const { formatMetric, getMetricLabel } = require('../../utils/metrics.utils');
const { getStyles } = require('./styles.template');
const { getScripts } = require('./scripts.template');

/**
 * Generate complete HTML for GeoGrid report
 * @param {Object} gridConfig - Grid configuration
 * @param {Object} gridData - Grid data with metrics
 * @param {Object} renderOptions - Render options
 * @returns {string} HTML content
 */
function generateHTML(gridConfig, gridData, renderOptions) {
  const { keyword, business, radiusKm, gridSize } = gridConfig;
  const { metrics } = gridData;
  const { theme, showLegend, brandText } = renderOptions;

  // Sanitize user inputs
  const safeKeyword = escapeHtml(keyword);
  const safeBusiness = escapeHtml(business);
  const safeBrandText = escapeHtml(brandText || 'EquipoSEO');

  // Format date
  const reportDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate metrics HTML
  const metricsHTML = `
    <div class="metric-card georank">
      <div class="label">GeoRank</div>
      <div class="value">${formatMetric('geoRank', metrics.geoRank)}</div>
    </div>
    <div class="metric-card position">
      <div class="label">Posición Media</div>
      <div class="value">${formatMetric('avgPosition', metrics.avgPosition)}</div>
    </div>
    <div class="metric-card localpack">
      <div class="label">Local Pack</div>
      <div class="value">${formatMetric('localPackPct', metrics.localPackPct)}</div>
    </div>
    <div class="metric-card coverage">
      <div class="label">Cobertura</div>
      <div class="value">${formatMetric('coverage', metrics.coverage)}</div>
    </div>
  `;

  // Generate legend HTML
  const legendItems = getLegendItems();
  const legendHTML = showLegend ? `
    <div class="legend">
      <h3>Leyenda de Posiciones</h3>
      <div class="legend-items">
        ${legendItems.map(item => `
          <div class="legend-item">
            <div class="legend-color" style="background-color: ${item.color};"></div>
            <span>${item.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  // Complete HTML
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GeoGrid SEO Report - ${safeBusiness}</title>

  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

  <style>${getStyles(theme)}</style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${safeBusiness}</h1>
      <div class="subtitle">Informe de Posicionamiento Local: "${safeKeyword}"</div>
      <div class="metadata">
        Grid ${gridSize}x${gridSize} | Radio: ${radiusKm} km | ${reportDate}
      </div>
    </div>

    <!-- Metrics -->
    <div class="metrics">
      ${metricsHTML}
    </div>

    <!-- Map -->
    <div class="map-container">
      <div id="map"></div>
      ${legendHTML}
    </div>

    <!-- Footer -->
    <div class="footer">
      <span class="brand">Powered by ${safeBrandText}</span> |
      <span>Generado el ${reportDate}</span>
    </div>
  </div>

  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <!-- Map initialization -->
  <script>${getScripts(gridData, renderOptions)}</script>
</body>
</html>`;
}

module.exports = { generateHTML };
