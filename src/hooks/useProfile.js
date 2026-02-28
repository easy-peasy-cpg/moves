import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setStats(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Fetch season stats
      const { data: memberData, error: memberError } = await supabase
        .from('season_members')
        .select('season_id, moves_completed')
        .eq('user_id', userId)

      if (memberError) throw memberError

      const seasonCount = memberData?.length || 0
      const totalMovesCompleted = (memberData || []).reduce(
        (sum, row) => sum + (row.moves_completed || 0),
        0
      )

      setStats({
        seasonCount,
        totalMovesCompleted,
      })
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, stats, loading, error }
}
