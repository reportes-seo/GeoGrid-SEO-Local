/**
 * Scripts template
 * JavaScript for the interactive map
 */

function getScripts(gridData, renderOptions) {
  const { points, center, bounds } = gridData;
  const { markerSize } = renderOptions;

  return `
    // Wait for Leaflet to load
    window.addEventListener('DOMContentLoaded', function() {
      try {
        // Initialize map
        const map = L.map('map', {
          zoomControl: true,
          attributionControl: true,
          preferCanvas: true
        });

        // Set view to center
        map.setView([${center.lat}, ${center.lng}], 12);

        // Track tile loading
        let tilesLoaded = false;
        let tilesLoading = 0;

        // Add OpenStreetMap tiles
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 1
        });

        tileLayer.on('loading', function() {
          tilesLoading++;
        });

        tileLayer.on('load', function() {
          tilesLoading--;
          if (tilesLoading === 0) {
            tilesLoaded = true;
          }
        });

        tileLayer.on('tileerror', function(error) {
          console.warn('Tile load error:', error);
        });

        tileLayer.addTo(map);

        // Add grid markers
        const gridPoints = ${JSON.stringify(points)};

        gridPoints.forEach(function(point) {
          const iconHtml = '<div class="custom-marker" style="' +
            'width: ${markerSize}px; ' +
            'height: ${markerSize}px; ' +
            'background-color: ' + point.color + '; ' +
            'color: ' + point.textColor + '; ' +
            'line-height: ${markerSize}px;' +
            '">' +
            point.displayText +
            '</div>';

          const customIcon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [${markerSize}, ${markerSize}],
            iconAnchor: [${markerSize / 2}, ${markerSize / 2}]
          });

          const marker = L.marker([point.lat, point.lng], {
            icon: customIcon
          }).addTo(map);

          // Add popup with details
          const positionText = point.position !== null ?
            'Posición: #' + point.position :
            'No encontrado';

          marker.bindPopup(
            '<strong>Punto ' + (point.index + 1) + '</strong><br>' +
            positionText + '<br>' +
            'Lat: ' + point.lat.toFixed(6) + '<br>' +
            'Lng: ' + point.lng.toFixed(6)
          );
        });

        // Add center business marker (using CSS icon instead of emoji)
        const businessIconHtml = '<div class="custom-marker business-marker" style="' +
          'width: ${markerSize + 8}px; ' +
          'height: ${markerSize + 8}px; ' +
          'background-color: #e74c3c; ' +
          'border: 3px solid #ffffff; ' +
          'box-shadow: 0 2px 8px rgba(0,0,0,0.3); ' +
          'position: relative;' +
          '">' +
          '<div style="' +
            'position: absolute; ' +
            'bottom: -8px; ' +
            'left: 50%; ' +
            'transform: translateX(-50%); ' +
            'width: 0; ' +
            'height: 0; ' +
            'border-left: 8px solid transparent; ' +
            'border-right: 8px solid transparent; ' +
            'border-top: 12px solid #e74c3c;' +
          '"></div>' +
          '</div>';

        const businessIcon = L.divIcon({
          html: businessIconHtml,
          className: '',
          iconSize: [${markerSize + 8}, ${markerSize + 8}],
          iconAnchor: [${(markerSize + 8) / 2}, ${(markerSize + 8) / 2}]
        });

        L.marker([${center.lat}, ${center.lng}], {
          icon: businessIcon
        }).addTo(map)
          .bindPopup('<strong>Ubicación del Negocio</strong>');

        // Fit bounds to show all markers
        const markerBounds = L.latLngBounds(
          [${bounds.south}, ${bounds.west}],
          [${bounds.north}, ${bounds.east}]
        );
        map.fitBounds(markerBounds, { padding: [50, 50] });

        // Wait for tiles to finish loading, then signal ready
        function checkTilesLoaded() {
          if (tilesLoaded || tilesLoading === 0) {
            window.GEOGRID_READY = true;
            console.log('GeoGrid map initialized successfully');
          } else {
            setTimeout(checkTilesLoaded, 100);
          }
        }

        // Start checking after a short delay
        setTimeout(checkTilesLoaded, 500);

      } catch (error) {
        console.error('Error initializing map:', error);
        window.GEOGRID_ERROR = error.message;
      }
    });
  `;
}

module.exports = { getScripts };
