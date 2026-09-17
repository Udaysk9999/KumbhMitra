import React, { useState } from 'react';

/**
 * AI Assistant Modal / Slide-over Component
 * Provides conversational guidance and itinerary simulation for Kumbh pilgrims.
 * In Phase 1, uses mock responses with explicit demo indicators.
 */
export default function AIAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Namaste! I am your AI KumbhMitra assistant. How can I assist your pilgrimage or visit across Nashik and Trimbakeshwar today?',
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const suggestions = [
    'Plan a 5-hour temple trip',
    'Find hospitals near me',
    'Find hotels near Trimbakeshwar',
    'Plan a low-walking itinerary'
  ];

  const handleSend = (queryText) => {
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

    // Simulate mock assistant response after brief delay
    setTimeout(() => {
      let mockReply = `Demonstration response for: "${textToSend}". In upcoming AI integration phases, KumbhMitra will analyze real-time crowd densities, temple aarti timings, and transit corridors to generate tailored answers.`;

      if (textToSend.includes('5-hour')) {
        mockReply = 'Suggested 5-Hour Pilgrimage: Begin at Trimbakeshwar Jyotirlinga (7:00 AM), take the dedicated shuttle along Trimbak Road to Panchavati (9:30 AM), visit Ramkund and Kalaram Temple, and conclude with Godavari River Aarti. (Demo Itinerary)';
      } else if (textToSend.includes('hospital')) {
        mockReply = 'Emergency Healthcare: Nashik District Civil Hospital is positioned along Trimbak Road with 24x7 trauma care. Additional field clinics are established at Tapovan and Ramkund. (Demo Query)';
      } else if (textToSend.includes('low-walking')) {
        mockReply = 'Low-Walking Route: Utilize the outer ring shuttle directly to CBS Bus Stand, then board the electric e-rickshaw connector to the barrier-free North Gate of Ramkund Ghat. (Demo Route)';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: mockReply,
          timestamp: 'Just now'
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[85vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="KumbhMitra AI Assistant"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-base shadow-sm">
              🤖
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-sm">
                KumbhMitra AI
              </h2>
              <p className="text-[11px] text-stone-500">
                Natural-language pilgrim guide (Phase 1 UI Demo)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            aria-label="Close AI Assistant"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-br-xs'
                    : 'bg-white text-stone-800 border border-stone-200/80 shadow-xs rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-stone-400 mt-1 px-1">
                {msg.sender === 'user' ? 'You' : 'AI Assistant'} • {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-2xl border border-stone-200 w-fit text-stone-500 text-xs animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-200"></span>
              <span className="ml-1 text-[11px]">Analyzing spatial context...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestions Chips */}
        <div className="px-4 py-2 border-t border-stone-100 bg-white">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
            Quick Prompts
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 hover:bg-amber-50 hover:text-amber-800 text-stone-700 border border-stone-200/70 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
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
            placeholder="Ask KumbhMitra..."
            aria-label="Ask KumbhMitra AI question"
            className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Send
          </button>
        </form>

        {/* Demo Disclaimer */}
        <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 text-[10px] text-stone-400 text-center">
          Mock AI interface for Phase 1. Real LLM inference will connect in the AI phase.
        </div>
      </div>
    </div>
  );
}
