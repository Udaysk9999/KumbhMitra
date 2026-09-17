import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { DEFAULT_MAP_OPTIONS, NASHIK_CENTER } from './mapConfig';
import MapMarker from './MapMarker';

// Module-level singleton state to prevent duplicate script loading and multiple setOptions calls
let isOptionsConfigured = false;
let librariesPromise = null;

function getGoogleMapsLibraries(apiKey) {
  if (!isOptionsConfigured) {
    setOptions({
      key: apiKey,
      v: 'weekly'
    });
    isOptionsConfigured = true;
  }

  if (!librariesPromise) {
    librariesPromise = Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
      importLibrary('places'),
      importLibrary('geometry')
    ])
      .then(([mapsLib, markerLib, placesLib, geometryLib]) => ({
        mapsLib,
        markerLib,
        placesLib,
        geometryLib,
        google: window.google
      }))
      .catch((err) => {
        // Reset promise on failure to allow retry if requested
        librariesPromise = null;
        throw err;
      });
  }

  return librariesPromise;
}

/**
 * Custom OverlayView container that renders React portals into Google Maps
 */
function createOverlayClass(google) {
  const OverlayViewClass =
    google?.maps?.OverlayView ||
    google?.OverlayView ||
    window.google?.maps?.OverlayView;

  return class ReactMarkerOverlay extends OverlayViewClass {
    constructor(latLng, container) {
      super();
      this.latLng = latLng;
      this.container = container;
      this.bounds = null;
    }

    onAdd() {
      const panes = this.getPanes();
      if (panes && panes.overlayMouseTarget) {
        panes.overlayMouseTarget.appendChild(this.container);
      }
    }

    draw() {
      const projection = this.getProjection();
      if (!projection || !this.container) return;
      const point = projection.fromLatLngToDivPixel(this.latLng);
      if (point) {
        this.container.style.position = 'absolute';
        this.container.style.left = `${point.x}px`;
        this.container.style.top = `${point.y}px`;
        this.container.style.transform = 'translate(-50%, -100%)';
        this.container.style.zIndex = '10';
      }
    }

    onRemove() {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }

    setPosition(latLng) {
      this.latLng = latLng;
      this.draw();
    }
  };
}

/**
 * Real Google Maps 2D Viewport Component
 * Uses official @googlemaps/js-api-loader v2 functional API (setOptions + importLibrary)
 */
const GoogleMap = forwardRef(function GoogleMap({
  apiKey,
  places = [],
  selectedPlace = null,
  onSelectPlace,
  onError,
  onCoordinatesChange
}, ref) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const centerListenerRef = useRef(null);
  const overlaysRef = useRef(new Map());
  const [googleMaps, setGoogleMaps] = useState(null);
  const [portals, setPortals] = useState([]);

  // Expose map controls to parent (zoom in, zoom out, recenter, fitPlaces)
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (mapInstanceRef.current) {
        const currentZoom = mapInstanceRef.current.getZoom() || 13;
        mapInstanceRef.current.setZoom(currentZoom + 1);
      }
    },
    zoomOut: () => {
      if (mapInstanceRef.current) {
        const currentZoom = mapInstanceRef.current.getZoom() || 13;
        mapInstanceRef.current.setZoom(currentZoom - 1);
      }
    },
    resetView: () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo(NASHIK_CENTER);
        mapInstanceRef.current.setZoom(13);
      }
    },
    fitPlaces: () => {
      const LatLngBoundsClass =
        googleMaps?.LatLngBounds ||
        googleMaps?.maps?.LatLngBounds ||
        window.google?.maps?.LatLngBounds;

      if (mapInstanceRef.current && LatLngBoundsClass && places.length > 0) {
        const bounds = new LatLngBoundsClass();
        places.forEach((p) => {
          bounds.extend({ lat: p.latitude, lng: p.longitude });
        });
        mapInstanceRef.current.fitBounds(bounds, 50);
      }
    },
    getMap: () => mapInstanceRef.current
  }), [googleMaps, places]);

  // Initialize Google Maps API via setOptions and importLibrary
  useEffect(() => {
    if (!apiKey) {
      onError?.('MISSING_API_KEY');
      return;
    }

    let isMounted = true;

    // Listen for authentication failure from Google Maps script
    window.gm_authFailure = () => {
      if (isMounted) {
        console.warn('Google Maps authentication failure: Check API key & billing in Google Cloud.');
        onError?.('AUTH_FAILURE');
      }
    };

    getGoogleMapsLibraries(apiKey)
      .then(({ google, mapsLib }) => {
        if (!isMounted || !mapContainerRef.current) return;

        // Ensure google.maps is saved in state
        const mapsNamespace = google?.maps || mapsLib;
        setGoogleMaps(mapsNamespace);

        // Instantiate Google Map only if not already created for this DOM element
        if (!mapInstanceRef.current && mapContainerRef.current) {
          const MapClass = mapsNamespace.Map || mapsLib.Map;
          const map = new MapClass(mapContainerRef.current, {
            ...DEFAULT_MAP_OPTIONS
          });

          mapInstanceRef.current = map;

          // Track center coordinates for display
          const listener = map.addListener('center_changed', () => {
            const center = map.getCenter();
            if (center && onCoordinatesChange) {
              onCoordinatesChange({
                lat: center.lat(),
                lng: center.lng()
              });
            }
          });
          centerListenerRef.current = listener;
        }
      })
      .catch((err) => {
        console.error('Failed to load Google Maps SDK:', err);
        if (isMounted) {
          onError?.('LOAD_ERROR: ' + (err.message || 'Network error'));
        }
      });

    return () => {
      isMounted = false;
      if (centerListenerRef.current?.remove) {
        centerListenerRef.current.remove();
        centerListenerRef.current = null;
      }
      if (window.gm_authFailure) {
        delete window.gm_authFailure;
      }
    };
  }, [apiKey]);

  // Clean up overlays on unmount
  useEffect(() => {
    return () => {
      overlaysRef.current.forEach((item) => {
        try {
          item.overlay?.setMap(null);
        } catch (_) {
          // ignore cleanup errors during unmount
        }
      });
      overlaysRef.current.clear();
    };
  }, []);

  // Synchronize overlays and portals when places change
  useEffect(() => {
    if (!googleMaps || !mapInstanceRef.current) return;

    const OverlayClass = createOverlayClass(googleMaps);
    const LatLngClass =
      googleMaps.LatLng ||
      googleMaps.maps?.LatLng ||
      window.google?.maps?.LatLng;
    const currentOverlays = overlaysRef.current;
    const newPortals = [];
    const activePlaceIds = new Set(places.map((p) => p.id));

    // Remove overlays for places no longer visible
    currentOverlays.forEach((item, placeId) => {
      if (!activePlaceIds.has(placeId)) {
        item.overlay.setMap(null);
        currentOverlays.delete(placeId);
      }
    });

    // Create or retain overlays for visible places
    places.forEach((place) => {
      let item = currentOverlays.get(place.id);
      if (!item) {
        const container = document.createElement('div');
        const latLng = new LatLngClass(place.latitude, place.longitude);
        const overlay = new OverlayClass(latLng, container);
        overlay.setMap(mapInstanceRef.current);

        item = { container, overlay, place };
        currentOverlays.set(place.id, item);
      } else {
        item.place = place;
      }

      // Create React Portal for marker
      newPortals.push(
        createPortal(
          <MapMarker
            key={place.id}
            place={place}
            isSelected={selectedPlace?.id === place.id}
            onClick={onSelectPlace}
          />,
          item.container
        )
      );
    });

    setPortals(newPortals);
  }, [googleMaps, places, selectedPlace, onSelectPlace]);

  // Pan to selected place when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPlace) return;

    const targetCoords = {
      lat: selectedPlace.latitude,
      lng: selectedPlace.longitude
    };

    mapInstanceRef.current.panTo(targetCoords);

    // Smoothly zoom in if zoomed out
    const currentZoom = mapInstanceRef.current.getZoom() || 13;
    if (currentZoom < 15) {
      mapInstanceRef.current.setZoom(15);
    }
  }, [selectedPlace]);

  return (
    <div className="relative w-full h-full">
      {/* Map Viewport Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full bg-stone-100"
        aria-label="Google Map Viewport"
      />

      {/* Render Portal Markers */}
      {portals}
    </div>
  );
});

export default GoogleMap;
