import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export function useSeasons() {
  const { user } = useAuth()
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSeasons = useCallback(async () => {
    if (!user) {
      setSeasons([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get all season_ids the user is a member of
      const { data: memberRows, error: memberError } = await supabase
        .from('moves_season_members')
        .select('season_id')
        .eq('user_id', user.id)

      if (memberError) throw memberError

      if (!memberRows || memberRows.length === 0) {
        setSeasons([])
        setLoading(false)
        return
      }

      const seasonIds = memberRows.map((row) => row.season_id)

      // Fetch the actual season records
      const { data: seasonsData, error: seasonsError } = await supabase
        .from('moves_seasons')
        .select('*')
        .in('id', seasonIds)
        .order('created_at', { ascending: false })

      if (seasonsError) throw seasonsError
      setSeasons(seasonsData || [])
    } catch (err) {
      console.error('Error fetching seasons:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSeasons()
  }, [fetchSeasons])

  return { seasons, loading, error, refetch: fetchSeasons }
}
