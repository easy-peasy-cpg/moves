import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useProfile } from '../hooks/useProfile'
import { useSeasons } from '../hooks/useSeasons'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile: authProfile } = useAuth()
  const { profile, stats, loading } = useProfile(user?.id)
  const { seasons, loading: seasonsLoading } = useSeasons()

  const displayProfile = profile || authProfile

  const activeSeasons = (seasons || []).filter(
    (s) => s.status === 'active' || s.status === 'drafting' || s.draft_status === 'completed'
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-sky-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!displayProfile) {
    return (
      <EmptyState
        title="Profile not found"
        description="Please sign in to view your profile."
        action={<Link to="/login"><Button>Sign In</Button></Link>}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        <Avatar
          src={displayProfile.avatar_url}
          name={displayProfile.display_name || displayProfile.username || ''}
          size="xl"
          className="mb-4"
        />
        <h1 className="font-display text-2xl text-charcoal">
          {displayProfile.display_name || displayProfile.username || 'Your Profile'}
        </h1>
        {displayProfile.username && (
          <p className="font-body text-warm-gray text-sm mt-0.5">
            @{displayProfile.username}
          </p>
        )}
        {displayProfile.bio && (
          <p className="font-body text-charcoal text-sm mt-2 max-w-sm leading-relaxed">
            {displayProfile.bio}
          </p>
        )}
        {displayProfile.city && (
          <p className="font-body text-warm-gray text-xs mt-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {displayProfile.city}
          </p>
        )}
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <p className="font-display text-xl text-charcoal">{stats.totalMovesCompleted}</p>
            <p className="font-body text-xs text-warm-gray">Moves completed</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl text-charcoal">{stats.seasonCount}</p>
            <p className="font-body text-xs text-warm-gray">Seasons</p>
          </div>
        </div>
      )}

      {/* Edit Profile Button */}
      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/settings')}
        >
          Edit Profile
        </Button>
      </div>

      {/* Active Seasons */}
      <section>
        <h2 className="font-display text-lg text-charcoal mb-3">Your Seasons</h2>

        {seasonsLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-sky-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeSeasons.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            }
            title="No active seasons"
            description="Start a new season and invite your crew."
            action={
              <Link to="/seasons/new">
                <Button>Start a Season</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {activeSeasons.map((season) => (
              <Link key={season.id} to={`/seasons/${season.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-body font-semibold text-charcoal text-sm">
                        {season.name}
                      </h3>
                      <p className="font-body text-xs text-warm-gray mt-0.5">
                        {new Date(season.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' - '}
                        {new Date(season.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <Badge variant={season.status === 'active' ? 'success' : 'accent'}>
                      {season.status === 'active' ? 'Active' : season.status === 'drafting' ? 'Drafting' : season.status}
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
