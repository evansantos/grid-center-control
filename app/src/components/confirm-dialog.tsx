'use client';

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'default',
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmBg = variant === 'danger' ? 'var(--grid-danger)' : 'var(--grid-accent)';
  const confirmHover = variant === 'danger' ? 'var(--grid-error)' : undefined;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 400, padding: 24,
          backgroundColor: 'var(--grid-surface, #1a1a1a)',
          border: '1px solid var(--grid-border)',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          fontFamily: 'monospace',
        }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--grid-text)' }}>{title}</h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--grid-text-dim)', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            ref={cancelRef}
            onClick={onCancel}
            style={{
              padding: '8px 16px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
              border: '1px solid var(--grid-border)', background: 'transparent',
              color: 'var(--grid-text)', fontFamily: 'monospace',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
              border: 'none', background: confirmBg, color: '#fff', fontFamily: 'monospace',
            }}
            onMouseEnter={e => { if (confirmHover) e.currentTarget.style.background = confirmHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = confirmBg; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
