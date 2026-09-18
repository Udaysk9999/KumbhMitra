import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from '../components/Header';
import CategoryFilters from '../components/CategoryFilters';
import MapContainer from '../maps/MapContainer';
import PlacePreviewCard from '../components/PlacePreviewCard';
import PlaceInfoPanel from '../components/PlaceInfoPanel';
import RoutePanel from '../routes/RoutePanel';
import AIAssistant from '../components/AIAssistant';
import EmergencyPanel from '../components/EmergencyPanel';
import ItineraryPanel from '../components/ItineraryPanel';
import { PlacesLoadingView, PlacesEmptyView, ApiUnavailableNotice } from '../components/PlaceStateView';
import { placeService, filterPlacesByCategory, EXPLORE_MODE_CATEGORIES } from '../places';
import { routeService } from '../services/routeService';
import itineraryService from '../services/itineraryService';
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
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [showNotice, setShowNotice] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // Itinerary Planning State
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [selectedItineraryPlaceIds, setSelectedItineraryPlaceIds] = useState([]);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [activeItineraryDayIndex, setActiveItineraryDayIndex] = useState(0);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryError, setItineraryError] = useState(null);

  // Route Planning State
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [routeStartPlace, setRouteStartPlace] = useState(null);
  const [routeDestPlace, setRouteDestPlace] = useState(null);
  const [routeMode, setRouteMode] = useState('shuttle');
  const [activeRoute, setActiveRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Load places from backend REST API (GET /api/places?limit=500 or GET /api/places?category=...&limit=500)
  useEffect(() => {
    let isMounted = true;

    async function loadPlaces() {
      setLoading(true);
      setApiError(null);
      try {
        const categoryParam = selectedCategory && selectedCategory !== 'all' ? selectedCategory : '';
        const result = await placeService.getPlaces({ category: categoryParam, limit: 500 });
        if (isMounted) {
          setPlaces(result.places);
          if (result.error) {
            setApiError(result.error);
            setShowNotice(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err.message || 'Unable to load places. Please try again.');
          setShowNotice(true);
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
  }, [selectedCategory]);

  // Filter places based on active category and experience mode
  const visiblePlaces = useMemo(() => {
    let filtered = places;

    if (experienceMode === 'explore' && selectedCategory === 'all') {
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

  // Marker click handler on map - loads full place details via GET /api/places/:id
  const handleSelectPlaceFromMap = async (place) => {
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

    const placeId = place._id || place.id;
    if (placeId) {
      try {
        const detailed = await placeService.getPlaceById(placeId);
        if (detailed) {
          setSelectedPlace((curr) => (curr && (curr.id === place.id || curr._id === place._id) ? detailed : curr));
        }
      } catch (err) {
        console.warn('[Home] Failed to load full place details:', err.message);
      }
    }
  };

  // Search selection handler -> opens details panel directly, pans map, and fetches GET /api/places/:id
  const handleSelectPlaceFromSearch = async (place) => {
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

    const placeId = place._id || place.id;
    if (placeId) {
      try {
        const detailed = await placeService.getPlaceById(placeId);
        if (detailed) {
          setSelectedPlace((curr) => (curr && (curr.id === place.id || curr._id === place._id) ? detailed : curr));
        }
      } catch (err) {
        console.warn('[Home] Failed to load full place details:', err.message);
      }
    }
  };

  // Nearby search handler using GET /api/places/nearby?lat=...&lng=...&radius=5000
  const handleNearbySearch = useCallback(async (category = '') => {
    setLoading(true);
    setApiError(null);
    try {
      // Determine center coordinates (selected place, navigator.geolocation, or Nashik center)
      let centerLat = selectedPlace?.latitude || NASHIK_CENTER.lat;
      let centerLng = selectedPlace?.longitude || NASHIK_CENTER.lng;

      if (!selectedPlace && navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          centerLat = position.coords.latitude;
          centerLng = position.coords.longitude;
        } catch {
          centerLat = NASHIK_CENTER.lat;
          centerLng = NASHIK_CENTER.lng;
        }
      }

      const result = await placeService.getNearbyPlaces({
        lat: centerLat,
        lng: centerLng,
        radius: 5000,
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
      } else if (result.error) {
        setApiError(result.error);
        setShowNotice(true);
      }
    } catch (err) {
      console.warn('[Home] Nearby search error:', err.message);
      setApiError(err.message || 'Nearby search failed.');
      setShowNotice(true);
    } finally {
      setLoading(false);
    }
  }, [selectedPlace]);

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

  // Toggle place in itinerary selection
  const handleToggleItineraryPlace = useCallback((placeOrId) => {
    const id = typeof placeOrId === 'string' ? placeOrId : (placeOrId?._id || placeOrId?.id);
    if (!id) return;
    setSelectedItineraryPlaceIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  }, []);

  // Display itinerary day route on map
  const handleShowDayRouteOnMap = useCallback((dayData) => {
    if (!dayData || !dayData.places || dayData.places.length === 0) return;

    const allCoords = [];
    dayData.places.forEach((p) => {
      if (p.travelFromPrevious?.geometry?.coordinates) {
        allCoords.push(...p.travelFromPrevious.geometry.coordinates);
      } else if (p.place?.location?.coordinates) {
        allCoords.push(p.place.location.coordinates);
      }
    });

    const dayRoute = {
      id: `itinerary_day_${dayData.day}`,
      start: dayData.places[0]?.place,
      destination: dayData.places[dayData.places.length - 1]?.place,
      distanceKm: dayData.totalTravelDistance,
      durationMinutes: dayData.totalTravelDuration,
      geometry: {
        type: 'LineString',
        coordinates: allCoords
      },
      steps: dayData.places.map((p, idx) => ({
        stepIndex: idx + 1,
        instruction: `Stop ${p.order}: ${p.place.name} (${p.visitDuration} min visit)`
      }))
    };

    setActiveRoute(dayRoute);
    if (dayRoute.geometry.coordinates.length > 0) {
      fitRoute(dayRoute);
    }
  }, [fitRoute]);

  // Generate multi-day itinerary via backend POST /api/itinerary
  const handleGenerateItinerary = useCallback(async ({ days, placeIds, startLocation }) => {
    setItineraryLoading(true);
    setItineraryError(null);
    try {
      const result = await itineraryService.generateItinerary({ days, placeIds, startLocation });
      if (result.success && result.data) {
        setGeneratedItinerary(result.data);
        setActiveItineraryDayIndex(0);
        if (result.data.days?.[0]) {
          handleShowDayRouteOnMap(result.data.days[0]);
        }
      } else {
        setItineraryError(result.error || 'Failed to create itinerary.');
      }
    } catch (err) {
      setItineraryError(err.message || 'An error occurred while generating itinerary.');
    } finally {
      setItineraryLoading(false);
    }
  }, [handleShowDayRouteOnMap]);

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
        onOpenItinerary={() => setIsItineraryOpen(true)}
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
          onViewDetails={async () => {
            setIsDetailsOpen(true);
            const pid = selectedPlace._id || selectedPlace.id;
            if (pid) {
              try {
                const detailed = await placeService.getPlaceById(pid);
                if (detailed) setSelectedPlace(detailed);
              } catch (err) {
                console.warn('[Home] Failed to fetch full details:', err.message);
              }
            }
          }}
          onGetDirections={handleStartRoute}
          onClose={() => setSelectedPlace(null)}
        />
      )}

      {/* Stage 2: Comprehensive Place Information Panel */}
      {selectedPlace && isDetailsOpen && !isRouteOpen && (
        <PlaceInfoPanel
          place={selectedPlace}
          onGetDirections={handleStartRoute}
          onToggleItinerary={handleToggleItineraryPlace}
          isInItinerary={selectedPlace ? selectedItineraryPlaceIds.includes(selectedPlace._id || selectedPlace.id) : false}
          onAskMitra={(place) => {
            setIsAIOpen(true);
          }}
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

      {/* Ask Mitra AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        contextLocation={selectedPlace?.name || null}
        onClearContextLocation={() => {}}
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

      {/* Itinerary Planner Modal / Panel */}
      <ItineraryPanel
        isOpen={isItineraryOpen}
        onClose={() => setIsItineraryOpen(false)}
        places={places}
        onGenerateItinerary={handleGenerateItinerary}
        generatedItinerary={generatedItinerary}
        activeDayIndex={activeItineraryDayIndex}
        onSelectDay={(idx) => {
          setActiveItineraryDayIndex(idx);
          if (generatedItinerary?.days?.[idx]) {
            handleShowDayRouteOnMap(generatedItinerary.days[idx]);
          }
        }}
        onSelectPlace={(place) => {
          setSelectedPlace(place);
          setIsDetailsOpen(true);
          panToPlace(place);
        }}
        onShowRouteOnMap={handleShowDayRouteOnMap}
        selectedPlaceIds={selectedItineraryPlaceIds}
        onTogglePlaceId={handleToggleItineraryPlace}
        onClearSelectedPlaces={() => setSelectedItineraryPlaceIds([])}
        isLoading={itineraryLoading}
        error={itineraryError}
        mapCenter={NASHIK_CENTER}
      />

    </div>
  );
}
