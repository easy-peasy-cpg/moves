import React, { useState } from 'react'

function ShimmerPill() {
  return (
    <div className="inline-block h-9 rounded-full bg-light-warm-gray animate-pulse" style={{ width: `${80 + Math.random() * 60}px` }} />
  )
}

export default function SuggestionPills({ suggestions = [], onSelect, loading = false }) {
  const [addedTitles, setAddedTitles] = useState(new Set())

  function handleSelect(suggestion) {
    setAddedTitles((prev) => new Set([...prev, suggestion.title]))
    onSelect(suggestion)
  }

  if (loading && suggestions.length === 0) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ShimmerPill key={i} />
        ))}
      </div>
    )
  }

  if (!loading && suggestions.length === 0) {
    return (
      <p className="font-body text-sm text-warm-gray py-2">
        Tap "Get Suggestions" to see AI-powered move ideas for this category.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => {
        const wasAdded = addedTitles.has(suggestion.title)

        return (
          <button
            key={suggestion.title}
            type="button"
            onClick={() => !wasAdded && handleSelect(suggestion)}
            disabled={wasAdded}
            className={[
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-200',
              wasAdded
                ? 'bg-sage-green/10 text-sage-green cursor-default'
                : 'bg-warm-white border border-light-warm-gray text-charcoal hover:border-sunset-gold hover:bg-sunset-gold/5 hover:scale-[1.02] active:scale-[0.98]',
            ].join(' ')}
          >
            {wasAdded ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
            {suggestion.title}
            {suggestion.isCollab && !wasAdded && (
              <svg className="w-3.5 h-3.5 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
