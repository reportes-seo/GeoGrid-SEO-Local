/**
 * Tests for services/grid.service.js
 * Integracion del dominio (coordenadas + colores + metricas) sin arrancar Puppeteer.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { generateGridData, calculateBounds, getGridSummary } = require('../services/grid.service');
const { getPositionColor, getTextColor } = require('../utils/colors.utils');

const BASE_CONFIG = {
  keyword: 'pizza',
  business: 'Pizza Express',
  centerLat: 40.4168,
  centerLng: -3.7038,
  gridSize: 3,
  radiusKm: 2,
  // El punto central (indice 4) es la posicion 5 -> tramo amarillo
  positions: [1, 2, 3, 10, 5, 12, null, 21, 8]
};

test('generateGridData combina coordenadas, posiciones y colores punto a punto', () => {
  const data = generateGridData(BASE_CONFIG);

  assert.equal(data.points.length, 9);

  data.points.forEach((point, i) => {
    assert.equal(point.index, i);
    assert.equal(point.position, BASE_CONFIG.positions[i]);
    assert.equal(point.color, getPositionColor(BASE_CONFIG.positions[i]));
    assert.equal(point.textColor, getTextColor(BASE_CONFIG.positions[i]));
    assert.equal(typeof point.lat, 'number');
    assert.equal(typeof point.lng, 'number');
  });
});

test('el marcador central hereda posicion y color del punto medio de la rejilla', () => {
  const data = generateGridData(BASE_CONFIG);

  // gridSize 3 -> indice central = 1 * 3 + 1 = 4 -> posicion 5 -> amarillo
  assert.equal(data.center.position, 5);
  assert.equal(data.center.displayText, '5');
  assert.equal(data.center.color, '#f1c40f');
  assert.equal(data.center.textColor, '#2c3e50');
  assert.equal(data.center.lat, BASE_CONFIG.centerLat);
  assert.equal(data.center.lng, BASE_CONFIG.centerLng);
});

test('el marcador central refleja un centro no encontrado', () => {
  const positions = [...BASE_CONFIG.positions];
  positions[4] = null;

  const data = generateGridData({ ...BASE_CONFIG, positions });

  assert.equal(data.center.position, null);
  assert.equal(data.center.displayText, 'X');
  assert.equal(data.center.color, '#95a5a6');
});

test('generateGridData calcula las metricas del informe', () => {
  const data = generateGridData(BASE_CONFIG);

  assert.equal(data.metrics.totalPoints, 9);
  assert.equal(data.metrics.coverage.found, 8);
  assert.equal(data.metrics.distribution.notFound, 1);
  assert.ok(data.metrics.geoRank > 0);
});

test('los bounds envuelven a todos los puntos de la rejilla', () => {
  const data = generateGridData(BASE_CONFIG);
  const lats = data.points.map(p => p.lat);
  const lngs = data.points.map(p => p.lng);

  assert.equal(data.bounds.north, Math.max(...lats));
  assert.equal(data.bounds.south, Math.min(...lats));
  assert.equal(data.bounds.east, Math.max(...lngs));
  assert.equal(data.bounds.west, Math.min(...lngs));
  assert.ok(data.bounds.north > data.bounds.south);
  assert.ok(data.bounds.east > data.bounds.west);
});

test('calculateBounds funciona sobre una lista arbitraria de puntos', () => {
  const bounds = calculateBounds([
    { lat: 1, lng: 10 },
    { lat: -3, lng: 4 },
    { lat: 2, lng: 8 }
  ]);

  assert.deepEqual(bounds, { north: 2, south: -3, east: 10, west: 4 });
});

test('getGridSummary resume el informe sin perder las metricas clave', () => {
  const data = generateGridData(BASE_CONFIG);
  const summary = getGridSummary(data);

  assert.equal(summary.totalPoints, 9);
  assert.equal(summary.gridSize, 3);
  assert.equal(summary.radiusKm, 2);
  assert.equal(summary.metrics.geoRank, data.metrics.geoRank);
  assert.equal(summary.metrics.coverage, data.metrics.coverage.percentage);
});

test('una rejilla 9x9 completa se procesa entera', () => {
  const positions = Array.from({ length: 81 }, (_, i) => (i % 7 === 0 ? null : (i % 25) + 1));
  const data = generateGridData({ ...BASE_CONFIG, gridSize: 9, radiusKm: 4, positions });

  assert.equal(data.points.length, 81);
  assert.equal(data.metrics.totalPoints, 81);
  assert.equal(data.center.lat, BASE_CONFIG.centerLat);
});
