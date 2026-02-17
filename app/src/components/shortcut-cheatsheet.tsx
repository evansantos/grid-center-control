'use client';

import { useEffect } from 'react';
import type { KeyBinding } from '@/hooks/use-keyboard-nav';

interface ShortcutCheatsheetProps {
  bindings: KeyBinding[];
  onClose: () => void;
}

export function ShortcutCheatsheet({ bindings, onClose }: ShortcutCheatsheetProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Group by category
  const grouped: Record<string, KeyBinding[]> = {};
  for (const b of bindings) {
    const cat = b.category || 'General';
    (grouped[cat] ??= []).push(b);
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono font-bold text-white">⌨️ Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-sm font-mono"
          >
            ESC
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {items.map((b, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm font-mono text-zinc-300">{b.description}</span>
                    <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono text-zinc-400">
                      {formatKey(b)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-zinc-800 pt-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-mono text-zinc-300">Toggle this panel</span>
              <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono text-zinc-400">
                ?
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatKey(binding: KeyBinding): string {
  const parts: string[] = [];
  if (binding.modifiers?.includes('meta') || binding.modifiers?.includes('ctrl')) parts.push('⌘');
  if (binding.modifiers?.includes('shift')) parts.push('⇧');
  if (binding.modifiers?.includes('alt')) parts.push('⌥');
  parts.push(binding.key.length === 1 ? binding.key.toUpperCase() : binding.key);
  return parts.join(' ');
}
