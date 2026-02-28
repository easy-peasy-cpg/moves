import React from 'react'
import Avatar from '../ui/Avatar'

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

const typeConfig = {
  season_invite: {
    color: 'text-sky-blue',
    bgColor: 'bg-sky-blue/10',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  draft_starting: {
    color: 'text-sunset-gold',
    bgColor: 'bg-sunset-gold/10',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
  draft_your_turn: {
    color: 'text-burnt-orange',
    bgColor: 'bg-burnt-orange/10',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  move_completed: {
    color: 'text-sage-green',
    bgColor: 'bg-sage-green/10',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  comment: {
    color: 'text-sky-blue',
    bgColor: 'bg-sky-blue/10',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  nudge: {
    color: 'text-burnt-orange',
    bgColor: 'bg-burnt-orange/10',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 12h5l-3-3m0 6l3-3" />
        <path d="M4 12h7" />
      </svg>
    ),
  },
  collab_tagged: {
    color: 'text-deep-purple',
    bgColor: 'bg-deep-purple/10',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075-5.925a1.575 1.575 0 013.15 0v1.5m-3.15-1.5v5.925m3.15-5.925v3.375c0 1.279.06 2.556.177 3.826.11 1.19-.517 2.33-1.532 2.911a10.586 10.586 0 01-3.593 1.267M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.277 6.277 0 006.277 6.277h2.09a5.39 5.39 0 002.456-.585" />
      </svg>
    ),
  },
  season_ended: {
    color: 'text-sunset-gold',
    bgColor: 'bg-sunset-gold/10',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0m0 0c-.51-.31-.96-.7-1.34-1.145" />
      </svg>
    ),
  },
  first_mover: {
    color: 'text-sunset-gold',
    bgColor: 'bg-sunset-gold/10',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
}

const defaultConfig = {
  color: 'text-warm-gray',
  bgColor: 'bg-light-warm-gray',
  icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
}

export default function NotificationItem({ notification, onClick }) {
  const config = typeConfig[notification.type] || defaultConfig
  const actorProfile = notification.profiles || {}
  const isUnread = !notification.is_read

  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
        'hover:bg-charcoal/[0.03]',
        isUnread
          ? 'bg-sky-blue/[0.04] border-l-2 border-l-sky-blue'
          : 'border-l-2 border-l-transparent',
      ].join(' ')}
    >
      {/* Type Icon */}
      <div className={[
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        config.bgColor,
        config.color,
      ].join(' ')}>
        {config.icon}
      </div>

      {/* Actor Avatar */}
      <Avatar
        src={actorProfile.avatar_url}
        name={actorProfile.display_name || actorProfile.username || ''}
        size="sm"
      />

      {/* Message + Timestamp */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-charcoal leading-snug">
          <span className="font-semibold">
            {actorProfile.display_name || actorProfile.username || 'Someone'}
          </span>{' '}
          {notification.message}
        </p>
        <p className="font-body text-xs text-warm-gray mt-0.5">
          {timeAgo(notification.created_at)}
        </p>
      </div>

      {/* Unread Dot */}
      {isUnread && (
        <div className="w-2 h-2 rounded-full bg-sky-blue shrink-0" />
      )}
    </button>
  )
}
