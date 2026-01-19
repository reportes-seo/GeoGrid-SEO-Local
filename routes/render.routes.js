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

// GET /api/preview - Preview HTML from query params
router.get('/preview', validatePreviewQuery, asyncHandler(previewController.previewFromQuery));

// GET /api/preview/presets - List available presets
router.get('/preview/presets', asyncHandler(previewController.listPresets));

// GET /api/preview/:presetId - Preview from preset
router.get('/preview/:presetId', asyncHandler(previewController.previewFromPreset));

module.exports = router;
