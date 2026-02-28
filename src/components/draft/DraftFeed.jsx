import React, { useEffect, useRef } from 'react';
import DraftPick from './DraftPick';

export default function DraftFeed({ picks }) {
  const feedRef = useRef(null);

  // Auto-scroll to latest pick
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [picks?.length]);

  const reversedPicks = [...(picks || [])].reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-charcoal">Draft Feed</h3>
        <span className="font-body text-xs text-warm-gray">
          {picks?.length || 0} pick{picks?.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto -mx-1 px-1 space-y-0.5"
      >
        {reversedPicks.length === 0 ? (
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
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <p className="font-body text-sm text-warm-gray">
              Waiting for the first pick...
            </p>
          </div>
        ) : (
          reversedPicks.map((pick, idx) => (
            <DraftPick key={pick.id || idx} pick={pick} />
          ))
        )}
      </div>
    </div>
  );
}
