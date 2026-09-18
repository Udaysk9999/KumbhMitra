import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';
import { normalizePlace } from '../places/placeUtils';

/**
 * Ask Mitra - AI Digital Guide Component
 * 
 * Connected to POST /api/ai/chat.
 * Grounded in verified Nashik and Trimbakeshwar database.
 * Supports location context, language selection, itinerary planning,
 * and interactive map highlights.
 */
export default function AIAssistant({
  isOpen,
  onClose,
  contextLocation = null,
  onClearContextLocation,
  onSelectPlace,
  onDisplayPlacesOnMap,
  onDisplayRouteOnMap
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Namaste! I am Mitra, your digital guide for Kumbh Mitra. Ask me about sacred temples, holy ghats, visitor facilities, or routes across Nashik and Trimbakeshwar.',
      timestamp: 'Just now',
      places: [],
      route: null
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // 'en' | 'hi' | 'mr'
  const [activeLocation, setActiveLocation] = useState(contextLocation);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync activeLocation with contextLocation prop
  useEffect(() => {
    if (contextLocation) {
      setActiveLocation(contextLocation);
    }
  }, [contextLocation]);

  // Auto-scroll on new messages or typing state changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const suggestions = [
    'Plan a one-day Nashik itinerary',
    'Tell me about Ram Kund',
    'What places are near Ram Kund?',
    'Tell me about Trimbakeshwar',
    'What temples should I visit?',
    'How do I get from Ram Kund to Trimbakeshwar?',
    'Plan a family-friendly itinerary'
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputText;
    if (!textToSend || !textToSend.trim() || isTyping) return;

    const userMsg = {
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setErrorNotice(null);

    // Build context object
    const context = {
      language: selectedLanguage,
      selectedLocation: activeLocation || undefined
    };

    try {
      const response = await apiService.chatWithAI(textToSend.trim(), context);

      const replyText = response.reply || response.data?.reply || 'Here is what I found for your request.';
      const rawPlaces = response.data?.places || response.places || [];
      const route = response.data?.route || response.route || null;

      const normalizedPlaces = Array.isArray(rawPlaces)
        ? rawPlaces.map(normalizePlace).filter(Boolean)
        : [];

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: replyText,
          places: normalizedPlaces,
          route: route || null,
          provider: response.provider || 'gemini',
          timestamp: 'Just now'
        }
      ]);

      if (normalizedPlaces.length > 0 && onDisplayPlacesOnMap) {
        onDisplayPlacesOnMap(normalizedPlaces);
      }

      if (route && onDisplayRouteOnMap) {
        onDisplayRouteOnMap(route);
      }
    } catch (err) {
      console.warn('[AskMitra] Chat error:', err.message);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, Mitra is temporarily unavailable. Please try again or explore places using the category filters.',
          places: [],
          route: null,
          isError: true,
          timestamp: 'Just now'
        }
      ]);
      setErrorNotice('Sorry, Mitra is temporarily unavailable. Please try again.');
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePlaceClick = (place) => {
    if (onSelectPlace) {
      onSelectPlace(place);
    }
  };

  const clearLocationContext = () => {
    setActiveLocation(null);
    if (onClearContextLocation) {
      onClearContextLocation();
    }
  };

  /**
   * Simple markdown-style text formatter (bold, bullet points, headers)
   */
  const formatMessageText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Headers (### or ##)
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-stone-900 text-xs mt-2 mb-1">
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-bold text-stone-900 text-sm mt-2.5 mb-1 text-amber-900">
            {trimmed.replace('## ', '')}
          </h3>
        );
      }

      // Bullet points (* or - or •)
      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
      const cleanLine = isBullet ? trimmed.replace(/^[\*\-•]\s+/, '') : line;

      // Handle bold **text**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-stone-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1.5 my-0.5">
            <span className="text-amber-600 select-none">•</span>
            <span className="flex-1">{renderedParts}</span>
          </div>
        );
      }

      return <p key={idx} className="my-0.5">{renderedParts}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Ask Mitra AI Digital Guide"
      >
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-stone-200 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center text-base shadow-sm">
              🕉️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-stone-900 text-sm">
                  Ask Mitra
                </h2>
                <span className="text-[10px] font-semibold bg-amber-200/70 text-amber-900 px-2 py-0.2 rounded-full border border-amber-300/60">
                  AI Digital Guide
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Nashik & Trimbakeshwar Kumbh Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-white rounded-lg p-0.5 border border-stone-200 shadow-xs">
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                  selectedLanguage === 'en'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('hi')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                  selectedLanguage === 'hi'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="हिंदी (Hindi)"
              >
                हि
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('mr')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                  selectedLanguage === 'mr'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="मराठी (Marathi)"
              >
                म
              </button>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              aria-label="Close Ask Mitra"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Location Context Pill (if active) */}
        {activeLocation && (
          <div className="px-4 py-1.5 bg-amber-100/60 border-b border-amber-200/80 flex items-center justify-between text-[11px] text-amber-900">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold">📍 Active Context:</span>
              <span className="font-bold underline truncate">{activeLocation}</span>
            </div>
            <button
              type="button"
              onClick={clearLocationContext}
              className="text-[10px] font-bold text-amber-800 hover:text-amber-950 px-1.5 py-0.5 rounded hover:bg-amber-200/60 transition-colors cursor-pointer"
              title="Clear location context"
            >
              Clear ✕
            </button>
          </div>
        )}

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
                className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-br-xs shadow-xs'
                    : msg.isError
                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-xs'
                    : 'bg-white text-stone-800 border border-stone-200 shadow-xs rounded-bl-xs'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div>{formatMessageText(msg.text)}</div>
                )}

                {/* Returned Places Cards */}
                {msg.places && msg.places.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-200/70 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                      <span>Found {msg.places.length} Location(s)</span>
                      {onDisplayPlacesOnMap && (
                        <button
                          type="button"
                          onClick={() => onDisplayPlacesOnMap(msg.places)}
                          className="text-amber-700 hover:text-amber-900 underline font-semibold normal-case cursor-pointer"
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
                        className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold hover:bg-amber-700 transition-colors cursor-pointer"
                      >
                        Show on Map
                      </button>
                    )}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-stone-400 mt-1 px-1">
                {msg.sender === 'user' ? 'You' : 'Mitra'} • {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-stone-200 w-fit text-stone-600 text-xs shadow-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-200"></span>
              <span className="ml-1 text-[11px] font-medium text-amber-900">Mitra is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Chips */}
        <div className="px-4 py-2 border-t border-stone-100 bg-white">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
            Suggested Inquiries
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
          className="p-3 border-t border-stone-200 bg-white flex items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeLocation
                ? `Ask Mitra about ${activeLocation}...`
                : 'Ask Mitra about temples, ghats, routes, itineraries...'
            }
            className="flex-1 max-h-24 px-3.5 py-2 bg-stone-50 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900 placeholder:text-stone-400 resize-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed flex-shrink-0 h-[34px]"
          >
            <span>Ask</span>
            <span>➔</span>
          </button>
        </form>
      </div>
    </div>
  );
}
