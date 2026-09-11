/**
 * Render routes
 */

const express = require('express');
const router = express.Router();
const renderController = require('../controllers/render.controller');
const previewController = require('../controllers/preview.controller');
const { validateRenderRequest, validatePreviewQuery } = require('../middleware/validation.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { validateApiKey } = require('../middleware/auth.middleware');

// POST /api/render - Render image (PROTECTED)
router.post('/render', validateApiKey, validateRenderRequest, asyncHandler(renderController.renderImage));

// POST /api/render/base64 - Render as base64 (PROTECTED)
router.post('/render/base64', validateApiKey, validateRenderRequest, asyncHandler(renderController.renderBase64));

// Los preview tambien renderizan (generan el HTML del informe y, en el navegador,
// cargan tiles): se protegen igual que /render. Desde el navegador se pasa la clave
// con ?api_key=... , que validateApiKey acepta.

// GET /api/preview - Preview HTML from query params (PROTECTED)
router.get('/preview', validateApiKey, validatePreviewQuery, asyncHandler(previewController.previewFromQuery));

// GET /api/preview/presets - List available presets (PROTECTED)
router.get('/preview/presets', validateApiKey, asyncHandler(previewController.listPresets));

// GET /api/preview/:presetId - Preview from preset (PROTECTED)
router.get('/preview/:presetId', validateApiKey, asyncHandler(previewController.previewFromPreset));

module.exports = router;
