import React, { forwardRef } from 'react';
import MapContainer from '../maps/MapContainer';

/**
 * Re-export wrapper for MapContainer
 * Preserves component directory organization while delegating to modular maps module.
 */
const ComponentMapContainer = forwardRef(function ComponentMapContainer(props, ref) {
  return <MapContainer ref={ref} {...props} />;
});

export default ComponentMapContainer;
