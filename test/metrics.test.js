/**
 * Tests for utils/metrics.utils.js
 *
 * Ojo a la asimetria deliberada del dominio: GeoRank y posicion media IGNORAN
 * los null; Local Pack % y cobertura los CUENTAN en el denominador.
 * Estos tests existen para que nadie la "arregle" por error.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateGeoRank,
  calculateAvgPosition,
  calculateLocalPackPercentage,
  calculateCoverage,
  calculateDistribution,
  calculateAllMetrics,
  formatMetric,
  getMetricLabel
} = require('../utils/metrics.utils');

const { POSITION_RANGES, NOT_FOUND_RANGE } = require('../utils/colors.utils');

test('calculateGeoRank es 1.00 cuando el negocio es primero en todas partes', () => {
  assert.equal(calculateGeoRank([1, 1, 1, 1]), 1.00);
});

test('calculateGeoRank es el inverso de la posicion media', () => {
  assert.equal(calculateGeoRank([2, 2, 2]), 0.5);
  assert.equal(calculateGeoRank([4, 4]), 0.25);
});

test('calculateGeoRank ignora los null (no los cuenta como malos)', () => {
  assert.equal(calculateGeoRank([1, null, null]), 1.00);
});

test('calculateGeoRank es 0.00 si no aparece en ningun punto', () => {
  assert.equal(calculateGeoRank([null, null]), 0.00);
  assert.equal(calculateGeoRank([]), 0.00);
});

test('calculateAvgPosition promedia solo los puntos encontrados', () => {
  assert.equal(calculateAvgPosition([1, 3, null]), 2);
  assert.equal(calculateAvgPosition([1, 2]), 1.5);
});

test('calculateAvgPosition es null si no aparece en ningun punto', () => {
  assert.equal(calculateAvgPosition([null, null]), null);
  assert.equal(calculateAvgPosition([]), null);
});

test('calculateLocalPackPercentage cuenta 1-3 sobre el TOTAL de puntos', () => {
  // 2 de 4 puntos en local pack -> 50%, aunque uno de los otros sea null
  assert.equal(calculateLocalPackPercentage([1, 3, 15, null], 4), 50);
  assert.equal(calculateLocalPackPercentage([4, 5, 6], 3), 0);
  assert.equal(calculateLocalPackPercentage([1, 2, 3], 3), 100);
});

test('calculateLocalPackPercentage no divide por cero', () => {
  assert.equal(calculateLocalPackPercentage([], 0), 0);
});

test('calculateCoverage informa encontrados, total y porcentaje', () => {
  assert.deepEqual(calculateCoverage([1, null, 5, null], 4), {
    found: 2,
    total: 4,
    percentage: 50
  });
});

test('calculateCoverage no divide por cero', () => {
  assert.deepEqual(calculateCoverage([], 0), { found: 0, total: 0, percentage: 0 });
});

test('calculateDistribution clasifica cada posicion en su tramo', () => {
  const distribution = calculateDistribution([1, 2, 3, 4, 7, 8, 10, 11, 20, 21, 99, null]);

  assert.deepEqual(distribution, {
    position1: 1,
    localPack: 2,
    top7: 2,
    top10: 2,
    page1: 2,
    page2Plus: 2,
    notFound: 1
  });
});

test('calculateDistribution suma siempre el total de puntos', () => {
  const positions = [1, 5, null, 30, 12, null, 2];
  const total = Object.values(calculateDistribution(positions)).reduce((a, b) => a + b, 0);

  assert.equal(total, positions.length);
});

test('las claves de distribution coinciden con los tramos definidos en colors', () => {
  const expectedKeys = [...POSITION_RANGES, NOT_FOUND_RANGE].map(r => r.key);

  assert.deepEqual(Object.keys(calculateDistribution([])), expectedKeys);
});

test('calculateAllMetrics devuelve el paquete completo coherente', () => {
  const positions = [1, 2, 3, null, 5, 10, 25, null, 1];
  const metrics = calculateAllMetrics(positions);

  assert.equal(metrics.totalPoints, 9);
  assert.equal(metrics.foundIn, 7);
  assert.equal(metrics.coverage.found, 7);
  assert.equal(metrics.coverage.percentage, 77.78);
  assert.equal(metrics.avgPosition, calculateAvgPosition(positions));
  assert.equal(metrics.geoRank, calculateGeoRank(positions));
  // 4 puntos en local pack (1,2,3,1) sobre 9 totales
  assert.equal(metrics.localPackPct, 44.44);
});

test('formatMetric da la cadena lista para pintar', () => {
  assert.equal(formatMetric('geoRank', 0.4567), '0.46');
  assert.equal(formatMetric('avgPosition', 3.44), '3.4');
  assert.equal(formatMetric('avgPosition', null), 'N/A');
  assert.equal(formatMetric('localPackPct', 44.44), '44%');
  assert.equal(formatMetric('coverage', { percentage: 77.78 }), '78%');
});

test('getMetricLabel traduce los nombres de metrica', () => {
  assert.equal(getMetricLabel('geoRank'), 'GeoRank');
  assert.equal(getMetricLabel('coverage'), 'Cobertura');
  assert.equal(getMetricLabel('desconocida'), 'desconocida');
});
