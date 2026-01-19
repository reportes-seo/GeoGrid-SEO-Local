# ⚡ EasyPanel - Inicio Rápido

Guía express para desplegar en EasyPanel en **5 minutos**.

## 🚀 Despliegue Rápido

### 1. Generar API Key

```bash
node utils/generateApiKey.js 1 equiposeo
```

Copia la key generada.

### 2. Variables de Entorno en EasyPanel

Pega estas variables en EasyPanel (sección "Environment Variables"):

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_GRID_SIZE=9
DEFAULT_RADIUS_KM=4.0
DEFAULT_MARKER_SIZE=28
DEFAULT_BRAND_TEXT=EquipoSEO
DEFAULT_WIDTH=800
DEFAULT_HEIGHT=1100
DEFAULT_FORMAT=png
DEFAULT_QUALITY=90
API_KEY_ENABLED=true
API_KEYS=TU_API_KEY_AQUI
```

**⚠️ IMPORTANTE**: Reemplaza `TU_API_KEY_AQUI` con la key del Paso 1.

### 3. Configuración del Servicio

- **Repository**: Tu repo de GitHub/GitLab
- **Branch**: `main`
- **Build Method**: Dockerfile
- **Port**: `3000`
- **CPU**: 2 vCPUs (mínimo 1)
- **RAM**: 2 GB (mínimo 1 GB)

### 4. Deploy

Click en **"Deploy"** y espera 5-10 minutos.

### 5. Probar

```bash
# Reemplaza con tu URL de EasyPanel
curl -X POST https://tu-app.easypanel.host/api/render \
  -H "Content-Type: application/json" \
  -H "X-API-Key: TU_API_KEY_AQUI" \
  -d '{
    "keyword": "test",
    "business": "Test",
    "centerLat": 40.4168,
    "centerLng": -3.7038,
    "gridSize": 3,
    "radiusKm": 2,
    "positions": [1,2,3,2,1,2,3,2,1]
  }' \
  --output test.png
```

Si recibes `test.png`, ¡funciona! ✅

---

## 📖 Documentación Completa

- [EASYPANEL_DEPLOYMENT.md](./EASYPANEL_DEPLOYMENT.md) - Guía completa paso a paso
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Autenticación y seguridad
- [README.md](./README.md) - Documentación general del proyecto

---

## ⚠️ Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Build falla | Verifica que Dockerfile esté en la raíz |
| Container reinicia | Aumenta RAM a 2GB |
| 502 Error | Verifica PORT=3000 y HOST=0.0.0.0 |
| Timeout | Aumenta PUPPETEER_TIMEOUT=60000 |
| Sin memoria | Aumenta RAM a 2-4GB |

---

**¿Necesitas ayuda?** Lee [EASYPANEL_DEPLOYMENT.md](./EASYPANEL_DEPLOYMENT.md) para la guía completa.
