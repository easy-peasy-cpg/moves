import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import CategoryPill from '../ui/CategoryPill'
import CommentSection from './CommentSection'

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

export default function FeedCard({ post, onAddComment }) {
  const [showComments, setShowComments] = useState(false)

  const profile = post.profiles || {}
  const draftedMove = post.drafted_moves || {}
  const movePool = draftedMove.move_pool || {}
  const comments = post.comments || []
  const visibleComments = showComments ? comments : comments.slice(0, 3)

  return (
    <Card className="overflow-hidden">
      {/* Header: Avatar, Name, Timestamp */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Link to={profile.username ? `/user/${profile.username}` : '#'}>
          <Avatar
            src={profile.avatar_url}
            name={profile.display_name || profile.username || ''}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={profile.username ? `/user/${profile.username}` : '#'}
            className="font-body font-semibold text-charcoal text-sm hover:underline"
          >
            {profile.display_name || profile.username || 'Unknown'}
          </Link>
          <p className="font-body text-xs text-warm-gray">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      {/* Move Info */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body font-semibold text-charcoal text-sm">
            {movePool.title}
          </span>
          {movePool.category && (
            <CategoryPill category={movePool.category} size="sm" />
          )}
        </div>
      </div>

      {/* Photo */}
      {post.photo_url && (
        <div className="px-4 pb-3">
          <img
            src={post.photo_url}
            alt={movePool.title || 'Move completion'}
            className="w-full rounded-xl object-cover max-h-96"
          />
        </div>
      )}

      {/* Celebration Prompt */}
      {post.celebration_prompt && (
        <div className="px-4 pb-2">
          <p className="font-body text-sm text-warm-gray italic leading-relaxed">
            {post.celebration_prompt}
          </p>
        </div>
      )}

      {/* Story / Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="font-body text-sm text-charcoal leading-relaxed">
            {post.caption}
          </p>
        </div>
      )}

      {/* Comment Count + Toggle */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="font-body text-xs text-warm-gray hover:text-charcoal transition-colors"
        >
          {comments.length === 0
            ? 'Comment'
            : comments.length === 1
              ? '1 comment'
              : `${comments.length} comments`}
        </button>
      </div>

      {/* Comments */}
      <div className="px-4 pb-4">
        <CommentSection
          comments={visibleComments}
          totalCount={comments.length}
          expanded={showComments}
          onToggleExpand={() => setShowComments(true)}
          onAddComment={onAddComment}
          feedPostId={post.id}
        />
      </div>
    </Card>
  )
}
