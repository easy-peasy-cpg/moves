import React from 'react';

const sizeClasses = {
  sm: 'text-xs px-2.5 py-0.5',
  md: 'text-sm px-3 py-1',
};

export default function CategoryPill({
  category,
  size = 'md',
  className = '',
}) {
  const slug = category?.toLowerCase().replace(/\s+/g, '-') || 'default';

  return (
    <span
      className={[
        'inline-block rounded-full font-body font-semibold capitalize cursor-default',
        'hover:scale-105 hover:shadow-sm transition-all duration-200',
        sizeClasses[size] || sizeClasses.md,
        `category-${slug}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {category}
    </span>
  );
}
