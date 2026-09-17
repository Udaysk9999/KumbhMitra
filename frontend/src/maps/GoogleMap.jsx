import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Loader } from '@googlemaps/js-api-loader';
import { DEFAULT_MAP_OPTIONS, NASHIK_CENTER } from './mapConfig';
import MapMarker from './MapMarker';

/**
 * Custom OverlayView container that renders React portals into Google Maps
 */
function createOverlayClass(google) {
  return class ReactMarkerOverlay extends google.maps.OverlayView {
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
 * Uses official @googlemaps/js-api-loader and Google Maps JavaScript API
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
  const overlaysRef = useRef(new Map());
  const [googleMaps, setGoogleMaps] = useState(null);
  const [portals, setPortals] = useState([]);

  // Expose map controls to parent (zoom in, zoom out, recenter)
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
      if (mapInstanceRef.current && googleMaps && places.length > 0) {
        const bounds = new googleMaps.LatLngBounds();
        places.forEach((p) => {
          bounds.extend({ lat: p.latitude, lng: p.longitude });
        });
        mapInstanceRef.current.fitBounds(bounds, 50);
      }
    },
    getMap: () => mapInstanceRef.current
  }), [googleMaps, places]);

  // Initialize Google Maps API
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

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader
      .load()
      .then((google) => {
        if (!isMounted || !mapContainerRef.current) return;

        setGoogleMaps(google);

        // Instantiate Google Map
        const map = new google.maps.Map(mapContainerRef.current, {
          ...DEFAULT_MAP_OPTIONS
        });

        mapInstanceRef.current = map;

        // Track center coordinates for display
        map.addListener('center_changed', () => {
          const center = map.getCenter();
          if (center && onCoordinatesChange) {
            onCoordinatesChange({
              lat: center.lat(),
              lng: center.lng()
            });
          }
        });
      })
      .catch((err) => {
        console.error('Failed to load Google Maps SDK:', err);
        if (isMounted) {
          onError?.('LOAD_ERROR: ' + (err.message || 'Network error'));
        }
      });

    return () => {
      isMounted = false;
      if (window.gm_authFailure) {
        delete window.gm_authFailure;
      }
    };
  }, [apiKey]);

  // Synchronize overlays and portals when places change
  useEffect(() => {
    if (!googleMaps || !mapInstanceRef.current) return;

    const OverlayClass = createOverlayClass(googleMaps);
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
        const latLng = new googleMaps.LatLng(place.latitude, place.longitude);
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
