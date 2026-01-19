/**
 * Preview controller
 * Handles HTML preview for debugging
 */

const { generateReportHTML } = require('../services/html.service');
const logger = require('../utils/logger.utils');

/**
 * Preview presets for testing
 */
const PRESETS = {
  demo: {
    keyword: 'comida para llevar',
    business: 'Restaurante El Buen Sabor',
    centerLat: 43.5596,
    centerLng: -5.9739,
    gridSize: 9,
    radiusKm: 4,
    positions: [10,6,4,3,5,9,10,6,9,1,6,5,2,2,3,5,6,10,9,5,2,2,2,2,1,3,null,6,4,2,1,1,1,3,5,null,null,2,1,2,1,1,2,2,null,7,5,2,1,1,1,1,2,5,21,2,2,2,3,2,1,3,7,21,2,3,1,2,2,5,21,null,2,9,3,10,21,5,null,5,10]
  },
  small: {
    keyword: 'pizza delivery',
    business: 'Pizza Express',
    centerLat: 40.4168,
    centerLng: -3.7038,
    gridSize: 5,
    radiusKm: 2,
    positions: [1,2,3,null,5,2,1,2,3,4,3,2,1,2,3,null,3,2,1,2,5,4,3,2,1]
  },
  large: {
    keyword: 'coffee shop',
    business: 'Starbucks Central',
    centerLat: 51.5074,
    centerLng: -0.1278,
    gridSize: 11,
    radiusKm: 6,
    positions: Array(121).fill(null).map((_, i) => {
      const rand = Math.random();
      if (rand < 0.1) return null;
      if (rand < 0.3) return Math.floor(Math.random() * 3) + 1;
      if (rand < 0.6) return Math.floor(Math.random() * 7) + 4;
      return Math.floor(Math.random() * 10) + 11;
    })
  }
};

/**
 * Preview report HTML from query params
 */
function previewFromQuery(req, res) {
  const { gridConfig, renderOptions } = req.validatedData;

  logger.info('Preview requested', {
    keyword: gridConfig.keyword,
    gridSize: gridConfig.gridSize
  });

  try {
    const { html } = generateReportHTML(gridConfig, renderOptions);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

    logger.info('Preview generated successfully');
  } catch (error) {
    logger.error('Preview generation failed', { error: error.message });
    throw error;
  }
}

/**
 * Preview report from preset
 */
function previewFromPreset(req, res) {
  const { presetId } = req.params;

  const preset = PRESETS[presetId];

  if (!preset) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'PRESET_NOT_FOUND',
        message: `Preset '${presetId}' not found`,
        availablePresets: Object.keys(PRESETS)
      }
    });
  }

  logger.info('Preview preset requested', { presetId });

  try {
    const { html } = generateReportHTML(preset, {});

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

    logger.info('Preview preset generated successfully', { presetId });
  } catch (error) {
    logger.error('Preview preset generation failed', {
      presetId,
      error: error.message
    });
    throw error;
  }
}

/**
 * List available presets
 */
function listPresets(req, res) {
  const presetList = Object.entries(PRESETS).map(([id, config]) => ({
    id,
    keyword: config.keyword,
    business: config.business,
    gridSize: config.gridSize,
    radiusKm: config.radiusKm,
    url: `/api/preview/${id}`
  }));

  res.json({
    success: true,
    presets: presetList
  });
}

module.exports = {
  previewFromQuery,
  previewFromPreset,
  listPresets,
  PRESETS
};
