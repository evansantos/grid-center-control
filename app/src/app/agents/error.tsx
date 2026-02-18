'use client';

import { useEffect } from 'react';
import { handleError } from '@/lib/error-handler';

export default function AgentsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { message, details, userMessage, suggestions } = handleError(error, 'agents');

  useEffect(() => { console.error('[agents]', error); }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="text-center space-y-6 max-w-2xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-red-500">🤖 Agents Dashboard Error</h1>
          <p className="text-lg text-zinc-300">Failed to load the AI agents management interface</p>
        </div>

        {/* Purpose Clarification */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">About the Agents Page</h2>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            The Agents page provides a centralized dashboard for managing and monitoring AI agents in the OpenClaw system. 
            Here you can:
          </p>
          <ul className="space-y-1 text-zinc-400 text-sm">
            <li className="flex items-center gap-2"><span className="text-green-500">•</span>View active agent sessions</li>
            <li className="flex items-center gap-2"><span className="text-green-500">•</span>Monitor agent performance and status</li>
            <li className="flex items-center gap-2"><span className="text-green-500">•</span>Review conversation histories</li>
            <li className="flex items-center gap-2"><span className="text-green-500">•</span>Manage agent configurations</li>
          </ul>
        </div>

        {/* User-friendly error message */}
        <div className="bg-red-950 border border-red-800 rounded-lg p-4 text-left">
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">What went wrong</h3>
          <p className="text-red-200 text-sm">{userMessage}</p>
          {error.digest && (
            <p className="text-xs text-red-400 font-mono mt-2 opacity-70">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Recovery suggestions */}
        <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 text-left">
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Troubleshooting steps</h3>
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
        <div className="flex gap-3 justify-center flex-wrap">
          <button 
            onClick={reset} 
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            🔄 Reload Agents
          </button>
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-semibold transition-colors"
          >
            🏠 Dashboard
          </button>
          <button 
            onClick={() => window.location.href = '/errors'} 
            className="px-6 py-2 bg-yellow-700 hover:bg-yellow-600 rounded-lg font-semibold transition-colors"
          >
            📊 View Errors
          </button>
        </div>

        {/* Help text */}
        <div className="text-xs text-zinc-500 leading-relaxed">
          <p>
            This error might be related to agent session files or communication issues. 
            Check the <a href="/errors" className="text-blue-400 hover:text-blue-300 underline">Error Dashboard</a> 
            for detailed system diagnostics and recent agent activity.
          </p>
        </div>

        {/* Technical details (development only) */}
        {details && process.env.NODE_ENV === 'development' && (
          <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-4 text-left">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Technical Details (Dev Mode)</h4>
            <pre className="text-xs text-zinc-400 overflow-auto max-h-32 whitespace-pre-wrap font-mono">
              {details}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
