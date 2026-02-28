import React, { useState, useEffect } from 'react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'

const rankColors = {
  1: 'text-sunset-gold',
  2: 'text-warm-gray',
  3: 'text-burnt-orange',
}

export default function Scoreboard({ members = [] }) {
  const [animate, setAnimate] = useState(false)

  // Trigger animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Sort by most completed (descending)
  const sorted = [...members].sort((a, b) => (b.moves_completed || 0) - (a.moves_completed || 0))

  // Determine if anyone has started (for "First Mover" badge)
  const firstMoverUserId = sorted.find((m) => (m.moves_completed || 0) > 0)?.user_id || null

  return (
    <div className="space-y-2">
      {sorted.map((member, index) => {
        const rank = index + 1
        const completed = member.moves_completed || 0
        const total = member.total_moves || 20
        const percent = total > 0 ? (completed / total) * 100 : 0
        const isFirstMover = member.user_id === firstMoverUserId && completed > 0

        return (
          <div
            key={member.user_id}
            className="flex items-center gap-3 bg-warm-white rounded-xl border border-light-warm-gray p-3 animate-fade-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {/* Rank */}
            <span
              className={[
                'font-display text-lg w-7 text-center shrink-0',
                rankColors[rank] || 'text-warm-gray',
              ].join(' ')}
            >
              {rank}
            </span>

            {/* Avatar */}
            <Avatar
              src={member.avatar_url}
              name={member.display_name || 'Player'}
              size="sm"
            />

            {/* Name + Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-body text-sm font-semibold text-charcoal truncate">
                  {member.display_name || 'Player'}
                </span>
                {isFirstMover && (
                  <Badge className="bg-sunset-gold/10 text-sunset-gold">
                    First Mover
                  </Badge>
                )}
              </div>
              <ProgressBar
                value={animate ? percent : 0}
                color={rank === 1 ? 'sunset-gold' : rank === 2 ? 'sky-blue' : 'sage-green'}
              />
            </div>

            {/* Score */}
            <span className="font-body text-sm font-semibold text-charcoal shrink-0 tabular-nums">
              {completed}/{total}
            </span>
          </div>
        )
      })}

      {sorted.length === 0 && (
        <p className="font-body text-sm text-warm-gray text-center py-8">
          No members to show yet.
        </p>
      )}
    </div>
  )
}
