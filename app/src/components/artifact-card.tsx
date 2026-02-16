'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArtifactCardProps {
  artifact: {
    id: string;
    type: string;
    content: string;
    status: string;
    feedback: string | null;
    created_at: string;
  };
  projectId: string;
  onAction?: () => void;
}

export function ArtifactCard({ artifact, projectId, onAction }: ArtifactCardProps) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const statusColors: Record<string, string> = {
    draft: 'text-gray-400',
    pending_approval: 'text-yellow-400',
    approved: 'text-green-400',
    rejected: 'text-red-400',
  };

  const statusIcons: Record<string, string> = {
    draft: '📝',
    pending_approval: '⏳',
    approved: '✅',
    rejected: '❌',
  };

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(true);
    await fetch(`/api/artifacts/${artifact.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, projectId, feedback: action === 'reject' ? feedback : undefined }),
    });
    setLoading(false);
    onAction?.();
  }

  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-mono uppercase text-zinc-500">{artifact.type}</span>
        <div className="flex items-center gap-2">
          <span>{statusIcons[artifact.status] ?? ''}</span>
          <span className={`text-sm font-mono ${statusColors[artifact.status] ?? ''}`}>
            {artifact.status}
          </span>
        </div>
      </div>

      <div className={`prose prose-invert prose-sm max-w-none mb-4 ${expanded ? '' : 'max-h-96'} overflow-y-auto`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {artifact.content}
        </ReactMarkdown>
      </div>

      {artifact.content.length > 2000 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-red-400 hover:text-red-300 font-mono mb-3"
        >
          {expanded ? '▲ Collapse' : '▼ Expand full content'}
        </button>
      )}

      {artifact.feedback && (
        <div className="bg-red-900/20 border border-red-900 rounded p-3 mb-3 text-sm">
          <strong>Feedback:</strong> {artifact.feedback}
        </div>
      )}

      {(artifact.status === 'draft' || artifact.status === 'pending_approval' || artifact.status === 'rejected') && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="px-3 py-1.5 bg-green-800 hover:bg-green-700 text-green-100 rounded text-sm font-mono disabled:opacity-50 cursor-pointer"
          >
            ✅ Approve
          </button>
          <input
            type="text"
            placeholder="Feedback (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-black border border-zinc-800 rounded text-sm font-mono text-zinc-300"
          />
          <button
            onClick={() => handleAction('reject')}
            disabled={loading}
            className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-red-100 rounded text-sm font-mono disabled:opacity-50 cursor-pointer"
          >
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );
}
