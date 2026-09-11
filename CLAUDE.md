# CLAUDE.md — GeoGrid Server

> Biblia del proyecto. Contexto que Claude Code carga automáticamente al abrir el repo.
> Regla: si el código y este documento se contradicen, **manda el código** — y se corrige este
> documento en el mismo cambio.

---

## 1. Qué es

Microservicio HTTP que genera **informes visuales de posicionamiento SEO local en formato
geo-grid**: una cuadrícula de puntos GPS alrededor de un negocio, cada uno coloreado según la
posición de ese negocio en Google para una keyword en ese punto concreto.

- **Entrada:** keyword + negocio + coordenadas del centro + array de posiciones ya medidas.
- **Salida:** imagen PNG/JPEG/WebP del mapa con métricas, o esa misma imagen en base64.
- **El servicio NO scrapea Google.** No mide posiciones; las recibe ya calculadas por el cliente
  que lo llama. Es un **renderizador**, no un rank tracker. Confundir esto es el error de
  concepto más caro del proyecto.

**Versión:** 1.2.0 · **Licencia:** ISC · **Módulos:** CommonJS · **Node:** >= 22.12 (§10.4)

---

## 2. Stack

| Capa | Tecnología |
|------|-----------|
| Runtime | **Node.js 22.12+** (CommonJS, `type: commonjs`) — ver §10.4 |
| HTTP | Express 5 |
| Validación | Joi 18 |
| Render | Puppeteer 25 (Chromium headless) |
| Mapa | Leaflet.js + tiles **OpenStreetMap** (configurable por `TILE_URL`) |
| Seguridad | helmet, cors, rate limit propio in-memory, API Key propia |
| Despliegue | Docker (`node:22-bookworm-slim` + chromium del sistema) → EasyPanel |

---

## 3. Comandos

```bash
npm run dev          # nodemon, desarrollo
npm start            # producción (node server.js)
npm test             # suite completa (runner nativo de Node, sin dependencias)
npm run test:watch   # tests en watch
npm run lint         # eslint (flat config)
npm run lint:fix
npm run format       # prettier
node utils/generateApiKey.js   # generar una API key válida (>=32 chars)

docker build -t geogrid-server .
docker-compose up -d
```

**Ojo al puerto:** el `.env` de esta máquina usa `PORT=3001`, mientras `.env.example` y el
Dockerfile usan 3000. Mira el log de arranque antes de lanzar curls a ciegas.

**Verificación rápida de que todo funciona:**

```bash
npm test                                    # 65 tests, < 1s
curl http://localhost:3001/health           # público
curl "http://localhost:3001/api/preview/demo?api_key=$API_KEY" -o demo.html   # preset 9x9
```

**Smoke test del render real** (lo único que ejercita Puppeteer de punta a punta):

```bash
curl -X POST http://localhost:3001/api/render -H "Content-Type: application/json" \
  -d '{"keyword":"pizza","business":"Pizza Express","centerLat":40.4168,"centerLng":-3.7038,
       "gridSize":3,"radiusKm":2,"positions":[1,2,3,2,5,2,3,null,21]}' --output smoke.png
```

Un 200 OK no basta: **abre la imagen**. Los fallos de este servicio (tiles en blanco, marca de
agua, leyenda cortada) son visuales y pasan todos los checks de estado.

---

## 4. Arquitectura

Flujo de una petición de render, capa por capa:

```
POST /api/render
  └─ middleware/rateLimit      límite por IP, in-memory
  └─ middleware/auth           valida API Key (si API_KEY_ENABLED=true)
  └─ middleware/validation     Joi: gridConfig + renderOptions → req.validatedData
  └─ controllers/render        orquesta
       └─ services/html        genera el HTML completo del informe
            └─ services/grid   coordenadas + colores + métricas   ← núcleo de dominio
                 ├─ utils/coordinates   rejilla GPS (Haversine / destino por rumbo)
                 ├─ utils/colors        posición → color, color de texto, texto del marcador
                 └─ utils/metrics       GeoRank, media, Local Pack %, cobertura, distribución
            └─ views/templates/*        geogrid (HTML) + styles (CSS) + scripts (Leaflet)
       └─ services/screenshot   Puppeteer: setContent → espera → captura
            └─ services/browser  singleton del navegador (1 browser, N páginas)
  └─ middleware/error          errorHandler + notFoundHandler (siempre los últimos)
```

**Reglas de capa (respétalas al añadir código):**

- `utils/` es puro: sin estado, sin I/O, sin Express. Es lo único trivialmente testeable.
- `services/` contiene la lógica; no conoce `req`/`res`.
- `controllers/` solo orquestan y dan forma a la respuesta HTTP.
- `models/` son **esquemas Joi**, no ORM ni base de datos. Este proyecto **no tiene BD**: es
  stateless salvo el contador de rate limit y el browser en memoria.
- Toda entrada de usuario que acabe en el HTML pasa por `utils/escapeHtml.utils.js`.

---

## 5. Contrato de la API

Documentación extensa en `API.md` y `AUTHENTICATION.md`. Resumen operativo:

| Método | Ruta | Auth | Devuelve |
|--------|------|------|----------|
| GET | `/` | — | índice de endpoints |
| GET | `/health` · `/health/ready` · `/health/live` | — | estado (probes Docker/K8s) |
| POST | `/api/render` | **API Key** | binario de imagen |
| POST | `/api/render/base64` | **API Key** | JSON con `data` base64 + métricas |
| GET | `/api/preview?keyword=…&business=…&lat=…&lng=…&positions=[…]` | **API Key** | HTML en vivo |
| GET | `/api/preview/presets` | **API Key** | lista de presets |
| GET | `/api/preview/:presetId` | **API Key** | HTML de un preset (`demo`, `small`, …) |

**Auth:** `X-API-Key: <key>` · `Authorization: Bearer <key>` · `?api_key=<key>`. Las tres
valen y cubren **todo `/api/*`**, render y preview (desde v1.2.0). Públicos solo `GET /` y
`/health*`, porque son las probes del contenedor. La auth se activa con `API_KEY_ENABLED=true`;
con `false` el middleware deja pasar todo, así que en producción debe estar en `true`.

**Cuerpo de `POST /api/render`** (validación en `models/gridConfig.model.js` +
`models/renderOptions.model.js`):

| Campo | Tipo | Rango | Default |
|-------|------|-------|---------|
| `keyword` | string | 1–200 | requerido |
| `business` | string | 1–200 | requerido |
| `centerLat` | number | −90…90 | requerido |
| `centerLng` | number | −180…180 | requerido |
| `gridSize` | int | 3–15 | 9 |
| `radiusKm` | number | 0.5–20 | 4 |
| `positions` | array de int≥1 o `null` | **longitud exacta = gridSize²** | requerido |
| `width` / `height` | int | 400–1920 | 800 / 1100 |
| `markerSize` | int | 16–48 | 28 |
| `brandText` | string | ≤50 | `EquipoSEO` |
| `showLegend` | bool | | `true` |
| `format` | enum | `png` \| `jpeg` \| `webp` | `png` |
| `quality` | int | 1–100 | 90 |
| `theme` | enum | `default` \| `dark` \| `light` | `default` |

`null` en `positions` = negocio **no encontrado** en ese punto. El array recorre la rejilla por
filas (índice `row * gridSize + col`).

Las respuestas de render llevan cabeceras `X-Render-Time`, `X-Grid-Points`, `X-GeoRank`.

---

## 6. Escala de colores — fuente de verdad: `utils/colors.utils.js`

Cualquier documento que diga otra cosa está desactualizado.

| Posición | Color | Texto | Etiqueta en leyenda |
|----------|-------|-------|---------------------|
| 1 | `#27ae60` verde oscuro | blanco | Posición #1 |
| 2–3 | `#2ecc71` verde claro | blanco | Local Pack (2-3) |
| **4–7** | `#f1c40f` amarillo | `#2c3e50` | Top 7 (4-7) |
| **8–10** | `#e67e22` naranja | blanco | Top 10 (8-10) |
| 11–20 | `#e74c3c` rojo | blanco | Página 1 (11-20) |
| 21+ | `#c0392b` rojo oscuro | blanco | Página 2+ (21+) — se muestra como `21+` |
| `null` | `#95a5a6` gris | blanco | No encontrado — se muestra como `X` |

`POSITION_RANGES` es la **única** definición de los tramos: color, color de texto, etiqueta de
leyenda y clave de distribución salen de esa tabla. Cambiar un umbral ahí lo cambia en el mapa,
en la leyenda y en las métricas a la vez, y `test/colors.test.js` verifica que los tramos cubren
todo el espacio de posiciones sin huecos ni solapes.

**Marcador central:** el centro reutiliza el color y la posición del punto medio de la rejilla
(índice `floor(gridSize/2) * gridSize + floor(gridSize/2)`), calculado en `grid.service.js` y
pintado en `scripts.template.js` como pin de dos capas (triángulo blanco de borde bajo el
triángulo de color). No lleva color fijo.

---

## 7. Métricas — `utils/metrics.utils.js`

| Métrica | Fórmula | Nota |
|---------|---------|------|
| **GeoRank** | `1 / posición_media`, capado a 1.00 | métrica propia; solo cuenta puntos encontrados |
| **Posición media** | media de posiciones no nulas | `null` si no aparece en ningún punto |
| **Local Pack %** | puntos en 1–3 ÷ **total de puntos** × 100 | denominador = todos, no solo los encontrados |
| **Cobertura** | puntos encontrados ÷ total × 100 | `{found, total, percentage}` |
| **Distribución** | conteo por tramo | claves derivadas de `POSITION_RANGES` |

Ojo a la asimetría deliberada: GeoRank y posición media **ignoran** los `null`; Local Pack % y
cobertura los **cuentan** en el denominador. Es correcto, pero es el sitio donde es fácil
"arreglar" un bug que no existe.

---

## 8. Configuración (`.env`)

Plantilla en `.env.example`. Validación con corte al arrancar en `config/env.config.js` — **si
la config es inválida el proceso no arranca**, y es intencional.

Claves que importan: `PORT`, `HOST`, `NODE_ENV`, `LOG_LEVEL`,
`PUPPETEER_EXECUTABLE_PATH` (en Docker: `/usr/bin/chromium`), `PUPPETEER_HEADLESS`,
`PUPPETEER_TIMEOUT`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`,
`DEFAULT_GRID_SIZE|RADIUS_KM|MARKER_SIZE|BRAND_TEXT`,
`DEFAULT_WIDTH|HEIGHT|FORMAT|QUALITY`, `API_KEY_ENABLED`, `API_KEYS` (separadas por comas,
**mínimo 32 caracteres cada una**) y `TILE_API_KEY` para los tiles (§10.3; la URL y la
atribución salen solas del código, no se configuran).

Reglas que abortan el arranque: puerto fuera de 1–65535 · `DEFAULT_GRID_SIZE` fuera de 3–15 ·
`DEFAULT_RADIUS_KM` fuera de 0.5–20 · `API_KEY_ENABLED=true` sin claves o con alguna clave
demasiado corta.

---

## 9. Despliegue (EasyPanel)

- **Dominio:** `https://equipo-seo-geogrid.qkhp74.easypanel.host/` · puerto interno `3000`.
- El *target* del dominio en EasyPanel debe apuntar al **nombre real del servicio** en el panel
  (`http://<servicio>:3000`). Un fallo histórico de este proyecto fue apuntar a un nombre de
  servicio inexistente; síntoma = 502/timeout con la app perfectamente sana. Comprobación:
  `curl https://equipo-seo-geogrid.qkhp74.easypanel.host/health`.
- La imagen instala **chromium del sistema** y corre como usuario `node` (no root).
  `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` — no se descarga el Chromium de Puppeteer.
- El `HEALTHCHECK` del contenedor pega a `/health/live`.
- `package-lock.json` **se versiona a propósito** (`npm ci` en el build). No lo ignores.
- Guías largas: `EASYPANEL_DEPLOYMENT.md`, `EASYPANEL_QUICKSTART.md`.

---

## 10. Gotchas (lo que rompe de verdad)

1. **Render headless: nada de emojis.** Los marcadores usan CSS puro (círculo + triángulo) y
   texto plano (`X`, `21+`). El contenedor no tiene fuentes de emoji; un 📍 sale como caja
   vacía. Ya se corrigió una vez — no reintroducir.
2. **Sincronía del screenshot.** `screenshot.service.js` espera a
   `window.GEOGRID_READY === true` (o `window.GEOGRID_ERROR`) con 15 s de timeout, y **luego
   duerme 2 s** para que terminen de pintar los tiles. Si tocas el template, mantén la señal
   `GEOGRID_READY`; sin ella la captura sale en blanco o a medias.
3. **Tiles — el punto más frágil del servicio.** Se configura con `TILE_URL` /
   `TILE_ATTRIBUTION` / `TILE_SUBDOMAINS`. Estado de los proveedores (verificado 2026-09-11):

   | Proveedor | Clave | Uso comercial | Qué pasa hoy |
   |---|---|---|---|
   | **CARTO con clave** | gratis, por formulario | **sí**, hasta 5M tiles/mes | **la opción recomendada** |
   | CARTO sin clave | no | — | sirve el tile con "API KEY REQUIRED" **estampado dentro del PNG** |
   | OpenStreetMap oficial | no | desaconsejado (servidores de voluntarios) | default actual: funciona, pero es un préstamo, no un servicio |
   | Geoapify | sí, gratis | sí, ~12.000 tiles/día | alternativa válida |

   Dos trampas aprendidas a base de golpes: **CARTO devuelve HTTP 200 con el aviso pintado en la
   imagen** (no falla, así que ningún check de estado lo detecta), y **OSM devuelve una imagen de
   "Access blocked" a los clientes que considera bots** (también con 200). Por eso, al tocar
   tiles, la única verificación válida es **abrir el PNG del render y mirarlo**.
   **En el entorno solo se pone la clave** (`TILE_API_KEY`). La URL del proveedor y la
   atribución legal viven en el código (`utils/tiles.utils.js`): con clave se construye CARTO
   Voyager, sin clave se cae a OpenStreetMap, y la atribución se deduce del dominio resultante.
   Si el proveedor no se reconoce, cae en la de OpenStreetMap — nunca en vacío, porque es
   condición de licencia. `TILE_URL` (plantilla completa) y `TILE_ATTRIBUTION` siguen existiendo
   como escape para un proveedor distinto, y tienen prioridad si se definen.

   **La clave de CARTO se pide en `carto.com/basemaps/apikey`** — es un formulario, sin cuenta
   ni tarjeta, y llega por email al momento. No confundir con los precios de carto.com, que son
   de su plataforma enterprise de Location Intelligence: otro producto. El límite gratuito (5M
   tiles/mes) admite uso comercial; solo si se supera piden pasar a un acuerdo de pago, y a
   ~50 tiles por informe eso son unos 100.000 informes al mes.

4. **Node 22.12+ es un requisito duro, no una preferencia.** Puppeteer 25 es ESM puro
   (`"type": "module"`) y declara `engines: >=22.12.0`. Este proyecto es CommonJS, así que
   depende de `require(esm)`, que Node habilitó por defecto en la **22.12**. Con Node 18 el
   proceso ni arranca: muere en `require('puppeteer')` con `ERR_REQUIRE_ESM`. Nunca bajes la
   imagen base del Dockerfile por debajo de esa versión — y ojo, el fallo es de **arranque**,
   así que no lo verás hasta que el contenedor esté desplegado.

   La etiqueta es `node:22-bookworm-slim` y el `bookworm` es deliberado: en trixie hay paquetes
   de Debian que cambiaron de nombre (`libasound2` → `libasound2t64`). Las librerías de Chromium
   ya no se listan una a una en el Dockerfile: las arrastra el propio paquete `chromium`, y esa
   lista manual se rompía en cada cambio de release.

5. **Browser singleton.** Un solo Chromium para todo el proceso, con reconexión (3 intentos) y
   limpieza periódica de páginas. No lances `puppeteer.launch()` fuera de `browser.service.js`:
   fugas de memoria garantizadas.
6. **Rate limit in-memory.** Vive en el proceso. Con más de una réplica, el límite real se
   multiplica por el número de instancias. Si se escala en horizontal hace falta backend externo.
7. **CORS en producción es `origin: false`** (`config/app.config.js`) — es decir, bloqueado
   desde navegador. El servicio está pensado para llamadas servidor-a-servidor. Si algún día se
   llama desde un front, hay que abrir un origen explícito, nunca `*`.
8. **CSP desactivada** en helmet, a propósito, porque el HTML del preview carga Leaflet y tiles
   por CDN. Tenerlo presente al auditar seguridad.
9. **`API_KEY_ENABLED=false` desactiva la auth de golpe**, en render y preview. Es cómodo en
   local y un agujero en producción: verifica el valor real del entorno desplegado, no el del
   `.env.example`.
10. **Puppeteer mayor = revisar la API del browser.** La v25 eliminó `browser.isConnected()`
   en favor de la propiedad `browser.connected`; el servidor arrancaba igual y solo reventaba al
   renderizar. Tras cada salto mayor, smoke test de render obligatorio.
11. **ESLint usa flat config** (`eslint.config.js`) y el formato lo lleva Prettier: no
    reintroduzcas reglas de estilo (`indent`, `quotes`, `semi`) — están deprecadas en el core de
    ESLint y chocan con `.prettierrc`.
12. **El JS que corre dentro del navegador** (plantillas y callbacks de `page.evaluate`) tiene su
    propia entrada en `eslint.config.js` con globals de browser. Si mueves ese código, mueve
    también la entrada o ESLint marcará `window`/`document` como indefinidos.

---

## 11. Estado conocido y deuda

Saneado el 2026-09-11 (detalle en `CHANGELOG.md` 1.2.0): tests, lint, dependencias, fuente única
de tramos, versión del endpoint raíz, tiles y ficheros huérfanos. Lo que **sigue abierto**:

- **Tiles sin clave propia.** El default (OSM) funciona pero depende de servidores de
  voluntarios. Pendiente: crear la cuenta gratuita de CARTO y poner su `TILE_URL` en las
  variables de entorno de EasyPanel (§10.3). No requiere tocar código ni redesplegar imagen.
- **Rate limit in-memory**: no sobrevive a más de una réplica (§10.6).
- **Sin tests de la capa HTTP ni de Puppeteer.** Los 65 tests cubren dominio, validación y
  autenticación; el render solo se verifica con el smoke test manual de §3.
- **Documentación dispersa en la raíz**: `README.md`, `API.md`, `AUTHENTICATION.md`,
  `COMMANDS.md`, `QUICKSTART.md`, `EASYPANEL_*.md`. Varios describen aún la v1.0/1.1 (tiles de
  CARTO, `npm test` inexistente); conviene una pasada cuando se toquen.
- `.env` está en el repo local pero **ignorado por git** (correcto). No lo comitees. Difiere de
  `.env.example` en el puerto (3001 vs 3000).

---

## 12. Convenciones

- CommonJS (`require`), 2 espacios, comillas simples, punto y coma. ESLint + Prettier mandan.
- Cada archivo abre con un bloque `/** … */` que dice qué hace. Mantenerlo.
- Logging siempre por `utils/logger.utils.js` con objeto de contexto
  (`logger.info('msg', { key })`), nunca `console.log`.
- Errores de negocio: clases con `statusCode`, capturadas por `middleware/error.middleware.js`.
  Los handlers async se envuelven en `asyncHandler`.
- Nombres de fichero: `<dominio>.<capa>.js` (`grid.service.js`, `auth.middleware.js`).
- Los archivos de trabajo de Claude van a `.dev/` (ignorado por git).
- Tests en `test/*.test.js` con `node:test` + `node:assert/strict`, en español y nombrando el
  comportamiento ("el marcador central hereda el color del punto medio"), no la función.

---

## 13. Historial de decisiones

| Fecha | Decisión / cambio | Dónde |
|-------|-------------------|-------|
| 2026-09-11 | Saneamiento de deuda: suite de tests nativa, ESLint flat config, `POSITION_RANGES` como fuente única, dependencias a 0 vulnerabilidades (Puppeteer 25) | `CHANGELOG.md` 1.2.0 |
| 2026-09-11 | Tiles a OpenStreetMap y proveedor configurable: CARTO gratuito empezó a estampar "API KEY REQUIRED" sobre los informes de cliente | `config/env.config.js`, `views/templates/scripts.template.js` |
| 2026-01-23 | Marcador central dinámico: hereda color y posición del punto medio de la rejilla; borde blanco extendido al pico del pin | `services/grid.service.js`, `views/templates/scripts.template.js` |
| 2026-01-22 | Emojis fuera del render: marcadores en CSS puro y `X` en vez de `✗`, por incompatibilidad headless | `views/templates/scripts.template.js`, `utils/colors.utils.js` |
| 2026-01-20 | Diagnóstico de dominio EasyPanel apuntando a un servicio inexistente | infraestructura (ver §9) |
| 2026-01-19 | v1.1.0 — autenticación por API Key en los endpoints de render | `middleware/auth.middleware.js`, `AUTHENTICATION.md` |
| — | Tiles migrados a CartoDB Voyager (OSM directo fallaba en headless) | `views/templates/scripts.template.js` |

El detalle completo de versiones vive en `CHANGELOG.md`; esta tabla solo guarda el **porqué**.
