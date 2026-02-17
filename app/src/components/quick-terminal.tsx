'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';

export function QuickTerminal() {
  const [visible, setVisible] = useState(false);
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLPreElement>(null);

  const execute = useCallback(async () => {
    const cmd = command.trim();
    if (!cmd) return;

    setHistory(prev => {
      const next = prev.filter(h => h !== cmd);
      next.unshift(cmd);
      return next.slice(0, 50);
    });
    setHistoryIndex(-1);
    setLoading(true);
    setOutput(prev => prev + `\n$ ${cmd}\n`);
    setCommand('');

    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      setOutput(prev => prev + (data.output || data.error || '(no output)') + '\n');
    } catch (e: any) {
      setOutput(prev => prev + `Error: ${e.message}\n`);
    } finally {
      setLoading(false);
      setTimeout(() => {
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }, 50);
    }
  }, [command]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      execute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const next = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(next);
        setCommand(history[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const next = historyIndex - 1;
        setHistoryIndex(next);
        setCommand(history[next]);
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setVisible(v => !v)}
        className="fixed bottom-4 right-4 z-50 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-lg px-3 py-2 text-sm font-mono transition-colors"
        title="Toggle Terminal"
      >
        {visible ? '✕ Terminal' : '⌨ Terminal'}
      </button>

      {visible && (
        <div className="fixed bottom-14 right-4 z-50 w-[560px] max-w-[90vw] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700">
            <span className="text-xs font-semibold text-zinc-400">Quick Terminal</span>
            <button
              onClick={() => setOutput('')}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Clear
            </button>
          </div>

          <pre
            ref={outputRef}
            className="flex-1 p-3 text-xs text-green-400 font-mono overflow-auto max-h-64 min-h-[120px] whitespace-pre-wrap bg-zinc-950"
          >
            {output || 'Ready. Type a command and press Enter.\n'}
          </pre>

          <div className="flex border-t border-zinc-700">
            <textarea
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              rows={1}
              className="flex-1 bg-zinc-800 text-white text-sm font-mono px-3 py-2 resize-none outline-none placeholder-zinc-500"
              disabled={loading}
            />
            <button
              onClick={execute}
              disabled={loading || !command.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium transition-colors"
            >
              {loading ? '...' : 'Run'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
