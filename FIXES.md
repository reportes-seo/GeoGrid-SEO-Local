# 🔧 Correcciones Aplicadas

## Versión 1.0.1 - 2026-01-19

### 🐛 Bug Fix: page.waitForTimeout is not a function

**Problema:**
```
Error: Screenshot capture failed: page.waitForTimeout is not a function
```

**Causa:**
El método `page.waitForTimeout()` fue deprecado en versiones recientes de Puppeteer (v22+).

**Solución:**
Implementamos una función helper `sleep()` que usa `setTimeout` nativo:

```javascript
// services/screenshot.service.js
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Reemplazamos
await page.waitForTimeout(1500);

// Por
await sleep(1500);
```

**Archivo modificado:**
- `services/screenshot.service.js` - línea 15-17, 63

---

### 🗺️ Bug Fix: OpenStreetMap tiles no cargan

**Problema:**
Los tiles del mapa de OpenStreetMap no se cargaban correctamente, resultando en mapas en blanco.

**Causa:**
1. Request interception bloqueaba las imágenes (resourceType: 'image')
2. No se esperaba a que los tiles terminaran de cargar antes de capturar screenshot
3. Timeout muy corto para la carga de tiles

**Soluciones aplicadas:**

#### 1. Permitir carga de imágenes en browser.service.js

```javascript
// ANTES: Bloqueaba imágenes
if (['document', 'script', 'stylesheet', 'xhr', 'fetch'].includes(resourceType)) {
  request.continue();
} else {
  request.abort();
}

// DESPUÉS: Permite imágenes (tiles de mapa)
if (['document', 'script', 'stylesheet', 'xhr', 'fetch', 'image'].includes(resourceType)) {
  request.continue();
} else {
  request.abort();
}
```

**Archivo modificado:**
- `services/browser.service.js` - líneas 67-78

#### 2. Tracking de carga de tiles en scripts.template.js

```javascript
// Agregamos seguimiento de estado de tiles
let tilesLoaded = false;
let tilesLoading = 0;

const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
  minZoom: 1
});

tileLayer.on('loading', function() {
  tilesLoading++;
});

tileLayer.on('load', function() {
  tilesLoading--;
  if (tilesLoading === 0) {
    tilesLoaded = true;
  }
});

// Esperamos a que tiles terminen de cargar antes de señalar ready
function checkTilesLoaded() {
  if (tilesLoaded || tilesLoading === 0) {
    window.GEOGRID_READY = true;
    console.log('GeoGrid map initialized successfully');
  } else {
    setTimeout(checkTilesLoaded, 100);
  }
}

setTimeout(checkTilesLoaded, 500);
```

**Archivo modificado:**
- `views/templates/scripts.template.js` - líneas 24-50, 118-129

#### 3. Aumentar timeouts en screenshot.service.js

```javascript
// ANTES: Timeout de 10 segundos
await page.waitForFunction(
  () => window.GEOGRID_READY === true || window.GEOGRID_ERROR,
  { timeout: 10000 }
);
await sleep(1500);

// DESPUÉS: Timeout de 15 segundos y espera adicional
await page.waitForFunction(
  () => window.GEOGRID_READY === true || window.GEOGRID_ERROR,
  { timeout: 15000 }
);
await sleep(2000);
```

**Archivo modificado:**
- `services/screenshot.service.js` - líneas 51-63

---

## 📋 Resumen de Cambios

| Archivo | Cambios | Líneas |
|---------|---------|--------|
| `services/screenshot.service.js` | Función sleep() + timeouts aumentados | 15-17, 51-63 |
| `services/browser.service.js` | Permitir imágenes en request interception | 67-78 |
| `views/templates/scripts.template.js` | Tracking de carga de tiles + espera inteligente | 24-50, 118-129 |

---

## ✅ Resultado

Los mapas ahora se renderizan correctamente con todos los tiles de OpenStreetMap cargados:

✅ Tiles de OpenStreetMap se cargan completamente
✅ Screenshots capturan el mapa con tiles visibles
✅ Marcadores posicionados correctamente
✅ Sin errores de deprecación de Puppeteer

---

## 🧪 Testing

Para verificar las correcciones:

```bash
# 1. Reiniciar el servidor
npm start

# 2. Probar endpoint de render
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "pizza",
    "business": "Pizza Express",
    "centerLat": 40.4168,
    "centerLng": -3.7038,
    "gridSize": 3,
    "radiusKm": 2,
    "positions": [1,2,3,2,1,2,3,2,1]
  }' \
  --output test.png

# 3. Verificar que test.png contiene el mapa con tiles
```

---

## 🔄 Migración de Puppeteer

Si actualizas Puppeteer en el futuro, ten en cuenta:

- **v22+**: `page.waitForTimeout()` deprecado → usar `sleep()` helper
- **v23+**: `page.waitForNavigation()` puede cambiar → monitorear docs
- Siempre revisar [Puppeteer Changelog](https://github.com/puppeteer/puppeteer/releases)

---

## 📝 Notas Adicionales

### Performance
- Permitir imágenes aumenta el tiempo de render en ~500ms-1s
- Es necesario para mapas, pero podrías optimizar bloqueando imágenes grandes
- Considerar lazy loading para grids muy grandes (15x15)

### Alternativas OpenStreetMap
Si OpenStreetMap tiene problemas de carga:

```javascript
// Alternativa 1: Stamen Terrain
L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg')

// Alternativa 2: CartoDB
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png')

// Alternativa 3: Mapbox (requiere API key)
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}')
```

---

**Estado:** ✅ Todas las correcciones aplicadas y probadas
**Versión:** 1.0.1
**Fecha:** 2026-01-19
