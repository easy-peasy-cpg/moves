import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import CategoryPill from '../components/ui/CategoryPill';

const floatingCards = [
  { move: 'Go Skydiving', category: 'Adventure', rotation: -6, top: '8%', left: '5%', delay: 0 },
  { move: 'Host a Dinner Party', category: 'Social', rotation: 4, top: '18%', right: '8%', delay: 1.2 },
  { move: 'Run a 5K', category: 'Physical', rotation: -3, top: '55%', left: '3%', delay: 0.6 },
  { move: 'Learn Guitar', category: 'Creative', rotation: 5, top: '60%', right: '4%', delay: 1.8 },
  { move: 'Spontaneous Road Trip', category: 'Adventure', rotation: -8, top: '35%', left: '8%', delay: 2.4 },
  { move: 'Write a Short Story', category: 'Creative', rotation: 3, top: '40%', right: '10%', delay: 0.3 },
];

const categories = [
  {
    name: 'Physical',
    examples: ['Run a 5K', 'Try a Yoga Class', 'Swim in the Ocean'],
  },
  {
    name: 'Personal',
    examples: ['Read 3 Books', 'Journal for a Week', 'Digital Detox Weekend'],
  },
  {
    name: 'Professional',
    examples: ['Give a Talk', 'Learn a New Tool', 'Mentor Someone'],
  },
  {
    name: 'Social',
    examples: ['Host a Dinner Party', 'Reconnect with an Old Friend', 'Game Night'],
  },
  {
    name: 'Creative',
    examples: ['Paint Something', 'Write a Song', 'Make a Short Film'],
  },
  {
    name: 'Adventure',
    examples: ['Go Skydiving', 'Visit a New City', 'Camp Under the Stars'],
  },
  {
    name: 'Wildcard',
    examples: ['Karaoke Solo', 'Random Act of Kindness', 'Say Yes to Everything for a Day'],
  },
];

function FloatingCard({ move, category, rotation, top, left, right, delay }) {
  const style = {
    '--rotation': `${rotation}deg`,
    animationDelay: `${delay}s`,
    top,
    left,
    right,
  };

  return (
    <div
      className="absolute hidden md:block opacity-[0.12] pointer-events-none select-none"
      style={style}
    >
      <div
        className="bg-warm-white rounded-2xl border border-light-warm-gray shadow-lg px-5 py-4 w-48"
        style={{ animation: 'float 6s ease-in-out infinite', animationDelay: `${delay}s` }}
      >
        <CategoryPill category={category} size="sm" />
        <p className="font-display text-charcoal text-base mt-2 leading-tight">{move}</p>
      </div>
    </div>
  );
}

function PoolIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <circle cx="18" cy="20" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="28" cy="18" r="2.5" fill="currentColor" opacity="0.5" />
      <circle cx="22" cy="28" r="3.5" fill="currentColor" opacity="0.7" />
      <circle cx="30" cy="26" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="16" cy="27" r="1.5" fill="currentColor" opacity="0.3" />
      <path d="M8 32 C14 28, 20 36, 26 30 C32 24, 38 34, 42 30" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 12 L24 8 L34 12 L34 36 L24 40 L14 36 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M19 18 H29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 23 H29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 28 H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 6 C32 6 38 10 38 14 L32 18 L26 14 C26 10 32 6 32 6Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CelebrateIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M16 24 L21 29 L32 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="24" y1="2" x2="24" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="42" y1="12" x2="38.5" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="6" y1="12" x2="9.5" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="10" y1="40" x2="13" y2="37.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="38" y1="40" x2="35" y2="37.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

const steps = [
  {
    number: '1',
    title: 'Build the Pool',
    description:
      'Your crew adds Moves to the pool. Physical challenges, creative projects, adventures, professional goals. Mix in some easy wins and some that scare you.',
    color: 'text-sunset-gold',
    borderColor: 'border-sunset-gold',
    Icon: PoolIcon,
  },
  {
    number: '2',
    title: 'Draft Your 20',
    description:
      'Snake draft, just like fantasy. Pick the Moves you actually want to do. Strategy matters: do you grab the fun ones first or lock in the hard ones?',
    color: 'text-sky-blue',
    borderColor: 'border-sky-blue',
    Icon: DraftIcon,
  },
  {
    number: '3',
    title: 'Make Your Moves',
    description:
      'Complete your Moves throughout the season. Post photo proof. Talk trash. Get nudged. Celebrate wins. See who makes the most Moves.',
    color: 'text-sage-green',
    borderColor: 'border-sage-green',
    Icon: CelebrateIcon,
  },
];

// ===== DRAFT DEMO DATA =====
const demoPlayers = [
  { name: 'Alex', color: 'bg-sky-blue', initial: 'A' },
  { name: 'Jordan', color: 'bg-sunset-gold', initial: 'J' },
  { name: 'Sam', color: 'bg-magenta', initial: 'S' },
];

const demoPool = [
  { id: 1, title: 'Run a Half Marathon', category: 'physical' },
  { id: 2, title: 'Host a Dinner Party', category: 'social' },
  { id: 3, title: 'Learn to Play Piano', category: 'creative' },
  { id: 4, title: 'Go Skydiving', category: 'adventure' },
  { id: 5, title: 'Read 5 Books', category: 'personal' },
  { id: 6, title: 'Give a Public Talk', category: 'professional' },
  { id: 7, title: 'Sunrise Hike', category: 'adventure' },
  { id: 8, title: 'Write a Short Film', category: 'creative' },
  { id: 9, title: 'Volunteer Somewhere New', category: 'social' },
  { id: 10, title: 'Cold Plunge Challenge', category: 'physical' },
  { id: 11, title: 'Karaoke Night', category: 'wildcard' },
  { id: 12, title: 'Build a Side Project', category: 'professional' },
];

// Snake draft order for 3 players: 0,1,2,2,1,0,0,1,2,...
function getSnakeDrafter(pickIndex, playerCount) {
  const round = Math.floor(pickIndex / playerCount);
  const pos = pickIndex % playerCount;
  return round % 2 === 0 ? pos : playerCount - 1 - pos;
}

function DraftDemo() {
  const [picks, setPicks] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const currentDrafterIndex = getSnakeDrafter(picks.length, demoPlayers.length);
  const currentDrafter = demoPlayers[currentDrafterIndex];
  const remainingPool = demoPool.filter((m) => !picks.some((p) => p.moveId === m.id));
  const draftComplete = remainingPool.length === 0;

  const makePick = useCallback((moveId) => {
    const move = demoPool.find((m) => m.id === moveId);
    if (!move) return;
    const drafter = demoPlayers[getSnakeDrafter(picks.length, demoPlayers.length)];
    setPicks((prev) => [...prev, { moveId: move.id, title: move.title, category: move.category, player: drafter }]);
  }, [picks.length]);

  // Auto-play
  useEffect(() => {
    if (isPaused || draftComplete) {
      if (draftComplete) {
        timerRef.current = setTimeout(() => {
          setPicks([]);
          setIsPaused(false);
        }, 3000);
      }
      return () => clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const pool = demoPool.filter((m) => !picks.some((p) => p.moveId === m.id));
      if (pool.length > 0) {
        makePick(pool[0].id);
      }
    }, 2000);

    return () => clearTimeout(timerRef.current);
  }, [picks, isPaused, draftComplete, makePick]);

  function handleManualPick(moveId) {
    if (draftComplete) return;
    // Pause auto-play briefly on interaction, then resume
    setIsPaused(true);
    makePick(moveId);
    setTimeout(() => setIsPaused(false), 2500);
  }

  // Group picks by player
  const playerPicks = demoPlayers.map((player) => ({
    ...player,
    moves: picks.filter((p) => p.player.name === player.name),
  }));

  return (
    <section className="py-20 md:py-32 px-6 bg-cream">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-charcoal text-center mb-4">
          See the Draft in Action
        </h2>
        <p className="font-body text-warm-gray text-center mb-12 max-w-lg mx-auto">
          Three friends. Twelve Moves. Snake draft. Click a Move to pick it yourself, or sit back and watch.
        </p>

        {/* On the Clock Banner */}
        <div
          className={[
            'rounded-xl px-5 py-3 mb-6 flex items-center justify-between transition-all duration-500',
            draftComplete ? 'bg-sage-green/15 border border-sage-green/30' : 'bg-sunset-gold/15 border border-sunset-gold/30',
          ].join(' ')}
        >
          <div className="flex items-center gap-3">
            {!draftComplete && (
              <div className={`w-8 h-8 rounded-full ${currentDrafter.color} text-white flex items-center justify-center font-display text-sm font-bold`}>
                {currentDrafter.initial}
              </div>
            )}
            <div>
              <p className="font-display text-sm text-charcoal">
                {draftComplete ? 'Draft Complete!' : `${currentDrafter.name} is on the clock`}
              </p>
              <p className="font-body text-xs text-warm-gray">
                {draftComplete
                  ? 'Everyone has their Moves. Restarting...'
                  : `Round ${Math.floor(picks.length / demoPlayers.length) + 1}, Pick ${picks.length + 1}`}
              </p>
            </div>
          </div>
          {!draftComplete && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-sunset-gold animate-pulse" />
              <span className="font-body text-xs text-warm-gray font-semibold">LIVE</span>
            </div>
          )}
        </div>

        {/* Desktop: 3-column layout */}
        <div className="hidden md:grid grid-cols-[1fr_1.8fr_1fr] gap-4" ref={containerRef}>
          {/* Left: Draft Feed */}
          <div className="bg-warm-white rounded-2xl border border-light-warm-gray p-4 max-h-[420px] overflow-hidden">
            <h3 className="font-display text-sm text-charcoal mb-3">Draft Feed</h3>
            <div className="space-y-2">
              {[...picks].reverse().map((pick, i) => (
                <div
                  key={`${pick.moveId}-${i}`}
                  className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg bg-cream/60 animate-fade-up"
                  style={{ animationDuration: '0.3s' }}
                >
                  <div className={`w-6 h-6 rounded-full ${pick.player.color} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                    {pick.player.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-xs text-charcoal font-semibold truncate">{pick.title}</p>
                    <p className="font-body text-[10px] text-warm-gray">{pick.player.name}</p>
                  </div>
                </div>
              ))}
              {picks.length === 0 && (
                <p className="font-body text-xs text-warm-gray text-center py-4">Waiting for first pick...</p>
              )}
            </div>
          </div>

          {/* Center: Pool */}
          <div className="bg-warm-white rounded-2xl border border-light-warm-gray p-4 max-h-[420px] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm text-charcoal">The Pool</h3>
              <span className="font-body text-xs text-warm-gray">{remainingPool.length} remaining</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoPool.map((move) => {
                const isDrafted = picks.some((p) => p.moveId === move.id);
                return (
                  <button
                    key={move.id}
                    onClick={() => !isDrafted && !draftComplete && handleManualPick(move.id)}
                    disabled={isDrafted || draftComplete}
                    className={[
                      'text-left rounded-xl border p-3 transition-all duration-300',
                      isDrafted
                        ? 'opacity-30 scale-95 border-light-warm-gray bg-cream cursor-default'
                        : 'border-light-warm-gray bg-warm-white hover:border-sky-blue hover:shadow-sm hover:-translate-y-0.5 cursor-pointer',
                    ].join(' ')}
                  >
                    <CategoryPill category={move.category} size="sm" />
                    <p className={[
                      'font-body text-sm font-semibold mt-1.5 leading-snug',
                      isDrafted ? 'text-warm-gray line-through' : 'text-charcoal',
                    ].join(' ')}>
                      {move.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Player Rosters */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {playerPicks.map((player) => (
              <div key={player.name} className="bg-warm-white rounded-2xl border border-light-warm-gray p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className={`w-7 h-7 rounded-full ${player.color} text-white flex items-center justify-center font-display text-xs font-bold`}>
                    {player.initial}
                  </div>
                  <span className="font-body text-sm font-semibold text-charcoal">{player.name}</span>
                  <span className="font-body text-xs text-warm-gray ml-auto">{player.moves.length}</span>
                </div>
                <div className="space-y-1">
                  {player.moves.map((move, i) => (
                    <div key={move.moveId} className="flex items-center gap-2 animate-fade-up" style={{ animationDuration: '0.3s' }}>
                      <span className="font-body text-[10px] text-warm-gray w-3 text-right shrink-0">{i + 1}</span>
                      <CategoryPill category={move.category} size="sm" />
                      <span className="font-body text-xs text-charcoal truncate">{move.title}</span>
                    </div>
                  ))}
                  {player.moves.length === 0 && (
                    <p className="font-body text-[10px] text-warm-gray italic">No picks yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: stacked layout */}
        <div className="md:hidden space-y-4">
          {/* Pool */}
          <div className="bg-warm-white rounded-2xl border border-light-warm-gray p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm text-charcoal">The Pool</h3>
              <span className="font-body text-xs text-warm-gray">{remainingPool.length} left</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoPool.map((move) => {
                const isDrafted = picks.some((p) => p.moveId === move.id);
                return (
                  <button
                    key={move.id}
                    onClick={() => !isDrafted && !draftComplete && handleManualPick(move.id)}
                    disabled={isDrafted || draftComplete}
                    className={[
                      'text-left rounded-xl border p-3 transition-all duration-300',
                      isDrafted
                        ? 'opacity-30 scale-95 border-light-warm-gray bg-cream cursor-default'
                        : 'border-light-warm-gray bg-warm-white hover:border-sky-blue cursor-pointer active:scale-95',
                    ].join(' ')}
                  >
                    <CategoryPill category={move.category} size="sm" />
                    <p className={[
                      'font-body text-xs font-semibold mt-1 leading-snug',
                      isDrafted ? 'text-warm-gray line-through' : 'text-charcoal',
                    ].join(' ')}>
                      {move.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pick Feed */}
          <div className="bg-warm-white rounded-2xl border border-light-warm-gray p-4">
            <h3 className="font-display text-sm text-charcoal mb-3">Picks</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[...picks].reverse().map((pick, i) => (
                <div
                  key={`m-${pick.moveId}-${i}`}
                  className="flex items-center gap-2.5 py-1.5 animate-fade-up"
                  style={{ animationDuration: '0.3s' }}
                >
                  <div className={`w-6 h-6 rounded-full ${pick.player.color} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                    {pick.player.initial}
                  </div>
                  <span className="font-body text-xs text-charcoal font-semibold truncate">{pick.title}</span>
                  <CategoryPill category={pick.category} size="sm" />
                </div>
              ))}
              {picks.length === 0 && (
                <p className="font-body text-xs text-warm-gray text-center py-3">Waiting for first pick...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--rotation)); }
          50% { transform: translateY(-20px) rotate(var(--rotation)); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s ease-out forwards;
        }
        .animate-fade-in-up-delay-1 {
          animation: fade-in-up 0.7s ease-out 0.15s forwards;
          opacity: 0;
        }
        .animate-fade-in-up-delay-2 {
          animation: fade-in-up 0.7s ease-out 0.3s forwards;
          opacity: 0;
        }
        .animate-fade-in-up-delay-3 {
          animation: fade-in-up 0.7s ease-out 0.45s forwards;
          opacity: 0;
        }
      `}</style>

      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, #FFF8F0 0%, #FFF8F0 30%, #FEF0E0 55%, #FDECD4 70%, #FBE3C8 85%, #F9DCC0 100%)',
          }}
        />

        {/* Floating cards */}
        {floatingCards.map((card) => (
          <FloatingCard key={card.move} {...card} />
        ))}

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h1 className="font-display text-6xl md:text-8xl font-extrabold text-sky-blue leading-none animate-fade-in-up">
            Moves
          </h1>

          <p className="font-display text-2xl md:text-3xl text-charcoal mt-4 animate-fade-in-up-delay-1">
            What's the move? Draft it. Do it. Prove it.
          </p>

          <p className="font-body text-lg text-warm-gray max-w-xl mx-auto mt-4 animate-fade-in-up-delay-2">
            Challenge your friends to actually do things. Draft your Moves, complete them, post the proof.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-fade-in-up-delay-3">
            <Link to="/signup">
              <Button size="lg" variant="primary" className="text-lg px-10 py-4 shadow-xl shadow-sky-blue/20">
                Start a Season
              </Button>
            </Link>
            <Link to="/join">
              <Button size="lg" variant="secondary" className="text-lg px-10 py-4">
                Join a Season
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 md:py-32 px-6 bg-warm-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-charcoal text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {steps.map(({ number, title, description, color, borderColor, Icon }) => (
              <div
                key={number}
                className={`relative bg-cream rounded-2xl p-8 border-t-4 ${borderColor} shadow-sm`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={`font-display text-5xl font-extrabold ${color} leading-none`}>
                    {number}
                  </span>
                  <div className={color}>
                    <Icon />
                  </div>
                </div>
                <h3 className="font-display text-xl text-charcoal mb-2">{title}</h3>
                <p className="font-body text-warm-gray leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DRAFT DEMO ===== */}
      <DraftDemo />

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 md:py-32 px-6 bg-cream">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-charcoal text-center mb-4">
            7 Ways to Move
          </h2>
          <p className="font-body text-warm-gray text-center mb-14 max-w-lg mx-auto">
            Every Move falls into a category. Balance your draft across all seven for the most well-rounded season.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map(({ name, examples }) => (
              <div
                key={name}
                className="bg-warm-white rounded-2xl border border-light-warm-gray p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mb-4">
                  <CategoryPill category={name} size="md" className="text-base px-4 py-1.5" />
                </div>
                <ul className="space-y-1.5">
                  {examples.map((ex) => (
                    <li key={ex} className="font-body text-warm-gray text-sm flex items-start gap-2">
                      <span className="text-light-warm-gray mt-0.5">&#9679;</span>
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Extra cell for visual balance on lg grid */}
            <div className="hidden lg:flex bg-warm-white rounded-2xl border border-light-warm-gray p-6 items-center justify-center">
              <p className="font-display text-xl text-warm-gray text-center">
                Your crew picks.<br />You draft.<br />You do the thing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF / ENERGY ===== */}
      <section className="py-20 md:py-32 px-6 bg-warm-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div
          className="absolute top-10 left-0 w-72 h-72 rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F5A623, transparent 70%)' }}
        />
        <div
          className="absolute bottom-10 right-0 w-96 h-96 rounded-full opacity-[0.05] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #D94B7A, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <blockquote className="font-display text-2xl md:text-3xl text-charcoal leading-snug">
            <span className="text-sunset-gold text-5xl leading-none align-text-top">"</span>
            Fantasy football kept your friend group together.{' '}
            <span className="text-sunset-gold">Moves</span> keeps your friend group alive.
            <span className="text-sunset-gold text-5xl leading-none align-text-top">"</span>
          </blockquote>

          <p className="font-body text-warm-gray text-lg mt-10">
            Draft your Moves. Do the things. Prove it happened.
          </p>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 md:py-32 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, #FFF8F0 0%, #FDECD4 50%, #FBE3C8 100%)',
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-6">
            Ready to make your move?
          </h2>

          <Link to="/signup">
            <Button size="lg" variant="primary" className="text-lg px-12 py-4 shadow-xl shadow-sky-blue/20">
              Start a Season
            </Button>
          </Link>

          <p className="font-body text-warm-gray mt-6">
            It takes 2 minutes to set up. The memories last forever.
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-10 px-6 bg-charcoal">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-2xl font-bold text-sky-blue">Moves</span>

          <div className="flex items-center gap-6">
            <Link
              to="/signup"
              className="font-body text-sm text-light-warm-gray hover:text-warm-white transition-colors"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="font-body text-sm text-light-warm-gray hover:text-warm-white transition-colors"
            >
              Log In
            </Link>
          </div>

          <p className="font-body text-xs text-warm-gray">
            &copy; {new Date().getFullYear()} Moves. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
