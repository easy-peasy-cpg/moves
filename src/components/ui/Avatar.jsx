import React from 'react';

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const palette = [
  'bg-sky-blue text-white',
  'bg-sunset-gold text-white',
  'bg-burnt-orange text-white',
  'bg-magenta text-white',
  'bg-sage-green text-white',
  'bg-deep-purple text-white',
];

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className = '',
}) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={[
          'rounded-full object-cover shrink-0',
          sizeClass,
          className,
        ].join(' ')}
      />
    );
  }

  const colorClass = palette[hashName(name) % palette.length];

  return (
    <div
      className={[
        'rounded-full flex items-center justify-center font-body font-semibold shrink-0 select-none',
        sizeClass,
        colorClass,
        className,
      ].join(' ')}
      aria-label={name || 'Avatar'}
    >
      {getInitials(name)}
    </div>
  );
}
