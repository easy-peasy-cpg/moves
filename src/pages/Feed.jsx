import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFeed } from '../hooks/useFeed'
import { useSeason } from '../hooks/useSeason'
import FeedCard from '../components/feed/FeedCard'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

export default function Feed() {
  const { id: seasonId } = useParams()
  const { posts, loading, addComment } = useFeed(seasonId)
  const { season } = useSeason(seasonId)

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
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={`/seasons/${seasonId}`}
          className="p-1.5 rounded-full hover:bg-charcoal/5 transition-colors text-warm-gray hover:text-charcoal"
          aria-label="Back to season"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display text-2xl text-charcoal">Feed</h1>
          {season && (
            <p className="font-body text-sm text-warm-gray">{season.name}</p>
          )}
        </div>
      </div>

      {/* Feed Posts */}
      {posts.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          }
          title="No Moves completed yet"
          description="Who's going first?"
          action={
            <Link to={`/seasons/${seasonId}`}>
              <Button variant="secondary" size="sm">Back to Dashboard</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
            >
              <FeedCard post={post} onAddComment={addComment} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
