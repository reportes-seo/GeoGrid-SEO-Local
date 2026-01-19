# 🗺️ GeoGrid SEO Local Server

Microservicio para generar informes visuales de posicionamiento SEO local en formato "geo-grid" (cuadrícula geográfica). Genera screenshots/imágenes PNG de mapas interactivos mostrando la visibilidad del negocio en cada punto.

## 📋 Características

- **Generación de mapas interactivos** con Leaflet.js y OpenStreetMap
- **Cálculo de métricas SEO**: GeoRank, posición media, cobertura, Local Pack %
- **Renderizado de screenshots** con Puppeteer
- **API REST** simple y eficiente
- **🔐 Autenticación con API Key** para proteger endpoints
- **Rate limiting** y validación robusta
- **Docker ready** para despliegue sencillo
- **Graceful shutdown** para Kubernetes/Docker

## 🚀 Stack Tecnológico

- Node.js 18+
- Express.js
- Puppeteer (headless browser)
- Leaflet.js + OpenStreetMap
- Joi (validación)
- Docker

## 📦 Instalación

### Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/yourusername/geogrid-server.git
cd geogrid-server

# Instalar dependencias
npm install

# Copiar configuración de ejemplo
cp .env.example .env

# Iniciar en modo desarrollo
npm run dev
```

### Docker

```bash
# Construir imagen
docker build -t geogrid-server .

# Ejecutar contenedor
docker run -p 3000:3000 geogrid-server

# O usar docker-compose
docker-compose up -d
```

## 🔧 Configuración

Variables de entorno (`.env`):

```env
# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Defaults
DEFAULT_GRID_SIZE=9
DEFAULT_RADIUS_KM=4.0
DEFAULT_MARKER_SIZE=28
DEFAULT_BRAND_TEXT=EquipoSEO
```

## 🔐 Autenticación (Opcional)

El servidor incluye autenticación con API Key para proteger los endpoints de renderizado y evitar uso no autorizado.

### Generar API Key

```bash
# Generar una API key segura
node utils/generateApiKey.js

# Generar con prefijo personalizado
node utils/generateApiKey.js 1 equiposeo

# Generar múltiples keys
node utils/generateApiKey.js 3
```

### Configurar

```env
# .env
API_KEY_ENABLED=true
API_KEYS=equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0
```

### Usar en Requests

```bash
# Opción 1: Header X-API-Key (recomendado)
curl -H "X-API-Key: your-key-here" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/render \
  -d '{...}'

# Opción 2: Authorization Bearer
curl -H "Authorization: Bearer your-key-here" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/render \
  -d '{...}'

# Opción 3: Query parameter
curl -X POST "http://localhost:3000/api/render?api_key=your-key-here" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Endpoints protegidos:**
- `POST /api/render` - Requiere API key
- `POST /api/render/base64` - Requiere API key

**Endpoints públicos:**
- `GET /api/preview/*` - No requiere autenticación (solo para debug)
- `GET /health/*` - No requiere autenticación

📖 **Documentación completa:** Ver [AUTHENTICATION.md](./AUTHENTICATION.md) para guía detallada de seguridad, ejemplos en múltiples lenguajes, y mejores prácticas.

## 📡 API Endpoints

### Renderizar Imagen

```bash
POST /api/render
Content-Type: application/json
X-API-Key: your-api-key-here  # Si autenticación está habilitada

# Request Body
{
  "keyword": "comida para llevar",
  "business": "Restaurante El Buen Sabor",
  "centerLat": 43.5596,
  "centerLng": -5.9739,
  "gridSize": 9,
  "radiusKm": 4,
  "positions": [10,6,4,3,5,9,...],
  "width": 800,
  "height": 900,
  "markerSize": 28,
  "format": "png"
}

# Response
Binary PNG image
Headers:
  X-Render-Time: 2847ms
  X-Grid-Points: 81
  X-GeoRank: 0.42
```

### Renderizar Base64

```bash
POST /api/render/base64
Content-Type: application/json
X-API-Key: your-api-key-here  # Si autenticación está habilitada

# Response
{
  "success": true,
  "data": "iVBORw0KGgoAAAANS...",
  "metadata": {
    "renderTime": 2847,
    "size": 245832,
    "format": "png"
  },
  "metrics": {
    "geoRank": 0.42,
    "avgPosition": 4.2,
    "localPackPct": 35.8,
    "coverage": 91.4
  }
}
```

### Preview HTML (Debug)

```bash
GET /api/preview?keyword=pizza&business=Pizza+Express&lat=40.4168&lng=-3.7038&gridSize=5&radius=2&positions=[1,2,3,null,5,2,1,2,3,4,3,2,1,2,3,null,3,2,1,2,5,4,3,2,1]

# Retorna HTML para ver en navegador
```

### Preview con Presets

```bash
# Listar presets
GET /api/preview/presets

# Ver preset
GET /api/preview/demo
GET /api/preview/small
GET /api/preview/large
```

### Health Checks

```bash
# Health general
GET /health

# Kubernetes readiness
GET /health/ready

# Kubernetes liveness
GET /health/live
```

## 🧮 Métricas Calculadas

### GeoRank
Métrica propietaria de visibilidad: `1 / posición_promedio`
- Rango: 0.00 - 1.00
- Mayor = mejor visibilidad

### Posición Media
Promedio de posiciones donde aparece el negocio

### Local Pack %
Porcentaje de puntos donde está en top 3

### Cobertura
Porcentaje de puntos donde se encontró el negocio

## 🎨 Esquema de Colores

| Posición | Color | Descripción |
|----------|-------|-------------|
| 1 | Verde oscuro (#27ae60) | Posición #1 |
| 2-3 | Verde claro (#2ecc71) | Local Pack |
| 4-7 | Amarillo (#f1c40f) | Top 7 |
| 8-10 | Naranja (#e67e22) | Top 10 |
| 11-20 | Rojo (#e74c3c) | Página 1 |
| 21+ | Rojo oscuro (#c0392b) | Página 2+ |
| null | Gris (#95a5a6) | No encontrado |

## 📝 Ejemplo de Uso

### cURL

```bash
# Sin autenticación (si API_KEY_ENABLED=false)
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "comida para llevar",
    "business": "Restaurante El Buen Sabor",
    "centerLat": 43.5596,
    "centerLng": -5.9739,
    "gridSize": 9,
    "radiusKm": 4,
    "positions": [10,6,4,3,5,9,10,6,9,1,6,5,2,2,3,5,6,10,9,5,2,2,2,2,1,3,null,6,4,2,1,1,1,3,5,null,null,2,1,2,1,1,2,2,null,7,5,2,1,1,1,1,2,5,21,2,2,2,3,2,1,3,7,21,2,3,1,2,2,5,21,null,2,9,3,10,21,5,null,5,10],
    "width": 800,
    "height": 900
  }' \
  --output informe.png

# Con autenticación (si API_KEY_ENABLED=true)
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -H "X-API-Key: equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0" \
  -d '{
    "keyword": "comida para llevar",
    "business": "Restaurante El Buen Sabor",
    "centerLat": 43.5596,
    "centerLng": -5.9739,
    "gridSize": 9,
    "radiusKm": 4,
    "positions": [10,6,4,3,5,9,10,6,9,1,6,5,2,2,3,5,6,10,9,5,2,2,2,2,1,3,null,6,4,2,1,1,1,3,5,null,null,2,1,2,1,1,2,2,null,7,5,2,1,1,1,1,2,5,21,2,2,2,3,2,1,3,7,21,2,3,1,2,2,5,21,null,2,9,3,10,21,5,null,5,10],
    "width": 800,
    "height": 900
  }' \
  --output informe.png
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');
const fs = require('fs');

async function generateReport() {
  const response = await axios.post('http://localhost:3000/api/render', {
    keyword: 'comida para llevar',
    business: 'Restaurante El Buen Sabor',
    centerLat: 43.5596,
    centerLng: -5.9739,
    gridSize: 9,
    radiusKm: 4,
    positions: [10,6,4,3,5,9,10,6,9,1,6,5,2,2,3,5,6,10,9,5,2,2,2,2,1,3,null,6,4,2,1,1,1,3,5,null,null,2,1,2,1,1,2,2,null,7,5,2,1,1,1,1,2,5,21,2,2,2,3,2,1,3,7,21,2,3,1,2,2,5,21,null,2,9,3,10,21,5,null,5,10]
  }, {
    responseType: 'arraybuffer',
    headers: {
      'X-API-Key': 'equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0' // Si autenticación está habilitada
    }
  });

  fs.writeFileSync('informe.png', response.data);
  console.log('Render time:', response.headers['x-render-time']);
  console.log('GeoRank:', response.headers['x-georank']);
}

generateReport();
```

### Python

```python
import requests

url = 'http://localhost:3000/api/render'
headers = {
    'X-API-Key': 'equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0'  # Si autenticación está habilitada
}
data = {
    'keyword': 'comida para llevar',
    'business': 'Restaurante El Buen Sabor',
    'centerLat': 43.5596,
    'centerLng': -5.9739,
    'gridSize': 9,
    'radiusKm': 4,
    'positions': [10,6,4,3,5,9,10,6,9,1,6,5,2,2,3,5,6,10,9,5,2,2,2,2,1,3,None,6,4,2,1,1,1,3,5,None,None,2,1,2,1,1,2,2,None,7,5,2,1,1,1,1,2,5,21,2,2,2,3,2,1,3,7,21,2,3,1,2,2,5,21,None,2,9,3,10,21,5,None,5,10]
}

response = requests.post(url, json=data, headers=headers)

with open('informe.png', 'wb') as f:
    f.write(response.content)

print(f"Render time: {response.headers['X-Render-Time']}")
print(f"GeoRank: {response.headers['X-GeoRank']}")
```

## 🏗️ Estructura del Proyecto

```
geogrid-server/
├── config/              # Configuración
├── controllers/         # Lógica de endpoints
├── middleware/          # Validación, errores, rate limiting
├── models/             # Schemas de validación
├── routes/             # Rutas de Express
├── services/           # Lógica de negocio
├── utils/              # Utilidades
├── views/templates/    # Templates HTML
├── .env                # Variables de entorno
├── app.js              # Configuración Express
├── server.js           # Entry point
├── Dockerfile          # Docker image
└── docker-compose.yml  # Docker Compose
```

## 🐛 Debugging

### Ver Preview HTML en Navegador

```bash
# Abrir en navegador para debug visual
http://localhost:3000/api/preview/demo
```

### Logs

```bash
# Development mode (verbose logs)
NODE_ENV=development npm run dev

# Production mode
npm start
```

## 🔒 Seguridad

- Validación robusta con Joi
- Sanitización HTML (prevención XSS)
- Rate limiting por IP
- Helmet.js para headers de seguridad
- CORS configurable
- Request size limits

## 📊 Performance

- Browser singleton (reutiliza instancia Puppeteer)
- Renderizado < 5 segundos
- Startup < 10 segundos
- Cleanup automático de páginas huérfanas
- Graceful shutdown

## 🚢 Despliegue

### EasyPanel (Recomendado)

Despliegue en EasyPanel en **5 minutos**:

```bash
# 1. Generar API Key
node utils/generateApiKey.js 1 equiposeo

# 2. Configurar en EasyPanel:
# - Conectar repositorio Git
# - Agregar variables de entorno (ver EASYPANEL_QUICKSTART.md)
# - Deploy

# 3. Verificar
curl https://tu-app.easypanel.host/health
```

📖 **Guías completas:**
- [EASYPANEL_QUICKSTART.md](./EASYPANEL_QUICKSTART.md) - Inicio rápido (5 minutos)
- [EASYPANEL_DEPLOYMENT.md](./EASYPANEL_DEPLOYMENT.md) - Guía completa paso a paso

### Docker

```bash
# Construir imagen
docker build -t geogrid-server .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e API_KEY_ENABLED=true \
  -e API_KEYS=your-key-here \
  geogrid-server

# O usar docker-compose
docker-compose up -d
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: geogrid-server
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: geogrid-server
        image: geogrid-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: API_KEY_ENABLED
          value: "true"
        - name: API_KEYS
          valueFrom:
            secretKeyRef:
              name: geogrid-secrets
              key: api-keys
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
        resources:
          requests:
            cpu: 1000m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 2Gi
```

## 📄 Licencia

ISC

## 👨‍💻 Autor

Desarrollado para EquipoSEO
