import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import NotificationItem from '../components/notifications/NotificationItem'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

function getNotificationRoute(notification) {
  const { type, metadata } = notification
  const seasonId = metadata?.season_id
  const feedPostId = metadata?.feed_post_id

  switch (type) {
    case 'season_invite':
      return seasonId ? `/seasons/${seasonId}` : '/'
    case 'draft_starting':
    case 'draft_your_turn':
      return seasonId ? `/seasons/${seasonId}/draft` : '/'
    case 'move_completed':
      return seasonId ? `/seasons/${seasonId}/feed` : '/'
    case 'comment':
      return seasonId ? `/seasons/${seasonId}/feed` : '/'
    case 'nudge':
      return seasonId ? `/seasons/${seasonId}` : '/'
    case 'collab_tagged':
      return seasonId ? `/seasons/${seasonId}/feed` : '/'
    case 'season_ended':
      return seasonId ? `/seasons/${seasonId}` : '/'
    case 'first_mover':
      return seasonId ? `/seasons/${seasonId}/feed` : '/'
    default:
      return '/'
  }
}

export default function Notifications() {
  const navigate = useNavigate()
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications()

  function handleClick(notification) {
    if (!notification.is_read) {
      markRead(notification.id)
    }
    const route = getNotificationRoute(notification)
    navigate(route)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-sky-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-20 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-charcoal">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          }
          title="All caught up"
          description="No notifications right now. Go make some Moves."
        />
      ) : (
        <div className="space-y-1">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => handleClick(notification)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
