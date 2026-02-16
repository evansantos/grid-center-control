'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  description: string;
  specReview: string | null;
  qualityReview: string | null;
}

export function TaskContent({ description, specReview, qualityReview }: Props) {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-blue-400">📝 Description</h2>
        <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50 prose prose-invert prose-sm max-w-none overflow-y-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {description}
          </ReactMarkdown>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <section>
          <h2 className="text-lg font-semibold mb-2">🔍 Spec Review</h2>
          <div className={`border rounded-lg p-4 bg-zinc-900/50 font-mono text-sm ${
            specReview?.startsWith('PASS') ? 'border-green-800 text-green-400' : specReview?.startsWith('FAIL') ? 'border-red-800 text-red-400' : 'border-zinc-800'
          }`}>
            {specReview ?? <span className="text-zinc-600">Pending</span>}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">✨ Quality Review</h2>
          <div className={`border rounded-lg p-4 bg-zinc-900/50 font-mono text-sm ${
            qualityReview?.startsWith('PASS') ? 'border-green-800 text-green-400' : qualityReview?.startsWith('FAIL') ? 'border-red-800 text-red-400' : 'border-zinc-800'
          }`}>
            {qualityReview ?? <span className="text-zinc-600">Pending</span>}
          </div>
        </section>
      </div>
    </>
  );
}
