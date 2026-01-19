/**
 * Validation middleware
 * Validates request data
 */

const { validateGridConfig } = require('../models/gridConfig.model');
const { validateRenderOptions } = require('../models/renderOptions.model');
const logger = require('../utils/logger.utils');

/**
 * Custom validation error
 */
class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.details = details;
  }
}

/**
 * Validate grid config and render options
 */
function validateRenderRequest(req, res, next) {
  try {
    // Validate grid config
    const gridConfigResult = validateGridConfig(req.body);
    if (gridConfigResult.error) {
      const details = gridConfigResult.error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }));

      throw new ValidationError('Grid configuration validation failed', details);
    }

    // Validate render options (optional)
    const renderOptionsResult = validateRenderOptions(req.body);
    if (renderOptionsResult.error) {
      const details = renderOptionsResult.error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }));

      throw new ValidationError('Render options validation failed', details);
    }

    // Attach validated data to request
    req.validatedData = {
      gridConfig: gridConfigResult.value,
      renderOptions: renderOptionsResult.value
    };

    logger.debug('Request validation successful', {
      keyword: gridConfigResult.value.keyword,
      gridSize: gridConfigResult.value.gridSize
    });

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Validate query parameters for preview
 */
function validatePreviewQuery(req, res, next) {
  try {
    const { keyword, business, lat, lng, gridSize, radius, positions } = req.query;

    // Check required parameters
    if (!keyword || !business || !lat || !lng || !positions) {
      throw new ValidationError('Missing required query parameters', [
        { field: 'query', message: 'Required: keyword, business, lat, lng, positions' }
      ]);
    }

    // Parse and validate
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedGridSize = parseInt(gridSize, 10) || 9;
    const parsedRadius = parseFloat(radius) || 4.0;

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      throw new ValidationError('Invalid coordinates', [
        { field: 'lat,lng', message: 'Coordinates must be valid numbers' }
      ]);
    }

    // Parse positions array
    let parsedPositions;
    try {
      parsedPositions = JSON.parse(positions);
      if (!Array.isArray(parsedPositions)) {
        throw new Error('Positions must be an array');
      }
    } catch (error) {
      throw new ValidationError('Invalid positions array', [
        { field: 'positions', message: 'Must be a valid JSON array' }
      ]);
    }

    // Create gridConfig object
    const gridConfig = {
      keyword,
      business,
      centerLat: parsedLat,
      centerLng: parsedLng,
      gridSize: parsedGridSize,
      radiusKm: parsedRadius,
      positions: parsedPositions
    };

    // Validate using model
    const result = validateGridConfig(gridConfig);
    if (result.error) {
      const details = result.error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }));

      throw new ValidationError('Preview query validation failed', details);
    }

    // Attach to request
    req.validatedData = {
      gridConfig: result.value,
      renderOptions: validateRenderOptions({}).value
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  ValidationError,
  validateRenderRequest,
  validatePreviewQuery
};
