import React, { useState } from 'react';
import { Cookie, Check, Shield } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const CookiePreferences: React.FC = () => {
  const [strictlyNecessary] = useState(true);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const { showToast } = useToast();

  const handleSave = () => {
    showToast('Cookie preferences updated', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="space-y-2 border-b border-white/8 pb-6">
        <span className="font-bold text-[#36D6C5] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Cookie className="w-4 h-4" />
          Data Preferences
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FF]">Cookie &amp; Storage Preferences</h1>
        <p className="text-xs text-[#9AA8BD]">
          Manage how MMX7 Image Studio stores local preferences and session states on your device.
        </p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Necessary */}
        <div className="p-5 rounded-2xl bg-[#121A2A] border border-white/8 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#F4F7FF]">Strictly Necessary Storage (Always Active)</h3>
            <p className="text-[#9AA8BD] leading-relaxed">
              Required for session authentication tokens, security authorization, and local theme/language configuration. These cannot be disabled.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#36D6C5]/20 text-[#36D6C5] font-bold text-[10px] uppercase shrink-0">
            Required
          </span>
        </div>

        {/* Functional */}
        <div className="p-5 rounded-2xl bg-[#121A2A] border border-white/8 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#F4F7FF]">Functional Preferences</h3>
            <p className="text-[#9AA8BD] leading-relaxed">
              Remembering your preferred image quality sliders, crop ratios, and editor canvas configurations between sessions.
            </p>
          </div>
          <input
            type="checkbox"
            checked={functional}
            onChange={(e) => setFunctional(e.target.checked)}
            className="w-4 h-4 rounded accent-[#6C63FF] mt-1 shrink-0"
          />
        </div>

        {/* Analytics */}
        <div className="p-5 rounded-2xl bg-[#121A2A] border border-white/8 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#F4F7FF]">Telemetry &amp; Crash Diagnostics</h3>
            <p className="text-[#9AA8BD] leading-relaxed">
              Anonymous performance error telemetry to diagnose broken canvas rendering or memory allocation faults on low-spec hardware.
            </p>
          </div>
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="w-4 h-4 rounded accent-[#6C63FF] mt-1 shrink-0"
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-6 py-2.5 px-6 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold transition-all"
        >
          Save Cookie Preferences
        </button>
      </div>
    </div>
  );
};
