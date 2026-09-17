import React from 'react';
import MapContainer from '../maps/MapContainer';

/**
 * Re-export wrapper for MapContainer
 * Preserves component directory organization while delegating to modular maps module.
 */
export default function ComponentMapContainer(props) {
  return <MapContainer {...props} />;
}
