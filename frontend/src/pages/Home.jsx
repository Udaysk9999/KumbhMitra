import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from '../components/Header';
import CategoryFilters from '../components/CategoryFilters';
import MapContainer from '../maps/MapContainer';
import PlacePreviewCard from '../components/PlacePreviewCard';
import PlaceInfoPanel from '../components/PlaceInfoPanel';
import RoutePanel from '../routes/RoutePanel';
import AIAssistant from '../components/AIAssistant';
import EmergencyPanel from '../components/EmergencyPanel';
import { PlacesLoadingView, PlacesEmptyView, ApiUnavailableNotice } from '../components/PlaceStateView';
import { placeService, filterPlacesByCategory, EXPLORE_MODE_CATEGORIES } from '../places';
import { routeService } from '../services/routeService';
import { NASHIK_CENTER } from '../maps/mapConfig';
import useMapCamera from '../hooks/useMapCamera';

/**
 * Home Page Component
 * Main coordinator for the map-first AI KumbhMitra UI shell.
 * Integrates real backend REST APIs, all 35+ POI categories, 6-group category filter,
 * Kumbh Mode vs. Explore Nashik switch, search, nearby lookup, routing, and AI chat.
 */
export default function Home() {
  const mapRef = useRef(null);
  const { panToPlace, fitRoute } = useMapCamera(mapRef);

  const [mapMode, setMapMode] = useState('2D');
  const [experienceMode, setExperienceMode] = useState('kumbh'); // 'kumbh' | 'explore'
  const [places, setPlaces] = useState(() => placeService.getPlacesSync());
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showNotice, setShowNotice] = useState(false);
  /** 'api' when connected to live backend, 'mock' when using demo fallback, null until resolved */
  const [dataSource, setDataSource] = useState(null);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [isItineraryLoading, setIsItineraryLoading] = useState(false);
  const [itineraryError, setItineraryError] = useState(null);

  // Route Planning State
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [routeStartPlace, setRouteStartPlace] = useState(null);
  const [routeDestPlace, setRouteDestPlace] = useState(null);
  const [routeMode, setRouteMode] = useState('shuttle');
  const [activeRoute, setActiveRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Load all places from backend REST API (GET /api/places?limit=500)
  useEffect(() => {
    let isMounted = true;

    async function loadPlaces() {
      setLoading(true);
      setApiError(null);
      try {
        const result = await placeService.getPlaces({ limit: 500 });
        if (isMounted) {
          setPlaces(result.places);
          setDataSource(result.source || 'mock');
          if (result.error) {
            setApiError(result.error);
            setShowNotice(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err.message || 'Unable to load places. Please try again.');
          setShowNotice(true);
          setDataSource('mock');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPlaces();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter places based on active category and experience mode
  const visiblePlaces = useMemo(() => {
    let filtered = places;

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filterPlacesByCategory(places, selectedCategory);
    } else if (experienceMode === 'explore') {
      // In Explore Nashik mode with 'all', prioritize forts, tourist spots, caves, waterfalls, museums, nature
      filtered = places.filter((p) => EXPLORE_MODE_CATEGORIES.has(p.category));
    }

    // Keep selected place visible even if outside filtered category
    if (selectedPlace && !filtered.some((p) => p.id === selectedPlace.id)) {
      filtered = [...filtered, selectedPlace];
    }

    // Keep route endpoints visible even if outside filtered category
    if (activeRoute) {
      if (routeStartPlace && !filtered.some((p) => p.id === routeStartPlace.id)) {
        filtered = [...filtered, routeStartPlace];
      }
      if (routeDestPlace && !filtered.some((p) => p.id === routeDestPlace.id)) {
        filtered = [...filtered, routeDestPlace];
      }
    }

    return filtered;
  }, [places, selectedCategory, experienceMode, selectedPlace, activeRoute, routeStartPlace, routeDestPlace]);

  // Marker click handler on map
  const handleSelectPlaceFromMap = (place) => {
    if (!place) return;

    if (isRouteOpen) {
      if (routeStartPlace && routeStartPlace.id === place.id) {
        return;
      }
      setRouteDestPlace(place);
      if (routeStartPlace && routeStartPlace.id !== place.id) {
        calculateActiveRoute(routeStartPlace, place, routeMode);
      }
      return;
    }

    setSelectedPlace(place);
    setIsDetailsOpen(false);
    panToPlace(place);
  };

  // Search selection handler -> opens details panel directly & pans map
  const handleSelectPlaceFromSearch = (place) => {
    if (!place) return;

    if (isRouteOpen) {
      setRouteDestPlace(place);
      if (routeStartPlace && routeStartPlace.id !== place.id) {
        calculateActiveRoute(routeStartPlace, place, routeMode);
      }
      return;
    }

    setSelectedPlace(place);
    setIsDetailsOpen(true);
    panToPlace(place);
  };

  // Nearby search handler using GET /api/places/nearby
  const handleNearbySearch = useCallback(async (category = '') => {
    setLoading(true);
    try {
      // Determine center coordinates (from navigator.geolocation or default center)
      let centerLat = NASHIK_CENTER.lat;
      let centerLng = NASHIK_CENTER.lng;

      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          centerLat = position.coords.latitude;
          centerLng = position.coords.longitude;
        } catch {
          // Graceful fallback: use Nashik map center
          centerLat = NASHIK_CENTER.lat;
          centerLng = NASHIK_CENTER.lng;
        }
      }

      const result = await placeService.getNearbyPlaces({
        lat: centerLat,
        lng: centerLng,
        radius: 10000,
        category: category || ''
      });

      if (result.places && result.places.length > 0) {
        setPlaces(result.places);
        if (category) {
          setSelectedCategory(category);
        }
        if (mapRef.current?.fitPlaces) {
          mapRef.current.fitPlaces();
        }
      }
    } catch (err) {
      console.warn('[Home] Nearby search error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Route calculation helper using backend routeService (POST /api/routes)
  const calculateActiveRoute = useCallback(async (start, dest, mode) => {
    if (!start || !dest) {
      setRouteError('Please select both origin and destination locations.');
      return;
    }

    if (start.id === dest.id) {
      setRouteError('Start and destination locations must be different.');
      return;
    }

    setRouteLoading(true);
    setRouteError(null);

    try {
      const response = await routeService.calculateRoute({
        start,
        destination: dest,
        mode
      });

      if (response.success && response.data) {
        setActiveRoute(response.data);
        fitRoute(response.data);
      } else {
        setRouteError(response.error || 'Failed to compute route between selected points.');
      }
    } catch (err) {
      setRouteError(err.message || 'An error occurred while calculating the route.');
    } finally {
      setRouteLoading(false);
    }
  }, [fitRoute]);

  // Trigger route planning for a destination
  const handleStartRoute = useCallback((dest) => {
    if (!dest) return;

    // Pick an appropriate default origin (e.g. Central Bus Station or Ramkund)
    const defaultOrigin =
      places.find((p) => p.id !== dest.id && (p.category === 'transport' || p.category === 'bus_stand' || p.category === 'railway')) ||
      places.find((p) => p.id !== dest.id) ||
      places[0];

    setRouteDestPlace(dest);
    setRouteStartPlace(defaultOrigin);
    setIsDetailsOpen(false);
    setIsRouteOpen(true);
    setRouteError(null);

    if (defaultOrigin && dest && defaultOrigin.id !== dest.id) {
      calculateActiveRoute(defaultOrigin, dest, routeMode);
    }
  }, [places, routeMode, calculateActiveRoute]);

  // Handle places returned from AI Assistant
  const handleDisplayPlacesFromAI = useCallback((aiPlaces) => {
    if (!aiPlaces || aiPlaces.length === 0) return;
    if (aiPlaces.length === 1) {
      setSelectedPlace(aiPlaces[0]);
      panToPlace(aiPlaces[0]);
    } else {
      // If multiple places returned from AI, merge into view and fit bounds
      setPlaces((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newToAdd = aiPlaces.filter((p) => !existingIds.has(p.id));
        return [...newToAdd, ...prev];
      });
      if (mapRef.current?.fitPlaces) {
        setTimeout(() => mapRef.current?.fitPlaces?.(), 100);
      }
    }
  }, [panToPlace]);

  // Handle route returned from AI Assistant
  const handleDisplayRouteFromAI = useCallback((aiRoute) => {
    if (!aiRoute) return;
    setActiveRoute(aiRoute);
    setIsRouteOpen(true);
    fitRoute(aiRoute);
  }, [fitRoute]);

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-stone-100 text-stone-900">
      
      {/* Top Navigation Header */}
      <Header
        mode={mapMode}
        onToggleMode={setMapMode}
        places={places}
        onSelectPlace={handleSelectPlaceFromSearch}
        onNearbySearch={handleNearbySearch}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        dataSource={dataSource}
      />

      {/* Floating Category Filter Chips with Mode Switcher & 6 Groups */}
      <nav 
        className="fixed top-14 md:top-16 left-0 right-0 z-20 pointer-events-auto flex justify-center"
        aria-label="Category Filters"
      >
        <div className="max-w-7xl w-full">
          <CategoryFilters
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            mode={experienceMode}
            onToggleMode={setExperienceMode}
          />
        </div>
      </nav>

      {/* Main Map Viewport Area */}
      <main className="relative flex-1 w-full h-full pt-28 md:pt-32 flex flex-col">
        {/* Loading Indicator */}
        {loading && <PlacesLoadingView message="Loading places..." />}

        {/* Empty Category Results Notice */}
        {!loading && visiblePlaces.length === 0 && (
          <PlacesEmptyView
            categoryLabel={selectedCategory}
            onReset={() => setSelectedCategory('all')}
          />
        )}

        <MapContainer
          ref={mapRef}
          mode={mapMode}
          places={visiblePlaces}
          selectedPlace={selectedPlace}
          activeRoute={activeRoute}
          onSelectPlace={handleSelectPlaceFromMap}
          onToggleMode={setMapMode}
        />
      </main>

      {/* Notice banner when API is offline and using fallback */}
      {showNotice && (
        <ApiUnavailableNotice
          error={apiError || 'Unable to load places. Please try again.'}
          onDismiss={() => setShowNotice(false)}
        />
      )}

      {/* Stage 1: Compact Place Preview Card */}
      {selectedPlace && !isDetailsOpen && !isRouteOpen && (
        <PlacePreviewCard
          place={selectedPlace}
          onViewDetails={() => setIsDetailsOpen(true)}
          onGetDirections={handleStartRoute}
          onClose={() => setSelectedPlace(null)}
        />
      )}

      {/* Stage 2: Comprehensive Place Information Panel */}
      {selectedPlace && isDetailsOpen && !isRouteOpen && (
        <PlaceInfoPanel
          place={selectedPlace}
          onGetDirections={handleStartRoute}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedPlace(null);
          }}
        />
      )}

      {/* Interactive Route Directions Panel */}
      {isRouteOpen && (
        <RoutePanel
          places={places}
          startPlace={routeStartPlace}
          destPlace={routeDestPlace}
          activeRoute={activeRoute}
          onSelectStart={(p) => {
            setRouteStartPlace(p);
            if (p && routeDestPlace && p.id !== routeDestPlace.id) {
              calculateActiveRoute(p, routeDestPlace, routeMode);
            }
          }}
          onSelectDest={(p) => {
            setRouteDestPlace(p);
            if (routeStartPlace && p && routeStartPlace.id !== p.id) {
              calculateActiveRoute(routeStartPlace, p, routeMode);
            }
          }}
          onSwapPoints={() => {
            const prevStart = routeStartPlace;
            const prevDest = routeDestPlace;
            setRouteStartPlace(prevDest);
            setRouteDestPlace(prevStart);
            if (prevStart && prevDest && prevStart.id !== prevDest.id) {
              calculateActiveRoute(prevDest, prevStart, routeMode);
            }
          }}
          onChangeMode={(newMode) => {
            setRouteMode(newMode);
            if (routeStartPlace && routeDestPlace && routeStartPlace.id !== routeDestPlace.id) {
              calculateActiveRoute(routeStartPlace, routeDestPlace, newMode);
            }
          }}
          onCalculateRoute={() => calculateActiveRoute(routeStartPlace, routeDestPlace, routeMode)}
          onClearRoute={() => {
            setActiveRoute(null);
            setRouteError(null);
          }}
          onClose={() => {
            setIsRouteOpen(false);
            setActiveRoute(null);
            setRouteError(null);
          }}
          isLoading={routeLoading}
          error={routeError}
        />
      )}

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onSelectPlace={(place) => {
          setSelectedPlace(place);
          setIsDetailsOpen(true);
          panToPlace(place);
        }}
        onDisplayPlacesOnMap={handleDisplayPlacesFromAI}
        onDisplayRouteOnMap={handleDisplayRouteFromAI}
      />

      {/* Emergency Information Panel Modal */}
      <EmergencyPanel
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

    </div>
  );
}
