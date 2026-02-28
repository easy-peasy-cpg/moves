import { useNavigate } from 'react-router-dom'

export default function PageWrapper({ children, title, className = '', showBack = false, onBack }) {
  const navigate = useNavigate()

  function handleBack() {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className={`pt-20 pb-24 md:pb-8 px-4 max-w-6xl mx-auto ${className}`}>
      {(showBack || title) && (
        <div className="flex items-center gap-3 mb-6">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-1.5 -ml-1.5 text-charcoal hover:text-sky-blue transition-colors rounded-lg hover:bg-cream"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {title && (
            <h1 className="font-display text-2xl text-charcoal">{title}</h1>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
