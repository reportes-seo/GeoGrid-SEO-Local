## 🔐 Autenticación con API Key - GeoGrid Server

## Descripción

GeoGrid Server incluye autenticación mediante API Key para proteger los endpoints de renderizado y asegurar que solo tu empresa pueda usar el servicio.

## 🎯 Endpoints Protegidos

Los siguientes endpoints **requieren autenticación**:

- ✅ `POST /api/render` - Renderizar imagen
- ✅ `POST /api/render/base64` - Renderizar base64

Los siguientes endpoints **NO requieren autenticación** (públicos):

- ⭕ `GET /health` - Health check
- ⭕ `GET /health/ready` - Readiness probe
- ⭕ `GET /health/live` - Liveness probe
- ⭕ `GET /api/preview/*` - Preview HTML (solo para desarrollo/debug)
- ⭕ `GET /` - Info del servicio

## 🔑 Generar API Keys

### Método 1: Script Automático (Recomendado)

```bash
# Generar 1 API key
node utils/generateApiKey.js

# Generar múltiples keys
node utils/generateApiKey.js 3

# Generar con prefijo personalizado
node utils/generateApiKey.js 1 miempresa
```

**Salida:**
```
🔐 GeoGrid API Key Generator

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated API Key:

  equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add to your .env file:

  API_KEY_ENABLED=true
  API_KEYS=equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0
```

### Método 2: Generación Manual

```bash
# Linux/Mac
node -e "console.log('equiposeo_' + require('crypto').randomBytes(32).toString('hex'))"

# Windows (PowerShell)
node -e "console.log('equiposeo_' + require('crypto').randomBytes(32).toString('hex'))"
```

## ⚙️ Configuración

### 1. Archivo .env

```env
# Security (API Key Authentication)
API_KEY_ENABLED=true
API_KEYS=equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0
```

**Múltiples keys** (separadas por coma):
```env
API_KEYS=equiposeo_key1...,equiposeo_key2...,equiposeo_key3...
```

### 2. Variables de Entorno

| Variable | Descripción | Valores | Default |
|----------|-------------|---------|---------|
| `API_KEY_ENABLED` | Activar/desactivar autenticación | `true` / `false` | `false` |
| `API_KEYS` | Lista de API keys válidas (separadas por coma) | string | `[]` |

### 3. Desactivar Autenticación (Desarrollo)

Para desarrollo local, puedes desactivar la autenticación:

```env
API_KEY_ENABLED=false
```

Con esto, los endpoints funcionarán sin requerir API key.

## 📡 Uso de API Keys

### Opción 1: Header X-API-Key (Recomendado)

```bash
curl -X POST http://localhost:3000/api/render \
  -H "X-API-Key: equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0" \
  -H "Content-Type: application/json" \
  -d @request.json \
  --output informe.png
```

### Opción 2: Authorization Bearer Token

```bash
curl -X POST http://localhost:3000/api/render \
  -H "Authorization: Bearer equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0" \
  -H "Content-Type: application/json" \
  -d @request.json \
  --output informe.png
```

### Opción 3: Query Parameter

```bash
curl -X POST "http://localhost:3000/api/render?api_key=equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0" \
  -H "Content-Type: application/json" \
  -d @request.json \
  --output informe.png
```

⚠️ **Nota:** El query parameter es menos seguro porque la key puede quedar en logs. Usa headers cuando sea posible.

## 💻 Ejemplos de Código

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const API_KEY = 'equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0';

// Opción 1: X-API-Key header
const response = await axios.post('http://localhost:3000/api/render', {
  keyword: 'pizza',
  business: 'Pizza Express',
  centerLat: 40.4168,
  centerLng: -3.7038,
  gridSize: 5,
  radiusKm: 2,
  positions: [1,2,3,null,5,2,1,2,3,4,3,2,1,2,3,null,3,2,1,2,5,4,3,2,1]
}, {
  headers: {
    'X-API-Key': API_KEY
  },
  responseType: 'arraybuffer'
});

fs.writeFileSync('informe.png', response.data);
```

### Python

```python
import requests

API_KEY = 'equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0'

# Opción 1: X-API-Key header
headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

data = {
    'keyword': 'pizza',
    'business': 'Pizza Express',
    'centerLat': 40.4168,
    'centerLng': -3.7038,
    'gridSize': 5,
    'radiusKm': 2,
    'positions': [1,2,3,None,5,2,1,2,3,4,3,2,1,2,3,None,3,2,1,2,5,4,3,2,1]
}

response = requests.post('http://localhost:3000/api/render',
                        headers=headers,
                        json=data)

with open('informe.png', 'wb') as f:
    f.write(response.content)
```

### PHP

```php
<?php

$apiKey = 'equiposeo_b24046bf2f449b4fc492ce29aad1d8d35a6488e3f1f217de16bc21a97e880bd0';

$data = [
    'keyword' => 'pizza',
    'business' => 'Pizza Express',
    'centerLat' => 40.4168,
    'centerLng' => -3.7038,
    'gridSize' => 5,
    'radiusKm' => 2,
    'positions' => [1,2,3,null,5,2,1,2,3,4,3,2,1,2,3,null,3,2,1,2,5,4,3,2,1]
];

$ch = curl_init('http://localhost:3000/api/render');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-Key: ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);

file_put_contents('informe.png', $response);
?>
```

## 🚨 Errores de Autenticación

### Sin API Key

**Request:**
```bash
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d @request.json
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "API key is required. Provide it via X-API-Key header, Authorization Bearer token, or api_key query parameter"
  }
}
```

### API Key Inválida

**Request:**
```bash
curl -X POST http://localhost:3000/api/render \
  -H "X-API-Key: invalid-key" \
  -H "Content-Type: application/json" \
  -d @request.json
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Invalid API key"
  }
}
```

## 🔒 Seguridad

### Requisitos de API Keys

- ✅ Mínimo **32 caracteres** de longitud
- ✅ Generadas con `crypto.randomBytes()` (criptográficamente seguras)
- ✅ Prefijo recomendado: `equiposeo_` para identificación

### Mejores Prácticas

1. **Nunca comitas API keys en Git**
   ```bash
   # Ya incluido en .gitignore
   .env
   ```

2. **Rota las keys periódicamente**
   ```bash
   # Generar nueva key
   node utils/generateApiKey.js

   # Actualizar .env
   API_KEYS=nueva-key,key-antigua  # Mantener ambas temporalmente

   # Después de migrar clientes, remover key antigua
   API_KEYS=nueva-key
   ```

3. **Usa HTTPS en producción**
   - Las keys viajan en headers, necesitan encriptación
   - Considera usar un reverse proxy (nginx, Caddy) con SSL

4. **Una key por cliente/aplicación**
   ```env
   API_KEYS=app1_key...,app2_key...,app3_key...
   ```
   - Facilita la revocación individual
   - Mejor auditoría

5. **Monitorea intentos fallidos**
   - Los logs registran intentos con API keys inválidas
   - Revisa logs regularmente: `grep "Invalid API key" logs/`

## 🐳 Docker

### docker-compose.yml

```yaml
services:
  geogrid-server:
    environment:
      - API_KEY_ENABLED=true
      - API_KEYS=${API_KEYS}  # Desde .env del host
```

### Kubernetes Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: geogrid-api-keys
type: Opaque
stringData:
  api-keys: equiposeo_your-key-here
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: geogrid-server
spec:
  template:
    spec:
      containers:
      - name: geogrid
        env:
        - name: API_KEY_ENABLED
          value: "true"
        - name: API_KEYS
          valueFrom:
            secretKeyRef:
              name: geogrid-api-keys
              key: api-keys
```

## 🧪 Testing

### Con autenticación activada

```bash
# Generar key de prueba
export TEST_API_KEY=$(node utils/generateApiKey.js 1 test | grep test_ | tr -d ' ')

# Probar con key válida
curl -H "X-API-Key: $TEST_API_KEY" \
  -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  --output test.png
```

### Sin autenticación (desarrollo)

```env
API_KEY_ENABLED=false
```

```bash
# Funciona sin API key
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  --output test.png
```

## 📊 Logging

Los intentos de autenticación se registran:

**Exitoso:**
```
[DEBUG] API key validated successfully { ip: '::1', path: '/api/render' }
```

**Fallido - Sin key:**
```
[WARN] Missing API key { ip: '::1', path: '/api/render', method: 'POST' }
```

**Fallido - Key inválida:**
```
[WARN] Invalid API key attempt { ip: '::1', path: '/api/render', method: 'POST', keyPrefix: 'invalid_...' }
```

## ❓ FAQ

### ¿Cuántas API keys puedo tener?

Ilimitadas. Sepáralas por coma en `API_KEYS`.

### ¿Puedo desactivar la autenticación temporalmente?

Sí:
```env
API_KEY_ENABLED=false
```

### ¿Las keys expiran?

No automáticamente. Debes rotarlas manualmente.

### ¿Qué pasa si la key se filtra?

1. Generar nueva key
2. Actualizar `.env` con la nueva
3. Remover la key comprometida
4. Reiniciar el servidor

### ¿Los endpoints de health/preview necesitan key?

No. Solo los endpoints de renderizado (`/api/render*`) requieren autenticación.

---

**Estado:** ✅ Implementado
**Versión:** 1.1.0
**Fecha:** 2026-01-19
