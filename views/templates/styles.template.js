/**
 * Styles template
 * CSS for the GeoGrid report
 */

function getStyles(theme = 'default') {
  const themes = {
    default: {
      background: '#ffffff',
      text: '#2c3e50',
      headerBg: '#34495e',
      headerText: '#ffffff',
      border: '#bdc3c7',
      metricBg: '#ecf0f1'
    },
    dark: {
      background: '#1a1a1a',
      text: '#ecf0f1',
      headerBg: '#2c3e50',
      headerText: '#ffffff',
      border: '#34495e',
      metricBg: '#2c3e50'
    },
    light: {
      background: '#f8f9fa',
      text: '#2c3e50',
      headerBg: '#3498db',
      headerText: '#ffffff',
      border: '#dee2e6',
      metricBg: '#ffffff'
    }
  };

  const colors = themes[theme] || themes.default;

  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: ${colors.background};
      color: ${colors.text};
      line-height: 1.6;
    }

    .container {
      width: 100%;
      max-width: 100%;
    }

    .header {
      background: ${colors.headerBg};
      color: ${colors.headerText};
      padding: 20px;
      text-align: center;
    }

    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .header .subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 8px;
    }

    .header .metadata {
      font-size: 13px;
      opacity: 0.8;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding: 20px;
      background: ${colors.metricBg};
    }

    .metric-card {
      text-align: center;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid ${colors.border};
      background: ${colors.background};
    }

    .metric-card .label {
      font-size: 13px;
      color: #7f8c8d;
      margin-bottom: 8px;
      text-transform: uppercase;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .metric-card .value {
      font-size: 28px;
      font-weight: 700;
      color: #2c3e50;
    }

    .metric-card.georank .value {
      color: #3498db;
    }

    .metric-card.position .value {
      color: #e67e22;
    }

    .metric-card.localpack .value {
      color: #27ae60;
    }

    .metric-card.coverage .value {
      color: #9b59b6;
    }

    .map-container {
      position: relative;
      padding: 20px;
    }

    #map {
      width: 100%;
      height: 500px;
      border-radius: 8px;
      border: 2px solid ${colors.border};
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .legend {
      margin-top: 20px;
      padding: 16px;
      background: ${colors.background};
      border: 1px solid ${colors.border};
      border-radius: 8px;
    }

    .legend h3 {
      font-size: 16px;
      margin-bottom: 12px;
      color: ${colors.text};
    }

    .legend-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .legend-color {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid rgba(0,0,0,0.1);
    }

    .footer {
      padding: 16px 20px;
      text-align: center;
      border-top: 1px solid ${colors.border};
      font-size: 12px;
      color: #7f8c8d;
    }

    .footer .brand {
      font-weight: 600;
      color: ${colors.text};
    }

    /* Leaflet custom styles */
    .custom-marker {
      background-color: #fff;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }

    .business-marker {
      font-size: 24px;
    }
  `;
}

module.exports = { getStyles };
