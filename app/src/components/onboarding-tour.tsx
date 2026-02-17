'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'grid-onboarding-seen';

interface TourStep {
  title: string;
  description: string;
  selector?: string;
  position: 'top' | 'bottom' | 'center';
}

const STEPS: TourStep[] = [
  { title: '🏢 This is the Office', description: 'Visit /office to see your agents working in real-time.', selector: 'a[href="/office"]', position: 'bottom' },
  { title: '👤 Click an Agent', description: 'In the living office, click any agent to see their details and status.', position: 'center' },
  { title: '⌨️ Use ⌘K', description: 'Press ⌘K (or Ctrl+K) anytime to open the command palette for quick navigation.', position: 'center' },
  { title: '🩺 Check Health', description: 'Visit the health page to monitor system status and agent health.', selector: 'a[href="/reports"]', position: 'bottom' },
  { title: '⚙️ Customize Layout', description: 'Head to Settings to customize escalation rules and preferences.', selector: 'a[href="/settings/escalation"]', position: 'bottom' },
];

export function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'true') {
        setVisible(true);
      }
    } catch {}
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
  }, []);

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <>
      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 9998,
      }} onClick={dismiss} />

      {/* Tooltip */}
      <div style={{
        position: 'fixed',
        zIndex: 9999,
        ...(current.position === 'center'
          ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
          : { top: 60, left: '50%', transform: 'translateX(-50%)' }),
        background: 'var(--grid-surface, #1a1a2e)',
        border: '1px solid var(--grid-border, #333)',
        borderRadius: 12,
        padding: '20px 24px',
        maxWidth: 360,
        width: '90vw',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontSize: 11, color: 'var(--grid-text-dim, #888)', marginBottom: 4 }}>
          Step {step + 1} of {STEPS.length}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--grid-text, #fff)' }}>
          {current.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--grid-text-dim, #aaa)', lineHeight: 1.5, marginBottom: 16 }}>
          {current.description}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={dismiss} style={{
            background: 'none', border: 'none', color: 'var(--grid-text-dim, #888)',
            cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
          }}>
            Skip tour
          </button>
          <button onClick={next} style={{
            background: 'var(--grid-accent, #e74c3c)', color: '#fff', border: 'none',
            borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13,
            fontWeight: 600, fontFamily: 'inherit',
          }}>
            {step < STEPS.length - 1 ? 'Next' : 'Done'}
          </button>
        </div>
      </div>
    </>
  );
}

/** Call this to reset the tour flag and trigger a re-show */
export function replayOnboardingTour() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  window.dispatchEvent(new Event('grid-replay-tour'));
}

export function OnboardingTourWithReplay() {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const handler = () => setKey(k => k + 1);
    window.addEventListener('grid-replay-tour', handler);
    return () => window.removeEventListener('grid-replay-tour', handler);
  }, []);

  return <OnboardingTour key={key} />;
}
