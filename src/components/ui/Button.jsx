import React from 'react';

const variants = {
  primary:
    'bg-burnt-orange text-white hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
  secondary:
    'border-2 border-charcoal text-charcoal bg-transparent hover:bg-charcoal hover:text-white',
  destructive:
    'bg-burnt-orange text-white hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
  ghost:
    'bg-transparent text-charcoal hover:bg-charcoal/5',
  accent:
    'bg-magenta text-white hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] font-bold',
};

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

function Spinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-full font-body font-semibold transition-all duration-200',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
