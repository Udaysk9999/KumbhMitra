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
    name: 'Nashik Godavari Basin (Ramkund)',
    center: NASHIK_CENTER,
    tilt: 55,
    heading: 25,
    zoom: 16,
    altitude: 600
  },
  trimbakeshwar: {
    name: 'Trimbakeshwar Jyotirlinga',
    center: TRIMBAKESHWAR_COORDS,
    tilt: 60,
    heading: 45,
    zoom: 16,
    altitude: 720
  },
  regionalOverview: {
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
 * Compute optimal 3D camera settings for a specific place
 */
export function computeCameraForPlace(place, currentHeading = 25) {
  if (!place) return DEFAULT_3D_CAMERA;

  const lat = Number(place.latitude ?? place.lat ?? NASHIK_CENTER.lat);
  const lng = Number(place.longitude ?? place.lng ?? NASHIK_CENTER.lng);

  // Subtle contextual camera tilt based on location type
  let tilt = 55;
  let zoom = 16;

  if (place.category === 'temple' || place.category === 'ghat') {
    tilt = 58;
    zoom = 16.5;
  } else if (place.category === 'transport' || place.category === 'parking') {
    tilt = 50;
    zoom = 15.5;
  }

  return {
    center: { lat, lng },
    tilt,
    heading: currentHeading,
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

  let zoom = 14;
  if (maxSpan > 0.25) zoom = 11.5;
  else if (maxSpan > 0.1) zoom = 12.5;
  else if (maxSpan > 0.04) zoom = 14;
  else zoom = 15.5;

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
