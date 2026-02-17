'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';

interface OutputLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  timestamp: number;
}

const MOCK_COMMANDS: Record<string, () => OutputLine[]> = {
  help: () => [
    { text: 'Available commands:', type: 'info', timestamp: Date.now() },
    { text: '  help        Show this help message', type: 'output', timestamp: Date.now() },
    { text: '  status      Show agent statuses', type: 'output', timestamp: Date.now() },
    { text: '  ls          List workspace files', type: 'output', timestamp: Date.now() },
    { text: '  clear       Clear terminal output', type: 'output', timestamp: Date.now() },
    { text: '  whoami      Show current user', type: 'output', timestamp: Date.now() },
    { text: '  uptime      Show system uptime', type: 'output', timestamp: Date.now() },
    { text: '  ping <host> Ping a host', type: 'output', timestamp: Date.now() },
  ],
  status: () => [
    { text: 'Agent Statuses:', type: 'info', timestamp: Date.now() },
    { text: '  ● orchestrator   active   uptime 4h 23m', type: 'success', timestamp: Date.now() },
    { text: '  ● code-agent     active   uptime 2h 10m', type: 'success', timestamp: Date.now() },
    { text: '  ○ review-agent   idle     last seen 15m ago', type: 'output', timestamp: Date.now() },
    { text: '  ✗ deploy-agent   error    connection timeout', type: 'error', timestamp: Date.now() },
  ],
  ls: () => [
    { text: 'src/', type: 'info', timestamp: Date.now() },
    { text: '  components/', type: 'output', timestamp: Date.now() },
    { text: '  lib/', type: 'output', timestamp: Date.now() },
    { text: '  app/', type: 'output', timestamp: Date.now() },
    { text: 'package.json', type: 'output', timestamp: Date.now() },
    { text: 'tsconfig.json', type: 'output', timestamp: Date.now() },
    { text: 'tailwind.config.ts', type: 'output', timestamp: Date.now() },
  ],
  whoami: () => [
    { text: 'grid-dashboard-user', type: 'output', timestamp: Date.now() },
  ],
  uptime: () => [
    { text: `System uptime: ${Math.floor(Math.random() * 48)}h ${Math.floor(Math.random() * 60)}m`, type: 'success', timestamp: Date.now() },
  ],
};

function executeCommand(input: string): OutputLine[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();

  if (cmd === 'clear') return [];

  const handler = MOCK_COMMANDS[cmd];
  if (handler) return handler();

  if (cmd === 'ping') {
    const host = parts[1] || 'localhost';
    return [
      { text: `PING ${host}: 64 bytes, time=12.3ms`, type: 'success', timestamp: Date.now() },
      { text: `PING ${host}: 64 bytes, time=11.8ms`, type: 'success', timestamp: Date.now() },
      { text: `PING ${host}: 64 bytes, time=13.1ms`, type: 'success', timestamp: Date.now() },
      { text: `--- ${host} ping statistics: 3 packets, 0% loss, avg 12.4ms ---`, type: 'info', timestamp: Date.now() },
    ];
  }

  return [
    { text: `command not found: ${cmd}. Type "help" for available commands.`, type: 'error', timestamp: Date.now() },
  ];
}

function getLineClasses(type: OutputLine['type']): string {
  switch (type) {
    case 'input': return 'text-green-400';
    case 'error': return 'text-red-400';
    case 'success': return 'text-emerald-400';
    case 'info': return 'text-cyan-400';
    default: return 'text-gray-200';
  }
}

function highlightPaths(text: string): React.ReactNode {
  const pathRegex = /((?:\/[\w.-]+)+\/?|[\w.-]+\/[\w.-]+\/?)/g;
  const parts = text.split(pathRegex);
  if (parts.length <= 1) return text;
  return parts.map((part, i) =>
    pathRegex.test(part) ? (
      <span key={i} className="text-cyan-300">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function QuickTerminal() {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputLine[]>([
    { text: 'Grid Dashboard Terminal v1.0 — Type "help" to get started.', type: 'info', timestamp: Date.now() },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Global keyboard shortcut: Ctrl+`
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleExecute = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add to history (max 50)
    setHistory(prev => {
      const next = [trimmed, ...prev.filter(h => h !== trimmed)];
      return next.slice(0, 50);
    });
    setHistoryIndex(-1);

    if (trimmed.toLowerCase() === 'clear') {
      setOutput([]);
      setInput('');
      return;
    }

    const inputLine: OutputLine = { text: `$ ${trimmed}`, type: 'input', timestamp: Date.now() };
    const result = executeCommand(trimmed);

    setOutput(prev => [...prev, inputLine, ...result]);
    setInput('');
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIndex);
      setInput(history[newIndex]);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput('');
        return;
      }
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInput(history[newIndex]);
    }
  };

  return (
    <div className="w-full rounded-lg border border-gray-700 dark:border-gray-600 overflow-hidden bg-gray-900 dark:bg-gray-950 shadow-lg">
      {/* Header */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 hover:bg-gray-750 dark:hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono text-sm font-bold">&gt;_</span>
          <span className="text-gray-200 text-sm font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-xs font-mono hidden sm:inline">Ctrl+`</span>
          <span className="text-gray-400 text-xs">{isOpen ? '▼' : '▶'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col">
          {/* Output area */}
          <div
            ref={outputRef}
            className="h-64 sm:h-72 overflow-y-auto p-3 font-mono text-xs sm:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-700"
          >
            {output.map((line, i) => (
              <div key={i} className={`whitespace-pre-wrap break-all ${getLineClasses(line.type)}`}>
                {line.type === 'input' ? (
                  <span className="font-bold">{highlightPaths(line.text)}</span>
                ) : (
                  highlightPaths(line.text)
                )}
              </div>
            ))}
            {output.length === 0 && (
              <div className="text-gray-600 italic">Terminal cleared.</div>
            )}
          </div>

          {/* Input area */}
          <div className="flex items-end gap-2 p-2 border-t border-gray-700 dark:border-gray-800 bg-gray-850 dark:bg-gray-900">
            <span className="text-green-400 font-mono text-sm py-1.5 pl-1 select-none">$</span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              rows={1}
              className="flex-1 bg-transparent text-gray-100 font-mono text-sm outline-none resize-none placeholder-gray-600 py-1.5"
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => { setOutput([]); }}
                className="px-2.5 py-1.5 text-xs font-mono rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                title="Clear output"
              >
                Clear
              </button>
              <button
                onClick={handleExecute}
                className="px-3 py-1.5 text-xs font-mono rounded bg-green-700 hover:bg-green-600 text-white transition-colors font-medium"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
