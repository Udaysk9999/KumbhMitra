/**
 * 3D Landmark Visual Configuration
 * Maps known place IDs to lightweight architectural models, badge labels, and custom styling.
 * All coordinates and master metadata continue to be sourced directly from the existing place dataset.
 */

export const LANDMARK_CONFIGS = {
  place_trimbakeshwar: {
    placeId: 'place_trimbakeshwar',
    landmarkType: 'temple-shikhara',
    badge: 'Sacred Jyotirlinga',
    subtitle: 'Brahmagiri Holy Origin',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    heightPx: 72,
    scale: 1.25,
    hasShikhara: true,
    hasKalash: true,
    hasFlag: true,
    hasPillars: true,
    elevationZ: 50
  },
  place_ramkund: {
    placeId: 'place_ramkund',
    landmarkType: 'stepped-ghat',
    badge: 'Shahi Snan Ghat',
    subtitle: 'Godavari Sacred Basin',
    accentColor: '#0284c7',
    glowColor: 'rgba(2, 132, 199, 0.45)',
    heightPx: 56,
    scale: 1.2,
    hasSteps: true,
    hasWaterBasin: true,
    hasDeepastambha: true,
    elevationZ: 44
  },
  place_kalaram: {
    placeId: 'place_kalaram',
    landmarkType: 'temple-shikhara',
    badge: 'Panchavati Heritage',
    subtitle: 'Black Basalt Mandir',
    accentColor: '#d97706',
    glowColor: 'rgba(217, 119, 6, 0.4)',
    heightPx: 64,
    scale: 1.15,
    hasShikhara: true,
    hasKalash: true,
    hasFlag: true,
    hasPillars: false,
    elevationZ: 42
  },
  place_cbs_transit: {
    placeId: 'place_cbs_transit',
    landmarkType: 'transit-terminal',
    badge: 'Kumbh Transit Hub',
    subtitle: 'Central Shuttle Terminal',
    accentColor: '#ea580c',
    glowColor: 'rgba(234, 88, 12, 0.4)',
    heightPx: 50,
    scale: 1.1,
    hasCanopy: true,
    hasTransitIcon: true,
    elevationZ: 38
  }
};

/**
 * Retrieve landmark configuration for a given place ID
 * Returns null if the place is a standard point of interest without custom landmark geometry.
 */
export function getLandmarkConfig(placeId) {
  if (!placeId) return null;
  return LANDMARK_CONFIGS[placeId] || null;
}
