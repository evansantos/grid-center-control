'use client';

interface ActivityData {
  status?: 'active' | 'recent' | 'idle';
  messageCount?: number;
  task?: string;
}

interface Badge {
  emoji: string;
  label: string;
  description: string;
}

function computeBadges(agentId: string, activity: ActivityData): Badge[] {
  const badges: Badge[] = [];
  const mc = activity.messageCount ?? 0;

  if (mc >= 100) {
    badges.push({ emoji: '🏆', label: '100 Tasks', description: 'Completed 100+ tasks' });
  }
  if (mc >= 50) {
    badges.push({ emoji: '⚡', label: 'Most Active', description: 'Over 50 messages today' });
  }
  if (activity.status === 'active') {
    badges.push({ emoji: '🔥', label: 'On Fire', description: 'Currently on an active streak' });
  }
  if (activity.status === 'idle' && mc === 0) {
    badges.push({ emoji: '✅', label: 'Zero Errors', description: 'Clean record — no errors reported' });
  }

  return badges;
}

export function AchievementBadges({ agentId, activity }: { agentId: string; activity: ActivityData }) {
  const badges = computeBadges(agentId, activity);
  if (badges.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 1, justifyContent: 'center', marginTop: 1 }}>
      {badges.map((b) => (
        <span
          key={b.label}
          style={{
            fontSize: 7,
            cursor: 'default',
            position: 'relative',
          }}
          title={`${b.label}: ${b.description}`}
          className="achievement-badge"
        >
          {b.emoji}
        </span>
      ))}
      <style>{`
        .achievement-badge { position: relative; }
        .achievement-badge::after {
          content: attr(title);
          position: absolute;
          bottom: 110%;
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: #e5e7eb;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 7px;
          font-family: monospace;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s;
          z-index: 100;
        }
        .achievement-badge:hover::after {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
