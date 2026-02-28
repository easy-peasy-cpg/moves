import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export function usePool(seasonId) {
  const { user } = useAuth()
  const [pool, setPool] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPool = useCallback(async () => {
    if (!seasonId) {
      setPool([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('move_pool')
        .select(`
          *,
          profiles:submitted_by (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('season_id', seasonId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setPool(data || [])
    } catch (err) {
      console.error('Error fetching pool:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [seasonId])

  useEffect(() => {
    fetchPool()
  }, [fetchPool])

  // Subscribe to realtime changes on move_pool for this season
  useEffect(() => {
    if (!seasonId) return

    const channel = supabase
      .channel(`pool-${seasonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'move_pool',
          filter: `season_id=eq.${seasonId}`,
        },
        () => {
          // Refetch on any change to get joined profile data
          fetchPool()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [seasonId, fetchPool])

  const addMove = useCallback(
    async (title, description, category, isCollab = false) => {
      if (!user || !seasonId) return

      try {
        const { data, error: insertError } = await supabase
          .from('move_pool')
          .insert({
            season_id: seasonId,
            title,
            description: description || null,
            category,
            is_collab: isCollab,
            submitted_by: user.id,
          })
          .select()
          .single()

        if (insertError) throw insertError
        return data
      } catch (err) {
        console.error('Error adding move to pool:', err)
        throw err
      }
    },
    [user, seasonId]
  )

  const poolStats = useMemo(() => {
    const byCategory = {}
    pool.forEach((move) => {
      const cat = move.category || 'uncategorized'
      byCategory[cat] = (byCategory[cat] || 0) + 1
    })
    return {
      total: pool.length,
      byCategory,
    }
  }, [pool])

  return { pool, loading, error, addMove, refetch: fetchPool, poolStats }
}
