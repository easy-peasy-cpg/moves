import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

const statusConfig = {
  pre_draft: { label: 'Building Pool', variant: 'accent' },
  drafting: { label: 'Drafting', variant: 'warning' },
  completed: { label: 'Active', variant: 'success' },
}

function formatDateRange(startDate, endDate) {
  const opts = { month: 'short', day: 'numeric' }
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')

  const startStr = start.toLocaleDateString('en-US', opts)
  const endStr = end.toLocaleDateString('en-US', {
    ...opts,
    year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined,
  })

  const yearSuffix = end.getFullYear() !== new Date().getFullYear()
    ? `, ${end.getFullYear()}`
    : ''

  return `${startStr} to ${endStr}${yearSuffix}`
}

export default function SeasonCard({ season }) {
  const navigate = useNavigate()

  const { id, name, start_date, end_date, draft_status, members = [] } = season

  const status = statusConfig[draft_status] || statusConfig.pre_draft

  function handleClick() {
    switch (draft_status) {
      case 'pre_draft':
        navigate(`/seasons/${id}/pool`)
        break
      case 'drafting':
        navigate(`/seasons/${id}/draft`)
        break
      case 'completed':
      default:
        navigate(`/seasons/${id}`)
        break
    }
  }

  // Show up to 4 avatars
  const displayMembers = members.slice(0, 4)
  const extraCount = members.length > 4 ? members.length - 4 : 0

  return (
    <Card onClick={handleClick} className="p-5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display text-xl text-charcoal leading-tight">
          {name}
        </h3>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <p className="font-body text-sm text-warm-gray mb-4">
        {formatDateRange(start_date, end_date)}
      </p>

      {/* Member avatars */}
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {displayMembers.map((member) => {
            const profile = member.profiles || member
            return (
              <Avatar
                key={member.user_id || profile.id}
                src={profile.avatar_url}
                name={profile.display_name || profile.username || 'Member'}
                size="sm"
                className="ring-2 ring-warm-white"
              />
            )
          })}
          {extraCount > 0 && (
            <div className="w-8 h-8 rounded-full bg-light-warm-gray flex items-center justify-center ring-2 ring-warm-white">
              <span className="font-body text-xs font-semibold text-warm-gray">
                +{extraCount}
              </span>
            </div>
          )}
        </div>
        <span className="font-body text-xs text-warm-gray ml-3">
          {members.length} member{members.length !== 1 ? 's' : ''}
        </span>
      </div>
    </Card>
  )
}
