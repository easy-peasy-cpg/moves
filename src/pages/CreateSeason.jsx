import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import InviteLink from '../components/season/InviteLink'

function generateInviteCode() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8)
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

function StepIndicator({ currentStep }) {
  const steps = [1, 2, 3]
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step) => (
        <div
          key={step}
          className={[
            'w-2.5 h-2.5 rounded-full transition-all duration-300',
            step === currentStep
              ? 'bg-sunset-gold w-8'
              : step < currentStep
                ? 'bg-sunset-gold'
                : 'bg-light-warm-gray',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

export default function CreateSeason() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1 fields
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return addMonths(new Date().toISOString().split('T')[0], 3)
  })

  // Step 2 fields
  const [seasonId, setSeasonId] = useState(null)
  const [inviteCode, setInviteCode] = useState('')
  const [members, setMembers] = useState([])

  // Quick duration buttons
  function setDuration(months) {
    if (startDate) {
      setEndDate(addMonths(startDate, months))
    }
  }

  // Step 1 validation
  const step1Valid = name.trim().length > 0 && startDate && endDate && endDate > startDate

  // Handle step 1 next
  function handleNext() {
    if (!step1Valid) return
    handleCreateSeason()
  }

  // Create season in Supabase and move to step 2
  async function handleCreateSeason() {
    if (!user) return

    try {
      setLoading(true)
      const code = generateInviteCode()

      const { data: seasonData, error: seasonError } = await supabase
        .from('seasons')
        .insert({
          name: name.trim(),
          start_date: startDate,
          end_date: endDate,
          created_by: user.id,
          invite_code: code,
          draft_status: 'pre_draft',
        })
        .select()
        .single()

      if (seasonError) throw seasonError

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('season_members')
        .insert({
          season_id: seasonData.id,
          user_id: user.id,
          join_order: 1,
        })

      if (memberError) throw memberError

      setSeasonId(seasonData.id)
      setInviteCode(code)
      setMembers([
        {
          user_id: user.id,
          profiles: profile,
          join_order: 1,
        },
      ])
      setStep(2)
    } catch (err) {
      console.error('Error creating season:', err)
      toast({ message: 'Failed to create season. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to new members joining in real-time
  useEffect(() => {
    if (!seasonId) return

    const channel = supabase
      .channel(`create-season-members-${seasonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'season_members',
          filter: `season_id=eq.${seasonId}`,
        },
        async (payload) => {
          // Skip if it is the creator (already in list)
          if (payload.new.user_id === user.id) return

          // Fetch the profile for the new member
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single()

          setMembers((prev) => [
            ...prev,
            {
              user_id: payload.new.user_id,
              profiles: profileData,
              join_order: payload.new.join_order,
            },
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [seasonId, user?.id])

  // Navigate to pool builder
  function handleStartPool() {
    navigate(`/seasons/${seasonId}/pool`)
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-lg mx-auto">
        <StepIndicator currentStep={step} />

        {/* Step 1: Season Details */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h1 className="font-display text-3xl text-charcoal text-center mb-2">
              Start a New Season
            </h1>
            <p className="font-body text-warm-gray text-center mb-8">
              Give it a name, pick the dates, and get your crew together.
            </p>

            <Card className="p-6 space-y-5">
              <Input
                label="Season Name"
                placeholder="Summer 2026, Q3 Moves, The Boys Are Back"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  error={endDate && startDate && endDate <= startDate ? 'Must be after start' : ''}
                />
              </div>

              {/* Quick duration buttons */}
              <div>
                <p className="font-body text-sm text-warm-gray mb-2">Quick duration</p>
                <div className="flex gap-2">
                  {[
                    { label: '1 Month', months: 1 },
                    { label: '3 Months', months: 3 },
                    { label: '6 Months', months: 6 },
                  ].map(({ label, months }) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setDuration(months)}
                      className={[
                        'px-4 py-2 rounded-full text-sm font-body font-semibold transition-all duration-200',
                        endDate === addMonths(startDate, months)
                          ? 'bg-sunset-gold text-white'
                          : 'bg-light-warm-gray text-charcoal hover:bg-warm-gray/30',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={!step1Valid}
                loading={loading}
                className="w-full"
                size="lg"
              >
                Next
              </Button>
            </Card>
          </div>
        )}

        {/* Step 2: Invite Your Crew */}
        {step === 2 && (
          <div className="animate-fade-up">
            <h1 className="font-display text-3xl text-charcoal text-center mb-2">
              Invite Your Crew
            </h1>
            <p className="font-body text-warm-gray text-center mb-8">
              Share this link with the people you want in your season.
            </p>

            <Card className="p-6 space-y-6">
              <InviteLink code={inviteCode} seasonName={name} />

              {/* Crew members */}
              <div>
                <p className="font-body font-medium text-sm text-charcoal mb-3">
                  Crew ({members.length})
                </p>
                <div className="space-y-3">
                  {members.map((member, i) => (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-3 animate-slide-in"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <Avatar
                        src={member.profiles?.avatar_url}
                        name={member.profiles?.display_name || member.profiles?.username || 'Member'}
                        size="sm"
                      />
                      <span className="font-body text-sm text-charcoal">
                        {member.profiles?.display_name || member.profiles?.username || 'Member'}
                      </span>
                      {member.join_order === 1 && (
                        <span className="ml-auto font-body text-xs text-warm-gray">Creator</span>
                      )}
                    </div>
                  ))}
                </div>

                {members.length < 2 && (
                  <p className="font-body text-sm text-warm-gray mt-4 text-center">
                    Waiting for {2 - members.length} more to join...
                  </p>
                )}
              </div>

              <Button
                onClick={handleStartPool}
                disabled={members.length < 2}
                className="w-full"
                size="lg"
              >
                Start Building the Pool
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
