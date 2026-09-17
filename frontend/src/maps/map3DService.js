/**
 * 3D Map Service & Configuration
 * Provides provider-agnostic 3D camera presets, projection helpers, and geographic configurations
 * for the Nashik + Trimbakeshwar (Kumbh Mela 2027) corridor.
 */

import { NASHIK_CENTER, TRIMBAKESHWAR_COORDS, REGIONAL_BOUNDS } from './mapConfig';

/**
 * Default 3D Camera Presets for Kumbh 2027 Key Locations
 */
export const CAMERA_PRESETS_3D = {
  nashikGodavari: {
    key: 'nashikGodavari',
    name: 'Nashik Godavari Basin (Ramkund)',
    center: NASHIK_CENTER,
    tilt: 55,
    heading: 25,
    zoom: 16,
    altitude: 600
  },
  trimbakeshwar: {
    key: 'trimbakeshwar',
    name: 'Trimbakeshwar Jyotirlinga',
    center: TRIMBAKESHWAR_COORDS,
    tilt: 60,
    heading: 45,
    zoom: 16,
    altitude: 720
  },
  regionalOverview: {
    key: 'regionalOverview',
    name: 'Nashik-Trimbak 3D Corridor',
    center: {
      lat: (NASHIK_CENTER.lat + TRIMBAKESHWAR_COORDS.lat) / 2,
      lng: (NASHIK_CENTER.lng + TRIMBAKESHWAR_COORDS.lng) / 2
    },
    tilt: 45,
    heading: 20,
    zoom: 12.5,
    altitude: 1800
  }
};

export const DEFAULT_3D_CAMERA = CAMERA_PRESETS_3D.nashikGodavari;

/**
 * Compute optimal 3D camera settings for a specific place with category-aware tilt & zoom
 */
export function computeCameraForPlace(place, currentHeading = 25) {
  if (!place) return DEFAULT_3D_CAMERA;

  const lat = Number(place.latitude ?? place.lat ?? NASHIK_CENTER.lat);
  const lng = Number(place.longitude ?? place.lng ?? NASHIK_CENTER.lng);

  // Category-specific perspective tuning
  let tilt = 55;
  let zoom = 1.45;

  if (place.category === 'temple') {
    tilt = 58;
    zoom = 1.55;
  } else if (place.category === 'ghat') {
    tilt = 54;
    zoom = 1.5;
  } else if (place.category === 'transport' || place.category === 'parking') {
    tilt = 48;
    zoom = 1.35;
  } else if (place.category === 'hotel' || place.category === 'restaurant') {
    tilt = 52;
    zoom = 1.4;
  }

  // Choose heading oriented towards central Godavari corridor
  let heading = currentHeading;
  if (lng < 73.65) {
    // Trimbakeshwar region -> orient east-northeast towards Brahmagiri ridge
    heading = 40;
  } else if (lat > 20.01) {
    // Panchavati / Northern Nashik -> orient south-southeast
    heading = 15;
  }

  return {
    center: { lat, lng },
    tilt,
    heading,
    zoom,
    placeName: place.name || 'Selected Place'
  };
}

/**
 * Compute optimal 3D camera view for an active route
 */
export function computeCameraForRoute(route) {
  if (!route || !route.start || !route.destination) {
    return DEFAULT_3D_CAMERA;
  }

  const startLat = Number(route.start.latitude);
  const startLng = Number(route.start.longitude);
  const destLat = Number(route.destination.latitude);
  const destLng = Number(route.destination.longitude);

  const midLat = (startLat + destLat) / 2;
  const midLng = (startLng + destLng) / 2;

  // Calculate approximate bearing between start and destination for aligned camera perspective
  const dLng = (destLng - startLng) * (Math.PI / 180);
  const lat1 = startLat * (Math.PI / 180);
  const lat2 = destLat * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  // Compute bounding distance to adjust 3D zoom
  const latDiff = Math.abs(destLat - startLat);
  const lngDiff = Math.abs(destLng - startLng);
  const maxSpan = Math.max(latDiff, lngDiff);

  let zoom = 1.25;
  if (maxSpan > 0.25) zoom = 0.95;
  else if (maxSpan > 0.1) zoom = 1.1;
  else if (maxSpan > 0.04) zoom = 1.3;
  else zoom = 1.45;

  return {
    center: { lat: midLat, lng: midLng },
    tilt: 48,
    heading: Math.round(bearing),
    zoom
  };
}

/**
 * Projects real geographic coordinates into percentage values with elevation offsets
 * for the 3D terrain canvas fallback.
 */
export function project3DCoords(lat, lng, elevation = 0, bounds = REGIONAL_BOUNDS) {
  const { north, south, east, west } = bounds;
  const clampedLng = Math.max(west, Math.min(east, lng));
  const clampedLat = Math.max(south, Math.min(north, lat));

  const xPercent = ((clampedLng - west) / (east - west)) * 100;
  const yPercent = ((north - clampedLat) / (north - south)) * 100;

  return {
    left: `${xPercent.toFixed(3)}%`,
    top: `${yPercent.toFixed(3)}%`,
    xPercent,
    yPercent,
    elevationPx: Math.min(elevation * 0.15, 60)
  };
}
