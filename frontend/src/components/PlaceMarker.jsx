import React from 'react';
import MapMarker from '../maps/MapMarker';

/**
 * Re-export wrapper for PlaceMarker
 * Delegates to the modular maps/MapMarker component.
 * Supports isSelected, highlighted, and onClick props.
 */
export default function PlaceMarker(props) {
  return <MapMarker {...props} />;
}
