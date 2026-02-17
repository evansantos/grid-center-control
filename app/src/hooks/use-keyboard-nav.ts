'use client';

import { useEffect, useCallback, useState } from 'react';

export interface KeyBinding {
  key: string;
  modifiers?: ('ctrl' | 'meta' | 'shift' | 'alt')[];
  description: string;
  action: () => void;
  category?: string;
}

interface UseKeyboardNavOptions {
  bindings: KeyBinding[];
  enabled?: boolean;
}

export function useKeyboardNav({ bindings, enabled = true }: UseKeyboardNavOptions) {
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const handler = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    // Don't capture when typing in inputs
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    // Toggle cheatsheet with ?
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setShowCheatsheet(s => !s);
      return;
    }

    for (const binding of bindings) {
      const mods = binding.modifiers || [];
      const ctrl = mods.includes('ctrl') || mods.includes('meta');
      const shift = mods.includes('shift');
      const alt = mods.includes('alt');

      if (
        e.key.toLowerCase() === binding.key.toLowerCase() &&
        (ctrl ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey)) &&
        (shift ? e.shiftKey : !e.shiftKey) &&
        (alt ? e.altKey : !e.altKey)
      ) {
        e.preventDefault();
        binding.action();
        return;
      }
    }
  }, [bindings, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);

  return { showCheatsheet, setShowCheatsheet };
}
