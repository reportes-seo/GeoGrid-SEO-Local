/**
 * RenderOptions model
 * Validates render options for screenshot generation
 */

const Joi = require('joi');

/**
 * RenderOptions schema
 */
const renderOptionsSchema = Joi.object({
  width: Joi.number()
    .integer()
    .min(400)
    .max(1920)
    .default(800)
    .messages({
      'number.base': 'Width must be a number',
      'number.integer': 'Width must be an integer',
      'number.min': 'Width must be between 400 and 1920 pixels',
      'number.max': 'Width must be between 400 and 1920 pixels'
    }),

  height: Joi.number()
    .integer()
    .min(400)
    .max(1920)
    .default(1100)
    .messages({
      'number.base': 'Height must be a number',
      'number.integer': 'Height must be an integer',
      'number.min': 'Height must be between 400 and 1920 pixels',
      'number.max': 'Height must be between 400 and 1920 pixels'
    }),

  markerSize: Joi.number()
    .integer()
    .min(16)
    .max(48)
    .default(28)
    .messages({
      'number.base': 'Marker size must be a number',
      'number.integer': 'Marker size must be an integer',
      'number.min': 'Marker size must be between 16 and 48 pixels',
      'number.max': 'Marker size must be between 16 and 48 pixels'
    }),

  brandText: Joi.string()
    .max(50)
    .default('EquipoSEO')
    .messages({
      'string.max': 'Brand text must not exceed 50 characters'
    }),

  showLegend: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Show legend must be a boolean'
    }),

  format: Joi.string()
    .valid('png', 'jpeg', 'webp')
    .default('png')
    .messages({
      'any.only': 'Format must be one of: png, jpeg, webp'
    }),

  quality: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(90)
    .messages({
      'number.base': 'Quality must be a number',
      'number.integer': 'Quality must be an integer',
      'number.min': 'Quality must be between 1 and 100',
      'number.max': 'Quality must be between 1 and 100'
    }),

  theme: Joi.string()
    .valid('default', 'dark', 'light')
    .default('default')
    .messages({
      'any.only': 'Theme must be one of: default, dark, light'
    })
});

/**
 * Validate render options
 * @param {Object} data - Render options data
 * @returns {{ error: Object|null, value: Object }}
 */
function validateRenderOptions(data) {
  const result = renderOptionsSchema.validate(data || {}, {
    abortEarly: false,
    stripUnknown: true
  });

  if (result.error) {
    return { error: result.error, value: null };
  }

  return { error: null, value: result.value };
}

module.exports = {
  renderOptionsSchema,
  validateRenderOptions
};
