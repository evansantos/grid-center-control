'use client';

import { useState, useEffect } from 'react';
import { OfficeThemeSelector } from '@/components/office-theme-selector';

export default function SettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('grid-sound-effects');
    if (stored !== null) setSoundEnabled(stored === 'true');
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('grid-sound-effects', String(next));
      return next;
    });
  };

  const replayOnboarding = () => {
    localStorage.removeItem('grid-onboarding-seen');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--grid-text)' }}>Settings</h1>

      <OfficeThemeSelector />

      {/* Sound Effects */}
      <div className="rounded-lg p-4 border" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--grid-text)' }}>Sound Effects</h3>
        <button
          onClick={toggleSound}
          className="flex items-center gap-3 text-sm"
          style={{ color: 'var(--grid-text-dim)' }}
        >
          <div
            className="w-10 h-5 rounded-full relative transition-colors"
            style={{ background: soundEnabled ? 'var(--grid-accent)' : 'var(--grid-border)' }}
          >
            <div
              className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
              style={{ left: soundEnabled ? '22px' : '2px' }}
            />
          </div>
          {soundEnabled ? '🔊 Sound effects on' : '🔇 Sound effects off'}
        </button>
      </div>

      {/* Onboarding */}
      <div className="rounded-lg p-4 border" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--grid-text)' }}>Onboarding</h3>
        <button
          onClick={replayOnboarding}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ background: 'var(--grid-accent)' }}
        >
          🎬 Replay Onboarding Tour
        </button>
        <p className="text-xs mt-2" style={{ color: 'var(--grid-text-dim)' }}>
          Resets the onboarding guide and reloads the page.
        </p>
      </div>
    </div>
  );
}
