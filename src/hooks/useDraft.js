import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export function useDraft(seasonId) {
  const { user } = useAuth()
  const [season, setSeason] = useState(null)
  const [pool, setPool] = useState([])
  const [draftedMoves, setDraftedMoves] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const myMoves = draftedMoves.filter((dm) => dm.user_id === user?.id)
  const currentDrafter = members.find((m) => m.user_id === season?.current_drafter_id) || null
  const isMyTurn = season?.current_drafter_id === user?.id

  const fetchAll = useCallback(async () => {
    if (!seasonId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Fetch season
      const { data: seasonData, error: seasonError } = await supabase
        .from('moves_seasons')
        .select('*')
        .eq('id', seasonId)
        .single()
      if (seasonError) throw seasonError
      setSeason(seasonData)

      // Fetch members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('moves_season_members')
        .select(`
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('season_id', seasonId)
        .order('join_order', { ascending: true })
      if (membersError) throw membersError
      setMembers(membersData || [])

      // Fetch move pool
      const { data: poolData, error: poolError } = await supabase
        .from('moves_pool')
        .select('*')
        .eq('season_id', seasonId)
      if (poolError) throw poolError
      setPool(poolData || [])

      // Fetch drafted moves
      const { data: draftedData, error: draftedError } = await supabase
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
        .order('draft_pick', { ascending: true })
      if (draftedError) throw draftedError
      setDraftedMoves(draftedData || [])
    } catch (err) {
      console.error('Error fetching draft data:', err)
    } finally {
      setLoading(false)
    }
  }, [seasonId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Realtime subscriptions
  useEffect(() => {
    if (!seasonId) return

    const channel = supabase
      .channel(`draft-${seasonId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'moves_seasons',
          filter: `id=eq.${seasonId}`,
        },
        (payload) => {
          setSeason(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moves_pool',
          filter: `season_id=eq.${seasonId}`,
        },
        () => {
          // Refetch pool on any change
          supabase
            .from('moves_pool')
            .select('*')
            .eq('season_id', seasonId)
            .then(({ data }) => {
              if (data) setPool(data)
            })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'moves_drafted',
          filter: `season_id=eq.${seasonId}`,
        },
        () => {
          // Refetch drafted moves on new pick
          supabase
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
            .order('draft_pick', { ascending: true })
            .then(({ data }) => {
              if (data) setDraftedMoves(data)
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [seasonId])

  /**
   * Snake draft logic:
   * Round 1: player 0, 1, 2, ..., N-1
   * Round 2: player N-1, N-2, ..., 0
   * Round 3: player 0, 1, 2, ..., N-1
   * etc.
   */
  function getNextDrafter(currentRound, currentPick, membersList) {
    const n = membersList.length
    if (n === 0) return { nextDrafterId: null, nextRound: currentRound, nextPick: currentPick }

    // Sort members by join_order
    const sorted = [...membersList].sort((a, b) => a.join_order - b.join_order)

    // Determine position within current round (0-indexed)
    const positionInRound = (currentPick - 1) % n
    const isForwardRound = currentRound % 2 === 1 // odd rounds go forward

    // Check if we're at end of round
    const isEndOfRound = positionInRound === n - 1

    let nextRound = currentRound
    let nextPickInRound = positionInRound + 1

    if (isEndOfRound) {
      nextRound = currentRound + 1
      nextPickInRound = 0
    }

    const isNextForward = nextRound % 2 === 1
    let nextIndex
    if (isNextForward) {
      nextIndex = nextPickInRound
    } else {
      nextIndex = n - 1 - nextPickInRound
    }

    return {
      nextDrafterId: sorted[nextIndex]?.user_id || null,
      nextRound,
      nextPick: currentPick + 1,
    }
  }

  const makePick = useCallback(
    async (movePoolId) => {
      if (!user || !season || !isMyTurn) return

      try {
        // Insert drafted move
        const { error: insertError } = await supabase.from('moves_drafted').insert({
          season_id: seasonId,
          user_id: user.id,
          move_pool_id: movePoolId,
          draft_round: season.current_round || 1,
          draft_pick: season.current_pick || 1,
        })
        if (insertError) throw insertError

        // Mark move as drafted in pool
        const { error: poolError } = await supabase
          .from('moves_pool')
          .update({
            is_drafted: true,
            drafted_by: user.id,
            draft_round: season.current_round || 1,
            draft_pick: season.current_pick || 1,
          })
          .eq('id', movePoolId)
        if (poolError) throw poolError

        // Calculate next drafter using snake logic
        const { nextDrafterId, nextRound, nextPick } = getNextDrafter(
          season.current_round || 1,
          season.current_pick || 1,
          members
        )

        // Update season with next drafter
        const { error: seasonError } = await supabase
          .from('moves_seasons')
          .update({
            current_drafter_id: nextDrafterId,
            current_round: nextRound,
            current_pick: nextPick,
          })
          .eq('id', seasonId)
        if (seasonError) throw seasonError
      } catch (err) {
        console.error('Error making pick:', err)
        throw err
      }
    },
    [user, season, isMyTurn, seasonId, members]
  )

  const startDraft = useCallback(async () => {
    if (!seasonId || !members.length) return

    try {
      // Randomize member order
      const shuffled = [...members].sort(() => Math.random() - 0.5)

      // Update join_order for each member
      for (let i = 0; i < shuffled.length; i++) {
        const { error } = await supabase
          .from('moves_season_members')
          .update({ join_order: i + 1 })
          .eq('id', shuffled[i].id)
        if (error) throw error
      }

      // Set draft_status to drafting, set first drafter
      const { error: seasonError } = await supabase
        .from('moves_seasons')
        .update({
          draft_status: 'drafting',
          current_drafter_id: shuffled[0].user_id,
          current_round: 1,
          current_pick: 1,
        })
        .eq('id', seasonId)
      if (seasonError) throw seasonError

      // Refetch everything
      await fetchAll()
    } catch (err) {
      console.error('Error starting draft:', err)
      throw err
    }
  }, [seasonId, members, fetchAll])

  return {
    season,
    pool,
    draftedMoves,
    myMoves,
    currentDrafter,
    isMyTurn,
    loading,
    makePick,
    startDraft,
  }
}
