/**
 * Colors utility
 * Provides color mapping for position rankings
 */

const POSITION_COLORS = {
  1: '#27ae60',        // Verde oscuro - posición 1
  '2-3': '#2ecc71',    // Verde claro - Local Pack
  '4-7': '#f1c40f',    // Amarillo
  '8-10': '#e67e22',   // Naranja
  '11-20': '#e74c3c',  // Rojo
  '21+': '#c0392b',    // Rojo oscuro
  null: '#95a5a6'      // Gris - no encontrado
};

const TEXT_COLORS = {
  1: '#ffffff',        // Blanco para verde oscuro
  '2-3': '#ffffff',    // Blanco para verde claro
  '4-7': '#2c3e50',    // Negro para amarillo
  '8-10': '#ffffff',   // Blanco para naranja
  '11-20': '#ffffff',  // Blanco para rojo
  '21+': '#ffffff',    // Blanco para rojo oscuro
  null: '#ffffff'      // Blanco para gris
};

/**
 * Get color for a given position
 * @param {number|null} position - Ranking position
 * @returns {string} Hex color code
 */
function getPositionColor(position) {
  if (position === null || position === undefined) {
    return POSITION_COLORS.null;
  }

  if (position === 1) {
    return POSITION_COLORS[1];
  }

  if (position >= 2 && position <= 3) {
    return POSITION_COLORS['2-3'];
  }

  if (position >= 4 && position <= 7) {
    return POSITION_COLORS['4-7'];
  }

  if (position >= 8 && position <= 10) {
    return POSITION_COLORS['8-10'];
  }

  if (position >= 11 && position <= 20) {
    return POSITION_COLORS['11-20'];
  }

  // 21+
  return POSITION_COLORS['21+'];
}

/**
 * Get text color for contrast against position color
 * @param {number|null} position - Ranking position
 * @returns {string} Hex color code
 */
function getTextColor(position) {
  if (position === null || position === undefined) {
    return TEXT_COLORS.null;
  }

  if (position === 1) {
    return TEXT_COLORS[1];
  }

  if (position >= 2 && position <= 3) {
    return TEXT_COLORS['2-3'];
  }

  if (position >= 4 && position <= 7) {
    return TEXT_COLORS['4-7'];
  }

  if (position >= 8 && position <= 10) {
    return TEXT_COLORS['8-10'];
  }

  if (position >= 11 && position <= 20) {
    return TEXT_COLORS['11-20'];
  }

  // 21+
  return TEXT_COLORS['21+'];
}

/**
 * Get display text for a position marker
 * @param {number|null} position - Ranking position
 * @returns {string} Display text
 */
function getDisplayText(position) {
  if (position === null || position === undefined) {
    return 'X';
  }

  if (position >= 21) {
    return '21+';
  }

  return position.toString();
}

/**
 * Get legend items for color reference
 * @returns {Array<{range: string, color: string, label: string}>}
 */
function getLegendItems() {
  return [
    { range: '1', color: POSITION_COLORS[1], label: 'Posición #1' },
    { range: '2-3', color: POSITION_COLORS['2-3'], label: 'Local Pack (2-3)' },
    { range: '4-7', color: POSITION_COLORS['4-7'], label: 'Top 7 (4-7)' },
    { range: '8-10', color: POSITION_COLORS['8-10'], label: 'Top 10 (8-10)' },
    { range: '11-20', color: POSITION_COLORS['11-20'], label: 'Página 1 (11-20)' },
    { range: '21+', color: POSITION_COLORS['21+'], label: 'Página 2+ (21+)' },
    { range: 'null', color: POSITION_COLORS.null, label: 'No encontrado' }
  ];
}

/**
 * Get color scale for visualization
 * @returns {Object} Color scale object
 */
function getColorScale() {
  return {
    colors: POSITION_COLORS,
    textColors: TEXT_COLORS
  };
}

module.exports = {
  POSITION_COLORS,
  TEXT_COLORS,
  getPositionColor,
  getTextColor,
  getDisplayText,
  getLegendItems,
  getColorScale
};
