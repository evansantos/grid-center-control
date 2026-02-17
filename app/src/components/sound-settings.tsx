'use client';

import { useState, useEffect } from 'react';
import {
  isSoundEnabled, setSoundEnabled,
  getVolume, setVolume,
  playNotification, playTaskComplete, playError, playSpawn,
} from '../lib/sound-effects';

export default function SoundSettings() {
  const [enabled, setEnabled] = useState(true);
  const [vol, setVol] = useState(30);

  useEffect(() => {
    setEnabled(isSoundEnabled());
    setVol(Math.round(getVolume() * 100));
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
  };

  const changeVol = (v: number) => {
    setVol(v);
    setVolume(v / 100);
  };

  const btn = (label: string, fn: () => void) => (
    <button
      onClick={fn}
      style={{
        background: 'var(--grid-surface)',
        border: '1px solid var(--grid-border)',
        borderRadius: 6,
        padding: '6px 12px',
        color: 'var(--grid-text)',
        cursor: 'pointer',
        fontSize: 12,
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ fontSize: 14, color: 'var(--grid-text)' }}>Sound Effects</label>
        <button
          onClick={toggle}
          style={{
            background: enabled ? 'var(--grid-accent, #3b82f6)' : 'var(--grid-surface)',
            border: '1px solid var(--grid-border)',
            borderRadius: 12,
            width: 44,
            height: 24,
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: enabled ? 22 : 3,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
            }}
          />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ fontSize: 13, color: 'var(--grid-text-dim)', minWidth: 60 }}>Volume</label>
        <input
          type="range"
          min={0}
          max={100}
          value={vol}
          onChange={(e) => changeVol(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: 12, color: 'var(--grid-text-dim)', minWidth: 36, textAlign: 'right' }}>{vol}%</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {btn('🔔 Notification', playNotification)}
        {btn('✅ Complete', playTaskComplete)}
        {btn('❌ Error', playError)}
        {btn('🚀 Spawn', playSpawn)}
      </div>
    </div>
  );
}
