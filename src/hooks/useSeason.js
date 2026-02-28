import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSeason(seasonId) {
  const [season, setSeason] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSeason = useCallback(async () => {
    if (!seasonId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data: seasonData, error: seasonError } = await supabase
        .from('moves_seasons')
        .select('*')
        .eq('id', seasonId)
        .single()

      if (seasonError) throw seasonError
      setSeason(seasonData)

      const { data: membersData, error: membersError } = await supabase
        .from('moves_season_members')
        .select(`
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url,
            bio,
            city
          )
        `)
        .eq('season_id', seasonId)
        .order('join_order', { ascending: true })

      if (membersError) throw membersError
      setMembers(membersData || [])
    } catch (err) {
      console.error('Error fetching season:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [seasonId])

  useEffect(() => {
    fetchSeason()
  }, [fetchSeason])

  // Subscribe to realtime changes on the season row
  useEffect(() => {
    if (!seasonId) return

    const channel = supabase
      .channel(`season-${seasonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moves_seasons',
          filter: `id=eq.${seasonId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setSeason(payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [seasonId])

  return { season, members, loading, error, refetch: fetchSeason }
}
