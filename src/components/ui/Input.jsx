import React from 'react';

export default function Input({ label, error, className = '', ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label className="block font-body font-medium text-sm text-charcoal mb-1.5">
          {label}
        </label>
      )}
      <input
        className={[
          'w-full rounded-xl bg-cream border px-4 py-3 text-charcoal placeholder:text-warm-gray outline-none transition-all duration-200 font-body',
          error
            ? 'border-burnt-orange focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20'
            : 'border-warm-gray/30 focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20',
        ].join(' ')}
        {...rest}
      />
      {error && (
        <p className="text-burnt-orange text-sm mt-1 font-body">{error}</p>
      )}
    </div>
  );
}
