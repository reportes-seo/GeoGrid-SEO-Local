# 🚀 Guía de Despliegue en EasyPanel

Esta guía te ayudará a desplegar **GeoGrid SEO Local Server** en EasyPanel.

## ✅ Compatibilidad

Este proyecto es **100% compatible** con EasyPanel. La estructura incluye:

- ✅ `Dockerfile` optimizado con Node.js 18
- ✅ `docker-compose.yml` para configuración local
- ✅ `.dockerignore` para builds eficientes
- ✅ Health checks para monitoreo
- ✅ Graceful shutdown para contenedores
- ✅ Variables de entorno configurables
- ✅ Puerto 3000 expuesto (configurable)

## 📋 Pre-requisitos

1. Cuenta en EasyPanel
2. Repositorio Git con el código (GitHub, GitLab, etc.)
3. API Key generada (si quieres habilitar autenticación)

---

## 🔧 Paso 1: Preparar el Proyecto

### 1.1 Generar API Key (Opcional pero Recomendado)

```bash
# Generar una API key segura
node utils/generateApiKey.js 1 equiposeo

# Ejemplo de output:
# equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0
```

Guarda esta key, la necesitarás en el paso 3.

### 1.2 Subir Código a Git

```bash
# Inicializar repositorio (si no lo has hecho)
git init
git add .
git commit -m "Initial commit: GeoGrid SEO Local Server v1.1.0"

# Conectar con tu repositorio remoto
git remote add origin https://github.com/tu-usuario/geogrid-server.git
git push -u origin main
```

---

## 🌐 Paso 2: Crear Proyecto en EasyPanel

### 2.1 Crear Nuevo Proyecto

1. Accede a tu panel de EasyPanel
2. Click en **"Create Project"** o **"New Project"**
3. Nombre del proyecto: `geogrid-server` (o el que prefieras)

### 2.2 Conectar Repositorio Git

1. En EasyPanel, selecciona **"Add Service"** → **"From Git Repository"**
2. Conecta tu cuenta de GitHub/GitLab
3. Selecciona el repositorio `geogrid-server`
4. Branch: `main` (o tu branch principal)

### 2.3 Configurar Build

EasyPanel debería detectar automáticamente el `Dockerfile`. Si no:

- **Build Method**: Dockerfile
- **Dockerfile Path**: `./Dockerfile`
- **Build Context**: `.` (root)
- **Port**: `3000`

---

## ⚙️ Paso 3: Variables de Entorno

En EasyPanel, ve a la sección **"Environment Variables"** y agrega las siguientes:

### Variables Obligatorias

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

### Puppeteer (Requeridas para el rendering)

```env
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000
```

### Límites de Requests (Recomendadas)

```env
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuración por Defecto

```env
DEFAULT_GRID_SIZE=9
DEFAULT_RADIUS_KM=4.0
DEFAULT_MARKER_SIZE=28
DEFAULT_BRAND_TEXT=EquipoSEO
DEFAULT_WIDTH=800
DEFAULT_HEIGHT=1100
DEFAULT_FORMAT=png
DEFAULT_QUALITY=90
```

### 🔐 Seguridad (Muy Recomendado)

```env
API_KEY_ENABLED=true
API_KEYS=equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0
```

**Importante**: Reemplaza la API key con la que generaste en el Paso 1.1

**Para múltiples keys** (separadas por comas):
```env
API_KEYS=key1_aqui,key2_aqui,key3_aqui
```

---

## 🔨 Paso 4: Recursos y Configuración

### 4.1 Recursos Recomendados

Dado que usa Puppeteer (Chromium headless), necesita recursos suficientes:

**Mínimo**:
- CPU: 1 vCPU
- RAM: 1 GB
- Storage: 2 GB

**Recomendado** (para producción):
- CPU: 2 vCPUs
- RAM: 2 GB
- Storage: 5 GB

### 4.2 Health Check (Opcional pero Recomendado)

Si EasyPanel permite configurar health checks:

- **Path**: `/health/live`
- **Port**: `3000`
- **Interval**: `30s`
- **Timeout**: `10s`
- **Start Period**: `40s`
- **Retries**: `3`

---

## 🚀 Paso 5: Desplegar

1. Click en **"Deploy"** o **"Create Service"**
2. EasyPanel comenzará a:
   - Clonar el repositorio
   - Construir la imagen Docker
   - Iniciar el contenedor
   - Asignar una URL pública

### Tiempo estimado de despliegue:
- **Build inicial**: 5-10 minutos (descarga de Node.js, Chromium, dependencias)
- **Builds subsecuentes**: 2-5 minutos (usando caché)

---

## 🌍 Paso 6: Configurar Dominio (Opcional)

### Opción 1: Usar dominio de EasyPanel

EasyPanel te asignará automáticamente un dominio como:
```
https://geogrid-server-xxxxx.easypanel.host
```

### Opción 2: Usar dominio personalizado

1. En EasyPanel, ve a **"Domains"**
2. Click en **"Add Domain"**
3. Ingresa tu dominio: `api.tudominio.com`
4. Configura el registro DNS (CNAME o A record) según indique EasyPanel
5. Espera a que propague (5-30 minutos)
6. EasyPanel configurará SSL automáticamente con Let's Encrypt

**Ejemplo de configuración DNS**:
```
Type: CNAME
Name: api
Value: tu-proyecto.easypanel.host
TTL: 3600
```

---

## ✅ Paso 7: Verificar Despliegue

### 7.1 Health Check

```bash
# Usando la URL de EasyPanel
curl https://geogrid-server-xxxxx.easypanel.host/health

# Debería retornar:
{
  "status": "ok",
  "timestamp": "2026-01-19T...",
  "uptime": 123.45,
  "service": "geogrid-server",
  "version": "1.1.0"
}
```

### 7.2 Prueba de Renderizado (sin autenticación)

Si `API_KEY_ENABLED=false`:

```bash
curl -X POST https://geogrid-server-xxxxx.easypanel.host/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "test",
    "business": "Test Business",
    "centerLat": 40.4168,
    "centerLng": -3.7038,
    "gridSize": 3,
    "radiusKm": 2,
    "positions": [1,2,3,2,1,2,3,2,1]
  }' \
  --output test.png
```

### 7.3 Prueba con Autenticación

Si `API_KEY_ENABLED=true`:

```bash
curl -X POST https://geogrid-server-xxxxx.easypanel.host/api/render \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu-api-key-aqui" \
  -d '{
    "keyword": "test",
    "business": "Test Business",
    "centerLat": 40.4168,
    "centerLng": -3.7038,
    "gridSize": 3,
    "radiusKm": 2,
    "positions": [1,2,3,2,1,2,3,2,1]
  }' \
  --output test.png
```

Si recibes la imagen `test.png`, ¡todo funciona correctamente! ✅

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

En EasyPanel:
1. Ve a tu servicio
2. Click en **"Logs"**
3. Los logs mostrarán:
   - Requests entrantes
   - Tiempos de renderizado
   - Errores (si los hay)
   - Métricas calculadas

**Ejemplo de logs esperados**:
```
[2026-01-19T15:30:45.123Z] INFO: Server started on 0.0.0.0:3000
[2026-01-19T15:30:50.456Z] INFO: Browser initialized successfully
[2026-01-19T15:31:20.789Z] INFO: Screenshot captured successfully {"renderTime":2847,"size":245832,"format":"png"}
```

### Métricas Importantes

Monitorea estas métricas en EasyPanel:

- **CPU Usage**: Debería estar entre 10-50% en idle, picos hasta 80% durante renders
- **Memory**: 500MB-1.5GB típicamente
- **Response Time**: < 5 segundos para renders
- **Error Rate**: < 1%

---

## 🔄 Actualizaciones

### Despliegue Automático (Recomendado)

1. En EasyPanel, habilita **"Auto Deploy"**
2. Cada vez que hagas `git push` a tu branch principal:
   - EasyPanel detectará los cambios
   - Rebuildeará la imagen
   - Desplegará automáticamente
   - Zero downtime con rolling updates

### Despliegue Manual

```bash
# 1. Hacer cambios en el código
# 2. Commit y push
git add .
git commit -m "Update: descripción del cambio"
git push origin main

# 3. En EasyPanel, click en "Rebuild" o "Redeploy"
```

---

## 🐛 Troubleshooting

### Error: "Build failed"

**Causa**: Problemas en el Dockerfile o dependencias

**Solución**:
1. Verifica los logs de build en EasyPanel
2. Asegúrate de que el Dockerfile esté en la raíz del repo
3. Verifica que `package.json` tenga todas las dependencias

### Error: "Container keeps restarting"

**Causa**: Chromium no puede iniciar o faltan variables de entorno

**Solución**:
1. Verifica que `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`
2. Aumenta la RAM a 2GB mínimo
3. Revisa logs para errores específicos

### Error: "502 Bad Gateway"

**Causa**: La app no está escuchando en el puerto correcto

**Solución**:
1. Verifica que `PORT=3000` y `HOST=0.0.0.0`
2. Asegúrate de que EasyPanel esté configurado para el puerto 3000

### Error: "Out of Memory"

**Causa**: Puppeteer/Chromium consume mucha RAM

**Solución**:
1. Aumenta la RAM a 2GB
2. Reduce `RATE_LIMIT_MAX_REQUESTS` si tienes muchos requests concurrentes
3. Considera implementar un sistema de cola

### Renders muy lentos (>10 segundos)

**Causa**: CPU insuficiente o timeout bajo

**Solución**:
1. Aumenta CPU a 2 vCPUs
2. Aumenta `PUPPETEER_TIMEOUT=60000` (60 segundos)

---

## 🔒 Seguridad en Producción

### Checklist de Seguridad

- ✅ `API_KEY_ENABLED=true` en producción
- ✅ API keys con mínimo 32 caracteres
- ✅ `NODE_ENV=production`
- ✅ HTTPS habilitado (automático con dominio en EasyPanel)
- ✅ Rate limiting configurado
- ✅ No exponer endpoints `/api/preview` públicamente (son solo para debug)

### Rotar API Keys

```bash
# 1. Generar nueva key
node utils/generateApiKey.js 1 equiposeo

# 2. En EasyPanel, actualizar variable de entorno:
# Temporalmente: usar ambas keys (antigua,nueva) para transición suave
API_KEYS=antigua_key_aqui,nueva_key_aqui

# 3. Actualizar clientes para usar nueva key
# 4. Después de 24-48h, remover la antigua:
API_KEYS=nueva_key_aqui
```

---

## 📈 Escalabilidad

### Opción 1: Escalar Verticalmente (Más Recursos)

En EasyPanel, aumenta:
- CPU: hasta 4-8 vCPUs
- RAM: hasta 4-8 GB

Esto permite más renders concurrentes.

### Opción 2: Escalar Horizontalmente (Múltiples Instancias)

EasyPanel permite múltiples réplicas:
1. Ve a **"Scaling"**
2. Aumenta el número de réplicas (ej: 2-3 instancias)
3. EasyPanel hará load balancing automático

**Nota**: Cada instancia necesita ~1-2GB RAM, planifica recursos.

---

## 💰 Costos Estimados

Basado en recursos típicos de VPS:

| Configuración | CPU | RAM | Precio Mensual* |
|---------------|-----|-----|-----------------|
| Desarrollo    | 1 vCPU | 1 GB | ~$5-10 |
| Producción Básica | 2 vCPUs | 2 GB | ~$12-20 |
| Producción Media | 2 vCPUs | 4 GB | ~$20-30 |
| Producción Alta | 4 vCPUs | 8 GB | ~$40-60 |

*Precios aproximados, dependen del proveedor de EasyPanel

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs** en EasyPanel
2. **Verifica variables de entorno** están correctas
3. **Consulta este documento** y `AUTHENTICATION.md`
4. **Revisa health checks**: `GET /health/live`

---

## ✅ Checklist Final

Antes de considerar el despliegue completo, verifica:

- [ ] Código subido a Git
- [ ] API Key generada (si usas autenticación)
- [ ] Proyecto creado en EasyPanel
- [ ] Repositorio conectado
- [ ] Variables de entorno configuradas
- [ ] Recursos asignados (mínimo 1 vCPU, 1GB RAM)
- [ ] Health check configurado
- [ ] Dominio configurado (opcional)
- [ ] `/health` retorna 200 OK
- [ ] `/api/render` genera imágenes correctamente
- [ ] Logs muestran actividad correcta
- [ ] Autenticación funciona (si está habilitada)

---

## 🎉 ¡Listo!

Tu servidor GeoGrid está ahora desplegado en EasyPanel y listo para generar informes de posicionamiento SEO local.

**URL de ejemplo**:
```
https://api.tudominio.com/api/render
```

**Próximos pasos**:
1. Integra el API en tu aplicación principal
2. Monitorea métricas y logs
3. Ajusta recursos según demanda
4. Implementa CI/CD para deploys automáticos

---

**Versión del Documento**: 1.0
**Última Actualización**: 2026-01-19
**Compatibilidad**: EasyPanel v2.x+
