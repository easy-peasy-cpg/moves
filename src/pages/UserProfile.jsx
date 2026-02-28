import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useProfile } from '../hooks/useProfile'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'

export default function UserProfile() {
  const { username } = useParams()
  const { user } = useAuth()

  const [userId, setUserId] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(true)
  const [lookupError, setLookupError] = useState(null)
  const [publicSeasons, setPublicSeasons] = useState([])
  const [sharedSeasons, setSharedSeasons] = useState([])

  const { profile, stats, loading: profileLoading } = useProfile(userId)

  // Lookup user by username
  useEffect(() => {
    async function lookupUser() {
      if (!username) {
        setLookupLoading(false)
        return
      }

      try {
        setLookupLoading(true)
        setLookupError(null)

        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single()

        if (error || !data) {
          setLookupError('User not found')
          setUserId(null)
        } else {
          setUserId(data.id)
        }
      } catch (err) {
        setLookupError('Something went wrong')
      } finally {
        setLookupLoading(false)
      }
    }

    lookupUser()
  }, [username])

  // Fetch their seasons and shared seasons
  useEffect(() => {
    async function fetchSeasons() {
      if (!userId) return

      try {
        // Get their season memberships
        const { data: theirMembers, error: theirError } = await supabase
          .from('moves_season_members')
          .select('season_id')
          .eq('user_id', userId)

        if (theirError) throw theirError
        const theirSeasonIds = (theirMembers || []).map((m) => m.season_id)

        if (theirSeasonIds.length > 0) {
          const { data: seasonsData, error: seasonsError } = await supabase
            .from('moves_seasons')
            .select('*')
            .in('id', theirSeasonIds)
            .order('created_at', { ascending: false })

          if (!seasonsError) {
            setPublicSeasons(seasonsData || [])
          }
        }

        // Check for shared seasons with current user
        if (user && user.id !== userId) {
          const { data: myMembers, error: myError } = await supabase
            .from('moves_season_members')
            .select('season_id')
            .eq('user_id', user.id)

          if (!myError && myMembers) {
            const mySeasonIds = myMembers.map((m) => m.season_id)
            const shared = theirSeasonIds.filter((id) => mySeasonIds.includes(id))

            if (shared.length > 0) {
              const { data: sharedData, error: sharedError } = await supabase
                .from('moves_seasons')
                .select('*')
                .in('id', shared)
                .order('created_at', { ascending: false })

              if (!sharedError) {
                setSharedSeasons(sharedData || [])
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user seasons:', err)
      }
    }

    fetchSeasons()
  }, [userId, user])

  const isLoading = lookupLoading || profileLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-sky-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (lookupError || !profile) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        }
        title="User not found"
        description={`No user with the username @${username} exists.`}
        action={<Link to="/"><Button variant="secondary">Go Home</Button></Link>}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-20 pb-24 md:pb-8 space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        <Avatar
          src={profile.avatar_url}
          name={profile.display_name || profile.username || ''}
          size="xl"
          className="mb-4"
        />
        <h1 className="font-display text-2xl text-charcoal">
          {profile.display_name || profile.username || 'Unknown'}
        </h1>
        {profile.username && (
          <p className="font-body text-warm-gray text-sm mt-0.5">
            @{profile.username}
          </p>
        )}
        {profile.bio && (
          <p className="font-body text-charcoal text-sm mt-2 max-w-sm leading-relaxed">
            {profile.bio}
          </p>
        )}
        {profile.city && (
          <p className="font-body text-warm-gray text-xs mt-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {profile.city}
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

      {/* Invite Button */}
      <div className="flex justify-center">
        <Button variant="secondary" size="sm">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Invite to Season
        </Button>
      </div>

      {/* Shared Seasons */}
      {sharedSeasons.length > 0 && (
        <section>
          <h2 className="font-display text-lg text-charcoal mb-3">Seasons Together</h2>
          <div className="space-y-3">
            {sharedSeasons.map((season) => (
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
                    <Badge variant="accent">Shared</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Season History */}
      <section>
        <h2 className="font-display text-lg text-charcoal mb-3">Season History</h2>
        {publicSeasons.length === 0 ? (
          <p className="font-body text-sm text-warm-gray text-center py-4">
            No seasons yet.
          </p>
        ) : (
          <div className="space-y-3">
            {publicSeasons.map((season) => (
              <Card key={season.id} className="p-4">
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
                  <Badge variant={season.draft_status === 'active' ? 'success' : 'default'}>
                    {season.draft_status === 'active' ? 'Active' : season.draft_status === 'completed' ? 'Ended' : season.draft_status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
