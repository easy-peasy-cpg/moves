import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const ToastContext = createContext(null);

const borderColors = {
  success: 'border-l-sage-green',
  error: 'border-l-burnt-orange',
  info: 'border-l-sky-blue',
};

const icons = {
  success: (
    <svg className="w-5 h-5 text-sage-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-burnt-orange shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-sky-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
};

const progressColors = {
  success: 'bg-sage-green',
  error: 'bg-burnt-orange',
  info: 'bg-sky-blue',
};

let toastId = 0;

function ToastItem({ id, message, type = 'info', duration = 3000, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [duration]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(id), 200);
    }, duration);

    return () => clearTimeout(timeout);
  }, [id, duration, onRemove]);

  return (
    <div
      className={[
        'relative bg-warm-white rounded-xl border border-light-warm-gray border-l-4 shadow-[0_4px_16px_rgba(45,42,38,0.12)] overflow-hidden',
        'min-w-[300px] max-w-[400px]',
        borderColors[type] || borderColors.info,
        exiting ? 'animate-fade-out' : 'animate-slide-in',
      ].join(' ')}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        {icons[type]}
        <p className="font-body text-sm text-charcoal leading-snug">{message}</p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-light-warm-gray">
        <div
          className={[
            'h-full transition-[width] duration-100 ease-linear',
            progressColors[type] || progressColors.info,
          ].join(' ')}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ message, type = 'info', duration = 3000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] flex flex-col-reverse gap-2 items-center md:items-end max-sm:left-4 max-sm:right-4">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
