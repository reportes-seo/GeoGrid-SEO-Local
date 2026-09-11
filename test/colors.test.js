/**
 * Tests for utils/colors.utils.js
 * Cubre las fronteras de cada tramo: es donde historicamente se han colado errores
 * (la documentacion llego a afirmar 4-6 / 7-10 cuando el codigo dice 4-7 / 8-10).
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  POSITION_RANGES,
  NOT_FOUND_RANGE,
  isFoundPosition,
  getRange,
  getPositionColor,
  getTextColor,
  getDisplayText,
  getLegendItems,
  getColorScale
} = require('../utils/colors.utils');

test('getPositionColor devuelve el color de cada tramo en sus fronteras', () => {
  const cases = [
    [1, '#27ae60'],
    [2, '#2ecc71'],
    [3, '#2ecc71'],
    [4, '#f1c40f'],
    [7, '#f1c40f'],
    [8, '#e67e22'],
    [10, '#e67e22'],
    [11, '#e74c3c'],
    [20, '#e74c3c'],
    [21, '#c0392b'],
    [999, '#c0392b']
  ];

  for (const [position, expected] of cases) {
    assert.equal(getPositionColor(position), expected, `posición ${position}`);
  }
});

test('getPositionColor devuelve gris cuando el negocio no aparece', () => {
  assert.equal(getPositionColor(null), '#95a5a6');
  assert.equal(getPositionColor(undefined), '#95a5a6');
});

test('getTextColor usa texto oscuro solo sobre el amarillo', () => {
  assert.equal(getTextColor(4), '#2c3e50');
  assert.equal(getTextColor(7), '#2c3e50');
  assert.equal(getTextColor(1), '#ffffff');
  assert.equal(getTextColor(8), '#ffffff');
  assert.equal(getTextColor(null), '#ffffff');
});

test('getDisplayText colapsa 21+ y marca los no encontrados con X', () => {
  assert.equal(getDisplayText(1), '1');
  assert.equal(getDisplayText(20), '20');
  assert.equal(getDisplayText(21), '21+');
  assert.equal(getDisplayText(500), '21+');
  assert.equal(getDisplayText(null), 'X');
  assert.equal(getDisplayText(undefined), 'X');
});

test('isFoundPosition distingue posiciones reales de huecos', () => {
  assert.equal(isFoundPosition(1), true);
  assert.equal(isFoundPosition(0), true);
  assert.equal(isFoundPosition(null), false);
  assert.equal(isFoundPosition(undefined), false);
  assert.equal(isFoundPosition(NaN), false);
  assert.equal(isFoundPosition('3'), false);
});

test('getRange cubre todo el espacio de posiciones sin huecos ni solapes', () => {
  for (let position = 1; position <= 60; position++) {
    const matches = POSITION_RANGES.filter(r => position >= r.min && position <= r.max);
    assert.equal(matches.length, 1, `la posición ${position} debe caer en exactamente un tramo`);
    assert.equal(getRange(position).key, matches[0].key);
  }
});

test('getLegendItems expone todos los tramos mas el no encontrado', () => {
  const items = getLegendItems();

  assert.equal(items.length, POSITION_RANGES.length + 1);
  assert.deepEqual(
    items.map(i => i.range),
    ['1', '2-3', '4-7', '8-10', '11-20', '21+', 'null']
  );

  // La leyenda debe usar exactamente los mismos colores que el mapa
  for (const range of POSITION_RANGES) {
    const item = items.find(i => i.range === range.label);
    assert.equal(item.color, getPositionColor(range.min), `color de leyenda del tramo ${range.key}`);
  }

  const notFoundItem = items.find(i => i.range === 'null');
  assert.equal(notFoundItem.color, NOT_FOUND_RANGE.color);
});

test('los colores de los tramos son distintos entre si', () => {
  const colors = [...POSITION_RANGES, NOT_FOUND_RANGE].map(r => r.color);
  assert.equal(new Set(colors).size, colors.length, 'dos tramos comparten color');
});

test('getColorScale devuelve colores y textos por etiqueta de tramo', () => {
  const scale = getColorScale();

  assert.equal(scale.colors['1'], '#27ae60');
  assert.equal(scale.colors['21+'], '#c0392b');
  assert.equal(scale.textColors['4-7'], '#2c3e50');
  assert.equal(Object.keys(scale.colors).length, POSITION_RANGES.length + 1);
});
