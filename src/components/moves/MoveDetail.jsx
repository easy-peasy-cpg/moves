import React from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import CategoryPill from '../ui/CategoryPill'

export default function MoveDetail({ move, onClose, onComplete }) {
  if (!move) return null

  const pool = move.move_pool || {}
  const isCompleted = move.is_completed

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <div className="space-y-5">
        {/* Title + Category */}
        <div>
          <h2 className="font-display text-xl text-charcoal">{pool.title}</h2>
          <div className="mt-2">
            <CategoryPill category={pool.category} size="sm" />
          </div>
        </div>

        {/* Description */}
        {pool.description && (
          <p className="font-body text-sm text-charcoal leading-relaxed">
            {pool.description}
          </p>
        )}

        {isCompleted ? (
          <>
            {/* Completion Photo */}
            {move.completion_photo_url && (
              <div className="rounded-xl overflow-hidden">
                <img
                  src={move.completion_photo_url}
                  alt={pool.title}
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            {/* Celebration Prompt */}
            {move.celebration_prompt && (
              <p className="font-body text-sm text-warm-gray italic leading-relaxed">
                {move.celebration_prompt}
              </p>
            )}

            {/* Story */}
            {move.completion_story && (
              <div className="bg-cream rounded-xl p-4">
                <p className="font-body text-sm text-charcoal leading-relaxed">
                  {move.completion_story}
                </p>
              </div>
            )}

            {/* Completion Date */}
            {move.completed_at && (
              <p className="font-body text-xs text-warm-gray">
                Completed {new Date(move.completed_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </>
        ) : (
          <>
            {/* Not completed state */}
            <div className="bg-cream rounded-xl p-6 text-center">
              <p className="font-body text-sm text-warm-gray mb-4">
                This Move is waiting for you.
              </p>
              <Button
                className="bg-sage-green text-white hover:bg-sage-green/90"
                onClick={onComplete}
              >
                Complete this Move
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
