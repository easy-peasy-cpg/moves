import React, { useState } from 'react'
import Button from '../ui/Button'

export default function InviteLink({ code, seasonName }) {
  const [copied, setCopied] = useState(false)

  const inviteUrl = `${window.location.origin}/join/${code}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = inviteUrl
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: seasonName ? `Join "${seasonName}" on Moves` : 'Join my season on Moves',
          text: 'Come make moves with me this season.',
          url: inviteUrl,
        })
      } catch {
        // User cancelled or share failed silently
      }
    }
  }

  return (
    <div className="space-y-3">
      <label className="block font-body font-medium text-sm text-charcoal">
        Invite Link
      </label>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-cream rounded-xl border border-warm-gray/30 px-4 py-3 font-body text-sm text-charcoal truncate select-all">
          {inviteUrl}
        </div>
        <Button
          variant={copied ? 'ghost' : 'secondary'}
          size="md"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-sage-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </span>
          )}
        </Button>
      </div>

      {typeof navigator !== 'undefined' && navigator.share && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="w-full"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share with your crew
        </Button>
      )}
    </div>
  )
}
