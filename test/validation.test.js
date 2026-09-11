/**
 * Tests for models/*.model.js y utils/escapeHtml.utils.js
 * La validacion es la unica frontera entre la peticion y Puppeteer: si deja pasar
 * basura, el fallo aparece a 30 segundos de distancia dentro del navegador.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { validateGridConfig } = require('../models/gridConfig.model');
const { validateRenderOptions } = require('../models/renderOptions.model');
const { escapeHtml, sanitizeObject } = require('../utils/escapeHtml.utils');

/**
 * Build a valid payload, overridable per test
 */
function validConfig(overrides = {}) {
  return {
    keyword: 'pizza',
    business: 'Pizza Express',
    centerLat: 40.4168,
    centerLng: -3.7038,
    gridSize: 3,
    radiusKm: 2,
    positions: [1, 2, 3, 2, 1, 2, 3, 2, 1],
    ...overrides
  };
}

test('validateGridConfig acepta una configuracion correcta', () => {
  const { error, value } = validateGridConfig(validConfig());

  assert.equal(error, null);
  assert.equal(value.gridSize, 3);
  assert.equal(value.keyword, 'pizza');
});

test('validateGridConfig aplica los defaults de gridSize y radiusKm', () => {
  const config = validConfig({ positions: new Array(81).fill(1) });
  delete config.gridSize;
  delete config.radiusKm;

  const { error, value } = validateGridConfig(config);

  assert.equal(error, null);
  assert.equal(value.gridSize, 9);
  assert.equal(value.radiusKm, 4);
});

test('validateGridConfig exige que positions tenga exactamente gridSize^2 elementos', () => {
  const { error } = validateGridConfig(validConfig({ positions: [1, 2, 3] }));

  assert.ok(error, 'debe rechazar un array de longitud incorrecta');
  assert.match(error.details[0].message, /does not match grid size/);
});

test('validateGridConfig acepta null dentro de positions (no encontrado)', () => {
  const { error, value } = validateGridConfig(
    validConfig({ positions: [1, null, 3, 2, null, 2, 3, 2, 1] })
  );

  assert.equal(error, null);
  assert.equal(value.positions[1], null);
});

test('validateGridConfig rechaza coordenadas fuera de rango', () => {
  assert.ok(validateGridConfig(validConfig({ centerLat: 91 })).error);
  assert.ok(validateGridConfig(validConfig({ centerLng: -181 })).error);
});

test('validateGridConfig rechaza gridSize y radiusKm fuera de los limites soportados', () => {
  assert.ok(validateGridConfig(validConfig({ gridSize: 2 })).error, 'gridSize < 3');
  assert.ok(validateGridConfig(validConfig({ gridSize: 16 })).error, 'gridSize > 15');
  assert.ok(validateGridConfig(validConfig({ radiusKm: 0.1 })).error, 'radio < 0.5');
  assert.ok(validateGridConfig(validConfig({ radiusKm: 25 })).error, 'radio > 20');
});

test('validateGridConfig exige keyword y business', () => {
  assert.ok(validateGridConfig(validConfig({ keyword: '' })).error);
  assert.ok(validateGridConfig(validConfig({ business: '' })).error);
});

test('validateGridConfig descarta campos desconocidos', () => {
  const { value } = validateGridConfig(validConfig({ inyectado: 'valor' }));

  assert.equal(value.inyectado, undefined);
});

test('validateRenderOptions aplica todos los defaults sobre un objeto vacio', () => {
  const { error, value } = validateRenderOptions({});

  assert.equal(error, null);
  assert.deepEqual(value, {
    width: 800,
    height: 1100,
    markerSize: 28,
    brandText: 'EquipoSEO',
    showLegend: true,
    format: 'png',
    quality: 90,
    theme: 'default'
  });
});

test('validateRenderOptions rechaza formatos y temas no soportados', () => {
  assert.ok(validateRenderOptions({ format: 'gif' }).error);
  assert.ok(validateRenderOptions({ theme: 'neon' }).error);
  assert.ok(validateRenderOptions({ width: 100 }).error);
  assert.ok(validateRenderOptions({ markerSize: 99 }).error);
});

test('escapeHtml neutraliza una inyeccion de script', () => {
  const escaped = escapeHtml('<script>alert("xss")</script>');

  assert.ok(!escaped.includes('<script>'));
  assert.equal(
    escaped,
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
  );
});

test('escapeHtml devuelve cadena vacia para lo que no es texto', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(42), '');
  assert.equal(escapeHtml(undefined), '');
});

test('sanitizeObject escapa strings de forma recursiva y respeta el resto', () => {
  const result = sanitizeObject({
    business: '<b>Bar</b>',
    gridSize: 9,
    nested: { keyword: 'a & b' }
  });

  assert.equal(result.business, '&lt;b&gt;Bar&lt;&#x2F;b&gt;');
  assert.equal(result.gridSize, 9);
  assert.equal(result.nested.keyword, 'a &amp; b');
});
