import React, { useEffect } from 'react';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[
          'bg-warm-white w-full rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto relative',
          'animate-slide-up md:animate-scale-pop',
          sizeClasses[size] || sizeClasses.md,
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          {title && (
            <h2 className="font-display text-xl text-charcoal">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-full hover:bg-charcoal/5 transition-colors text-warm-gray hover:text-charcoal"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
