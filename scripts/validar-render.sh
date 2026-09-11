#!/usr/bin/env bash
#
# Valida visualmente un informe real: pide el render y guarda el PNG para abrirlo.
#
# Existe porque los fallos de este servicio son VISUALES y todos devuelven HTTP 200:
# tiles con marca de agua, tiles en blanco, "Access blocked", leyenda cortada.
# Un 200 no prueba nada aqui; hay que mirar la imagen.
#
# Uso:
#   scripts/validar-render.sh                                    # demo 9x9 en Mahon, contra produccion
#   scripts/validar-render.sh "podologo" "Clinica X" 40.41 -3.70 # negocio real
#   scripts/validar-render.sh "podologo" "Clinica X" 40.41 -3.70 13 6   # rejilla 13x13, radio 6km
#   GEOGRID_URL=http://localhost:3001 scripts/validar-render.sh  # contra local
#
# La clave sale de API_KEY, o del .env del proyecto si no se pasa. Nunca se escribe aqui.

set -euo pipefail

KEYWORD="${1:-restaurante en mahon}"
BUSINESS="${2:-Casa Pedro}"
LAT="${3:-39.8885}"
LNG="${4:-4.2658}"
GRID="${5:-9}"
RADIUS="${6:-4}"

BASE_URL="${GEOGRID_URL:-https://equipo-seo-geogrid.qkhp74.easypanel.host}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

KEY="${API_KEY:-}"
if [ -z "$KEY" ] && [ -f "$ROOT/.env" ]; then
  KEY="$(grep '^API_KEYS=' "$ROOT/.env" | cut -d= -f2 | cut -d, -f1 | tr -d '\r\n')"
fi
if [ -z "$KEY" ]; then
  echo "ERROR: no hay clave. Exporta API_KEY=... o pon API_KEYS en .env" >&2
  exit 1
fi

# Posiciones sinteticas: mejor en el centro, peor segun se aleja, con huecos.
POSITIONS="$(node -e "
const g=$GRID, half=Math.floor(g/2), out=[];
for (let r=0;r<g;r++) for (let c=0;c<g;c++) {
  const d=Math.max(Math.abs(r-half),Math.abs(c-half));
  let p;
  if (d===0) p=1;
  else if (d===1) p=2+(r+c)%2;
  else if (d===2) p=3+(r*c)%4;
  else if (d===3) p=7+(r+c)%5;
  else p=((r*c)%5===0)?null:12+(r+c)%10;
  out.push(p);
}
console.log(JSON.stringify(out));
")"

OUT_DIR="$ROOT/.dev/alex"
mkdir -p "$OUT_DIR"
OUT="$OUT_DIR/validacion-${GRID}x${GRID}-$(date +%Y%m%d-%H%M%S).png"

echo "Render ${GRID}x${GRID} | radio ${RADIUS}km | $BUSINESS | $BASE_URL"

HTTP="$(curl -s --max-time 120 -o "$OUT" -w '%{http_code}' \
  -X POST "$BASE_URL/api/render" \
  -H 'Content-Type: application/json' \
  -H "X-API-Key: $KEY" \
  -d "{\"keyword\":\"$KEYWORD\",\"business\":\"$BUSINESS\",\"centerLat\":$LAT,\"centerLng\":$LNG,\"gridSize\":$GRID,\"radiusKm\":$RADIUS,\"positions\":$POSITIONS}")"

if [ "$HTTP" != "200" ]; then
  echo "FALLO: HTTP $HTTP"
  head -c 400 "$OUT"; echo
  exit 1
fi

# Verificacion con herramientas POSIX, no con node: en Git Bash (Windows) una ruta
# /c/Users/... llega a node como C:\c\Users\... y la lectura falla.
SIGNATURE="$(head -c 8 "$OUT" | od -An -tx1 | tr -d ' \n')"
if [ "$SIGNATURE" != "89504e470d0a1a0a" ]; then
  echo "FALLO: la respuesta no es un PNG"
  head -c 400 "$OUT"; echo
  exit 1
fi

# Ancho y alto viven en los bytes 16-23 de la cabecera IHDR, big-endian
DIMS="$(od -An -j16 -N8 -tu4 --endian=big "$OUT" 2>/dev/null | tr -s ' ' || true)"
echo "OK  HTTP 200 | $(wc -c < "$OUT" | tr -d ' ') bytes | dimensiones:${DIMS:- (no legibles)}"

echo "Abrelo y comprueba: mapa sin marca de agua, atribucion visible, leyenda completa."
echo "$OUT"
