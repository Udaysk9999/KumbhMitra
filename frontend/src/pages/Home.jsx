<<<<<<< HEAD
import React, { useState, useEffect, useMemo } from 'react';
=======
import React, { useState, useMemo, useEffect, useCallback } from 'react';
>>>>>>> 38212d7 (frontend 1)
import Header from '../components/Header';
import CategoryFilters from '../components/CategoryFilters';
import MapContainer from '../maps/MapContainer';
import PlacePreviewCard from '../components/PlacePreviewCard';
import PlaceInfoPanel from '../components/PlaceInfoPanel';
import RoutePanel from '../routes/RoutePanel';
import AIAssistant from '../components/AIAssistant';
import EmergencyPanel from '../components/EmergencyPanel';
<<<<<<< HEAD
import { PlacesLoadingView, PlacesEmptyView, ApiUnavailableNotice } from '../components/PlaceStateView';
import { placeService, filterPlacesByCategory } from '../places';

/**
 * Home Page Component
 * Main coordinator for the map-first AI KumbhMitra UI shell.
 * Connects to the normalized place data layer with support for both mock and future backend API sources.
=======
import placeService from '../services/placeService';
import { generateDemoRoute } from '../routes/routeUtils';

/**
 * Home Page Component
 * Main coordinator for AI KumbhMitra UI shell.
 * Integrates 2D map, place discovery, category filtering, and interactive route visualizer.
>>>>>>> 38212d7 (frontend 1)
 */
export default function Home() {
  const [mapMode, setMapMode] = useState('2D');
  const [places, setPlaces] = useState(() => placeService.getInitialPlaces());
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

<<<<<<< HEAD
  // Place data layer states
  const [places, setPlaces] = useState(() => placeService.getPlacesSync());
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showNotice, setShowNotice] = useState(false);

  // Load places from placeService
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
    return filterPlacesByCategory(places, selectedCategory);
  }, [places, selectedCategory]);
=======
  // Route Planning State
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [routeStartPlace, setRouteStartPlace] = useState(null);
  const [routeDestPlace, setRouteDestPlace] = useState(null);
  const [routeMode, setRouteMode] = useState('shuttle');
  const [activeRoute, setActiveRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Load places via service abstraction
  useEffect(() => {
    let isMounted = true;
    placeService.getPlaces().then((res) => {
      if (isMounted && res.success && res.data) {
        setPlaces(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter places based on active category
  const visiblePlaces = useMemo(() => {
    let filtered = places;
    if (selectedCategory !== 'all') {
      const norm = selectedCategory.toLowerCase();
      filtered = places.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        if (cat === norm) return true;
        if ((norm === 'market' || norm === 'markets') && cat === 'shop') return true;
        if (norm === 'shop' && cat === 'market') return true;
        return false;
      });
    }

    // Keep selected place visible even if outside filtered category
    if (selectedPlace && !filtered.some((p) => p.id === selectedPlace.id)) {
      filtered = [...filtered, selectedPlace];
    }

    return filtered;
  }, [places, selectedCategory, selectedPlace]);

  // Marker click handler -> opens compact preview
  const handleSelectPlaceFromMap = (place) => {
    setSelectedPlace(place);
    setIsDetailsOpen(false);
  };

  // Search selection handler -> opens details panel directly & pans map
  const handleSelectPlaceFromSearch = (place) => {
    setSelectedPlace(place);
    setIsDetailsOpen(true);
  };

  // Trigger route planning for a destination
  const handleStartRoute = useCallback((dest) => {
    if (!dest) return;
    
    // Pick an appropriate default origin (e.g. Central Bus Station or Ramkund)
    const defaultOrigin = places.find(
      (p) => p.id !== dest.id && (p.category === 'transport' || p.id === 'place_cbs_transit')
    ) || places.find((p) => p.id !== dest.id) || places[0];

    setRouteDestPlace(dest);
    setRouteStartPlace(defaultOrigin);
    setIsDetailsOpen(false);
    setIsRouteOpen(true);
    setRouteError(null);

    // Calculate initial route
    if (defaultOrigin && dest && defaultOrigin.id !== dest.id) {
      setRouteLoading(true);
      setTimeout(() => {
        try {
          const route = generateDemoRoute(defaultOrigin, dest, routeMode);
          setActiveRoute(route);
        } catch (err) {
          setRouteError(err.message);
        } finally {
          setRouteLoading(false);
        }
      }, 150);
    }
  }, [places, routeMode]);

  // Calculate or recalculate route
  const handleCalculateRoute = () => {
    if (!routeStartPlace || !routeDestPlace) {
      setRouteError('Please select both start and destination locations.');
      return;
    }
    if (routeStartPlace.id === routeDestPlace.id) {
      setRouteError('Start and destination locations must be different.');
      return;
    }

    setRouteLoading(true);
    setRouteError(null);

    setTimeout(() => {
      try {
        const route = generateDemoRoute(routeStartPlace, routeDestPlace, routeMode);
        setActiveRoute(route);
      } catch (err) {
        setRouteError(err.message);
      } finally {
        setRouteLoading(false);
      }
    }, 200);
  };

  // Swap origin and destination
  const handleSwapRoutePoints = () => {
    const prevStart = routeStartPlace;
    const prevDest = routeDestPlace;
    setRouteStartPlace(prevDest);
    setRouteDestPlace(prevStart);

    if (prevStart && prevDest && prevStart.id !== prevDest.id) {
      try {
        const route = generateDemoRoute(prevDest, prevStart, routeMode);
        setActiveRoute(route);
        setRouteError(null);
      } catch (err) {
        setRouteError(err.message);
      }
    }
  };

  // Change travel mode
  const handleChangeRouteMode = (newMode) => {
    setRouteMode(newMode);
    if (routeStartPlace && routeDestPlace && routeStartPlace.id !== routeDestPlace.id) {
      try {
        const route = generateDemoRoute(routeStartPlace, routeDestPlace, newMode);
        setActiveRoute(route);
      } catch (err) {
        setRouteError(err.message);
      }
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
>>>>>>> 38212d7 (frontend 1)

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-stone-100 text-stone-900">
      
      {/* Top Navigation Header */}
      <Header
        mode={mapMode}
        onToggleMode={setMapMode}
        places={places}
<<<<<<< HEAD
        onSelectPlace={(place) => setSelectedPlace(place)}
=======
        onSelectPlace={handleSelectPlaceFromSearch}
>>>>>>> 38212d7 (frontend 1)
        onOpenAI={() => setIsAIOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Floating Category Filter Chips (Positioned below header) */}
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
          mode={mapMode}
          places={visiblePlaces}
          selectedPlace={selectedPlace}
          activeRoute={activeRoute}
          onSelectPlace={handleSelectPlaceFromMap}
          onToggleMode={setMapMode}
        />
      </main>

<<<<<<< HEAD
      {/* Optional Notice when API is offline and using fallback */}
      {showNotice && (
        <ApiUnavailableNotice
          error={apiError}
          onDismiss={() => setShowNotice(false)}
        />
      )}

      {/* Reusable Place Information Panel */}
      {selectedPlace && (
=======
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
>>>>>>> 38212d7 (frontend 1)
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
          onSelectStart={setRouteStartPlace}
          onSelectDest={setRouteDestPlace}
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
