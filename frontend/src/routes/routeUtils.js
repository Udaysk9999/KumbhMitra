/**
 * Route Utilities & Future Backend Route Contract
 * 
 * Provides local demo route interpolation, realistic distance & duration estimations,
 * and standard GeoJSON-compatible LineString structures ready to connect to
 * backend routing services in upcoming phases.
 */

export const TRAVEL_MODES = [
  {
    id: 'shuttle',
    label: 'Shuttle / Bus',
    icon: '🚌',
    description: 'Kumbh Mela dedicated electric shuttle & feeder bus loop',
    avgSpeedKmh: 32,
    color: '#d97706',
    dashArray: 'none'
  },
  {
    id: 'walking',
    label: 'Walking',
    icon: '🚶',
    description: 'Sacred Parikrama pedestrian ghat walkway',
    avgSpeedKmh: 4.5,
    color: '#0284c7',
    dashArray: '6 6'
  },
  {
    id: 'driving',
    label: 'Driving',
    icon: '🚗',
    description: 'Designated pilgrim vehicle corridor (NH-848 / Ring Road)',
    avgSpeedKmh: 42,
    color: '#059669',
    dashArray: 'none'
  }
];

/**
 * Calculate Great-Circle Distance (Haversine) in Kilometers
 */
export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate a realistic road-following curved route path between two points
 * Uses subtle intermediate waypoints adhering to the Nashik-Trimbak terrain
 */
function interpolateWaypoints(start, dest) {
  const points = [];
  const count = 12; // 12 intermediate control points

  const lat1 = start.latitude;
  const lng1 = start.longitude;
  const lat2 = dest.latitude;
  const lng2 = dest.longitude;

  // Known anchor points if connecting Trimbakeshwar and Nashik city
  const isTrimbakCorridor =
    (lng1 < 73.6 && lng2 > 73.7) || (lng2 < 73.6 && lng1 > 73.7);

  for (let i = 0; i <= count; i++) {
    const t = i / count;
    // Base linear interpolation
    let lat = lat1 + (lat2 - lat1) * t;
    let lng = lng1 + (lng2 - lng1) * t;

    // Add realistic geographic arc (NH-848 curves gently around Anjaneri hills)
    if (isTrimbakCorridor && i > 0 && i < count) {
      const arc = Math.sin(t * Math.PI);
      lat += arc * 0.015; // gentle northward arc around hill contours
      lng += arc * 0.008;
    } else if (i > 0 && i < count) {
      // Local city road deflection
      const subtleArc = Math.sin(t * Math.PI * 2);
      lat += subtleArc * 0.0012;
      lng += subtleArc * 0.0015;
    }

    points.push({ lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) });
  }

  return points;
}

/**
 * Generate Simulated Route Object conforming to GeoJSON LineString standard
 */
export function generateDemoRoute(startPlace, destPlace, modeId = 'shuttle') {
  if (!startPlace || !destPlace) return null;

  if (startPlace.id === destPlace.id) {
    throw new Error('Start and destination locations must be different.');
  }

  const mode = TRAVEL_MODES.find((m) => m.id === modeId) || TRAVEL_MODES[0];
  const directDist = calculateHaversineKm(
    startPlace.latitude,
    startPlace.longitude,
    destPlace.latitude,
    destPlace.longitude
  );

  // Winding factor: Real roads in Nashik district are ~1.28x of straight-line distance
  const roadDistKm = Number((directDist * 1.28).toFixed(1));
  const effectiveDist = Math.max(roadDistKm, 0.4);

  // Estimated duration calculation
  const travelMinutes = Math.max(
    Math.round((effectiveDist / mode.avgSpeedKmh) * 60) + (modeId === 'shuttle' ? 5 : 2),
    3
  );

  const waypoints = interpolateWaypoints(startPlace, destPlace);

  // Standard GeoJSON coordinates: [ [longitude, latitude], ... ]
  const geoJsonCoordinates = waypoints.map((pt) => [pt.lng, pt.lat]);

  return {
    id: `route_${startPlace.id}_${destPlace.id}_${mode.id}`,
    start: {
      id: startPlace.id,
      name: startPlace.name,
      category: startPlace.category,
      categoryIcon: startPlace.categoryIcon,
      latitude: startPlace.latitude,
      longitude: startPlace.longitude,
      address: startPlace.address
    },
    destination: {
      id: destPlace.id,
      name: destPlace.name,
      category: destPlace.category,
      categoryIcon: destPlace.categoryIcon,
      latitude: destPlace.latitude,
      longitude: destPlace.longitude,
      address: destPlace.address
    },
    mode: mode.id,
    modeLabel: mode.label,
    modeIcon: mode.icon,
    modeColor: mode.color,
    modeDashArray: mode.dashArray,
    distanceKm: effectiveDist,
    distanceText: effectiveDist >= 1 ? `${effectiveDist} km` : `${Math.round(effectiveDist * 1000)} m`,
    durationMinutes: travelMinutes,
    durationText:
      travelMinutes >= 60
        ? `${Math.floor(travelMinutes / 60)} hr ${travelMinutes % 60 > 0 ? `${travelMinutes % 60} min` : ''}`
        : `${travelMinutes} min`,
    geometry: {
      type: 'LineString',
      coordinates: geoJsonCoordinates
    },
    waypoints // helper for direct map lat/lng consuming
  };
}
