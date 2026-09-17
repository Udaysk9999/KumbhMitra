import { useCallback } from 'react';

/**
 * useMapCamera Hook
 * Abstracts imperative map camera operations (pan, zoom, fit route, fit markers, reset).
 * Works smoothly across both GoogleMap and MapFallback instances.
 */
export function useMapCamera(mapRef) {
  const panToPlace = useCallback((place, zoom = 16) => {
    if (!mapRef?.current || !place) return;
    if (mapRef.current.fitToPlace) {
      mapRef.current.fitToPlace(place, zoom);
    } else if (mapRef.current.panTo) {
      const lat = place.latitude ?? place.lat;
      const lng = place.longitude ?? place.lng;
      if (lat != null && lng != null) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom?.(zoom);
      }
    }
  }, [mapRef]);

  const fitRoute = useCallback((route, padding) => {
    if (!mapRef?.current) return;
    mapRef.current.fitBoundsToRoute?.(route, padding);
  }, [mapRef]);

  const fitAllMarkers = useCallback(() => {
    if (!mapRef?.current) return;
    mapRef.current.fitPlaces?.();
  }, [mapRef]);

  const resetView = useCallback(() => {
    if (!mapRef?.current) return;
    mapRef.current.resetView?.();
  }, [mapRef]);

  return {
    panToPlace,
    fitRoute,
    fitAllMarkers,
    resetView
  };
}

export default useMapCamera;
