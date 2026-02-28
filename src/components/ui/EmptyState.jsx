import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="mb-4 text-warm-gray">{icon}</div>
      )}
      {title && (
        <h3 className="font-display text-xl text-charcoal mb-2">{title}</h3>
      )}
      {description && (
        <p className="font-body text-warm-gray text-sm max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
