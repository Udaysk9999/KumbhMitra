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
import { placeService, filterPlacesByCategory } from '../places';
import { routeService } from '../services/routeService';
import useMapCamera from '../hooks/useMapCamera';

/**
 * Home Page Component
 * Main coordinator for the map-first AI KumbhMitra UI shell.
 * Integrates 2D map, normalized place discovery, category filtering,
 * place preview/details panels, and the backend-ready route visualizer.
 */
export default function Home() {
  const mapRef = useRef(null);
  const { panToPlace, fitRoute } = useMapCamera(mapRef);

  const [mapMode, setMapMode] = useState('2D');
  const [places, setPlaces] = useState(() => placeService.getPlacesSync());
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showNotice, setShowNotice] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // Route Planning State
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [routeStartPlace, setRouteStartPlace] = useState(null);
  const [routeDestPlace, setRouteDestPlace] = useState(null);
  const [routeMode, setRouteMode] = useState('shuttle');
  const [activeRoute, setActiveRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Load places from placeService (REST API if enabled, otherwise fallback)
  useEffect(() => {
    let isMounted = true;

    async function loadPlaces() {
      setLoading(true);
      try {
        const result = await placeService.getPlaces();
        if (isMounted) {
          setPlaces(result.places);
          if (result.error) {
            setApiError(result.error);
            setShowNotice(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err.message);
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

  // Filter places based on active category using normalized place layer
  const visiblePlaces = useMemo(() => {
    let filtered = filterPlacesByCategory(places, selectedCategory);

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
  }, [places, selectedCategory, selectedPlace, activeRoute, routeStartPlace, routeDestPlace]);

  // Marker click handler on map
  const handleSelectPlaceFromMap = (place) => {
    if (!place) return;

    if (isRouteOpen) {
      // If route panel is open, update destination (or swap if selecting origin)
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
      // If route panel is active, selecting from search sets destination
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

  // Route calculation helper using backend-ready routeService
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
      places.find((p) => p.id !== dest.id && (p.category === 'transport' || p.id === 'place_cbs_transit')) ||
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

  // Recalculate route on button trigger
  const handleCalculateRoute = () => {
    calculateActiveRoute(routeStartPlace, routeDestPlace, routeMode);
  };

  // Swap origin and destination
  const handleSwapRoutePoints = () => {
    const prevStart = routeStartPlace;
    const prevDest = routeDestPlace;
    setRouteStartPlace(prevDest);
    setRouteDestPlace(prevStart);

    if (prevStart && prevDest && prevStart.id !== prevDest.id) {
      calculateActiveRoute(prevDest, prevStart, routeMode);
    }
  };

  // Change travel mode
  const handleChangeRouteMode = (newMode) => {
    setRouteMode(newMode);
    if (routeStartPlace && routeDestPlace && routeStartPlace.id !== routeDestPlace.id) {
      calculateActiveRoute(routeStartPlace, routeDestPlace, newMode);
    }
  };

  // Handle origin selection in panel
  const handleSelectStartPoint = (place) => {
    setRouteStartPlace(place);
    if (place && routeDestPlace && place.id !== routeDestPlace.id) {
      calculateActiveRoute(place, routeDestPlace, routeMode);
    }
  };

  // Handle destination selection in panel
  const handleSelectDestPoint = (place) => {
    setRouteDestPlace(place);
    if (routeStartPlace && place && routeStartPlace.id !== place.id) {
      calculateActiveRoute(routeStartPlace, place, routeMode);
    }
  };

  // Clear route from map
  const handleClearRoute = () => {
    setActiveRoute(null);
    setRouteError(null);
  };

  // Close route panel entirely
  const handleCloseRoutePanel = () => {
    setIsRouteOpen(false);
    setActiveRoute(null);
    setRouteError(null);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-stone-100 text-stone-900">
      
      {/* Top Navigation Header */}
      <Header
        mode={mapMode}
        onToggleMode={setMapMode}
        places={places}
        onSelectPlace={handleSelectPlaceFromSearch}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Floating Category Filter Chips */}
      <nav 
        className="fixed top-14 md:top-16 left-0 right-0 z-20 pointer-events-auto flex justify-center"
        aria-label="Category Filters"
      >
        <div className="max-w-7xl w-full">
          <CategoryFilters
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </nav>

      {/* Main Map Viewport Area */}
      <main className="relative flex-1 w-full h-full pt-24 md:pt-28 flex flex-col">
        {/* Loading Indicator */}
        {loading && <PlacesLoadingView />}

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
          error={apiError}
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
          onSelectStart={handleSelectStartPoint}
          onSelectDest={handleSelectDestPoint}
          onSwapPoints={handleSwapRoutePoints}
          onChangeMode={handleChangeRouteMode}
          onCalculateRoute={handleCalculateRoute}
          onClearRoute={handleClearRoute}
          onClose={handleCloseRoutePanel}
          isLoading={routeLoading}
          error={routeError}
        />
      )}

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* Emergency Information Panel Modal */}
      <EmergencyPanel
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

    </div>
  );
}
