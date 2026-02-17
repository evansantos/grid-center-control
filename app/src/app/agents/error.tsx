'use client';

import { useEffect } from 'react';
import { handleError } from '@/lib/error-handler';

export default function AgentsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { message, details } = handleError(error, 'agents');

  useEffect(() => { console.error('[agents]', error); }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-bold text-red-500">⚠️ Agents Page Error</h1>
        <p className="text-zinc-400">The Agents page encountered an error.</p>
        <p className="text-sm text-zinc-500">{message}</p>
        {error.digest && <p className="text-xs text-zinc-600 font-mono">Digest: {error.digest}</p>}
        {details && <pre className="text-xs text-zinc-600 text-left bg-zinc-900 p-3 rounded overflow-auto max-h-40">{details}</pre>}
        <button onClick={reset} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors">
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}
