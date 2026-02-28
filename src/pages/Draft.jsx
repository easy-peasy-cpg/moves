import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../lib/auth';
import { useDraft } from '../hooks/useDraft';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Card from '../components/ui/Card';
import CategoryPill from '../components/ui/CategoryPill';
import OnTheClock from '../components/draft/OnTheClock';
import PoolList from '../components/draft/PoolList';
import DraftFeed from '../components/draft/DraftFeed';
import MyRoster from '../components/draft/MyRoster';
import ConfirmPickModal from '../components/draft/ConfirmPickModal';

const SECONDS_PER_PICK = 60;
const TOTAL_ROUNDS = 20;

export default function Draft() {
  const { id: seasonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    season,
    pool,
    draftedMoves,
    myMoves,
    currentDrafter,
    isMyTurn,
    loading,
    makePick,
    startDraft,
  } = useDraft(seasonId);

  // Local UI state
  const [selectedMove, setSelectedMove] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pickLoading, setPickLoading] = useState(false);
  const [startingDraft, setStartingDraft] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SECONDS_PER_PICK);
  const [mobileTab, setMobileTab] = useState('pool');
  const timerRef = useRef(null);
  const prevPickRef = useRef(null);

  // Determine if user is the season creator
  const isCreator = season?.created_by === user?.id;

  // Build draft feed picks from draftedMoves
  const feedPicks = useMemo(() => {
    return (draftedMoves || []).map((dm) => {
      // Find the drafter's profile from pool or member info embedded in drafted move
      return {
        id: dm.id,
        user_display_name: dm.user_display_name || dm.profiles?.display_name || 'Unknown',
        user_avatar_url: dm.user_avatar_url || dm.profiles?.avatar_url || null,
        move_title: dm.moves_pool?.title || 'Unknown Move',
        category: dm.moves_pool?.category || null,
        round: dm.draft_round,
        pick_number: dm.draft_pick,
      };
    });
  }, [draftedMoves]);

  // Members list from the season hook (passed through draftedMoves or fetched separately)
  // We re-derive members from the useDraft hook which exposes currentDrafter
  // For the lobby, we read from draftedMoves parents -- actually useDraft returns members internally
  // but does not expose them. We can derive crew from pool submitters + currentDrafter.
  // Actually, looking at useDraft more carefully, it doesn't expose members directly.
  // We'll need to fetch them or work with what we have. Let's use the season + pool data.

  // Check if draft is complete
  const isDraftComplete = season?.draft_status === 'completed';
  const isDrafting = season?.draft_status === 'drafting';
  const isPreDraft = !isDrafting && !isDraftComplete;

  // Timer logic: reset on each new pick
  useEffect(() => {
    if (!isDrafting) return;

    const currentPick = season?.current_pick;
    if (currentPick !== prevPickRef.current) {
      prevPickRef.current = currentPick;
      setTimeRemaining(season?.seconds_per_pick || SECONDS_PER_PICK);
    }
  }, [isDrafting, season?.current_pick, season?.seconds_per_pick]);

  // Countdown interval
  useEffect(() => {
    if (!isDrafting) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDrafting, season?.current_pick]);

  // Auto-pick on timer expiry (only if it's my turn)
  useEffect(() => {
    if (timeRemaining === 0 && isMyTurn && isDrafting) {
      const available = pool.filter((m) => !m.is_drafted);
      if (available.length > 0) {
        const randomMove = available[Math.floor(Math.random() * available.length)];
        handleConfirmPick(randomMove.id);
      }
    }
  }, [timeRemaining, isMyTurn, isDrafting]);

  // Confetti when draft completes
  useEffect(() => {
    if (isDraftComplete) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4A9FD9', '#F5A623', '#E8762B', '#D94B7A', '#6B9E78', '#7B4FA0'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4A9FD9', '#F5A623', '#E8762B', '#D94B7A', '#6B9E78', '#7B4FA0'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isDraftComplete]);

  // Handlers
  const handleSelectMove = useCallback((move) => {
    setSelectedMove(move);
    setConfirmOpen(true);
  }, []);

  const handleConfirmPick = useCallback(
    async (movePoolId) => {
      try {
        setPickLoading(true);
        await makePick(movePoolId || selectedMove?.id);
        setConfirmOpen(false);
        setSelectedMove(null);
      } catch (err) {
        console.error('Failed to make pick:', err);
      } finally {
        setPickLoading(false);
      }
    },
    [makePick, selectedMove]
  );

  const handleStartDraft = useCallback(async () => {
    try {
      setStartingDraft(true);
      await startDraft();
    } catch (err) {
      console.error('Failed to start draft:', err);
    } finally {
      setStartingDraft(false);
    }
  }, [startDraft]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-light-warm-gray border-t-sunset-gold animate-spin mx-auto mb-4" />
          <p className="font-body text-warm-gray">Loading the draft...</p>
        </div>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-xl text-charcoal mb-2">Season not found</p>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // ============================================================
  // PRE-DRAFT LOBBY
  // ============================================================
  if (isPreDraft) {
    return (
      <div className="min-h-screen bg-cream pt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-up">
            <h1 className="font-display text-4xl text-charcoal mb-2">The Draft</h1>
            <p className="font-body text-warm-gray text-lg">{season.name}</p>
          </div>

          {/* Crew circle */}
          <Card className="p-8 mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <h2 className="font-display text-xl text-charcoal text-center mb-6">
              Your Crew
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {(season.members || []).map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="flex flex-col items-center gap-2 animate-scale-pop"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <Avatar
                    src={member.profiles?.avatar_url || member.avatar_url}
                    name={member.profiles?.display_name || member.display_name || 'Player'}
                    size="xl"
                    className="ring-2 ring-light-warm-gray"
                  />
                  <span className="font-body text-sm font-semibold text-charcoal text-center max-w-[80px] truncate">
                    {member.profiles?.display_name || member.display_name || 'Player'}
                  </span>
                </div>
              ))}
              {/* Fallback if members not on season obj */}
              {(!season.members || season.members.length === 0) && (
                <p className="font-body text-sm text-warm-gray">
                  Waiting for your crew to join...
                </p>
              )}
            </div>
          </Card>

          {/* Draft order info */}
          <Card className="p-6 mb-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-3">
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
                className="text-sunset-gold"
              >
                <polyline points="14 2 14 8 20 8" />
                <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                <path d="M2 15h10" />
                <path d="m5 12-3 3 3 3" />
              </svg>
              <h3 className="font-display text-lg text-charcoal">Snake Draft Format</h3>
            </div>
            <p className="font-body text-sm text-warm-gray leading-relaxed">
              {TOTAL_ROUNDS} rounds total. Odd rounds go in order (1, 2, 3...), even rounds reverse (3, 2, 1...).
              Draft order is randomized when the draft begins. Everyone ends up with {TOTAL_ROUNDS} Moves.
            </p>
          </Card>

          {/* Start button or waiting message */}
          <div className="text-center animate-fade-up" style={{ animationDelay: '300ms' }}>
            {isCreator ? (
              <Button
                size="lg"
                loading={startingDraft}
                onClick={handleStartDraft}
                className="!bg-sunset-gold hover:!bg-sunset-gold/90 text-white px-12 py-4 text-xl shadow-lg shadow-sunset-gold/30"
              >
                Start the Draft
              </Button>
            ) : (
              <div className="bg-warm-white rounded-2xl border border-light-warm-gray p-6">
                <div className="w-8 h-8 rounded-full border-4 border-light-warm-gray border-t-sunset-gold animate-spin mx-auto mb-3" />
                <p className="font-body text-warm-gray">
                  Waiting for the commissioner to start the draft...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DRAFT COMPLETE
  // ============================================================
  if (isDraftComplete) {
    // Group drafted moves by user
    const movesByUser = {};
    (draftedMoves || []).forEach((dm) => {
      const uid = dm.user_id;
      if (!movesByUser[uid]) {
        movesByUser[uid] = {
          user_id: uid,
          display_name: dm.user_display_name || dm.profiles?.display_name || 'Player',
          avatar_url: dm.user_avatar_url || dm.profiles?.avatar_url || null,
          moves: [],
        };
      }
      movesByUser[uid].moves.push(dm);
    });

    return (
      <div className="min-h-screen bg-cream pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Celebration header */}
          <div className="text-center mb-10 animate-fade-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sunset-gold/15 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sunset-gold"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 8 9 8" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 15 8 15 8" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <h1 className="font-display text-4xl text-charcoal mb-2">
              The Draft is Complete!
            </h1>
            <p className="font-body text-warm-gray text-lg">
              {season.name} / {TOTAL_ROUNDS} rounds, all moves claimed
            </p>
          </div>

          {/* Everyone's picks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {Object.values(movesByUser).map((player, idx) => (
              <Card
                key={player.user_id}
                className="p-5 animate-fade-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-light-warm-gray">
                  <Avatar
                    src={player.avatar_url}
                    name={player.display_name}
                    size="lg"
                  />
                  <div>
                    <h3 className="font-display text-lg text-charcoal">
                      {player.display_name}
                    </h3>
                    <span className="font-body text-xs text-warm-gray">
                      {player.moves.length} Moves
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {player.moves
                    .sort((a, b) => a.draft_pick - b.draft_pick)
                    .map((dm, mIdx) => (
                      <div key={dm.id || mIdx} className="flex items-center gap-2">
                        <span className="font-body text-xs text-warm-gray w-5 text-right shrink-0">
                          {dm.draft_pick}.
                        </span>
                        <span className="font-body text-sm text-charcoal flex-1 truncate">
                          {dm.moves_pool?.title || 'Untitled'}
                        </span>
                        <CategoryPill
                          category={dm.moves_pool?.category}
                          size="sm"
                        />
                      </div>
                    ))}
                </div>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center animate-fade-up" style={{ animationDelay: '400ms' }}>
            <Button
              size="lg"
              onClick={() => navigate(`/seasons/${seasonId}`)}
              className="!bg-sunset-gold hover:!bg-sunset-gold/90 text-white px-12 py-4 text-xl shadow-lg shadow-sunset-gold/30"
            >
              Time to Make Your Moves
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // LIVE DRAFT
  // ============================================================
  const mobileTabs = [
    { key: 'pool', label: 'Pool' },
    { key: 'my-moves', label: 'My Moves' },
    { key: 'feed', label: 'Feed' },
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col pt-16">
      {/* Your turn banner (mobile + desktop) */}
      {isMyTurn && (
        <div className="bg-sunset-gold text-white py-2.5 px-4 text-center animate-slide-in">
          <p className="font-display text-lg">
            Your pick! Choose a move from the pool.
          </p>
        </div>
      )}

      {/* On the Clock - always visible */}
      <div className="px-4 pt-4 pb-2 max-w-7xl mx-auto w-full">
        <OnTheClock
          drafter={currentDrafter}
          timeRemaining={timeRemaining}
          isMyTurn={isMyTurn}
          round={season?.current_round || 1}
          pick={season?.current_pick || 1}
        />
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden lg:flex flex-1 max-w-7xl mx-auto w-full px-4 pb-4 gap-4 overflow-hidden">
        {/* Left: Draft Feed */}
        <div className="w-72 shrink-0 flex flex-col">
          <Card className="flex-1 p-4 flex flex-col overflow-hidden">
            <DraftFeed picks={feedPicks} />
          </Card>
        </div>

        {/* Center: Pool */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl text-charcoal">The Pool</h2>
              <span className="font-body text-xs text-warm-gray">
                {pool.filter((m) => !m.is_drafted).length} remaining
              </span>
            </div>
            <PoolList
              pool={pool}
              onSelect={isMyTurn ? handleSelectMove : undefined}
              selectedId={selectedMove?.id}
            />
            {!isMyTurn && (
              <div className="mt-2 text-center py-2 bg-cream rounded-lg">
                <p className="font-body text-xs text-warm-gray">
                  Wait for your turn to make a pick
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right: My Roster */}
        <div className="w-72 shrink-0 flex flex-col">
          <Card className="flex-1 p-4 flex flex-col overflow-hidden">
            <MyRoster moves={myMoves} />
          </Card>
        </div>
      </div>

      {/* ========== MOBILE LAYOUT ========== */}
      <div className="lg:hidden flex flex-col flex-1 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-light-warm-gray bg-warm-white px-4">
          {mobileTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              className={[
                'flex-1 py-3 text-center font-body text-sm font-semibold transition-all duration-200 relative',
                mobileTab === tab.key
                  ? 'text-charcoal'
                  : 'text-warm-gray',
              ].join(' ')}
            >
              {tab.label}
              {tab.key === 'my-moves' && myMoves.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-sunset-gold text-white text-xs">
                  {myMoves.length}
                </span>
              )}
              {mobileTab === tab.key && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-charcoal rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden px-4 py-3">
          {mobileTab === 'pool' && (
            <div className="h-full flex flex-col">
              <PoolList
                pool={pool}
                onSelect={isMyTurn ? handleSelectMove : undefined}
                selectedId={selectedMove?.id}
              />
              {!isMyTurn && (
                <div className="mt-2 text-center py-2 bg-cream rounded-lg">
                  <p className="font-body text-xs text-warm-gray">
                    Wait for your turn to make a pick
                  </p>
                </div>
              )}
            </div>
          )}

          {mobileTab === 'my-moves' && (
            <div className="h-full">
              <MyRoster moves={myMoves} />
            </div>
          )}

          {mobileTab === 'feed' && (
            <div className="h-full">
              <DraftFeed picks={feedPicks} />
            </div>
          )}
        </div>
      </div>

      {/* Confirm Pick Modal */}
      <ConfirmPickModal
        move={selectedMove}
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedMove(null);
        }}
        onConfirm={handleConfirmPick}
        loading={pickLoading}
      />
    </div>
  );
}
