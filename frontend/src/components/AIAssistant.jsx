import React, { useState } from 'react';
import apiService from '../services/api';
import { normalizePlace } from '../places/placeUtils';

/**
 * AI Assistant Component
 * Connected to POST /api/ai/chat.
 * Displays natural language replies, returned places with interactive map links,
 * and computed routes.
 */
export default function AIAssistant({
  isOpen,
  onClose,
  onSelectPlace,
  onDisplayPlacesOnMap,
  onDisplayRouteOnMap
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Namaste! I am your AI KumbhMitra assistant. Ask me about temples, ghats, forts, waterfalls, hospitals, parking, or routes across Nashik and Trimbakeshwar.',
      timestamp: 'Just now',
      places: [],
      route: null
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  if (!isOpen) return null;

  const suggestions = [
    'Find temples near Ram Kund',
    'Show forts near Nashik',
    'What tourist places can I visit?',
    'Find hospitals near Trimbakeshwar',
    'Show parking near Panchavati',
    'Find waterfalls',
    'Show hotels near Trimbakeshwar',
    'Find vegetarian restaurants'
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setErrorNotice(null);

    try {
      // Call real backend POST /api/ai/chat
      const response = await apiService.chatWithAI(textToSend);
      const { reply, places, route } = response.data || {};

      const normalizedPlaces = Array.isArray(places)
        ? places.map(normalizePlace).filter(Boolean)
        : [];

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: reply || 'Here is what I found for your request.',
          places: normalizedPlaces,
          route: route || null,
          timestamp: 'Just now'
        }
      ]);

      // If places returned, optionally notify parent to display them
      if (normalizedPlaces.length > 0 && onDisplayPlacesOnMap) {
        onDisplayPlacesOnMap(normalizedPlaces);
      }

      // If route returned, notify parent to display route
      if (route && onDisplayRouteOnMap) {
        onDisplayRouteOnMap(route);
      }

    } catch (err) {
      console.warn('[AIAssistant] Error calling AI chat endpoint:', err.message);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'AI assistant is temporarily unavailable. Please try again or explore places using the category filters.',
          places: [],
          route: null,
          isError: true,
          timestamp: 'Just now'
        }
      ]);
      setErrorNotice('AI assistant is temporarily unavailable.');
    } finally {
      setIsTyping(false);
    }
  };

  const handlePlaceClick = (place) => {
    if (onSelectPlace) {
      onSelectPlace(place);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[88vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="KumbhMitra AI Assistant"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center text-base shadow-sm">
              🤖
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-sm">
                KumbhMitra AI Assistant
              </h2>
              <p className="text-[11px] text-stone-500">
                Connected to Nashik & Trimbakeshwar Spatial Intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Close AI Assistant"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/40">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-br-xs'
                    : msg.isError
                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-xs'
                    : 'bg-white text-stone-800 border border-stone-200 shadow-xs rounded-bl-xs'
                }`}
              >
                {msg.text}

                {/* Returned Places Cards */}
                {msg.places && msg.places.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-200/70 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                      <span>Found {msg.places.length} Location(s)</span>
                      {onDisplayPlacesOnMap && (
                        <button
                          type="button"
                          onClick={() => onDisplayPlacesOnMap(msg.places)}
                          className="text-amber-700 hover:text-amber-900 underline font-semibold normal-case"
                        >
                          View all on map
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                      {msg.places.map((place) => (
                        <button
                          key={place.id}
                          type="button"
                          onClick={() => handlePlaceClick(place)}
                          className="text-left p-2 rounded-xl bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base flex-shrink-0" aria-hidden="true">
                              {place.categoryIcon || '📍'}
                            </span>
                            <div className="min-w-0 pr-1">
                              <div className="font-semibold text-stone-900 text-xs truncate group-hover:text-amber-900">
                                {place.name}
                              </div>
                              <div className="text-[10px] text-stone-500 truncate">
                                {place.region} • {place.categoryLabel || place.category}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full border border-stone-200 flex-shrink-0">
                            Show ➔
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Returned Route Card */}
                {msg.route && (
                  <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-amber-950 text-xs">
                        🧭 Computed Travel Route
                      </div>
                      <div className="text-[10px] text-amber-800">
                        {msg.route.distanceKm ? `${msg.route.distanceKm} km` : ''} 
                        {msg.route.durationMins ? ` • ~${msg.route.durationMins} min` : ''}
                      </div>
                    </div>
                    {onDisplayRouteOnMap && (
                      <button
                        type="button"
                        onClick={() => onDisplayRouteOnMap(msg.route)}
                        className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold hover:bg-amber-700 transition-colors"
                      >
                        Show on Map
                      </button>
                    )}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-stone-400 mt-1 px-1">
                {msg.sender === 'user' ? 'You' : 'AI KumbhMitra'} • {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-2xl border border-stone-200 w-fit text-stone-500 text-xs animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-200"></span>
              <span className="ml-1 text-[11px]">Searching Nashik & Trimbakeshwar database...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestions Chips */}
        <div className="px-4 py-2 border-t border-stone-100 bg-white">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
            Suggested Queries
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {suggestions.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 hover:bg-amber-50 hover:text-amber-800 text-stone-700 border border-stone-200/70 transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-stone-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about forts, temples, hospitals, hotels, routes..."
            className="flex-1 px-3.5 py-2 bg-stone-50 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900 placeholder:text-stone-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Ask</span>
            <span>➔</span>
          </button>
        </form>
      </div>
    </div>
  );
}
