/**
 * Tests for utils/tiles.utils.js
 *
 * La atribucion es obligatoria por licencia (OSM y CARTO la exigen visible en el
 * mapa). Estos tests garantizan que NUNCA se queda vacia, pase lo que pase con
 * la configuracion, y que cada proveedor recibe la suya.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { buildTileUrl, getAttributionFor, OSM_ATTRIBUTION, PROVIDERS } = require('../utils/tiles.utils');

test('reconoce CARTO y anade su atribucion junto a la de OpenStreetMap', () => {
  const attribution = getAttributionFor(
    'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=ABC123'
  );

  assert.match(attribution, /CARTO/);
  assert.match(attribution, /OpenStreetMap/);
});

test('reconoce al proveedor aunque la URL lleve clave, subdominios o mayusculas', () => {
  const variantes = [
    'https://{s}.basemaps.CartoCDN.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    'https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=XYZ',
    'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=XYZ'
  ];
  const esperados = [/CARTO/, /Geoapify/, /MapTiler/];

  variantes.forEach((url, i) => {
    assert.match(getAttributionFor(url), esperados[i], url);
  });
});

test('OpenStreetMap oficial recibe solo su atribucion', () => {
  const attribution = getAttributionFor('https://tile.openstreetmap.org/{z}/{x}/{y}.png');

  assert.equal(attribution, OSM_ATTRIBUTION);
  assert.doesNotMatch(attribution, /CARTO/);
});

test('un proveedor desconocido cae en la atribucion de OpenStreetMap, nunca en vacio', () => {
  assert.equal(getAttributionFor('https://tiles.ejemplo-raro.net/{z}/{x}/{y}.png'), OSM_ATTRIBUTION);
});

test('una URL ausente o invalida tampoco deja el mapa sin atribucion', () => {
  assert.equal(getAttributionFor(''), OSM_ATTRIBUTION);
  assert.equal(getAttributionFor(null), OSM_ATTRIBUTION);
  assert.equal(getAttributionFor(undefined), OSM_ATTRIBUTION);
  assert.equal(getAttributionFor(42), OSM_ATTRIBUTION);
});

test('toda atribucion incluye OpenStreetMap: es la base de datos de todos ellos', () => {
  PROVIDERS.forEach(provider => {
    assert.match(provider.attribution, /OpenStreetMap/, provider.match);
  });
});

test('toda atribucion es HTML con enlace, como exigen las licencias', () => {
  PROVIDERS.forEach(provider => {
    assert.match(provider.attribution, /<a href="https:\/\/[^"]+">/, provider.match);
  });
});

test('con clave se construye la URL de CARTO y la clave viaja en ella', () => {
  const url = buildTileUrl('MI_CLAVE');

  assert.match(url, /basemaps\.cartocdn\.com/);
  assert.match(url, /key=MI_CLAVE/);
  assert.match(url, /\{z\}\/\{x\}\/\{y\}/, 'la plantilla de Leaflet debe quedar intacta');
});

test('sin clave se cae a OpenStreetMap en vez de a un CARTO con marca de agua', () => {
  [undefined, null, '', '   ', 42].forEach(valor => {
    assert.match(buildTileUrl(valor), /tile\.openstreetmap\.org/, String(valor));
  });
});

test('la clave se escapa: un valor con caracteres raros no rompe la URL', () => {
  assert.match(buildTileUrl('a b&c'), /key=a%20b%26c/);
});

test('la URL construida con clave produce la atribucion de CARTO', () => {
  assert.match(getAttributionFor(buildTileUrl('X')), /CARTO/);
});
