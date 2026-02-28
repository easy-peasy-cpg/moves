import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { useSeason } from '../hooks/useSeason'
import { usePool } from '../hooks/usePool'
import { useToast } from '../components/ui/Toast'
import { getMoveSuggestions } from '../lib/api'
import Button from '../components/ui/Button'
import CategoryPill from '../components/ui/CategoryPill'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
import AddMoveForm from '../components/pool/AddMoveForm'
import SuggestionPills from '../components/pool/SuggestionPills'

const CATEGORIES = ['physical', 'personal', 'professional', 'social', 'creative', 'adventure', 'wildcard']

const categoryDotColors = {
  physical: 'bg-sage-green',
  personal: 'bg-sunset-gold',
  professional: 'bg-sky-blue',
  social: 'bg-magenta',
  creative: 'bg-deep-purple',
  adventure: 'bg-burnt-orange',
  wildcard: 'bg-burnt-orange',
}

export default function BuildPool() {
  const { id: seasonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { season, members, loading: seasonLoading } = useSeason(seasonId)
  const { pool, loading: poolLoading, addMove, poolStats } = usePool(seasonId)

  const [activeTab, setActiveTab] = useState('all')
  const [addingMove, setAddingMove] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  const isCreator = season?.created_by === user?.id
  const memberCount = members.length
  const targetMoves = memberCount * 20
  const poolReady = pool.length >= targetMoves && targetMoves > 0

  const filteredMoves = useMemo(() => {
    if (activeTab === 'all') return pool
    return pool.filter((m) => m.category === activeTab)
  }, [activeTab, pool])

  async function handleAddMove({ title, description, isCollab }) {
    const category = activeTab === 'all' ? 'wildcard' : activeTab

    setAddingMove(true)
    try {
      await addMove(title, description, category, isCollab)
      toast({ message: 'Move added to the pool!', type: 'success' })
    } catch {
      toast({ message: 'Could not add move. Try again.', type: 'error' })
    } finally {
      setAddingMove(false)
    }
  }

  async function handleGetSuggestions() {
    const category = activeTab === 'all' ? 'wildcard' : activeTab
    const existingTitles = pool
      .filter((m) => m.category === category)
      .map((m) => m.title)

    setSuggestionsLoading(true)
    try {
      const result = await getMoveSuggestions(category, existingTitles)
      setSuggestions(result || [])
    } catch {
      toast({ message: 'Could not load suggestions right now.', type: 'error' })
    } finally {
      setSuggestionsLoading(false)
    }
  }

  async function handleSelectSuggestion(suggestion) {
    const category = activeTab === 'all' ? 'wildcard' : activeTab

    try {
      await addMove(suggestion.title, null, category, suggestion.isCollab || false)
      toast({ message: `"${suggestion.title}" added!`, type: 'success' })
      setSuggestions((prev) => prev.filter((s) => s.title !== suggestion.title))
    } catch {
      toast({ message: 'Could not add suggestion. Try again.', type: 'error' })
    }
  }

  async function handleStartDraft() {
    try {
      const { error } = await supabase
        .from('moves_seasons')
        .update({ draft_status: 'drafting' })
        .eq('id', seasonId)

      if (error) throw error
      navigate(`/seasons/${seasonId}/draft`)
    } catch (err) {
      console.error('Error starting draft:', err)
      toast({ message: 'Could not start the draft. Try again.', type: 'error' })
    }
  }

  if (seasonLoading || poolLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-sunset-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pb-32">
      {/* Header */}
      <div className="bg-warm-white border-b border-light-warm-gray px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl text-charcoal">
            {season?.name || 'Build the Pool'}
          </h1>
          <p className="font-body text-warm-gray text-sm mt-1">
            {pool.length} Move{pool.length !== 1 ? 's' : ''} in the pool
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-light-warm-gray bg-warm-white">
        <div className="max-w-2xl mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 py-3 min-w-max">
            <button
              onClick={() => setActiveTab('all')}
              className={[
                'px-4 py-1.5 rounded-full text-sm font-body font-semibold transition-all duration-200 shrink-0',
                activeTab === 'all'
                  ? 'bg-charcoal text-warm-white'
                  : 'bg-light-warm-gray text-charcoal hover:bg-warm-gray/30',
              ].join(' ')}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat)
                  setSuggestions([])
                }}
                className="shrink-0"
              >
                <CategoryPill
                  category={cat}
                  size="md"
                  className={activeTab === cat ? 'ring-2 ring-charcoal/20 ring-offset-1' : 'opacity-70 hover:opacity-100'}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Add a Move Form */}
        {activeTab !== 'all' ? (
          <AddMoveForm
            onSubmit={handleAddMove}
            category={activeTab}
            loading={addingMove}
          />
        ) : (
          <div className="bg-warm-white rounded-2xl border border-light-warm-gray p-5">
            <p className="font-body text-sm text-warm-gray text-center">
              Select a category tab to add moves and get suggestions.
            </p>
          </div>
        )}

        {/* AI Suggestions */}
        {activeTab !== 'all' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-charcoal">AI Suggestions</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGetSuggestions}
                loading={suggestionsLoading}
              >
                Get Suggestions
              </Button>
            </div>
            <SuggestionPills
              suggestions={suggestions}
              onSelect={handleSelectSuggestion}
              loading={suggestionsLoading}
            />
          </div>
        )}

        {/* Existing Moves in Pool */}
        <div>
          <h3 className="font-display text-lg text-charcoal mb-3">
            {activeTab === 'all' ? 'All Moves' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Moves`}
            <span className="text-warm-gray text-base ml-2">({filteredMoves.length})</span>
          </h3>

          {filteredMoves.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              }
              title="No moves yet"
              description={
                activeTab === 'all'
                  ? 'Pick a category and start adding moves to build the pool.'
                  : `Be the first to add a ${activeTab} move to the pool.`
              }
            />
          ) : (
            <div className="space-y-3 stagger-children">
              {filteredMoves.map((move) => (
                <div
                  key={move.id}
                  className="bg-warm-white rounded-xl border border-light-warm-gray p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-body font-semibold text-charcoal truncate">
                          {move.title}
                        </h4>
                        {move.is_collab && (
                          <Badge variant="accent">Collab</Badge>
                        )}
                        {move.is_app_suggested && (
                          <Badge>AI</Badge>
                        )}
                      </div>
                      {move.description && (
                        <p className="font-body text-sm text-warm-gray line-clamp-2">
                          {move.description}
                        </p>
                      )}
                    </div>
                    {activeTab === 'all' && (
                      <CategoryPill category={move.category} size="sm" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Avatar
                      src={move.profiles?.avatar_url}
                      name={move.profiles?.display_name || move.profiles?.username || 'Unknown'}
                      size="sm"
                    />
                    <span className="font-body text-xs text-warm-gray">
                      {move.profiles?.display_name || move.profiles?.username || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-warm-white border-t border-light-warm-gray px-4 py-4 z-40">
        <div className="max-w-2xl mx-auto">
          {/* Category dots */}
          <div className="flex items-center justify-center gap-3 mb-3">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full ${categoryDotColors[cat]}`} />
                <span className="font-body text-xs text-warm-gray">
                  {poolStats.byCategory[cat] || 0}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm text-charcoal font-semibold">
                {pool.length} / {targetMoves || '...'} Moves
              </p>
              {poolReady && (
                <p className="font-body text-xs text-sage-green font-semibold">
                  Pool is ready!
                </p>
              )}
            </div>

            {isCreator && (
              <Button
                onClick={handleStartDraft}
                disabled={!poolReady}
                size="md"
              >
                Start the Draft
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
