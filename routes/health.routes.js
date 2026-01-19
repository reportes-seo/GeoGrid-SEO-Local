/**
 * Health routes
 */

const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');
const { asyncHandler } = require('../middleware/error.middleware');

// GET /health - Main health check
router.get('/', asyncHandler(healthController.getHealth));

// GET /health/ready - Readiness probe
router.get('/ready', asyncHandler(healthController.getReady));

// GET /health/live - Liveness probe
router.get('/live', asyncHandler(healthController.getLive));

module.exports = router;
