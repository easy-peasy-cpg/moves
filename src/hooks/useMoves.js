import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMoves(seasonId, userId) {
  const [moves, setMoves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMoves = useCallback(async () => {
    if (!seasonId || !userId) {
      setMoves([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('drafted_moves')
        .select(`
          *,
          move_pool (
            id,
            title,
            category,
            description
          )
        `)
        .eq('season_id', seasonId)
        .eq('user_id', userId)
        .order('draft_pick', { ascending: true })

      if (fetchError) throw fetchError
      setMoves(data || [])
    } catch (err) {
      console.error('Error fetching moves:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [seasonId, userId])

  useEffect(() => {
    fetchMoves()
  }, [fetchMoves])

  const completeMove = useCallback(
    async (draftedMoveId, photoUrl, story) => {
      try {
        // Update the drafted move as completed
        const { error: updateError } = await supabase
          .from('drafted_moves')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
            completion_photo_url: photoUrl || null,
            completion_story: story || null,
          })
          .eq('id', draftedMoveId)

        if (updateError) throw updateError

        // Create a feed post for the completion
        const { error: feedError } = await supabase.from('feed_posts').insert({
          season_id: seasonId,
          user_id: userId,
          drafted_move_id: draftedMoveId,
          photo_url: photoUrl || null,
          caption: story || null,
          post_type: 'completion',
        })

        if (feedError) throw feedError

        // Refetch moves to update state
        await fetchMoves()
      } catch (err) {
        console.error('Error completing move:', err)
        throw err
      }
    },
    [seasonId, userId, fetchMoves]
  )

  return { moves, loading, error, completeMove, refetch: fetchMoves }
}
