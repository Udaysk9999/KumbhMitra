import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';

/**
 * MOCK emergency data displayed when GET /api/emergency is unavailable.
 * Contains official India-wide emergency numbers (100, 108, 101) which are real.
 */
const DEMO_EMERGENCY_DATA = {
  source: 'demo',
  disclaimer: 'Verified Kumbh-specific emergency data will be connected once the backend emergency registry is available. The national hotlines below (100, 101, 108) are official India-wide numbers.',
  categories: [
    {
      id: 'ambulance',
      icon: '🚑',
      label: 'Medical Emergency',
      description: 'Ambulance dispatch, riverbank first aid, triage units',
      contacts: [
        { label: 'National Ambulance Helpline', number: '108', type: 'national' },
        { label: 'Nashik Civil Hospital Emergency', number: '0253-2579400', type: 'local' }
      ]
    },
    {
      id: 'police',
      icon: '🚓',
      label: 'Police & Security',
      description: 'Nashik Police Control Room, crowd management',
      contacts: [
        { label: 'Police Emergency', number: '100', type: 'national' },
        { label: 'Nashik District Police', number: '0253-2310100', type: 'local' }
      ]
    },
    {
      id: 'fire',
      icon: '🚒',
      label: 'Fire & Rescue',
      description: 'Fire department, disaster response units',
      contacts: [
        { label: 'Fire Emergency', number: '101', type: 'national' },
        { label: 'Nashik Fire Station', number: '0253-2572020', type: 'local' }
      ]
    },
    {
      id: 'hospital',
      icon: '🏥',
      label: 'Hospitals',
      description: '24×7 trauma centers, Kumbh medical camps',
      contacts: [
        { label: 'Nashik Civil Hospital', number: '0253-2579400', type: 'local' },
        { label: 'General Helpline', number: '112', type: 'national' }
      ]
    },
    {
      id: 'womens_helpline',
      icon: '👩',
      label: "Women's Safety",
      description: "24-hour women's helpline and safety assistance",
      contacts: [
        { label: "Women's Helpline", number: '1091', type: 'national' }
      ]
    },
    {
      id: 'help_center',
      icon: '🆘',
      label: 'Lost & Help Center',
      description: 'Lost pilgrims, information kiosks, administrative help',
      contacts: [
        { label: 'Tourist Helpline', number: '1363', type: 'national' }
      ]
    }
  ]
};

/**
 * EmergencyPanel
 *
 * Connects to GET /api/emergency when available.
 * Falls back to DEMO_EMERGENCY_DATA (national India numbers) if backend is offline.
 *
 * Props:
 *   isOpen   – boolean
 *   onClose  – callback
 */
export default function EmergencyPanel({ isOpen, onClose }) {
  const [emergencyData, setEmergencyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState(null); // 'live' | 'demo'
  const hasFetchedRef = useRef(false);

  // Fetch emergency data once when panel first opens
  useEffect(() => {
    if (!isOpen || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function fetchEmergency() {
      setLoading(true);
      try {
        const data = await apiService.getEmergency();
        if (data && data.categories && data.categories.length > 0) {
          setEmergencyData(data);
          setDataSource('live');
        } else {
          setEmergencyData(DEMO_EMERGENCY_DATA);
          setDataSource('demo');
        }
      } catch {
        // Backend emergency endpoint not available – use local demo data
        setEmergencyData(DEMO_EMERGENCY_DATA);
        setDataSource('demo');
      } finally {
        setLoading(false);
      }
    }

    fetchEmergency();
  }, [isOpen]);

  if (!isOpen) return null;

  const displayData = emergencyData || DEMO_EMERGENCY_DATA;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-red-200 flex flex-col max-h-[88vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Emergency Facilities and Services"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-red-100 bg-red-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center text-base shadow-sm">
              🚨
            </div>
            <div>
              <h2 className="font-bold text-red-950 text-sm">
                Emergency Information Hub
              </h2>
              <p className="text-[11px] text-red-700/80">
                Nashik &amp; Trimbakeshwar Kumbh 2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Data source badge */}
            {dataSource && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                dataSource === 'live'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-amber-50 border-amber-300 text-amber-700'
              }`}>
                {dataSource === 'live' ? '🟢 Live' : '🟡 Demo'}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              aria-label="Close emergency panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <span>⚠️</span>
            <span>Safety Notice</span>
          </div>
          <p className="leading-relaxed">
            {displayData.disclaimer ||
              'In a life-threatening emergency always call 112 (India national emergency). The contacts below are for reference.'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-stone-500">
              <div className="w-8 h-8 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              <p className="text-xs">Loading emergency services…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {displayData.categories.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-xl border border-stone-200 shadow-sm hover:border-red-300 transition-colors"
                >
                  {/* Category header */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl" aria-hidden="true">{item.icon}</span>
                    <span className="font-bold text-xs text-stone-900">{item.label}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug mb-2">
                    {item.description}
                  </p>

                  {/* Contact numbers */}
                  {item.contacts && item.contacts.length > 0 && (
                    <div className="space-y-1">
                      {item.contacts.map((contact, ci) => (
                        <a
                          key={ci}
                          href={`tel:${contact.number}`}
                          className="flex items-center justify-between px-2 py-1 rounded-lg bg-stone-50 hover:bg-red-50 border border-stone-200 hover:border-red-200 transition-colors group"
                          aria-label={`Call ${contact.label}: ${contact.number}`}
                        >
                          <span className="text-[10px] text-stone-600 group-hover:text-red-700 font-medium truncate pr-1">
                            {contact.label}
                          </span>
                          <span className="text-[11px] font-bold font-mono text-red-700 flex-shrink-0 flex items-center gap-1">
                            📞 {contact.number}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* If no contacts yet (future backend data) */}
                  {(!item.contacts || item.contacts.length === 0) && (
                    <div className="text-[10px] font-mono text-stone-400 mt-1">
                      Status: Integration Scheduled
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-stone-200 bg-white flex items-center justify-between gap-2">
          <p className="text-[10px] text-stone-400 italic">
            Always dial <strong>112</strong> in a life-threatening emergency.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex-shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
