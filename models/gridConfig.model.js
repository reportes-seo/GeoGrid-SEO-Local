/**
 * GridConfig model
 * Validates grid configuration data
 */

const Joi = require('joi');
const { isValidCoordinate } = require('../utils/coordinates.utils');

/**
 * GridConfig schema
 */
const gridConfigSchema = Joi.object({
  keyword: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Keyword is required',
      'string.min': 'Keyword must be at least 1 character',
      'string.max': 'Keyword must not exceed 200 characters'
    }),

  business: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Business name is required',
      'string.min': 'Business name must be at least 1 character',
      'string.max': 'Business name must not exceed 200 characters'
    }),

  centerLat: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.base': 'Center latitude must be a number',
      'number.min': 'Center latitude must be between -90 and 90',
      'number.max': 'Center latitude must be between -90 and 90',
      'any.required': 'Center latitude is required'
    }),

  centerLng: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.base': 'Center longitude must be a number',
      'number.min': 'Center longitude must be between -180 and 180',
      'number.max': 'Center longitude must be between -180 and 180',
      'any.required': 'Center longitude is required'
    }),

  gridSize: Joi.number()
    .integer()
    .min(3)
    .max(15)
    .default(9)
    .messages({
      'number.base': 'Grid size must be a number',
      'number.integer': 'Grid size must be an integer',
      'number.min': 'Grid size must be between 3 and 15',
      'number.max': 'Grid size must be between 3 and 15'
    }),

  radiusKm: Joi.number()
    .min(0.5)
    .max(20)
    .default(4)
    .messages({
      'number.base': 'Radius must be a number',
      'number.min': 'Radius must be between 0.5 and 20 km',
      'number.max': 'Radius must be between 0.5 and 20 km'
    }),

  positions: Joi.array()
    .items(
      Joi.number().integer().min(1).allow(null)
    )
    .required()
    .messages({
      'array.base': 'Positions must be an array',
      'any.required': 'Positions array is required'
    })
});

/**
 * Validate grid configuration
 * @param {Object} data - Grid configuration data
 * @returns {{ error: Object|null, value: Object }}
 */
function validateGridConfig(data) {
  const result = gridConfigSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (result.error) {
    return { error: result.error, value: null };
  }

  // Additional validation for positions array length
  const expectedLength = result.value.gridSize * result.value.gridSize;
  if (result.value.positions.length !== expectedLength) {
    return {
      error: {
        details: [{
          message: `Positions array length (${result.value.positions.length}) does not match grid size (${result.value.gridSize}x${result.value.gridSize} = ${expectedLength})`,
          path: ['positions']
        }]
      },
      value: null
    };
  }

  // Validate coordinates
  if (!isValidCoordinate(result.value.centerLat, result.value.centerLng)) {
    return {
      error: {
        details: [{
          message: 'Invalid center coordinates',
          path: ['centerLat', 'centerLng']
        }]
      },
      value: null
    };
  }

  return { error: null, value: result.value };
}

module.exports = {
  gridConfigSchema,
  validateGridConfig
};
