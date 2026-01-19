/**
 * Coordinates utility
 * Handles GPS coordinate calculations for grid generation
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Converts degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 */
function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Calculate new coordinates given a starting point, distance and bearing
 * @param {number} lat - Starting latitude
 * @param {number} lng - Starting longitude
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} bearingDegrees - Bearing in degrees (0 = North, 90 = East)
 * @returns {{ lat: number, lng: number }}
 */
function calculateDestination(lat, lng, distanceKm, bearingDegrees) {
  const latRad = toRadians(lat);
  const lngRad = toRadians(lng);
  const bearingRad = toRadians(bearingDegrees);
  const angularDistance = distanceKm / EARTH_RADIUS_KM;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
    Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );

  const newLngRad = lngRad + Math.atan2(
    Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad),
    Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(newLatRad)
  );

  return {
    lat: toDegrees(newLatRad),
    lng: toDegrees(newLngRad)
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - First point latitude
 * @param {number} lng1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lng2 - Second point longitude
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Validates if coordinates are valid
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean}
 */
function isValidCoordinate(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

/**
 * Generate grid coordinates around a center point
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} gridSize - Size of grid (e.g., 9 = 9x9 grid)
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Array<{lat: number, lng: number, index: number}>}
 */
function generateGridCoordinates(centerLat, centerLng, gridSize, radiusKm) {
  const coordinates = [];
  const gridSpacing = (radiusKm * 2) / (gridSize - 1);
  const halfGrid = Math.floor(gridSize / 2);

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const offsetY = (halfGrid - row) * gridSpacing;
      const offsetX = (col - halfGrid) * gridSpacing;

      // Calculate bearing and distance from center
      const bearing = Math.atan2(offsetX, offsetY);
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

      // Convert to coordinates
      const point = calculateDestination(
        centerLat,
        centerLng,
        distance,
        toDegrees(bearing)
      );

      coordinates.push({
        lat: point.lat,
        lng: point.lng,
        index: row * gridSize + col,
        row,
        col
      });
    }
  }

  return coordinates;
}

/**
 * Format coordinate for display
 * @param {number} value - Coordinate value
 * @param {number} decimals - Number of decimal places
 * @returns {string}
 */
function formatCoordinate(value, decimals = 6) {
  return value.toFixed(decimals);
}

module.exports = {
  calculateDestination,
  calculateDistance,
  isValidCoordinate,
  generateGridCoordinates,
  formatCoordinate,
  toRadians,
  toDegrees
};
