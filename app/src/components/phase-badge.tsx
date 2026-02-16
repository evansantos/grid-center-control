const PHASE_COLORS: Record<string, string> = {
  brainstorm: 'bg-purple-900/50 text-purple-300 border-purple-700',
  design: 'bg-blue-900/50 text-blue-300 border-blue-700',
  plan: 'bg-cyan-900/50 text-cyan-300 border-cyan-700',
  execute: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  review: 'bg-orange-900/50 text-orange-300 border-orange-700',
  done: 'bg-green-900/50 text-green-300 border-green-700',
  // Task statuses reuse some colors
  pending: 'bg-gray-900/50 text-gray-300 border-gray-700',
  in_progress: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  approved: 'bg-green-900/50 text-green-300 border-green-700',
  failed: 'bg-red-900/50 text-red-300 border-red-700',
};

export function PhaseBadge({ phase }: { phase: string }) {
  const colors = PHASE_COLORS[phase] ?? 'bg-gray-900/50 text-gray-300 border-gray-700';
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-mono uppercase rounded border ${colors}`}>
      {phase}
    </span>
  );
}
