import React from 'react';

const variants = {
  default: 'bg-light-warm-gray text-charcoal',
  success: 'bg-sage-green/10 text-sage-green',
  warning: 'bg-burnt-orange/10 text-burnt-orange',
  accent: 'bg-sunset-gold/10 text-sunset-gold',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
}) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-0.5 font-body',
        variants[variant] || variants.default,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
