'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useKeyboardNav, type KeyBinding } from '@/hooks/use-keyboard-nav';
import { ShortcutCheatsheet } from './shortcut-cheatsheet';
import { useRouter } from 'next/navigation';

interface KeyboardNavContextValue {
  showCheatsheet: boolean;
  setShowCheatsheet: (v: boolean) => void;
}

const KeyboardNavContext = createContext<KeyboardNavContextValue>({
  showCheatsheet: false,
  setShowCheatsheet: () => {},
});

export function useKeyboardNavContext() {
  return useContext(KeyboardNavContext);
}

export function KeyboardNavProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const bindings: KeyBinding[] = useMemo(() => [
    { key: 'h', description: 'Go Home', action: () => router.push('/'), category: 'Navigation' },
    { key: 'a', description: 'Agents page', action: () => router.push('/agents'), category: 'Navigation' },
    { key: 'm', description: 'Metrics page', action: () => router.push('/metrics'), category: 'Navigation' },
    { key: 'c', description: 'Cost dashboard', action: () => router.push('/analytics/costs'), category: 'Navigation' },
    { key: 'k', modifiers: ['meta'], description: 'Command palette', action: () => {
      document.dispatchEvent(new CustomEvent('toggle-command-palette'));
    }, category: 'Actions' },
    { key: 'Escape', description: 'Close panel/modal', action: () => {
      document.dispatchEvent(new CustomEvent('close-panel'));
    }, category: 'Actions' },
    { key: '1', description: 'Select agent 1', action: () => selectAgent(0), category: 'Agents' },
    { key: '2', description: 'Select agent 2', action: () => selectAgent(1), category: 'Agents' },
    { key: '3', description: 'Select agent 3', action: () => selectAgent(2), category: 'Agents' },
    { key: '4', description: 'Select agent 4', action: () => selectAgent(3), category: 'Agents' },
    { key: '5', description: 'Select agent 5', action: () => selectAgent(4), category: 'Agents' },
  ], [router]);

  const { showCheatsheet, setShowCheatsheet } = useKeyboardNav({ bindings });

  return (
    <KeyboardNavContext.Provider value={{ showCheatsheet, setShowCheatsheet }}>
      {children}
      {showCheatsheet && (
        <ShortcutCheatsheet
          bindings={bindings}
          onClose={() => setShowCheatsheet(false)}
        />
      )}
    </KeyboardNavContext.Provider>
  );
}

function selectAgent(index: number) {
  // Dispatch custom event that LivingOffice can listen to
  document.dispatchEvent(new CustomEvent('select-agent-by-index', { detail: { index } }));
}
