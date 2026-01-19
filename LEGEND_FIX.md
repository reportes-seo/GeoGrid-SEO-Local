# 🎨 Corrección: Leyenda Cortada en Screenshots

## Problema Reportado

La leyenda de posiciones aparecía cortada en las imágenes generadas por el API.

## Causa Raíz

El screenshot se estaba capturando con una altura fija que no consideraba el contenido completo de la página, incluyendo:
- Header
- Métricas
- Mapa
- **Leyenda** ⬅️ Se cortaba aquí
- Footer

## Soluciones Implementadas

### 1. ✅ Detección Automática de Altura de Contenido

**Archivo:** `services/screenshot.service.js`

Ahora el servicio calcula la altura real del contenido antes de capturar:

```javascript
// Obtener altura real del contenido HTML
const contentHeight = await page.evaluate(() => {
  const container = document.querySelector('.container');
  return container ? container.scrollHeight : document.body.scrollHeight;
});

// Ajustar viewport si el contenido es más alto
if (contentHeight > height) {
  await page.setViewport({
    width,
    height: contentHeight,
    deviceScaleFactor: 1
  });
}

// Capturar con clip preciso
const screenshotOptions = {
  type: format,
  encoding: 'binary',
  fullPage: false,
  clip: {
    x: 0,
    y: 0,
    width: width,
    height: contentHeight > height ? contentHeight : height
  }
};
```

**Beneficios:**
- ✅ La leyenda siempre se incluye completa
- ✅ No importa el tamaño del grid (3x3, 9x9, 15x15)
- ✅ Ajuste dinámico según contenido real
- ✅ No captura espacio extra innecesario

### 2. ✅ Altura por Defecto Aumentada

**Archivos modificados:**
- `config/env.config.js`
- `models/renderOptions.model.js`
- `.env`
- `.env.example`

```javascript
// ANTES: 900px (insuficiente)
height: 900

// DESPUÉS: 1100px (suficiente para todo)
height: 1100
```

**Desglose de altura típica:**
```
Header:        ~100px
Métricas:      ~100px
Mapa:          ~500px (configurable)
Leyenda:       ~200px ⬅️ Necesita espacio
Footer:        ~60px
Padding:       ~40px
----------------------------
TOTAL:         ~1000px
```

Con 1100px hay margen suficiente para todo el contenido.

### 3. ✅ Opción showLegend

La leyenda está **activada por defecto** (`showLegend: true`), pero puedes desactivarla si lo necesitas:

```json
{
  "keyword": "pizza",
  "business": "Pizza Express",
  "centerLat": 40.4168,
  "centerLng": -3.7038,
  "gridSize": 5,
  "radiusKm": 2,
  "positions": [1,2,3,2,1,2,1,2,3,4,3,2,1,2,3,null,3,2,1,2,5,4,3,2,1],
  "showLegend": false  // ⬅️ Para ocultar leyenda
}
```

## Ejemplo de Uso

### Request Completo (con leyenda)

```bash
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "pizza delivery",
    "business": "Pizza Express",
    "centerLat": 40.4168,
    "centerLng": -3.7038,
    "gridSize": 5,
    "radiusKm": 2,
    "positions": [1,2,3,null,5,2,1,2,3,4,3,2,1,2,3,null,3,2,1,2,5,4,3,2,1]
  }' \
  --output informe-completo.png
```

La imagen resultante incluirá:
✅ Header con nombre del negocio
✅ Métricas (GeoRank, Posición Media, Local Pack %, Cobertura)
✅ Mapa con tiles de OpenStreetMap
✅ Marcadores de grid coloreados
✅ **Leyenda completa** (todos los colores visibles)
✅ Footer con branding y fecha

### Request con Altura Personalizada

Si necesitas más espacio:

```json
{
  "keyword": "pizza delivery",
  "business": "Pizza Express",
  "centerLat": 40.4168,
  "centerLng": -3.7038,
  "gridSize": 11,
  "radiusKm": 6,
  "positions": [...],
  "height": 1400  // ⬅️ Más alto para grids grandes
}
```

### Request Sin Leyenda

Para reportes más compactos:

```json
{
  "keyword": "pizza delivery",
  "business": "Pizza Express",
  "centerLat": 40.4168,
  "centerLng": -3.7038,
  "gridSize": 5,
  "radiusKm": 2,
  "positions": [...],
  "showLegend": false,  // ⬅️ Ocultar leyenda
  "height": 800         // ⬅️ Puede ser más bajo
}
```

## Contenido de la Leyenda

La leyenda muestra todos los rangos de posiciones con sus colores:

| Posición | Color | Etiqueta |
|----------|-------|----------|
| 1 | 🟢 Verde Oscuro | Posición #1 |
| 2-3 | 🟢 Verde Claro | Local Pack (2-3) |
| 4-7 | 🟡 Amarillo | Top 7 (4-7) |
| 8-10 | 🟠 Naranja | Top 10 (8-10) |
| 11-20 | 🔴 Rojo | Página 1 (11-20) |
| 21+ | 🔴 Rojo Oscuro | Página 2+ (21+) |
| null | ⚫ Gris | No encontrado |

## Testing

Para verificar que la leyenda se incluye correctamente:

```bash
# 1. Generar imagen
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d @examples/request-example.json \
  --output test-con-leyenda.png

# 2. Verificar dimensiones de la imagen (debe ser ~1100px de alto)
file test-con-leyenda.png

# 3. Abrir imagen y verificar que se ve la leyenda completa al final
```

## Troubleshooting

### La leyenda sigue cortada

**Causa posible:** Grid muy grande (15x15) con altura insuficiente

**Solución:**
```json
{
  "gridSize": 15,
  "height": 1500  // ⬅️ Aumentar para grids grandes
}
```

### La imagen es muy grande

**Causa posible:** Altura automática ajustada para contenido muy largo

**Solución:**
```json
{
  "showLegend": false,  // ⬅️ Ocultar leyenda
  "height": 800         // ⬅️ Reducir altura
}
```

### Quiero ver la leyenda pero más compacta

**Solución:** Puedes modificar los estilos en `views/templates/styles.template.js`:

```javascript
.legend-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));  // Más compacto
  gap: 6px;  // Menos espacio
}
```

## Resumen

| Aspecto | Antes | Después |
|---------|-------|---------|
| Altura por defecto | 900px | 1100px |
| Detección automática | ❌ No | ✅ Sí |
| Leyenda visible | ⚠️ A veces cortada | ✅ Siempre completa |
| Ajuste dinámico | ❌ No | ✅ Sí |
| showLegend | ✅ true | ✅ true |

---

**Estado:** ✅ Corrección aplicada
**Versión:** 1.0.2
**Fecha:** 2026-01-19
