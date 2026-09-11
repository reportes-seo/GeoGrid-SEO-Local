/**
 * Tests for utils/coordinates.utils.js
 * Geometria de la rejilla: si esto se rompe, todos los informes salen mal ubicados.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateDestination,
  calculateDistance,
  isValidCoordinate,
  generateGridCoordinates,
  formatCoordinate,
  toRadians,
  toDegrees
} = require('../utils/coordinates.utils');

const MADRID = { lat: 40.4168, lng: -3.7038 };

test('toRadians y toDegrees son inversos', () => {
  assert.equal(toDegrees(toRadians(90)).toFixed(9), '90.000000000');
  assert.equal(toRadians(180), Math.PI);
});

test('calculateDistance mide Madrid-Barcelona con precision razonable', () => {
  const barcelona = { lat: 41.3874, lng: 2.1686 };
  const distance = calculateDistance(MADRID.lat, MADRID.lng, barcelona.lat, barcelona.lng);

  // Distancia real en linea recta: ~505 km
  assert.ok(distance > 495 && distance < 515, `esperaba ~505 km, obtuve ${distance}`);
});

test('calculateDistance de un punto a si mismo es 0', () => {
  assert.equal(calculateDistance(MADRID.lat, MADRID.lng, MADRID.lat, MADRID.lng), 0);
});

test('calculateDestination avanza hacia el norte aumentando la latitud', () => {
  const north = calculateDestination(MADRID.lat, MADRID.lng, 111.19, 0);

  // ~111.19 km por grado de latitud
  assert.ok(Math.abs(north.lat - (MADRID.lat + 1)) < 0.01, `lat obtenida: ${north.lat}`);
  assert.ok(Math.abs(north.lng - MADRID.lng) < 0.0001, 'la longitud no debe moverse hacia el norte');
});

test('calculateDestination y calculateDistance son coherentes', () => {
  const target = calculateDestination(MADRID.lat, MADRID.lng, 25, 135);
  const back = calculateDistance(MADRID.lat, MADRID.lng, target.lat, target.lng);

  assert.ok(Math.abs(back - 25) < 0.01, `esperaba 25 km, obtuve ${back}`);
});

test('isValidCoordinate acepta coordenadas validas y rechaza el resto', () => {
  assert.equal(isValidCoordinate(40.4168, -3.7038), true);
  assert.equal(isValidCoordinate(0, 0), true);
  assert.equal(isValidCoordinate(90, 180), true);
  assert.equal(isValidCoordinate(-90, -180), true);

  assert.equal(isValidCoordinate(91, 0), false);
  assert.equal(isValidCoordinate(0, 181), false);
  assert.equal(isValidCoordinate(NaN, 0), false);
  assert.equal(isValidCoordinate('40', -3), false);
  assert.equal(isValidCoordinate(null, null), false);
});

test('generateGridCoordinates crea gridSize x gridSize puntos indexados por filas', () => {
  const points = generateGridCoordinates(MADRID.lat, MADRID.lng, 5, 4);

  assert.equal(points.length, 25);
  points.forEach((point, i) => {
    assert.equal(point.index, i, 'el indice debe seguir el orden del array');
    assert.equal(point.index, point.row * 5 + point.col, 'indice = row * gridSize + col');
  });
});

test('el punto central de una rejilla impar cae exactamente en el centro', () => {
  const gridSize = 9;
  const points = generateGridCoordinates(MADRID.lat, MADRID.lng, gridSize, 4);
  const halfGrid = Math.floor(gridSize / 2);
  const center = points[halfGrid * gridSize + halfGrid];

  assert.ok(Math.abs(center.lat - MADRID.lat) < 1e-9, `lat central: ${center.lat}`);
  assert.ok(Math.abs(center.lng - MADRID.lng) < 1e-9, `lng central: ${center.lng}`);
});

test('las esquinas quedan a radio*raiz(2) del centro y la rejilla es simetrica', () => {
  const gridSize = 5;
  const radiusKm = 4;
  const points = generateGridCoordinates(MADRID.lat, MADRID.lng, gridSize, radiusKm);
  const expectedDiagonal = radiusKm * Math.SQRT2;

  const corners = [
    points[0],                               // NO
    points[gridSize - 1],                    // NE
    points[gridSize * (gridSize - 1)],       // SO
    points[gridSize * gridSize - 1]          // SE
  ];

  for (const corner of corners) {
    const d = calculateDistance(MADRID.lat, MADRID.lng, corner.lat, corner.lng);
    assert.ok(
      Math.abs(d - expectedDiagonal) < 0.05,
      `esquina a ${d} km, esperaba ~${expectedDiagonal}`
    );
  }

  // La primera fila esta al norte del centro y la ultima al sur
  assert.ok(points[0].lat > MADRID.lat);
  assert.ok(points[gridSize * gridSize - 1].lat < MADRID.lat);
});

test('el borde de la rejilla queda a exactamente el radio pedido', () => {
  const points = generateGridCoordinates(MADRID.lat, MADRID.lng, 7, 3);
  const halfGrid = 3;
  const northCenter = points[halfGrid]; // fila 0, columna central

  const d = calculateDistance(MADRID.lat, MADRID.lng, northCenter.lat, northCenter.lng);
  assert.ok(Math.abs(d - 3) < 0.01, `esperaba 3 km, obtuve ${d}`);
});

test('formatCoordinate redondea a los decimales pedidos', () => {
  assert.equal(formatCoordinate(40.416775123), '40.416775');
  assert.equal(formatCoordinate(40.416775123, 2), '40.42');
});
