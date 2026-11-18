import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PATTERN_FAMILIES } from '../data/curriculum';

export function TaxonomyStrip({
  problems,
  entries,
  activePattern,
  onSelectPattern,
}) {
  const [expandedMobile, setExpandedMobile] = useState(false);

  const counts = {};
  for (const fam of PATTERN_FAMILIES) {
    counts[fam.id] = { done: 0, total: 0 };
  }

  let totalDone = 0;
  for (const p of problems) {
    if (!counts[p.pattern]) continue;
    counts[p.pattern].total += 1;
    const st = entries[p.id]?.stage || 0;
    if (st >= 1) {
      counts[p.pattern].done += 1;
      totalDone += 1;
    }
  }

  return (
    <section
      id="pattern-taxonomy-strip"
      className={`taxonomy-strip ${expandedMobile ? 'expanded' : ''}`}
      aria-label="Algorithmic pattern taxonomy filter"
    >
      <div className="taxonomy-scroll-wrap">
        <div className="taxonomy-grid">
          <button
            type="button"
            className={`tax-chip ${activePattern === 'all' ? 'active' : ''}`}
            onClick={() => onSelectPattern('all')}
          >
            <div className="tax-chip-top">
              <span className="tax-name">All Patterns</span>
              <span className="tax-ratio">
                {totalDone}/{problems.length}
              </span>
            </div>
            <div className="tax-bar">
              <div
                className="tax-bar-fill"
                style={{
                  width: `${problems.length ? (totalDone / problems.length) * 100 : 0}%`,
                }}
              />
            </div>
          </button>

          {PATTERN_FAMILIES.map((family, idx) => {
            const { done, total } = counts[family.id];
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isActive = activePattern === family.id;
            const mobileSecondary = idx >= 3 && !isActive;

            return (
              <button
                key={family.id}
                type="button"
                className={`tax-chip ${isActive ? 'active' : ''} ${
                  mobileSecondary ? 'tax-mobile-extra' : ''
                }`}
                onClick={() => onSelectPattern(isActive ? 'all' : family.id)}
                title={
                  family.focus
                    ? `${family.name} (Priority focus pattern)`
                    : family.name
                }
              >
                <div className="tax-chip-top">
                  <span className="tax-name">
                    {family.focus && (
                      <span className="tax-focus-dot" aria-label="Priority focus" />
                    )}
                    {family.name}
                  </span>
                  <span className="tax-ratio">
                    {done}/{total}
                  </span>
                </div>
                <div className="tax-bar">
                  <div className="tax-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className="tax-mobile-toggle"
        onClick={() => setExpandedMobile((v) => !v)}
        aria-expanded={expandedMobile}
      >
        {expandedMobile ? (
          <>
            <span>Show focus patterns only</span>
            <ChevronUp size={14} strokeWidth={1.75} aria-hidden="true" />
          </>
        ) : (
          <>
            <span>Show all {PATTERN_FAMILIES.length} pattern families</span>
            <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" />
          </>
        )}
      </button>
    </section>
  );
}
