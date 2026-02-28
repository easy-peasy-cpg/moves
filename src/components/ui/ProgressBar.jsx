import React from 'react';

const colorMap = {
  'sunset-gold': 'bg-sunset-gold',
  'sky-blue': 'bg-sky-blue',
  'sage-green': 'bg-sage-green',
  'burnt-orange': 'bg-burnt-orange',
  'magenta': 'bg-magenta',
  'deep-purple': 'bg-deep-purple',
};

export default function ProgressBar({
  value = 0,
  className = '',
  color = 'sunset-gold',
  showLabel = false,
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const bgClass = colorMap[color] || colorMap['sunset-gold'];

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-end mb-1">
          <span className="font-body text-xs font-semibold text-charcoal">
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div className="h-2 rounded-full bg-light-warm-gray overflow-hidden">
        <div
          className={[
            'h-full rounded-full transition-all duration-600 ease-out',
            bgClass,
          ].join(' ')}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
