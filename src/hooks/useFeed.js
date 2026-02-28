import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export function useFeed(seasonId) {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = useCallback(async () => {
    if (!seasonId) {
      setPosts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('moves_feed_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          moves_drafted:drafted_move_id (
            id,
            is_completed,
            completed_at,
            moves_pool (
              id,
              title,
              category,
              description
            )
          ),
          moves_comments (
            id,
            content,
            created_at,
            user_id,
            profiles:user_id (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('season_id', seasonId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching feed:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [seasonId])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Subscribe to realtime on feed_posts and comments
  useEffect(() => {
    if (!seasonId) return

    const channel = supabase
      .channel(`feed-${seasonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moves_feed_posts',
          filter: `season_id=eq.${seasonId}`,
        },
        () => {
          fetchPosts()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'moves_comments',
        },
        () => {
          // Refetch posts to get updated comments
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [seasonId, fetchPosts])

  const addComment = useCallback(
    async (feedPostId, content) => {
      if (!user) return

      try {
        const { data, error: insertError } = await supabase
          .from('moves_comments')
          .insert({
            feed_post_id: feedPostId,
            user_id: user.id,
            content,
          })
          .select()
          .single()

        if (insertError) throw insertError
        return data
      } catch (err) {
        console.error('Error adding comment:', err)
        throw err
      }
    },
    [user]
  )

  return { posts, loading, error, addComment, refetch: fetchPosts }
}
