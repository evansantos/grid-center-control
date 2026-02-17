'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-bold text-red-500">⚠️ Something went wrong</h1>
        <p className="text-zinc-400">{error.message || 'An unexpected error occurred'}</p>
        {error.digest && <p className="text-xs text-zinc-600 font-mono">Digest: {error.digest}</p>}
        <button onClick={reset} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors">
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}
