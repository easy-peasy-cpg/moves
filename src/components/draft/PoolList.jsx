import React, { useState, useMemo } from 'react';
import CategoryPill from '../ui/CategoryPill';
import MoveCard from './MoveCard';

const CATEGORIES = [
  'Physical',
  'Personal',
  'Professional',
  'Social',
  'Creative',
  'Adventure',
  'Wildcard',
];

export default function PoolList({ pool, onSelect, selectedId, filterCategory: externalFilter }) {
  const [activeCategory, setActiveCategory] = useState(externalFilter || 'All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPool = useMemo(() => {
    if (!pool) return [];
    return pool.filter((move) => {
      // Hide already drafted moves
      if (move.is_drafted) return false;

      // Category filter
      if (activeCategory !== 'All' && move.category !== activeCategory) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (move.title || '').toLowerCase();
        const desc = (move.description || '').toLowerCase();
        if (!title.includes(q) && !desc.includes(q)) return false;
      }

      return true;
    });
  }, [pool, activeCategory, searchQuery]);

  const draftedIds = useMemo(() => {
    if (!pool) return new Set();
    return new Set(pool.filter((m) => m.is_drafted).map((m) => m.id));
  }, [pool]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search the pool..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-cream border border-warm-gray/30 pl-10 pr-4 py-2.5 text-sm text-charcoal placeholder:text-warm-gray outline-none transition-all duration-200 font-body focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide mb-2">
        <button
          onClick={() => setActiveCategory('All')}
          className={[
            'shrink-0 rounded-full px-3 py-1 text-sm font-body font-semibold transition-all duration-200',
            activeCategory === 'All'
              ? 'bg-charcoal text-warm-white'
              : 'bg-light-warm-gray/60 text-warm-gray hover:bg-light-warm-gray',
          ].join(' ')}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="shrink-0"
          >
            <CategoryPill
              category={cat}
              size="sm"
              className={[
                'transition-all duration-200',
                activeCategory === cat
                  ? 'ring-2 ring-charcoal/30 scale-105'
                  : 'opacity-70 hover:opacity-100',
              ].join(' ')}
            />
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="mb-3">
        <span className="font-body text-xs text-warm-gray">
          {filteredPool.length} move{filteredPool.length !== 1 ? 's' : ''} available
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto -mx-1 px-1">
        {filteredPool.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-light-warm-gray mb-3"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="font-body text-sm text-warm-gray">
              {searchQuery ? 'No moves match your search' : 'No moves available in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
            {filteredPool.map((move) => (
              <MoveCard
                key={move.id}
                move={move}
                onSelect={() => onSelect?.(move)}
                isSelected={selectedId === move.id}
                isDrafted={draftedIds.has(move.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
