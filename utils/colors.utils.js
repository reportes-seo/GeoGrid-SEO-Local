/**
 * Colors utility
 * Provides color mapping for position rankings
 *
 * POSITION_RANGES es la UNICA fuente de verdad de los tramos de posicion.
 * Colores, leyenda y distribucion de metricas se derivan de aqui: cambiar un
 * umbral en esta tabla lo cambia en todo el sistema.
 */

/**
 * Position ranges, ordered from best to worst.
 * @type {Array<{key: string, label: string, min: number, max: number, color: string, textColor: string, legend: string}>}
 */
const POSITION_RANGES = [
  {
    key: 'position1',
    label: '1',
    min: 1,
    max: 1,
    color: '#27ae60',        // Verde oscuro - posición 1
    textColor: '#ffffff',
    legend: 'Posición #1'
  },
  {
    key: 'localPack',
    label: '2-3',
    min: 2,
    max: 3,
    color: '#2ecc71',        // Verde claro - Local Pack
    textColor: '#ffffff',
    legend: 'Local Pack (2-3)'
  },
  {
    key: 'top7',
    label: '4-7',
    min: 4,
    max: 7,
    color: '#f1c40f',        // Amarillo
    textColor: '#2c3e50',
    legend: 'Top 7 (4-7)'
  },
  {
    key: 'top10',
    label: '8-10',
    min: 8,
    max: 10,
    color: '#e67e22',        // Naranja
    textColor: '#ffffff',
    legend: 'Top 10 (8-10)'
  },
  {
    key: 'page1',
    label: '11-20',
    min: 11,
    max: 20,
    color: '#e74c3c',        // Rojo
    textColor: '#ffffff',
    legend: 'Página 1 (11-20)'
  },
  {
    key: 'page2Plus',
    label: '21+',
    min: 21,
    max: Infinity,
    color: '#c0392b',        // Rojo oscuro
    textColor: '#ffffff',
    legend: 'Página 2+ (21+)'
  }
];

/**
 * Range used when the business was not found at a grid point.
 */
const NOT_FOUND_RANGE = {
  key: 'notFound',
  label: 'null',
  min: null,
  max: null,
  color: '#95a5a6',          // Gris - no encontrado
  textColor: '#ffffff',
  legend: 'No encontrado'
};

/**
 * Text shown inside a marker for positions at or beyond the last range.
 */
const OVERFLOW_TEXT = '21+';

/**
 * Text shown inside a marker when the business was not found.
 */
const NOT_FOUND_TEXT = 'X';

/**
 * Check whether a value is a usable ranking position
 * @param {any} position - Value to check
 * @returns {boolean}
 */
function isFoundPosition(position) {
  return typeof position === 'number' && !isNaN(position);
}

/**
 * Resolve the range a position belongs to
 * @param {number|null} position - Ranking position
 * @returns {Object} Matching range, or NOT_FOUND_RANGE
 */
function getRange(position) {
  if (!isFoundPosition(position)) {
    return NOT_FOUND_RANGE;
  }

  const match = POSITION_RANGES.find(
    range => position >= range.min && position <= range.max
  );

  return match || NOT_FOUND_RANGE;
}

/**
 * Get color for a given position
 * @param {number|null} position - Ranking position
 * @returns {string} Hex color code
 */
function getPositionColor(position) {
  return getRange(position).color;
}

/**
 * Get text color for contrast against position color
 * @param {number|null} position - Ranking position
 * @returns {string} Hex color code
 */
function getTextColor(position) {
  return getRange(position).textColor;
}

/**
 * Get display text for a position marker
 * @param {number|null} position - Ranking position
 * @returns {string} Display text
 */
function getDisplayText(position) {
  if (!isFoundPosition(position)) {
    return NOT_FOUND_TEXT;
  }

  const lastRange = POSITION_RANGES[POSITION_RANGES.length - 1];
  if (position >= lastRange.min) {
    return OVERFLOW_TEXT;
  }

  return position.toString();
}

/**
 * Get legend items for color reference
 * @returns {Array<{range: string, color: string, label: string}>}
 */
function getLegendItems() {
  return [...POSITION_RANGES, NOT_FOUND_RANGE].map(range => ({
    range: range.label,
    color: range.color,
    label: range.legend
  }));
}

/**
 * Get color scale for visualization
 * @returns {{colors: Object, textColors: Object}} Color scale keyed by range label
 */
function getColorScale() {
  const colors = {};
  const textColors = {};

  [...POSITION_RANGES, NOT_FOUND_RANGE].forEach(range => {
    colors[range.label] = range.color;
    textColors[range.label] = range.textColor;
  });

  return { colors, textColors };
}

module.exports = {
  POSITION_RANGES,
  NOT_FOUND_RANGE,
  isFoundPosition,
  getRange,
  getPositionColor,
  getTextColor,
  getDisplayText,
  getLegendItems,
  getColorScale
};
