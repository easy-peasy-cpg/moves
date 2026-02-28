import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { useSeason } from '../hooks/useSeason'
import { useMoves } from '../hooks/useMoves'
import { useFeed } from '../hooks/useFeed'
import Scoreboard from '../components/season/Scoreboard'
import CompleteMoveModal from '../components/moves/CompleteMoveModal'
import MoveDetail from '../components/moves/MoveDetail'
import NudgeButton from '../components/moves/NudgeButton'
import FeedCard from '../components/feed/FeedCard'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import CategoryPill from '../components/ui/CategoryPill'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../components/ui/Toast'

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const opts = { month: 'short', day: 'numeric' }
  const yearOpts = { ...opts, year: 'numeric' }
  const startStr = start.toLocaleDateString('en-US', opts)
  const endStr = end.toLocaleDateString('en-US', yearOpts)
  return `${startStr} - ${endStr}`
}

function daysRemaining(endDate) {
  const now = new Date()
  const end = new Date(endDate)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export default function SeasonDashboard() {
  const { id: seasonId } = useParams()
  const { user } = useAuth()
  const { season, members, loading: seasonLoading } = useSeason(seasonId)
  const { moves, loading: movesLoading, completeMove, refetch: refetchMoves } = useMoves(seasonId, user?.id)
  const { posts, loading: feedLoading, addComment } = useFeed(seasonId)
  const { toast } = useToast()

  const [filter, setFilter] = useState('all')
  const [completeModalMove, setCompleteModalMove] = useState(null)
  const [detailMove, setDetailMove] = useState(null)
  const [expandedMember, setExpandedMember] = useState(null)
  const [memberMoves, setMemberMoves] = useState({})
  const [loadingMemberMoves, setLoadingMemberMoves] = useState({})

  const filteredMoves = useMemo(() => {
    if (!moves) return []
    if (filter === 'todo') return moves.filter((m) => !m.is_completed)
    if (filter === 'completed') return moves.filter((m) => m.is_completed)
    return moves
  }, [moves, filter])

  const completedCount = useMemo(() => moves?.filter((m) => m.is_completed).length || 0, [moves])
  const recentPosts = useMemo(() => (posts || []).slice(0, 7), [posts])
  const remaining = season ? daysRemaining(season.end_date) : 0

  async function handleExpandMember(memberId) {
    if (expandedMember === memberId) {
      setExpandedMember(null)
      return
    }
    setExpandedMember(memberId)

    if (memberMoves[memberId]) return

    setLoadingMemberMoves((prev) => ({ ...prev, [memberId]: true }))
    try {
      // supabase already imported at top level
      const { data, error } = await supabase
        .from('drafted_moves')
        .select(`
          *,
          move_pool (id, title, category, description)
        `)
        .eq('season_id', seasonId)
        .eq('user_id', memberId)
        .order('draft_pick', { ascending: true })

      if (!error) {
        setMemberMoves((prev) => ({ ...prev, [memberId]: data || [] }))
      }
    } catch (err) {
      console.error('Error loading member moves:', err)
    } finally {
      setLoadingMemberMoves((prev) => ({ ...prev, [memberId]: false }))
    }
  }

  async function handleCompleteMove({ photoUrl, story, collabPartnerId }) {
    if (!completeModalMove) return
    try {
      await completeMove(completeModalMove.id, photoUrl, story)
      toast({ message: 'Move completed! Nice work.', type: 'success' })
      setCompleteModalMove(null)
      refetchMoves()
    } catch (err) {
      toast({ message: 'Something went wrong. Try again.', type: 'error' })
    }
  }

  if (seasonLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-sky-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!season) {
    return (
      <EmptyState
        title="Season not found"
        description="This season doesn't exist or you don't have access."
        action={<Link to="/"><Button>Go Home</Button></Link>}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl text-charcoal">{season.name}</h1>
            <p className="font-body text-warm-gray text-sm mt-1">
              {formatDateRange(season.start_date, season.end_date)}
            </p>
          </div>
          <Badge variant={remaining > 14 ? 'success' : remaining > 0 ? 'warning' : 'default'}>
            {remaining > 0 ? `${remaining} days left` : 'Season ended'}
          </Badge>
        </div>

        {/* Crew Avatars */}
        <div className="flex items-center -space-x-2">
          {members.map((member) => (
            <Avatar
              key={member.user_id}
              src={member.profiles?.avatar_url}
              name={member.profiles?.display_name || member.profiles?.username || ''}
              size="sm"
              className="ring-2 ring-warm-white"
            />
          ))}
          <span className="ml-3 font-body text-sm text-warm-gray">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Scoreboard */}
      <section>
        <h2 className="font-display text-lg text-charcoal mb-3">Scoreboard</h2>
        <Scoreboard members={members} />
      </section>

      {/* My Moves */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-charcoal">
            My Moves
            <span className="ml-2 font-body text-sm text-warm-gray font-normal">
              {completedCount}/{moves?.length || 0}
            </span>
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'todo', label: 'To Do' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={[
                'px-4 py-1.5 rounded-full text-sm font-body font-semibold transition-all duration-200',
                filter === tab.key
                  ? 'bg-sky-blue text-white'
                  : 'bg-light-warm-gray text-warm-gray hover:text-charcoal',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {movesLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-sky-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMoves.length === 0 ? (
          <EmptyState
            title={filter === 'completed' ? 'No completed moves yet' : filter === 'todo' ? 'All caught up!' : 'No moves drafted'}
            description={filter === 'todo' ? 'You have completed all your moves. Incredible.' : 'Your drafted moves will appear here.'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMoves.map((move) => {
              const pool = move.move_pool || {}
              const isCompleted = move.is_completed

              return (
                <Card
                  key={move.id}
                  className="p-4 group relative"
                  onClick={() => {
                    if (isCompleted) {
                      setDetailMove(move)
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-body font-semibold text-charcoal text-sm leading-snug">
                      {pool.title}
                    </h3>
                    {isCompleted && (
                      <div className="shrink-0 w-5 h-5 rounded-full bg-sage-green flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <CategoryPill category={pool.category} size="sm" />

                  {isCompleted && move.completion_photo_url && (
                    <div className="mt-3 relative rounded-lg overflow-hidden">
                      <img
                        src={move.completion_photo_url}
                        alt={pool.title}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  )}

                  {isCompleted && move.completed_at && (
                    <p className="mt-2 font-body text-xs text-warm-gray">
                      {new Date(move.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}

                  {!isCompleted && (
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:block">
                      <Button
                        size="sm"
                        className="bg-sage-green text-white hover:bg-sage-green/90 w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCompleteModalMove(move)
                        }}
                      >
                        Complete
                      </Button>
                    </div>
                  )}

                  {/* Mobile: always show complete button for incomplete */}
                  {!isCompleted && (
                    <div className="mt-3 sm:hidden">
                      <Button
                        size="sm"
                        className="bg-sage-green text-white hover:bg-sage-green/90 w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCompleteModalMove(move)
                        }}
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Season Feed */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-charcoal">Feed</h2>
          {posts && posts.length > 7 && (
            <Link
              to={`/seasons/${seasonId}/feed`}
              className="font-body text-sm text-sky-blue font-semibold hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {feedLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-sky-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentPosts.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Complete a Move to kick off the feed."
          />
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <FeedCard key={post.id} post={post} onAddComment={addComment} />
            ))}
          </div>
        )}
      </section>

      {/* Crew */}
      <section>
        <h2 className="font-display text-lg text-charcoal mb-4">Crew</h2>
        <div className="space-y-2">
          {members.map((member) => {
            const profile = member.profiles || {}
            const isMe = member.user_id === user?.id
            const isExpanded = expandedMember === member.user_id
            const theirMoves = memberMoves[member.user_id] || []
            const isLoadingMoves = loadingMemberMoves[member.user_id]

            return (
              <Card key={member.user_id} className="overflow-hidden">
                <button
                  onClick={() => !isMe && handleExpandMember(member.user_id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <Avatar
                    src={profile.avatar_url}
                    name={profile.display_name || profile.username || ''}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-charcoal text-sm truncate">
                      {profile.display_name || profile.username || 'Unknown'}
                      {isMe && <span className="text-warm-gray font-normal ml-1">(you)</span>}
                    </p>
                    <p className="font-body text-xs text-warm-gray">
                      {member.moves_completed || 0} completed
                    </p>
                  </div>
                  {!isMe && (
                    <svg
                      className={[
                        'w-4 h-4 text-warm-gray transition-transform duration-200',
                        isExpanded ? 'rotate-180' : '',
                      ].join(' ')}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {isExpanded && !isMe && (
                  <div className="px-4 pb-4 border-t border-light-warm-gray pt-3">
                    {isLoadingMoves ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-sky-blue border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : theirMoves.length === 0 ? (
                      <p className="font-body text-sm text-warm-gray text-center py-3">No moves drafted yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {theirMoves.map((move) => {
                          const pool = move.move_pool || {}
                          return (
                            <div key={move.id} className="flex items-center justify-between gap-2 py-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                {move.is_completed ? (
                                  <div className="w-4 h-4 rounded-full bg-sage-green flex items-center justify-center shrink-0">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-light-warm-gray shrink-0" />
                                )}
                                <span className="font-body text-sm text-charcoal truncate">{pool.title}</span>
                                <CategoryPill category={pool.category} size="sm" />
                              </div>
                              {!move.is_completed && (
                                <NudgeButton
                                  seasonId={seasonId}
                                  receiverId={member.user_id}
                                  draftedMoveId={move.id}
                                  moveTitle={pool.title}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </section>

      {/* Complete Move Modal */}
      {completeModalMove && (
        <CompleteMoveModal
          move={completeModalMove}
          isOpen={!!completeModalMove}
          onClose={() => setCompleteModalMove(null)}
          onComplete={handleCompleteMove}
          seasonId={seasonId}
          userId={user?.id}
          members={members}
        />
      )}

      {/* Move Detail Modal */}
      {detailMove && (
        <MoveDetail
          move={detailMove}
          onClose={() => setDetailMove(null)}
          onComplete={() => {
            setDetailMove(null)
            setCompleteModalMove(detailMove)
          }}
        />
      )}
    </div>
  )
}
