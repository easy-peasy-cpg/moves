import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import CategoryPill from '../ui/CategoryPill';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

export default function ConfirmPickModal({ move, isOpen, onClose, onConfirm, loading }) {
  if (!move) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Your Pick" size="md">
      <div className="space-y-5">
        {/* Move details */}
        <div className="bg-cream rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CategoryPill category={move.category} />
            {move.is_collab && (
              <Badge variant="accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Collab
              </Badge>
            )}
          </div>

          <h3 className="font-display text-2xl text-charcoal mb-2">
            {move.title}
          </h3>

          {move.description && (
            <p className="font-body text-sm text-warm-gray leading-relaxed mb-4">
              {move.description}
            </p>
          )}

          {move.submitted_by_name && (
            <div className="flex items-center gap-2 pt-3 border-t border-light-warm-gray">
              <Avatar
                src={move.submitted_by_avatar}
                name={move.submitted_by_name}
                size="sm"
              />
              <span className="font-body text-xs text-warm-gray">
                Added by {move.submitted_by_name}
              </span>
            </div>
          )}
        </div>

        {/* Collab callout */}
        {move.is_collab && (
          <div className="flex items-start gap-3 bg-sunset-gold/10 rounded-xl p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-sunset-gold shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="font-body text-sm text-charcoal">
              This is a Collab Move. You will need a partner from your crew to complete it together.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="secondary"
            size="lg"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="lg"
            loading={loading}
            onClick={() => onConfirm?.(move.id)}
            className="flex-1 !bg-sunset-gold hover:!bg-sunset-gold/90"
          >
            Make Your Move
          </Button>
        </div>
      </div>
    </Modal>
  );
}
