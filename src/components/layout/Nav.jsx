import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useSeasons } from '../../hooks/useSeasons'
import { useNotifications } from '../../hooks/useNotifications'

export default function Nav() {
  const { user, profile, signOut } = useAuth()
  const { seasons } = useSeasons()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()

  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false)
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false)
  const seasonRef = useRef(null)
  const avatarRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (seasonRef.current && !seasonRef.current.contains(e.target)) {
        setSeasonDropdownOpen(false)
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-warm-white/80 backdrop-blur-md border-b border-light-warm-gray items-center justify-between px-6 h-16">
      {/* Left: Wordmark */}
      <Link to="/" className="font-display text-2xl font-bold text-sky-blue">
        Moves
      </Link>

      {/* Middle: My Seasons dropdown */}
      <div className="relative" ref={seasonRef}>
        <button
          onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)}
          className="flex items-center gap-2 text-charcoal font-body text-sm font-medium hover:text-sky-blue transition-colors"
        >
          My Seasons
          <svg className={`w-4 h-4 transition-transform ${seasonDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {seasonDropdownOpen && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-warm-white rounded-xl shadow-lg border border-light-warm-gray py-2 z-50">
            {seasons && seasons.length > 0 ? (
              seasons.map((season) => (
                <button
                  key={season.id}
                  onClick={() => {
                    navigate(`/season/${season.id}`)
                    setSeasonDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-cream transition-colors"
                >
                  <span className="font-body text-sm font-medium text-charcoal block">{season.name}</span>
                  <span className="font-body text-xs text-warm-gray">{season.status}</span>
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-warm-gray font-body">No seasons yet</p>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Start a Season */}
        <button
          onClick={() => navigate('/season/create')}
          className="bg-sky-blue text-white font-body text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Start a Season
        </button>

        {/* Notifications bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-charcoal hover:text-sky-blue transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-burnt-orange text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
            className="w-8 h-8 rounded-full bg-sage-green text-white flex items-center justify-center font-body text-sm font-bold overflow-hidden"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile?.display_name?.[0] || profile?.username?.[0] || '?').toUpperCase()
            )}
          </button>

          {avatarDropdownOpen && (
            <div className="absolute top-full mt-2 right-0 w-48 bg-warm-white rounded-xl shadow-lg border border-light-warm-gray py-2 z-50">
              <button
                onClick={() => {
                  navigate('/profile')
                  setAvatarDropdownOpen(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-cream transition-colors font-body text-sm text-charcoal"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  navigate('/settings')
                  setAvatarDropdownOpen(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-cream transition-colors font-body text-sm text-charcoal"
              >
                Settings
              </button>
              <hr className="my-1 border-light-warm-gray" />
              <button
                onClick={() => {
                  handleSignOut()
                  setAvatarDropdownOpen(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-cream transition-colors font-body text-sm text-burnt-orange"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
