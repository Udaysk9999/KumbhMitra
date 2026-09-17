/**
 * Route Utilities & Backend Route Contract
 * 
 * Provides:
 * 1. Normalized Route Data Contract compatible with future backend routing endpoints.
 * 2. Multi-modal travel options (Shuttle, Walking, Driving) with realistic speed & traffic profiles.
 * 3. High-fidelity geometric road interpolation tailored to the Nashik-Trimbakeshwar corridor.
 * 4. Contextual turn-by-turn navigation steps generator.
 * 5. Route normalization for future API responses.
 */

export const TRAVEL_MODES = [
  {
    id: 'shuttle',
    label: 'Shuttle / Bus',
    shortLabel: 'Shuttle',
    icon: '🚌',
    description: 'Simhastha Kumbh dedicated electric shuttle & feeder bus loop',
    avgSpeedKmh: 32,
    color: '#d97706', // amber-600
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    dashArray: 'none'
  },
  {
    id: 'walking',
    label: 'Walking',
    shortLabel: 'Walk',
    icon: '🚶',
    description: 'Sacred Parikrama pedestrian ghat walkway & pilgrim paths',
    avgSpeedKmh: 4.5,
    color: '#0284c7', // sky-600
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    dashArray: '6 6'
  },
  {
    id: 'driving',
    label: 'Driving',
    shortLabel: 'Drive',
    icon: '🚗',
    description: 'Designated pilgrim vehicle corridor (NH-848 / Ring Road)',
    avgSpeedKmh: 42,
    color: '#059669', // emerald-600
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    dashArray: 'none'
  }
];

/**
 * Get travel mode config by ID
 */
export function getTravelMode(modeId = 'shuttle') {
  return TRAVEL_MODES.find((m) => m.id === modeId) || TRAVEL_MODES[0];
}

/**
 * Calculate Great-Circle Distance (Haversine) in Kilometers
 */
export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
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
 * Format distance value in kilometers to readable text
 */
export function formatDistance(distanceKm) {
  if (distanceKm == null || isNaN(distanceKm)) return '-- km';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Format duration in minutes to readable text
 */
export function formatDuration(durationMinutes) {
  if (durationMinutes == null || isNaN(durationMinutes)) return '-- min';
  const mins = Math.round(durationMinutes);
  if (mins < 60) {
    return `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours} hr ${remainingMins} min` : `${hours} hr`;
}

/**
 * Generate intermediate waypoints along the Nashik-Trimbakeshwar terrain
 */
function interpolateWaypoints(start, dest) {
  const points = [];
  const count = 14; // intermediate control points

  const lat1 = Number(start.latitude);
  const lng1 = Number(start.longitude);
  const lat2 = Number(dest.latitude);
  const lng2 = Number(dest.longitude);

  // Check if route connects Trimbakeshwar (< 73.6) and Nashik city (> 73.7)
  const isTrimbakCorridor =
    (lng1 < 73.6 && lng2 > 73.7) || (lng2 < 73.6 && lng1 > 73.7);

  for (let i = 0; i <= count; i++) {
    const t = i / count;
    let lat = lat1 + (lat2 - lat1) * t;
    let lng = lng1 + (lng2 - lng1) * t;

    // Realistic geographic arc around Anjaneri / Brahmagiri hills on NH-848
    if (isTrimbakCorridor && i > 0 && i < count) {
      const arc = Math.sin(t * Math.PI);
      lat += arc * 0.016;
      lng += arc * 0.009;
    } else if (i > 0 && i < count) {
      // Gentle city curvature
      const subtleArc = Math.sin(t * Math.PI * 2);
      lat += subtleArc * 0.0014;
      lng += subtleArc * 0.0018;
    }

    points.push({ lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) });
  }

  return points;
}

/**
 * Generate context-aware turn-by-turn navigation steps for Kumbh Mela
 */
function generateNavigationSteps(startPlace, destPlace, modeId, distanceKm, durationMinutes) {
  const steps = [];
  const mode = getTravelMode(modeId);

  // Step 1: Origin departure
  if (modeId === 'walking') {
    steps.push({
      stepIndex: 1,
      instruction: `Head out from ${startPlace.name} along the pedestrian pilgrim pathway`,
      distanceKm: Number((distanceKm * 0.15).toFixed(1)),
      distanceText: formatDistance(distanceKm * 0.15),
      durationMinutes: Math.max(1, Math.round(durationMinutes * 0.15)),
      durationText: formatDuration(durationMinutes * 0.15),
      maneuver: 'depart',
      icon: '🚶'
    });
  } else if (modeId === 'shuttle') {
    steps.push({
      stepIndex: 1,
      instruction: `Board the Kumbh Electric Feeder Shuttle at ${startPlace.name} boarding zone`,
      distanceKm: 0.1,
      distanceText: '100 m',
      durationMinutes: 4,
      durationText: '4 min wait',
      maneuver: 'board',
      icon: '🚏'
    });
  } else {
    steps.push({
      stepIndex: 1,
      instruction: `Start vehicle at ${startPlace.name} parking / pickup zone`,
      distanceKm: Number((distanceKm * 0.1).toFixed(1)),
      distanceText: formatDistance(distanceKm * 0.1),
      durationMinutes: Math.max(1, Math.round(durationMinutes * 0.1)),
      durationText: formatDuration(durationMinutes * 0.1),
      maneuver: 'depart',
      icon: '🚗'
    });
  }

  // Step 2: Main corridor traversal
  const isTrimbak =
    startPlace.region === 'Trimbakeshwar' || destPlace.region === 'Trimbakeshwar';

  if (isTrimbak) {
    steps.push({
      stepIndex: 2,
      instruction: 'Follow NH-848 (Nashik - Trimbak Highway) along the Brahmagiri mountain corridor',
      distanceKm: Number((distanceKm * 0.6).toFixed(1)),
      distanceText: formatDistance(distanceKm * 0.6),
      durationMinutes: Math.max(2, Math.round(durationMinutes * 0.6)),
      durationText: formatDuration(durationMinutes * 0.6),
      maneuver: 'straight',
      icon: '🛣️'
    });
  } else {
    steps.push({
      stepIndex: 2,
      instruction: 'Continue through Godavari River Ghat feeder road towards central sacred zone',
      distanceKm: Number((distanceKm * 0.6).toFixed(1)),
      distanceText: formatDistance(distanceKm * 0.6),
      durationMinutes: Math.max(2, Math.round(durationMinutes * 0.6)),
      durationText: formatDuration(durationMinutes * 0.6),
      maneuver: 'straight',
      icon: '🌊'
    });
  }

  // Step 3: Local approach & diversion
  steps.push({
    stepIndex: 3,
    instruction: `Follow Simhastha crowd guidance signs towards ${destPlace.categoryLabel || destPlace.category || 'destination'} approach`,
    distanceKm: Number((distanceKm * 0.2).toFixed(1)),
    distanceText: formatDistance(distanceKm * 0.2),
    durationMinutes: Math.max(1, Math.round(durationMinutes * 0.2)),
    durationText: formatDuration(durationMinutes * 0.2),
    maneuver: 'turn-right',
    icon: '↗️'
  });

  // Step 4: Final arrival
  steps.push({
    stepIndex: 4,
    instruction: `Arrive at ${destPlace.name}. Pilgrim reception and assistance desk on site.`,
    distanceKm: Number((distanceKm * 0.05).toFixed(1)),
    distanceText: formatDistance(distanceKm * 0.05),
    durationMinutes: Math.max(1, Math.round(durationMinutes * 0.05)),
    durationText: formatDuration(durationMinutes * 0.05),
    maneuver: 'arrive',
    icon: '🎯'
  });

  return steps;
}

/**
 * Standard Frontend Route Contract Normalizer
 * Ensures both live backend API responses and local fallback routes adhere to
 * the exact contract required by the UI and map layers.
 * 
 * @param {object} raw - API response or route object
 * @param {object} [fallbackStart] - Fallback start location
 * @param {object} [fallbackDest] - Fallback destination location
 * @param {string} [fallbackMode='shuttle'] - Fallback travel mode
 * @returns {object} Strict Normalized Route Object
 */
export function normalizeRoute(raw, fallbackStart = null, fallbackDest = null, fallbackMode = 'shuttle') {
  if (!raw) return null;

  const modeId = raw.travelMode || raw.mode || fallbackMode;
  const mode = getTravelMode(modeId);

  const start = raw.start || fallbackStart || {
    id: 'origin',
    name: 'Selected Origin',
    latitude: 19.9975,
    longitude: 73.7898
  };

  const destination = raw.destination || fallbackDest || {
    id: 'destination',
    name: 'Selected Destination',
    latitude: 19.9324,
    longitude: 73.5307
  };

  // Distance extraction
  let distanceKm = 0;
  if (typeof raw.distanceKm === 'number') {
    distanceKm = raw.distanceKm;
  } else if (raw.distance && typeof raw.distance.valueKm === 'number') {
    distanceKm = raw.distance.valueKm;
  } else if (raw.distance && typeof raw.distance.valueMeters === 'number') {
    distanceKm = raw.distance.valueMeters / 1000;
  } else if (typeof raw.distance === 'number') {
    distanceKm = raw.distance;
  }

  // Duration extraction
  let durationMinutes = 0;
  if (typeof raw.durationMinutes === 'number') {
    durationMinutes = raw.durationMinutes;
  } else if (raw.duration && typeof raw.duration.valueMinutes === 'number') {
    durationMinutes = raw.duration.valueMinutes;
  } else if (raw.duration && typeof raw.duration.valueSeconds === 'number') {
    durationMinutes = Math.round(raw.duration.valueSeconds / 60);
  } else if (typeof raw.duration === 'number') {
    durationMinutes = raw.duration;
  }

  // Geometry extraction (GeoJSON LineString format: [[lng, lat], ...])
  let coordinates = [];
  if (raw.geometry && Array.isArray(raw.geometry.coordinates)) {
    coordinates = raw.geometry.coordinates;
  } else if (Array.isArray(raw.coordinates)) {
    coordinates = raw.coordinates;
  } else if (Array.isArray(raw.waypoints)) {
    coordinates = raw.waypoints.map((pt) => [pt.lng || pt[0], pt.lat || pt[1]]);
  }

  // Generate fallback coordinates if missing
  if (coordinates.length < 2 && start.latitude && destination.latitude) {
    const waypoints = interpolateWaypoints(start, destination);
    coordinates = waypoints.map((pt) => [pt.lng, pt.lat]);
  }

  // Steps extraction
  const steps = Array.isArray(raw.steps) && raw.steps.length > 0
    ? raw.steps.map((s, idx) => ({
        stepIndex: s.stepIndex || idx + 1,
        instruction: s.instruction || s.text || `Step ${idx + 1}`,
        distanceKm: s.distanceKm || 0,
        distanceText: s.distanceText || formatDistance(s.distanceKm || 0),
        durationMinutes: s.durationMinutes || 0,
        durationText: s.durationText || formatDuration(s.durationMinutes || 0),
        maneuver: s.maneuver || 'straight',
        icon: s.icon || '➡️'
      }))
    : generateNavigationSteps(start, destination, mode.id, distanceKm, durationMinutes);

  return {
    id: raw.id || `route_${start.id || 'start'}_${destination.id || 'dest'}_${mode.id}`,
    start: {
      id: start.id,
      name: start.name || 'Start Point',
      category: start.category,
      categoryIcon: start.categoryIcon || '📍',
      latitude: Number(start.latitude),
      longitude: Number(start.longitude),
      address: start.address,
      region: start.region
    },
    destination: {
      id: destination.id,
      name: destination.name || 'Destination Point',
      category: destination.category,
      categoryIcon: destination.categoryIcon || '📍',
      latitude: Number(destination.latitude),
      longitude: Number(destination.longitude),
      address: destination.address,
      region: destination.region
    },
    travelMode: mode.id,
    mode: mode.id, // backwards compatibility
    modeLabel: mode.label,
    modeShortLabel: mode.shortLabel,
    modeIcon: mode.icon,
    modeColor: mode.color,
    modeDashArray: mode.dashArray,
    distance: {
      valueKm: Number(distanceKm.toFixed(1)),
      valueMeters: Math.round(distanceKm * 1000),
      text: formatDistance(distanceKm)
    },
    duration: {
      valueMinutes: Math.round(durationMinutes),
      valueSeconds: Math.round(durationMinutes * 60),
      text: formatDuration(durationMinutes)
    },
    distanceKm: Number(distanceKm.toFixed(1)),
    distanceText: formatDistance(distanceKm),
    durationMinutes: Math.round(durationMinutes),
    durationText: formatDuration(durationMinutes),
    geometry: {
      type: 'LineString',
      coordinates
    },
    steps,
    source: raw.source || 'mock'
  };
}

/**
 * Generate Simulated Route Object conforming to GeoJSON LineString standard
 */
export function generateDemoRoute(startPlace, destPlace, modeId = 'shuttle') {
  if (!startPlace || !destPlace) return null;

  if (startPlace.id === destPlace.id) {
    throw new Error('Start and destination locations must be different.');
  }

  const mode = getTravelMode(modeId);
  const directDist = calculateHaversineKm(
    startPlace.latitude,
    startPlace.longitude,
    destPlace.latitude,
    destPlace.longitude
  );

  // Real roads in Nashik district are ~1.28x of straight-line distance
  const roadDistKm = Number((directDist * 1.28).toFixed(1));
  const effectiveDist = Math.max(roadDistKm, 0.4);

  // Estimated duration calculation based on mode
  const travelMinutes = Math.max(
    Math.round((effectiveDist / mode.avgSpeedKmh) * 60) + (modeId === 'shuttle' ? 5 : 2),
    3
  );

  const waypoints = interpolateWaypoints(startPlace, destPlace);
  const geoJsonCoordinates = waypoints.map((pt) => [pt.lng, pt.lat]);

  const rawRoute = {
    id: `route_${startPlace.id}_${destPlace.id}_${mode.id}`,
    start: startPlace,
    destination: destPlace,
    travelMode: mode.id,
    mode: mode.id,
    distanceKm: effectiveDist,
    durationMinutes: travelMinutes,
    geometry: {
      type: 'LineString',
      coordinates: geoJsonCoordinates
    },
    source: 'mock'
  };

  return normalizeRoute(rawRoute, startPlace, destPlace, mode.id);
}

export default {
  TRAVEL_MODES,
  getTravelMode,
  calculateHaversineKm,
  formatDistance,
  formatDuration,
  normalizeRoute,
  generateDemoRoute
};
