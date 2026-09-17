import React from 'react';
import MapMarker from '../maps/MapMarker';

/**
 * Re-export wrapper for PlaceMarker
 * Delegates to the modular maps/MapMarker component.
 */
export default function ComponentPlaceMarker(props) {
  return <MapMarker {...props} />;
}
