import React from 'react'
import CategoryPill from '../ui/CategoryPill'
import Badge from '../ui/Badge'
import Avatar from '../ui/Avatar'
import EmptyState from '../ui/EmptyState'

const CATEGORIES = ['physical', 'personal', 'professional', 'social', 'creative', 'adventure', 'wildcard']

/**
 * PoolBuilder renders the move list for a given category filter.
 * It is used by the BuildPool page to display the pool contents
 * while the page handles form submissions, suggestions, and tab state.
 *
 * Props:
 *   moves       - array of move objects (already filtered by the parent if needed)
 *   activeTab   - the currently active category tab (or 'all')
 *   emptyText   - custom empty state description
 */
export default function PoolBuilder({ moves = [], activeTab = 'all', emptyText }) {
  if (moves.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        }
        title="No moves yet"
        description={
          emptyText ||
          (activeTab === 'all'
            ? 'Pick a category and start adding moves to build the pool.'
            : `Be the first to add a ${activeTab} move to the pool.`)
        }
      />
    )
  }

  return (
    <div className="space-y-3 stagger-children">
      {moves.map((move) => (
        <div
          key={move.id}
          className="bg-warm-white rounded-xl border border-light-warm-gray p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-body font-semibold text-charcoal truncate">
                  {move.title}
                </h4>
                {move.is_collab && (
                  <Badge variant="accent">Collab</Badge>
                )}
                {move.is_app_suggested && (
                  <Badge>AI</Badge>
                )}
              </div>
              {move.description && (
                <p className="font-body text-sm text-warm-gray line-clamp-2">
                  {move.description}
                </p>
              )}
            </div>
            {activeTab === 'all' && move.category && (
              <CategoryPill category={move.category} size="sm" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Avatar
              src={move.profiles?.avatar_url}
              name={move.profiles?.display_name || move.profiles?.username || 'Unknown'}
              size="sm"
            />
            <span className="font-body text-xs text-warm-gray">
              {move.profiles?.display_name || move.profiles?.username || 'Unknown'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
