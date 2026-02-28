import React from 'react';
import Avatar from '../ui/Avatar';
import CategoryPill from '../ui/CategoryPill';

export default function DraftPick({ pick }) {
  if (!pick) return null;

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-cream/60 transition-colors duration-150 animate-slide-in">
      <Avatar
        src={pick.user_avatar_url}
        name={pick.user_display_name || 'Unknown'}
        size="sm"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-body font-semibold text-sm text-charcoal">
            {pick.user_display_name || 'Unknown'}
          </span>
          <span className="font-body text-sm text-warm-gray">picked</span>
          <span className="font-body text-sm font-semibold text-sky-blue truncate">
            {pick.move_title}
          </span>
          {pick.category && (
            <CategoryPill category={pick.category} size="sm" />
          )}
        </div>
        <span className="font-body text-xs text-warm-gray">
          Round {pick.round}, Pick {pick.pick_number}
        </span>
      </div>
    </div>
  );
}
