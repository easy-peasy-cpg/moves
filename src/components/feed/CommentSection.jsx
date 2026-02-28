import React, { useState } from 'react'
import { useAuth } from '../../lib/auth'
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

export default function CommentSection({
  comments = [],
  totalCount = 0,
  expanded = false,
  onToggleExpand,
  onAddComment,
  feedPostId,
}) {
  const { user, profile } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const text = newComment.trim()
    if (!text || !onAddComment || submitting) return

    setSubmitting(true)
    try {
      await onAddComment(feedPostId, text)
      setNewComment('')
    } catch (err) {
      console.error('Error adding comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* View all link */}
      {!expanded && totalCount > 3 && (
        <button
          onClick={onToggleExpand}
          className="font-body text-xs text-sky-blue font-semibold hover:underline"
        >
          View all {totalCount} comments
        </button>
      )}

      {/* Comment List */}
      {comments.length > 0 && (
        <div className="space-y-2.5">
          {comments.map((comment, index) => {
            const commentProfile = comment.profiles || {}
            return (
              <div
                key={comment.id}
                className="flex items-start gap-2 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar
                  src={commentProfile.avatar_url}
                  name={commentProfile.display_name || commentProfile.username || ''}
                  size="sm"
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-body font-semibold text-charcoal text-xs">
                      {commentProfile.display_name || commentProfile.username || 'Unknown'}
                    </span>
                    <span className="font-body text-xs text-charcoal leading-snug">
                      {comment.content}
                    </span>
                  </div>
                  <p className="font-body text-[10px] text-warm-gray mt-0.5">
                    {timeAgo(comment.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Avatar
            src={profile?.avatar_url}
            name={profile?.display_name || profile?.username || ''}
            size="sm"
          />
          <div className="flex-1 flex items-center gap-1.5 bg-cream rounded-full border border-warm-gray/20 pl-3 pr-1 py-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-charcoal placeholder:text-warm-gray text-xs font-body outline-none min-w-0"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className={[
                'p-1.5 rounded-full transition-all duration-200 shrink-0',
                newComment.trim()
                  ? 'text-sky-blue hover:bg-sky-blue/10'
                  : 'text-warm-gray/40 cursor-default',
              ].join(' ')}
              aria-label="Send comment"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
