# 🚀 GeoGrid Server - Quick Start Guide

## Instalación Rápida

```bash
# 1. Clonar o descargar el proyecto
cd geogrid-server

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor
npm start
```

El servidor estará disponible en: http://localhost:3000

## Verificar que Funciona

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Deberías ver algo como:
```json
{
  "status": "healthy",
  "browser": {
    "connected": true
  }
}
```

### 2. Ver Preview de Demo

Abre en tu navegador:
```
http://localhost:3000/api/preview/demo
```

Verás un mapa interactivo con un grid 9x9 de posiciones.

### 3. Generar tu Primera Imagen

Guarda este archivo como `test.json`:
```json
{
  "keyword": "pizza delivery",
  "business": "Pizza Express",
  "centerLat": 40.4168,
  "centerLng": -3.7038,
  "gridSize": 5,
  "radiusKm": 2,
  "positions": [1,2,3,null,5,2,1,2,3,4,3,2,1,2,3,null,3,2,1,2,5,4,3,2,1]
}
```

Genera la imagen:
```bash
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d @test.json \
  --output mi-primer-geogrid.png
```

¡Abre `mi-primer-geogrid.png` y verás tu informe!

## Endpoints Principales

### 🖼️ Renderizar Imagen
```bash
POST /api/render
```
Retorna imagen PNG/JPEG/WebP

### 📊 Renderizar Base64
```bash
POST /api/render/base64
```
Retorna JSON con imagen en base64 + métricas

### 👁️ Preview HTML
```bash
GET /api/preview/demo
```
Ver HTML en navegador para debugging

### ❤️ Health Check
```bash
GET /health
```
Verificar estado del servidor

## Estructura de Request

```json
{
  "keyword": "tu búsqueda",          // Requerido
  "business": "Nombre del Negocio",  // Requerido
  "centerLat": 40.4168,              // Requerido (-90 a 90)
  "centerLng": -3.7038,              // Requerido (-180 a 180)
  "gridSize": 9,                     // Opcional (3-15, default: 9)
  "radiusKm": 4,                     // Opcional (0.5-20, default: 4)
  "positions": [1,2,3,...],          // Requerido (array de números o null)
  "width": 800,                      // Opcional (400-1920, default: 800)
  "height": 900,                     // Opcional (400-1920, default: 900)
  "format": "png"                    // Opcional (png/jpeg/webp, default: png)
}
```

**Importante**: El array `positions` debe tener exactamente `gridSize × gridSize` elementos.

## Array de Posiciones

El array `positions` representa las posiciones en el grid:
- **Número (1-20+)**: Posición del negocio en ese punto
- **null**: No encontrado en ese punto

Ejemplo para grid 3×3 (9 posiciones):
```json
[
  1,  2,  3,     // Fila 1: pos 1, pos 2, pos 3
  2,  1,  2,     // Fila 2: pos 2, pos 1, pos 2
  3,  2,  null   // Fila 3: pos 3, pos 2, no encontrado
]
```

## Métricas Calculadas

El servidor calcula automáticamente:

- **GeoRank**: `1 / posición_media` (0.00-1.00, mayor = mejor)
- **Posición Media**: Promedio de posiciones
- **Local Pack %**: % de puntos en top 3
- **Cobertura %**: % de puntos donde se encontró

## Colores de Posiciones

| Posición | Color | Significado |
|----------|-------|-------------|
| 1 | 🟢 Verde Oscuro | ¡Primera posición! |
| 2-3 | 🟢 Verde Claro | Local Pack |
| 4-7 | 🟡 Amarillo | Top 7 |
| 8-10 | 🟠 Naranja | Top 10 |
| 11-20 | 🔴 Rojo | Primera página |
| 21+ | 🔴 Rojo Oscuro | Segunda página o más |
| null | ⚫ Gris | No encontrado |

## Ejemplos Prácticos

### Grid Pequeño (5×5 = 25 puntos)
```json
{
  "keyword": "café",
  "business": "Café Central",
  "centerLat": 40.4168,
  "centerLng": -3.7038,
  "gridSize": 5,
  "radiusKm": 2,
  "positions": [1,2,3,4,5,2,1,2,3,4,3,2,1,2,3,4,3,2,1,2,5,4,3,2,1]
}
```

### Grid Mediano (9×9 = 81 puntos)
```json
{
  "gridSize": 9,
  "radiusKm": 4,
  "positions": [/* 81 valores */]
}
```

### Grid Grande (11×11 = 121 puntos)
```json
{
  "gridSize": 11,
  "radiusKm": 6,
  "positions": [/* 121 valores */]
}
```

## Modo Desarrollo

```bash
# Iniciar con auto-reload
npm run dev

# Ver logs más detallados
NODE_ENV=development npm run dev
```

## Docker

```bash
# Construir
docker build -t geogrid-server .

# Ejecutar
docker run -p 3000:3000 geogrid-server

# Con docker-compose
docker-compose up -d
```

## Troubleshooting

### ❌ "Browser creation failed"
- **Windows**: Puppeteer descarga Chrome automáticamente, espera a que termine
- **Linux/Docker**: Instala Chromium primero

### ❌ "Validation failed"
- Verifica que `positions` tenga exactamente `gridSize²` elementos
- Verifica que lat/lng estén en rangos válidos

### ❌ "Rate limit exceeded"
- Espera 60 segundos o ajusta `RATE_LIMIT_MAX_REQUESTS` en `.env`

## Próximos Pasos

1. Lee el [README.md](./README.md) completo
2. Revisa la [documentación de la API](./API.md)
3. Explora los ejemplos en `/examples`
4. Prueba con tus propios datos

## Soporte

- 📖 Documentación: [README.md](./README.md) y [API.md](./API.md)
- 🐛 Reportar bugs: GitHub Issues
- 💬 Preguntas: support@equiposeo.com

---

**¡Listo!** Ya tienes un servidor de GeoGrid SEO funcionando. 🎉
