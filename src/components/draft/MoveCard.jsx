import React from 'react';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import CategoryPill from '../ui/CategoryPill';
import Badge from '../ui/Badge';

export default function MoveCard({ move, onSelect, isSelected, isDrafted, draftedBy }) {
  if (!move) return null;

  return (
    <Card
      onClick={!isDrafted ? () => onSelect?.(move) : undefined}
      className={[
        'p-4 transition-all duration-200 relative overflow-hidden',
        isDrafted
          ? 'opacity-40 pointer-events-none'
          : 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer',
        isSelected
          ? 'ring-2 ring-sky-blue shadow-lg shadow-sky-blue/15 border-sky-blue'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Drafted overlay */}
      {isDrafted && (
        <div className="absolute inset-0 bg-warm-white/60 flex items-center justify-center z-10 rounded-2xl">
          <span className="font-body text-sm font-semibold text-warm-gray">
            Drafted{draftedBy ? ` by ${draftedBy}` : ''}
          </span>
        </div>
      )}

      {/* Header: category + collab */}
      <div className="flex items-center gap-2 mb-2">
        <CategoryPill category={move.category} size="sm" />
        {move.is_collab && (
          <Badge variant="accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Collab
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-lg text-charcoal leading-snug mb-1.5">
        {move.title}
      </h3>

      {/* Description */}
      {move.description && (
        <p className="font-body text-sm text-warm-gray leading-relaxed mb-3 line-clamp-2">
          {move.description}
        </p>
      )}

      {/* Submitted by */}
      {move.submitted_by_name && (
        <div className="flex items-center gap-2 pt-2 border-t border-light-warm-gray">
          <Avatar
            src={move.submitted_by_avatar}
            name={move.submitted_by_name}
            size="sm"
          />
          <span className="font-body text-xs text-warm-gray">
            Added by {move.submitted_by_name}
          </span>
        </div>
      )}
    </Card>
  );
}
