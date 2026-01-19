# 🛠️ Comandos Útiles - GeoGrid Server

## 📦 NPM Scripts

```bash
# Iniciar servidor (producción)
npm start

# Desarrollo con auto-reload
npm run dev

# Verificar código con ESLint
npm run lint

# Corregir problemas de código automáticamente
npm run lint:fix

# Formatear código con Prettier
npm run format
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t geogrid-server .

# Ejecutar contenedor
docker run -p 3000:3000 geogrid-server

# Ejecutar en background
docker run -d -p 3000:3000 --name geogrid geogrid-server

# Ver logs
docker logs -f geogrid

# Detener contenedor
docker stop geogrid

# Eliminar contenedor
docker rm geogrid

# Docker Compose - iniciar
docker-compose up -d

# Docker Compose - detener
docker-compose down

# Docker Compose - ver logs
docker-compose logs -f

# Docker Compose - reiniciar
docker-compose restart
```

## 🧪 Testing API

### Health Checks

```bash
# Health general
curl http://localhost:3000/health

# Readiness probe
curl http://localhost:3000/health/ready

# Liveness probe
curl http://localhost:3000/health/live

# Info del servicio
curl http://localhost:3000/
```

### Preview en Navegador

```bash
# Preset demo
open http://localhost:3000/api/preview/demo

# Preset pequeño
open http://localhost:3000/api/preview/small

# Preset grande
open http://localhost:3000/api/preview/large

# Listar presets
curl http://localhost:3000/api/preview/presets | jq .
```

### Generar Imágenes

```bash
# Renderizar PNG (guardar como archivo)
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  --output informe.png

# Ver headers de respuesta
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  --output informe.png \
  -i

# Renderizar JPEG con calidad 85
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "pizza",
    "business": "Pizza Express",
    "centerLat": 40.4168,
    "centerLng": -3.7038,
    "gridSize": 5,
    "radiusKm": 2,
    "positions": [1,2,3,null,5,2,1,2,3,4,3,2,1,2,3,null,3,2,1,2,5,4,3,2,1],
    "format": "jpeg",
    "quality": 85
  }' \
  --output informe.jpg

# Renderizar WebP
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  --output informe.webp
```

### Obtener Base64 + Métricas

```bash
# Base64 con métricas (salida formateada)
curl -X POST http://localhost:3000/api/render/base64 \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  | jq .

# Solo métricas
curl -X POST http://localhost:3000/api/render/base64 \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  | jq '.metrics'

# Solo metadata
curl -X POST http://localhost:3000/api/render/base64 \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  | jq '.metadata'
```

## 🔍 Debugging

```bash
# Ver logs en tiempo real (desarrollo)
npm run dev

# Ver logs del servidor (si está en background)
tail -f logs/server.log

# Verificar puerto en uso
netstat -ano | findstr :3000    # Windows
lsof -i :3000                   # Linux/Mac

# Verificar procesos Node.js
tasklist | findstr node         # Windows
ps aux | grep node              # Linux/Mac

# Matar proceso en puerto 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 📊 Monitoring

```bash
# Health check continuo (cada 5 segundos)
watch -n 5 'curl -s http://localhost:3000/health | jq .'

# Monitor de métricas
while true; do
  curl -s http://localhost:3000/health | jq '.memory, .browser'
  sleep 5
done
```

## 🧹 Limpieza

```bash
# Limpiar node_modules
rm -rf node_modules
npm install

# Limpiar caché de npm
npm cache clean --force

# Limpiar imágenes Docker antiguas
docker system prune -a

# Limpiar volúmenes Docker
docker volume prune
```

## 🔧 Desarrollo

```bash
# Instalar dependencias
npm install

# Instalar dependencia nueva
npm install <package-name>

# Instalar dev dependency
npm install -D <package-name>

# Actualizar dependencias
npm update

# Auditoría de seguridad
npm audit

# Corregir vulnerabilidades
npm audit fix

# Ver dependencias desactualizadas
npm outdated
```

## 📝 Git

```bash
# Inicializar repositorio
git init

# Agregar archivos
git add .

# Commit
git commit -m "feat: initial commit"

# Ver estado
git status

# Ver diferencias
git diff

# Crear rama
git checkout -b feature/new-feature

# Push a GitHub
git remote add origin https://github.com/user/geogrid-server.git
git push -u origin main
```

## 🚀 Despliegue

### Kubernetes

```bash
# Crear deployment
kubectl create deployment geogrid --image=geogrid-server:latest

# Exponer servicio
kubectl expose deployment geogrid --port=3000 --type=LoadBalancer

# Ver pods
kubectl get pods

# Ver logs
kubectl logs -f <pod-name>

# Escalar
kubectl scale deployment geogrid --replicas=3

# Actualizar imagen
kubectl set image deployment/geogrid geogrid=geogrid-server:v2
```

### Docker Swarm

```bash
# Inicializar swarm
docker swarm init

# Desplegar stack
docker stack deploy -c docker-compose.yml geogrid

# Ver servicios
docker service ls

# Escalar
docker service scale geogrid_geogrid-server=3

# Ver logs
docker service logs -f geogrid_geogrid-server

# Eliminar stack
docker stack rm geogrid
```

## 📈 Performance Testing

```bash
# Test de carga con Apache Bench
ab -n 100 -c 10 http://localhost:3000/health

# Test con wrk
wrk -t4 -c100 -d30s http://localhost:3000/health

# Benchmark de renderizado
time curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  --output /dev/null
```

## 🔐 Seguridad

```bash
# Escanear vulnerabilidades con Snyk
npx snyk test

# Analizar imagen Docker
docker scan geogrid-server

# Verificar permisos de archivos
ls -la

# Cambiar permisos (Linux/Mac)
chmod 600 .env
chmod 755 server.js
```

## 💡 Tips Útiles

```bash
# Ver todas las variables de entorno
node -e "console.log(process.env)" | grep GEOGRID

# Verificar versión de Node
node --version

# Verificar versión de npm
npm --version

# Verificar Puppeteer
node -e "const puppeteer = require('puppeteer'); console.log(puppeteer.executablePath())"

# Generar datos de prueba (81 posiciones aleatorias)
node -e "console.log(JSON.stringify(Array(81).fill(0).map(() => Math.random() < 0.9 ? Math.floor(Math.random() * 20) + 1 : null)))"

# Calcular tamaño del proyecto (sin node_modules)
du -sh --exclude=node_modules .

# Contar líneas de código
find . -name "*.js" ! -path "./node_modules/*" | xargs wc -l
```

## 🆘 Solución de Problemas

```bash
# Problema: Puerto en uso
# Solución: Cambiar puerto en .env
echo "PORT=3001" >> .env

# Problema: Browser falla
# Solución: Limpiar y reinstalar Puppeteer
rm -rf node_modules/puppeteer
npm install puppeteer

# Problema: Memoria insuficiente
# Solución: Aumentar límite de Node.js
node --max-old-space-size=4096 server.js

# Problema: ENOENT error
# Solución: Verificar permisos y path
ls -la
pwd
```

---

**💡 Pro Tip:** Guarda tus comandos más usados en un archivo `my-commands.sh` para acceso rápido!
