# Changelog

All notable changes to GeoGrid Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-09-11

### Security
- **Los endpoints de preview ahora exigen API Key** (`GET /api/preview`,
  `/api/preview/presets`, `/api/preview/:presetId`). Antes eran publicos y dejaban
  abierta la parte cara del servicio: cada preview genera el informe y arranca un
  render. Desde el navegador, pasar la clave como `?api_key=...`.
  `GET /` y `/health*` siguen publicos (son las probes del contenedor).

### Added
- Suite de tests con el runner nativo de Node (`npm test`), sin dependencias nuevas:
  65 tests sobre colores, metricas, coordenadas, validacion, grid.service y autenticacion
- Proveedor de tiles configurable por entorno: `TILE_URL`, `TILE_ATTRIBUTION`, `TILE_SUBDOMAINS`
- Cabeceras `Retry-After` y `X-RateLimit-*` tambien en las respuestas 429

### Fixed
- Tiles del mapa estampados con la marca de agua "API KEY REQUIRED": CARTO dejo de
  servir tiles gratuitos sin clave. Default cambiado a OpenStreetMap oficial
- `npm run lint` estaba roto desde ESLint 9 (config legacy `.eslintrc.js`):
  migrado a flat config (`eslint.config.js`)
- `browser.isConnected()` no existe en Puppeteer 25 -> `browser.connected`
- El endpoint raiz `/` anunciaba la version 1.0.0 cableada; ahora se lee de package.json
- `escapeHtml`: `hasOwnProperty` accedido desde el objeto destino (fallaba con objetos sin prototipo)
- Division por cero en metricas con una rejilla vacia
- Los errores reenvueltos ya adjuntan `cause`, preservando el stack original

### Changed
- `POSITION_RANGES` (utils/colors.utils.js) es ahora la UNICA fuente de verdad de los
  tramos de posicion: colores, leyenda y distribucion de metricas se derivan de ahi.
  Antes los umbrales estaban duplicados en tres sitios
- Dependencias actualizadas; `npm audit` pasa de 18 vulnerabilidades (1 critica, 12 altas) a 0:
  puppeteer 24.35 -> 25.10, dotenv 16 -> 17, eslint 9 -> 10, joi/helmet/cors/compression al dia
- `getColorScale()` devuelve las claves por etiqueta de tramo ('1', '2-3', ...);
  `POSITION_COLORS`/`TEXT_COLORS` dejan de exportarse (no tenian consumidores)

### Removed
- `FIXES.md` y `LEGEND_FIX.md`: su contenido ya estaba en este CHANGELOG y habia quedado
  desactualizado. Los gotchas vigentes viven en CLAUDE.md
- Carpeta huerfana `viewstemplates/` (vacia; las plantillas estan en `views/templates/`)

## [1.1.0] - 2026-01-19

### Added
- 🔐 **API Key Authentication** for render endpoints
  - Protects `/api/render` and `/api/render/base64` endpoints
  - Supports multiple API keys (comma-separated)
  - Three auth methods: `X-API-Key` header, `Authorization Bearer`, or `api_key` query param
  - Can be enabled/disabled via `API_KEY_ENABLED` env variable
  - Minimum 32-character key length requirement
  - New middleware: `middleware/auth.middleware.js`
  - New utility: `utils/generateApiKey.js` for secure key generation

### Security
- 🛡️ Authentication middleware validates API keys before processing requests
- 📝 Logs authentication attempts (successful and failed)
- 🔑 Cryptographically secure API key generation with `crypto.randomBytes()`
- ⚙️ Configurable via environment variables

### Documentation
- 📄 Added `AUTHENTICATION.md` with complete authentication guide
  - Setup instructions
  - Code examples (JavaScript, Python, PHP, cURL)
  - Security best practices
  - Docker/Kubernetes configuration
  - FAQ and troubleshooting

### Configuration
- Added new environment variables:
  - `API_KEY_ENABLED` - Enable/disable authentication (default: false)
  - `API_KEYS` - Comma-separated list of valid API keys

## [1.0.2] - 2026-01-19

### Fixed
- 🎨 Fixed legend being cut off in screenshots
  - Added automatic content height detection
  - Viewport now adjusts dynamically to fit all content
  - Increased default height from 900px to 1100px
  - Updated `services/screenshot.service.js`, `config/env.config.js`, `models/renderOptions.model.js`

### Changed
- 📏 Default screenshot height: 900px → 1100px
  - Ensures legend, footer, and all content fits properly
  - Applies to both `.env` defaults and model validation

### Documentation
- 📄 Added `LEGEND_FIX.md` with detailed explanation of legend fix

## [1.0.1] - 2026-01-19

### Fixed
- 🐛 Fixed `page.waitForTimeout is not a function` error in Puppeteer v22+
  - Replaced deprecated `waitForTimeout()` with custom `sleep()` helper
  - Updated `services/screenshot.service.js`
- 🗺️ Fixed OpenStreetMap tiles not loading in screenshots
  - Enabled image loading in request interception
  - Added tile loading tracking in map initialization
  - Increased timeouts to allow tiles to fully load
  - Updated `services/browser.service.js` and `views/templates/scripts.template.js`
- ⏱️ Increased screenshot capture timeout from 10s to 15s
- 🔧 Increased tile loading wait time from 1.5s to 2s

### Documentation
- 📄 Added `FIXES.md` with detailed bug fix documentation

## [1.0.0] - 2026-01-19

### Added
- ✨ Initial release of GeoGrid Server
- 🗺️ Interactive map generation with Leaflet.js and OpenStreetMap
- 📸 Screenshot rendering with Puppeteer
- 📊 SEO metrics calculation (GeoRank, Average Position, Local Pack %, Coverage)
- 🎨 Color-coded position markers (1 to 21+)
- 🔒 Request validation with Joi
- 🛡️ Security headers with Helmet
- ⚡ Rate limiting (100 requests/minute)
- 🐳 Docker support with Dockerfile and docker-compose
- ❤️ Health check endpoints (health, ready, live)
- 🔧 Environment-based configuration
- 📝 Comprehensive logging
- 🔄 Graceful shutdown for containers
- 👀 HTML preview mode for debugging
- 🎯 Demo presets (demo, small, large)

### API Endpoints
- `POST /api/render` - Generate PNG/JPEG/WebP image
- `POST /api/render/base64` - Generate base64-encoded image with metrics
- `GET /api/preview` - Preview HTML report
- `GET /api/preview/:presetId` - Preview demo presets
- `GET /api/preview/presets` - List available presets
- `GET /health` - Health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Features
- Grid sizes from 3×3 to 15×15
- Radius from 0.5km to 20km
- Custom marker sizes (16-48px)
- Multiple image formats (PNG, JPEG, WebP)
- Themes support (default, dark, light)
- Configurable branding text
- Legend toggle
- Position colors based on ranking

### Performance
- Browser singleton pattern for efficiency
- Request timeout: 30 seconds
- Typical render time: 2-3 seconds
- Startup time: < 10 seconds

### Documentation
- README.md with complete setup guide
- API.md with detailed endpoint documentation
- QUICKSTART.md for getting started quickly
- Example requests in multiple languages (cURL, JavaScript, Python)
- Inline code documentation

### Configuration
- Environment variables via .env
- Configurable rate limiting
- Adjustable timeouts
- Custom defaults for grid size, radius, etc.

### Security
- Input validation and sanitization
- XSS prevention
- Rate limiting per IP
- CORS configuration
- Helmet security headers
- Request size limits

## [Unreleased]

### Planned
- 📊 Analytics and usage tracking
- 🔐 API key authentication
- 💾 Redis caching for better performance
- 📧 Email report delivery
- 🌍 Multi-language support
- 📱 Responsive templates
- 🎨 Custom color schemes
- 📈 Historical data tracking
- 🔄 Batch rendering
- 🎯 Geographic heatmaps
- 📦 Export to PDF
- 🔌 Webhook support

---

[1.0.0]: https://github.com/yourusername/geogrid-server/releases/tag/v1.0.0
