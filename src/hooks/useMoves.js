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
        .from('moves_drafted')
        .select(`
          *,
          moves_pool (
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
    async (draftedMoveId, photoUrl, story, collabPartnerId, celebrationPrompt) => {
      try {
        // Update the drafted move as completed
        const updateFields = {
          is_completed: true,
          completed_at: new Date().toISOString(),
          completion_photo_url: photoUrl || null,
          completion_story: story || null,
        }
        if (collabPartnerId) {
          updateFields.collab_partner_id = collabPartnerId
        }
        const { error: updateError } = await supabase
          .from('moves_drafted')
          .update(updateFields)
          .eq('id', draftedMoveId)

        if (updateError) throw updateError

        // Create a feed post for the completion
        const feedPost = {
          season_id: seasonId,
          user_id: userId,
          drafted_move_id: draftedMoveId,
        }
        if (celebrationPrompt) {
          feedPost.celebration_prompt = celebrationPrompt
        }
        const { error: feedError } = await supabase.from('moves_feed_posts').insert(feedPost)

        if (feedError) console.error('Feed post error (non-blocking):', feedError)

        // Increment moves_completed on the season member
        const { data: memberData } = await supabase
          .from('moves_season_members')
          .select('moves_completed')
          .eq('season_id', seasonId)
          .eq('user_id', userId)
          .single()

        if (memberData) {
          await supabase
            .from('moves_season_members')
            .update({ moves_completed: (memberData.moves_completed || 0) + 1 })
            .eq('season_id', seasonId)
            .eq('user_id', userId)
        }

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
