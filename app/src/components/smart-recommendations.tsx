'use client';

import { useState, useEffect, useCallback } from 'react';
/* Inline SVG icons (no lucide dependency) */
function IconLightbulb({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" /><path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}
function IconWarning({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  );
}
function IconSparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}
function IconZap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RecommendationType = 'info' | 'warning' | 'suggestion' | 'action';

interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Color / icon map                                                   */
/* ------------------------------------------------------------------ */

const TYPE_CONFIG: Record<
  RecommendationType,
  { icon: typeof IconLightbulb; bg: string; border: string; text: string; badge: string }
> = {
  info: {
    icon: IconLightbulb,
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    border: 'border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  },
  warning: {
    icon: IconWarning,
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    border: 'border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  },
  suggestion: {
    icon: IconSparkles,
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    border: 'border-purple-500/30',
    text: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  },
  action: {
    icon: IconZap,
    bg: 'bg-green-500/10 dark:bg-green-500/15',
    border: 'border-green-500/30',
    text: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-500/20 text-green-700 dark:text-green-300',
  },
};

/* ------------------------------------------------------------------ */
/*  Mock recommendation engine                                         */
/* ------------------------------------------------------------------ */

function generateRecommendations(): Recommendation[] {
  return [
    {
      id: 'spec-idle',
      type: 'action',
      title: 'SPEC is idle',
      description: '3 tasks sitting in backlog — assign them to SPEC to keep the sprint moving.',
      actionLabel: 'Assign tasks',
    },
    {
      id: 'dev-done-review',
      type: 'suggestion',
      title: 'DEV finished work',
      description: 'DEV completed its current task. BUG should review the output before merging.',
      actionLabel: 'Trigger review',
    },
    {
      id: 'high-cost',
      type: 'warning',
      title: 'High token spend',
      description: 'Opus usage is 3× above daily average. Consider switching to a cheaper model for routine tasks.',
      actionLabel: 'View costs',
    },
    {
      id: 'stale-pr',
      type: 'info',
      title: 'PR awaiting merge',
      description: 'PR #42 has been approved for 2 hours with no merge. Auto-merge candidate.',
      actionLabel: 'View PR',
    },
    {
      id: 'blocked-task',
      type: 'warning',
      title: 'Task blocked',
      description: 'Task AUT-07 is blocked on a dependency. Escalate or reassign to unblock the pipeline.',
      actionLabel: 'Escalate',
    },
    {
      id: 'agent-error-rate',
      type: 'action',
      title: 'BUG error spike',
      description: 'BUG agent hit 3 errors in the last hour. Restart or check logs.',
      actionLabel: 'View logs',
    },
    {
      id: 'idle-agents',
      type: 'suggestion',
      title: 'Multiple agents idle',
      description: 'DEV, SPEC, and DOC are all idle. Consider spawning a new sprint or pausing to save costs.',
      actionLabel: 'Spawn sprint',
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

const MAX_VISIBLE = 4;
const ROTATE_INTERVAL = 8000;

function useSmartRecommendations() {
  const [all] = useState<Recommendation[]>(generateRecommendations);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [offset, setOffset] = useState(0);

  const active = all.filter((r) => !dismissed.has(r.id));

  // Auto-rotate when there are more than MAX_VISIBLE
  useEffect(() => {
    if (active.length <= MAX_VISIBLE) return;
    const timer = setInterval(() => {
      setOffset((o) => o + 1);
    }, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [active.length]);

  const visible = active.length <= MAX_VISIBLE
    ? active
    : Array.from({ length: MAX_VISIBLE }, (_, i) => active[(offset + i) % active.length]);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  }, []);

  return { visible, dismiss, total: active.length };
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function RecommendationCard({
  rec,
  onDismiss,
}: {
  rec: Recommendation;
  onDismiss: (id: string) => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const cfg = TYPE_CONFIG[rec.type];
  const Icon = cfg.icon;

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(rec.id), 300);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 rounded-lg border p-3
        transition-all duration-300 ease-in-out
        ${cfg.bg} ${cfg.border}
        ${leaving ? 'opacity-0 scale-95 translate-x-2' : 'opacity-100 scale-100 translate-x-0'}
      `}
    >
      {/* Icon */}
      <div className={`mt-0.5 shrink-0 rounded-md p-1.5 ${cfg.badge}`}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.text}`}>
            {rec.type}
          </span>
        </div>
        <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {rec.title}
        </p>
        <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {rec.description}
        </p>
        <button
          className={`mt-2 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors
            ${cfg.badge} hover:opacity-80`}
          onClick={rec.onAction}
        >
          {rec.actionLabel}
        </button>
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        aria-label="Dismiss recommendation"
      >
        <IconX className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported widget                                                    */
/* ------------------------------------------------------------------ */

export function SmartRecommendations() {
  const { visible, dismiss, total } = useSmartRecommendations();

  if (visible.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
        No recommendations right now — everything looks good ✓
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {visible.map((rec) => (
        <RecommendationCard key={rec.id} rec={rec} onDismiss={dismiss} />
      ))}
      {total > MAX_VISIBLE && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center mt-1">
          Showing {MAX_VISIBLE} of {total} recommendations · auto-rotating
        </p>
      )}
    </div>
  );
}
