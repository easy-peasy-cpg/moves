import React, { useMemo } from 'react';
import CategoryPill from '../ui/CategoryPill';
import ProgressBar from '../ui/ProgressBar';

const TOTAL_PICKS = 20;

const CATEGORY_ORDER = [
  'Physical',
  'Personal',
  'Professional',
  'Social',
  'Creative',
  'Adventure',
  'Wildcard',
];

export default function MyRoster({ moves }) {
  const grouped = useMemo(() => {
    const map = {};
    (moves || []).forEach((dm) => {
      const cat = dm.move_pool?.category || dm.category || 'Uncategorized';
      if (!map[cat]) map[cat] = [];
      map[cat].push(dm);
    });
    return map;
  }, [moves]);

  const count = moves?.length || 0;
  const progress = (count / TOTAL_PICKS) * 100;

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const aIdx = CATEGORY_ORDER.indexOf(a);
    const bIdx = CATEGORY_ORDER.indexOf(b);
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="font-display text-lg text-charcoal">My Moves</h3>
          <span className="font-body text-sm font-semibold text-charcoal">
            {count}/{TOTAL_PICKS}
          </span>
        </div>
        <ProgressBar
          value={progress}
          color="sunset-gold"
        />
      </div>

      <div className="flex-1 overflow-y-auto -mx-1 px-1">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-light-warm-gray mb-2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <p className="font-body text-sm text-warm-gray">
              No moves drafted yet. Make your first pick!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCategories.map((cat) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <CategoryPill category={cat} size="sm" />
                  <span className="font-body text-xs text-warm-gray">
                    ({grouped[cat].length})
                  </span>
                </div>
                <div className="space-y-1.5 ml-1">
                  {grouped[cat].map((dm, idx) => (
                    <div
                      key={dm.id || idx}
                      className="flex items-center gap-2 animate-scale-pop"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-sunset-gold shrink-0" />
                      <span className="font-body text-sm text-charcoal">
                        {dm.move_pool?.title || dm.title || 'Untitled move'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
