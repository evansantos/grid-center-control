'use client'

import { useState } from 'react'

interface AgentStats {
  tasks: number
  errors: number
  avgResponse: number
  isTopActive: boolean
}

interface AchievementBadgesProps {
  agentId: string
  stats: AgentStats
}

interface Badge {
  id: string
  emoji: string
  name: string
  description: string
  check: (stats: AgentStats) => boolean
  color: string
}

const badges: Badge[] = [
  { id: 'century', emoji: '💯', name: 'Century', description: 'Completed 100+ tasks', check: s => s.tasks >= 100, color: 'bg-amber-500/20 border-amber-500/50 text-amber-400' },
  { id: 'flawless', emoji: '💎', name: 'Flawless', description: 'Zero errors recorded', check: s => s.errors === 0, color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' },
  { id: 'mvp', emoji: '👑', name: 'MVP', description: 'Most active agent', check: s => s.isTopActive, color: 'bg-purple-500/20 border-purple-500/50 text-purple-400' },
  { id: 'speed', emoji: '⚡', name: 'Speed Demon', description: 'Fastest avg response time', check: s => s.avgResponse < 200, color: 'bg-blue-500/20 border-blue-500/50 text-blue-400' },
]

export function AchievementBadges({ agentId, stats }: AchievementBadgesProps) {
  const [tooltip, setTooltip] = useState<string | null>(null)

  return (
    <div className="flex items-center gap-2">
      {badges.map(badge => {
        const unlocked = badge.check(stats)
        return (
          <div
            key={`${agentId}-${badge.id}`}
            className="relative"
            onMouseEnter={() => setTooltip(badge.id)}
            onMouseLeave={() => setTooltip(null)}
          >
            <div
              className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm transition-all ${
                unlocked
                  ? `${badge.color} shadow-sm`
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-600 grayscale'
              }`}
            >
              {badge.emoji}
            </div>
            {tooltip === badge.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-300 whitespace-nowrap z-10 shadow-lg">
                <span className="font-medium">{badge.name}</span>
                <span className="text-zinc-500"> — {badge.description}</span>
                {!unlocked && <span className="text-zinc-600"> (locked)</span>}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-700" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
