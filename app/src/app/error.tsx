'use client';

import { useEffect } from 'react';
import { handleError } from '@/lib/error-handler';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { message, details, userMessage, suggestions } = handleError(error, 'root');

  useEffect(() => { console.error(error); }, [error]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="text-center space-y-6 max-w-2xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-red-500">⚠️ Application Error</h1>
          <p className="text-lg text-zinc-300">Grid Dashboard encountered an unexpected error</p>
        </div>

        {/* Purpose Clarification */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">What happened?</h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            The Grid Dashboard application failed to load properly. This error boundary caught a critical issue 
            that prevented the page from rendering normally.
          </p>
        </div>

        {/* User-friendly error message */}
        <div className="bg-red-950 border border-red-800 rounded-lg p-4 text-left">
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">Error Details</h3>
          <p className="text-red-200 text-sm">{userMessage}</p>
          {error.digest && (
            <p className="text-xs text-red-400 font-mono mt-2 opacity-70">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Recovery suggestions */}
        <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 text-left">
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">What you can do</h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          <button 
            onClick={reset} 
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            🔄 Try Again
          </button>
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-semibold transition-colors"
          >
            🏠 Go Home
          </button>
        </div>

        {/* Help text */}
        <div className="text-xs text-zinc-500 leading-relaxed">
          <p>
            If this error persists, check the browser console for technical details 
            or visit the <a href="/errors" className="text-blue-400 hover:text-blue-300 underline">Error Dashboard</a> 
            for system-wide error monitoring.
          </p>
        </div>
      </div>
    </div>
  );
}
