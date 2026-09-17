import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import CategoryFilters from '../components/CategoryFilters';
import MapContainer from '../maps/MapContainer';
import PlaceInfoPanel from '../components/PlaceInfoPanel';
import AIAssistant from '../components/AIAssistant';
import EmergencyPanel from '../components/EmergencyPanel';
import { MOCK_PLACES } from '../constants/mockPlaces';

/**
 * Home Page Component
 * Main coordinator for the map-first AI KumbhMitra UI shell.
 */
export default function Home() {
  const [mapMode, setMapMode] = useState('2D');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // Filter places based on active category
  const visiblePlaces = useMemo(() => {
    if (selectedCategory === 'all') {
      return MOCK_PLACES;
    }
    return MOCK_PLACES.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-stone-100 text-stone-900">
      
      {/* Top Navigation Header */}
      <Header
        mode={mapMode}
        onToggleMode={setMapMode}
        places={MOCK_PLACES}
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
        <MapContainer
          mode={mapMode}
          places={visiblePlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={(place) => setSelectedPlace(place)}
          onToggleMode={setMapMode}
        />
      </main>

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
