import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

export default function NudgeButton({ seasonId, receiverId, draftedMoveId, moveTitle }) {
  const { user } = useAuth()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleNudge(e) {
    e.stopPropagation()
    if (sent || sending || !user) return

    setSending(true)
    try {
      // Insert nudge record
      const { error: nudgeError } = await supabase
        .from('moves_nudges')
        .insert({
          season_id: seasonId,
          sender_id: user.id,
          receiver_id: receiverId,
          drafted_move_id: draftedMoveId,
        })

      if (nudgeError) throw nudgeError

      // Insert notification for the receiver
      const { error: notifError } = await supabase
        .from('moves_notifications')
        .insert({
          user_id: receiverId,
          actor_id: user.id,
          type: 'nudge',
          season_id: seasonId,
          reference_id: draftedMoveId,
          message: `nudged you about "${moveTitle}"`,
        })

      if (notifError) {
        console.error('Error creating nudge notification:', notifError)
      }

      setSent(true)

      // Re-enable after 5 seconds
      setTimeout(() => {
        setSent(false)
      }, 5000)
    } catch (err) {
      console.error('Error sending nudge:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <button
      onClick={handleNudge}
      disabled={sent || sending}
      className={[
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body font-semibold transition-all duration-200 shrink-0',
        sent
          ? 'bg-sage-green/10 text-sage-green cursor-default'
          : 'bg-burnt-orange/10 text-burnt-orange hover:bg-burnt-orange/20 active:scale-95',
        sending ? 'opacity-50' : '',
      ].join(' ')}
    >
      {sent ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Nudged!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 12h5l-3-3m0 6l3-3" />
            <path d="M4 12h7" />
          </svg>
          Nudge
        </>
      )}
    </button>
  )
}
