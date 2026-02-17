'use client';

import { useState, useEffect } from 'react';

interface SpeechBubbleProps {
  text: string;
  color?: string;
  position?: 'top' | 'bottom';
  visible?: boolean;
  maxWidth?: number;
  autoHide?: number; // ms, 0 = no auto-hide
}

export function SpeechBubble({
  text,
  color = 'var(--grid-success)',
  position = 'top',
  visible = true,
  maxWidth = 160,
  autoHide = 5000,
}: SpeechBubbleProps) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (visible && autoHide > 0) {
      const t = setTimeout(() => setShow(false), autoHide);
      return () => clearTimeout(t);
    }
  }, [visible, autoHide, text]);

  if (!show || !text) return null;

  const isTop = position === 'top';

  return (
    <div
      style={{
        position: 'absolute',
        [isTop ? 'bottom' : 'top']: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: isTop ? 4 : undefined,
        marginTop: !isTop ? 4 : undefined,
        zIndex: 100,
        pointerEvents: 'none',
        animation: 'bubbleFadeIn 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes bubbleFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(${isTop ? '4px' : '-4px'}); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div
        style={{
          backgroundColor: 'var(--grid-surface)',
          border: `1px solid ${color}40`,
          borderRadius: 8,
          padding: '3px 8px',
          maxWidth,
          position: 'relative',
          boxShadow: `0 2px 8px ${color}20`,
        }}
      >
        <span
          style={{
            fontSize: 8,
            fontFamily: 'monospace',
            color: 'var(--grid-text)',
            lineHeight: 1.3,
            display: 'block',
            wordBreak: 'break-word',
          }}
        >
          {text}
        </span>
        {/* Triangle pointer */}
        <div
          style={{
            position: 'absolute',
            [isTop ? 'bottom' : 'top']: -5,
            left: '50%',
            transform: `translateX(-50%) ${isTop ? '' : 'rotate(180deg)'}`,
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `5px solid ${color}40`,
          }}
        />
      </div>
    </div>
  );
}
