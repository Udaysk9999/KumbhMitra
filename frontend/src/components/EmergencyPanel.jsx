import React from 'react';

/**
 * Emergency Services Panel Component
 * Provides rapid access to emergency facilities and civil protection categories.
 * Explicitly disclaims fake emergency numbers in accordance with safety standards.
 */
export default function EmergencyPanel({ isOpen, onClose }) {
  if (!isOpen) return null;

  const emergencyCategories = [
    { icon: '🚑', label: 'Ambulance', desc: 'Rapid medical response & riverbank emergency units' },
    { icon: '🚓', label: 'Police', desc: 'Nashik & Trimbakeshwar sector law enforcement' },
    { icon: '🚒', label: 'Fire & Safety', desc: 'Disaster management & rescue teams' },
    { icon: '🏥', label: 'Hospitals', desc: '24x7 trauma care centers & triage field tents' },
    { icon: '💊', label: 'Pharmacy', desc: '24-hour medical dispensaries & first aid' },
    { icon: '🆘', label: 'Help Center', desc: 'Lost & found, information kiosks & administrative help' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-red-200 flex flex-col max-h-[85vh] overflow-hidden"
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
                Nashik & Trimbakeshwar Kumbh 2027
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            aria-label="Close emergency panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mandatory Verification Notice */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <span>⚠️</span>
            <span>Safety Disclaimer</span>
          </div>
          <p className="leading-relaxed">
            Verified emergency information will be connected in a later phase. 
            Official hotlines, medical triage posts, and police control room numbers will be integrated directly from Kumbh Mela administration databases.
          </p>
        </div>

        {/* Emergency Categories Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-stone-50/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
            Planned Emergency Channels
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {emergencyCategories.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-red-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl" aria-hidden="true">{item.icon}</span>
                  <span className="font-bold text-xs text-stone-900">{item.label}</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  {item.desc}
                </p>
                <div className="mt-2 text-[10px] font-mono text-stone-400">
                  Status: Integration Scheduled
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button Footer */}
        <div className="p-3.5 border-t border-stone-200 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Close Emergency Panel
          </button>
        </div>
      </div>
    </div>
  );
}
