/**
 * Main router
 * Combines all route modules
 */

const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.routes');
const renderRoutes = require('./render.routes');

// Mount routes
router.use('/health', healthRoutes);
router.use('/api', renderRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'GeoGrid SEO Local Server',
    version: '1.0.0',
    description: 'Microservicio para generar informes visuales de posicionamiento SEO local',
    endpoints: {
      health: '/health',
      ready: '/health/ready',
      live: '/health/live',
      render: 'POST /api/render',
      renderBase64: 'POST /api/render/base64',
      preview: 'GET /api/preview?keyword=...&business=...&lat=...&lng=...&positions=[...]',
      previewPresets: 'GET /api/preview/presets',
      previewPreset: 'GET /api/preview/:presetId'
    },
    docs: 'https://github.com/yourusername/geogrid-server'
  });
});

module.exports = router;
