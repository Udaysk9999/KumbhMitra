import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import CategoryFilters from '../components/CategoryFilters';
import MapContainer from '../components/MapContainer';
import PlaceInfoPanel from '../components/PlaceInfoPanel';
import AIAssistant from '../components/AIAssistant';
import EmergencyPanel from '../components/EmergencyPanel';
import { PlacesLoadingView, PlacesEmptyView, ApiUnavailableNotice } from '../components/PlaceStateView';
import { placeService, filterPlacesByCategory } from '../places';

/**
 * Home Page Component
 * Main coordinator for the map-first AI KumbhMitra UI shell.
 * Connects to the normalized place data layer with support for both mock and future backend API sources.
 */
export default function Home() {
  const [mapMode, setMapMode] = useState('2D');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

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

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-stone-100 text-stone-900">
      
      {/* Top Navigation Header */}
      <Header
        mode={mapMode}
        onToggleMode={setMapMode}
        places={places}
        onSelectPlace={(place) => setSelectedPlace(place)}
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
          onSelectPlace={(place) => setSelectedPlace(place)}
        />
      </main>

      {/* Optional Notice when API is offline and using fallback */}
      {showNotice && (
        <ApiUnavailableNotice
          error={apiError}
          onDismiss={() => setShowNotice(false)}
        />
      )}

      {/* Reusable Place Information Panel */}
      {selectedPlace && (
        <PlaceInfoPanel
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
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
