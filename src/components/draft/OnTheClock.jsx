import React from 'react';
import Avatar from '../ui/Avatar';

export default function OnTheClock({ drafter, timeRemaining, isMyTurn, round, pick }) {
  const minutes = Math.floor((timeRemaining || 0) / 60);
  const seconds = (timeRemaining || 0) % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timeRemaining !== null && timeRemaining <= 10;

  return (
    <div
      className={[
        'rounded-2xl p-5 transition-all duration-300',
        isMyTurn
          ? 'bg-sunset-gold/10 border-2 border-sunset-gold animate-pulse-slow shadow-lg shadow-sunset-gold/20'
          : 'bg-warm-white border-2 border-light-warm-gray',
      ].join(' ')}
    >
      {/* Round / Pick label */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">
          Round {round || 1}, Pick {pick || 1}
        </span>
        <span className="font-body text-xs font-semibold uppercase tracking-wider text-warm-gray">
          On the Clock
        </span>
      </div>

      {/* Main display */}
      <div className="flex items-center gap-4">
        <Avatar
          src={drafter?.profiles?.avatar_url || drafter?.avatar_url}
          name={drafter?.profiles?.display_name || drafter?.display_name || 'Unknown'}
          size="xl"
          className={isMyTurn ? 'ring-4 ring-sunset-gold/40' : ''}
        />

        <div className="flex-1 min-w-0">
          {isMyTurn ? (
            <>
              <p className="font-display text-2xl text-sunset-gold leading-tight">
                You're on the clock!
              </p>
              <p className="font-body text-sm text-warm-gray mt-0.5">
                Pick a move from the pool below
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-2xl text-charcoal leading-tight truncate">
                {drafter?.profiles?.display_name || drafter?.display_name || 'Someone'}
              </p>
              <p className="font-body text-sm text-warm-gray mt-0.5">
                is picking...
              </p>
            </>
          )}
        </div>

        {/* Timer */}
        {timeRemaining !== null && timeRemaining !== undefined && (
          <div
            className={[
              'flex flex-col items-center justify-center rounded-xl px-4 py-2 min-w-[80px]',
              isUrgent
                ? 'bg-burnt-orange/10 animate-pulse-slow'
                : 'bg-cream',
            ].join(' ')}
          >
            <span
              className={[
                'font-display text-3xl tabular-nums leading-none',
                isUrgent ? 'text-burnt-orange' : 'text-charcoal',
              ].join(' ')}
            >
              {timeDisplay}
            </span>
            <span className="font-body text-xs text-warm-gray mt-0.5">remaining</span>
          </div>
        )}
      </div>
    </div>
  );
}
