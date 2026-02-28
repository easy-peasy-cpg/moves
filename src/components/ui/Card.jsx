import React from 'react';

export default function Card({ children, className = '', onClick, ...rest }) {
  const interactive = !!onClick;

  return (
    <div
      className={[
        'bg-warm-white rounded-2xl border border-light-warm-gray shadow-[0_2px_12px_rgba(45,42,38,0.08)]',
        interactive ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </div>
  );
}
