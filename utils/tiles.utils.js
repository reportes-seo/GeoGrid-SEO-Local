/**
 * Tiles utility
 * Deduce la atribucion legal a partir de la URL del proveedor de tiles.
 *
 * Por que existe esto: la atribucion es HTML y obligatoria por licencia (OSM y
 * CARTO la exigen visible), pero es horrible de mantener dentro de una variable
 * de entorno. Como cada proveedor tiene una atribucion fija y conocida, basta con
 * reconocer su dominio en TILE_URL y poner la correcta automaticamente.
 *
 * El operador solo configura TILE_URL con su clave; la atribucion se encarga sola.
 */

const OSM =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Proveedor por defecto cuando hay clave: CARTO Voyager, el estilo de los informes.
 * La plantilla vive aqui y no en el entorno: lo unico que cambia entre instalaciones
 * es la clave, asi que es lo unico que se pide por variable de entorno.
 */
const CARTO_TEMPLATE =
  'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=';

/**
 * Proveedor por defecto sin clave: OpenStreetMap oficial.
 * Sirve para desarrollo; en produccion se pone la clave (ver .env.example).
 */
const OSM_TEMPLATE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/**
 * Build the tile URL from an API key
 *
 * Con clave -> CARTO Voyager (sin marca de agua, 5M tiles/mes, uso comercial).
 * Sin clave -> OpenStreetMap oficial.
 *
 * @param {string} [apiKey] - Tile provider API key
 * @returns {string} Tile URL template
 */
function buildTileUrl(apiKey) {
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';

  return key ? `${CARTO_TEMPLATE}${encodeURIComponent(key)}` : OSM_TEMPLATE;
}

/**
 * Proveedores conocidos: se reconocen por un fragmento de su dominio.
 * El orden importa solo si dos patrones pudieran coincidir con la misma URL.
 * @type {Array<{match: string, attribution: string}>}
 */
const PROVIDERS = [
  {
    match: 'cartocdn.com',
    attribution: `${OSM} © <a href="https://carto.com/attributions">CARTO</a>`
  },
  {
    match: 'geoapify.com',
    attribution: `${OSM} © <a href="https://www.geoapify.com/">Geoapify</a>`
  },
  {
    match: 'maptiler.com',
    attribution: `${OSM} © <a href="https://www.maptiler.com/copyright/">MapTiler</a>`
  },
  {
    match: 'stadiamaps.com',
    attribution: `${OSM} © <a href="https://stadiamaps.com/">Stadia Maps</a>`
  },
  {
    match: 'thunderforest.com',
    attribution: `${OSM} © <a href="https://www.thunderforest.com/">Thunderforest</a>`
  },
  {
    match: 'openstreetmap.org',
    attribution: OSM
  }
];

/**
 * Get the legal attribution for a tile URL
 *
 * Si el proveedor no se reconoce se devuelve la de OpenStreetMap, que es la base
 * de datos de practicamente todos: quedarse sin atribucion nunca es una opcion,
 * y para un proveedor exotico siempre se puede forzar con TILE_ATTRIBUTION.
 *
 * @param {string} tileUrl - Tile URL template
 * @returns {string} HTML attribution
 */
function getAttributionFor(tileUrl) {
  if (typeof tileUrl !== 'string' || tileUrl.length === 0) {
    return OSM;
  }

  const url = tileUrl.toLowerCase();
  const provider = PROVIDERS.find(p => url.includes(p.match));

  return provider ? provider.attribution : OSM;
}

module.exports = {
  OSM_ATTRIBUTION: OSM,
  CARTO_TEMPLATE,
  OSM_TEMPLATE,
  PROVIDERS,
  buildTileUrl,
  getAttributionFor
};
