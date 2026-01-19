# 📡 GeoGrid Server - API Documentation

## Base URL

```
http://localhost:3000
```

## Authentication

No authentication required (stateless service).

## Rate Limiting

- **Window**: 60 seconds
- **Max Requests**: 100 per window
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Endpoints

### 1. Root - Service Info

Get information about the service.

**Endpoint**: `GET /`

**Response**:
```json
{
  "name": "GeoGrid SEO Local Server",
  "version": "1.0.0",
  "description": "Microservicio para generar informes visuales de posicionamiento SEO local",
  "endpoints": {
    "health": "/health",
    "render": "POST /api/render",
    ...
  }
}
```

---

### 2. Health Check

Check service health and browser status.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-19T13:28:27.027Z",
  "uptime": 178.34,
  "memory": {
    "heapUsed": 16,
    "heapTotal": 19,
    "rss": 68
  },
  "browser": {
    "connected": true,
    "pages": 0,
    "uptime": 166
  }
}
```

---

### 3. Readiness Probe

Kubernetes readiness probe.

**Endpoint**: `GET /health/ready`

**Response**:
```json
{
  "status": "ready",
  "timestamp": "2026-01-19T13:28:27.027Z"
}
```

**Status Codes**:
- `200`: Ready
- `503`: Not ready

---

### 4. Liveness Probe

Kubernetes liveness probe.

**Endpoint**: `GET /health/live`

**Response**:
```json
{
  "status": "alive",
  "timestamp": "2026-01-19T13:28:27.027Z"
}
```

---

### 5. Render Image

Generate GeoGrid report as PNG/JPEG/WebP image.

**Endpoint**: `POST /api/render`

**Request Body**:
```json
{
  "keyword": "comida para llevar",
  "business": "Restaurante El Buen Sabor",
  "centerLat": 43.5596,
  "centerLng": -5.9739,
  "gridSize": 9,
  "radiusKm": 4,
  "positions": [10, 6, 4, 3, 5, ...],
  "width": 800,
  "height": 900,
  "markerSize": 28,
  "brandText": "EquipoSEO",
  "showLegend": true,
  "format": "png",
  "quality": 90,
  "theme": "default"
}
```

**Parameters**:

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `keyword` | string | Yes | - | min: 1, max: 200 |
| `business` | string | Yes | - | min: 1, max: 200 |
| `centerLat` | number | Yes | - | -90 to 90 |
| `centerLng` | number | Yes | - | -180 to 180 |
| `gridSize` | number | No | 9 | 3 to 15 |
| `radiusKm` | number | No | 4 | 0.5 to 20 |
| `positions` | array | Yes | - | length = gridSize² |
| `width` | number | No | 800 | 400 to 1920 |
| `height` | number | No | 900 | 400 to 1920 |
| `markerSize` | number | No | 28 | 16 to 48 |
| `brandText` | string | No | "EquipoSEO" | max: 50 |
| `showLegend` | boolean | No | true | - |
| `format` | string | No | "png" | png, jpeg, webp |
| `quality` | number | No | 90 | 1 to 100 |
| `theme` | string | No | "default" | default, dark, light |

**Response**:
- **Content-Type**: `image/png` (or jpeg/webp)
- **Body**: Binary image data

**Response Headers**:
```
Content-Type: image/png
Content-Length: 245832
X-Render-Time: 2847ms
X-Grid-Points: 81
X-GeoRank: 0.42
```

**Status Codes**:
- `200`: Success
- `400`: Validation error
- `500`: Render error
- `503`: Browser error

---

### 6. Render Base64

Generate GeoGrid report and return as base64-encoded JSON.

**Endpoint**: `POST /api/render/base64`

**Request Body**: Same as `/api/render`

**Response**:
```json
{
  "success": true,
  "data": "iVBORw0KGgoAAAANSUhEUgAA...",
  "metadata": {
    "renderTime": 2847,
    "size": 245832,
    "format": "png",
    "gridPoints": 81
  },
  "metrics": {
    "geoRank": 0.42,
    "avgPosition": 4.2,
    "localPackPct": 35.8,
    "coverage": 91.4
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Validation error
- `500`: Render error
- `503`: Browser error

---

### 7. Preview HTML

Preview the HTML report in browser (for debugging).

**Endpoint**: `GET /api/preview`

**Query Parameters**:

| Param | Type | Required | Example |
|-------|------|----------|---------|
| `keyword` | string | Yes | "pizza" |
| `business` | string | Yes | "Pizza Express" |
| `lat` | number | Yes | 40.4168 |
| `lng` | number | Yes | -3.7038 |
| `gridSize` | number | No | 5 |
| `radius` | number | No | 2 |
| `positions` | JSON array | Yes | [1,2,3,null,5,...] |

**Example**:
```
GET /api/preview?keyword=pizza&business=Pizza+Express&lat=40.4168&lng=-3.7038&gridSize=5&radius=2&positions=[1,2,3,null,5,2,1,2,3,4,3,2,1,2,3,null,3,2,1,2,5,4,3,2,1]
```

**Response**:
- **Content-Type**: `text/html`
- **Body**: HTML page with interactive map

---

### 8. Preview Presets

List available demo presets.

**Endpoint**: `GET /api/preview/presets`

**Response**:
```json
{
  "success": true,
  "presets": [
    {
      "id": "demo",
      "keyword": "comida para llevar",
      "business": "Restaurante El Buen Sabor",
      "gridSize": 9,
      "radiusKm": 4,
      "url": "/api/preview/demo"
    },
    {
      "id": "small",
      "keyword": "pizza delivery",
      "business": "Pizza Express",
      "gridSize": 5,
      "radiusKm": 2,
      "url": "/api/preview/small"
    },
    {
      "id": "large",
      "keyword": "coffee shop",
      "business": "Starbucks Central",
      "gridSize": 11,
      "radiusKm": 6,
      "url": "/api/preview/large"
    }
  ]
}
```

---

### 9. Preview Preset

Preview a specific preset.

**Endpoint**: `GET /api/preview/:presetId`

**Parameters**:
- `presetId`: One of `demo`, `small`, `large`

**Response**:
- **Content-Type**: `text/html`
- **Body**: HTML page with interactive map

**Status Codes**:
- `200`: Success
- `404`: Preset not found

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Grid configuration validation failed",
    "details": [
      {
        "field": "centerLat",
        "message": "Center latitude is required"
      }
    ]
  }
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid request data
- `RENDER_ERROR`: Screenshot generation failed
- `BROWSER_ERROR`: Browser/Puppeteer error
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `NOT_FOUND`: Route not found
- `INTERNAL_ERROR`: Unexpected server error

---

## Metrics Explained

### GeoRank
Proprietary visibility metric: `1 / average_position`
- Range: 0.00 to 1.00
- Higher = better visibility
- Formula: `1 / avgPosition`

### Average Position
Average ranking position where business appears.
- Example: 4.2 means average position is 4.2
- `null` if not found anywhere

### Local Pack %
Percentage of grid points where business is in top 3.
- Range: 0% to 100%
- Higher = better local pack presence

### Coverage
Percentage of grid points where business was found.
- Range: 0% to 100%
- Higher = wider geographic presence

---

## Position Color Scheme

| Position | Color | Description |
|----------|-------|-------------|
| 1 | 🟢 Green (#27ae60) | Position #1 |
| 2-3 | 🟢 Light Green (#2ecc71) | Local Pack |
| 4-7 | 🟡 Yellow (#f1c40f) | Top 7 |
| 8-10 | 🟠 Orange (#e67e22) | Top 10 |
| 11-20 | 🔴 Red (#e74c3c) | Page 1 |
| 21+ | 🔴 Dark Red (#c0392b) | Page 2+ |
| null | ⚫ Gray (#95a5a6) | Not found |

---

## Example Requests

### cURL

```bash
# Render image
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  --output informe.png

# Render base64
curl -X POST http://localhost:3000/api/render/base64 \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json

# Preview
curl "http://localhost:3000/api/preview/demo"
```

### JavaScript

See `examples/test-api.js`

### Python

See `examples/test-api.py`

---

## Performance

- **Startup time**: < 10 seconds
- **Render time**: < 5 seconds (typical: 2-3 seconds)
- **Max concurrent renders**: Limited by rate limiting (100/min)
- **Browser lifecycle**: Singleton, reused across requests
- **Memory**: ~60-200 MB typical usage

---

## Troubleshooting

### Browser fails to initialize

Check Puppeteer configuration:
- Windows: Leave `PUPPETEER_EXECUTABLE_PATH` empty (uses bundled Chromium)
- Linux: Set to `/usr/bin/chromium` or `/usr/bin/google-chrome`
- Docker: Set to `/usr/bin/chromium`

### Renders timeout

Increase timeout in `.env`:
```
PUPPETEER_TIMEOUT=60000
```

### Memory issues

Reduce concurrent requests or increase container memory limits.

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/geogrid-server/issues
- Email: support@equiposeo.com
