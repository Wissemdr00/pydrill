import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { PATTERN_MAP } from '../data/curriculum';
import { getProblemState } from '../utils/srs';

export function StudyDrawer({
  problem,
  entry,
  onRecordOutcome,
  onUpdateField,
  onDeleteCustom,
}) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setShowHint(false);
  }, [problem?.id]);

  if (!problem) {
    return (
      <aside className="study-drawer" aria-label="Problem study notes">
        <div className="empty-state">
          <h3>Select a problem to study</h3>
          <p>
            Click any row in the queue to open its LeetCode link, log a 1-line
            pattern trigger, and schedule its 3-day or 14-day cold review.
          </p>
        </div>
      </aside>
    );
  }

  const state = getProblemState(entry);
  const pattern = PATTERN_MAP[problem.pattern];
  const stage = entry?.stage || 0;
  const lcUrl = problem.slug
    ? `https://leetcode.com/problems/${problem.slug}/`
    : `https://leetcode.com/problemset/?search=${encodeURIComponent(problem.title)}`;

  const cleanLabel =
    stage === 0
      ? 'Solved Clean (+3d)'
      : stage === 1
        ? 'Cold Recall Clean (+14d)'
        : 'Mark Mastered';

  return (
    <aside className="study-drawer" aria-label={`Study panel for ${problem.title}`}>
      <div className="study-drawer-inner">
        <div className="drawer-header">
          <h2 className="drawer-title">{problem.title}</h2>
          <div className="drawer-meta">
            <span className="mono">#{problem.number}</span>
            <span>·</span>
            <span className={`diff-${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
            <span>·</span>
            <span>{pattern?.name || problem.pattern}</span>
            {problem.targetComplexity && (
              <>
                <span>·</span>
                <span className="mono">{problem.targetComplexity}</span>
              </>
            )}
            <a
              className="lc-link"
              href={lcUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>LeetCode</span>
              <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="srs-box">
          <div className="srs-row">
            <span>Spaced-repetition stage</span>
            <span className={`status-pill ${state.tone}`}>{state.label}</span>
          </div>

          <div className="srs-steps">
            <div className={`srs-step ${stage >= 1 ? 'reached' : ''}`}>
              1 · Day 3
            </div>
            <div className={`srs-step ${stage >= 2 ? 'reached' : ''}`}>
              2 · Day 14
            </div>
            <div className={`srs-step ${stage >= 3 ? 'reached' : ''}`}>
              3 · Mastered
            </div>
          </div>

          <div className="srs-row">
            <span>
              Attempts: <strong className="mono">{entry?.attempts || 0}</strong>
            </span>
            <span>
              {entry?.nextReviewAt ? (
                <>
                  Next review: <span className="mono">{entry.nextReviewAt}</span>
                </>
              ) : stage >= 3 ? (
                'Cold recall complete'
              ) : (
                'Not scheduled yet'
              )}
            </span>
          </div>
        </div>

        <div className="outcome-grid">
          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={() => onRecordOutcome(problem.id, 'clean')}
          >
            <CheckCircle2 size={15} strokeWidth={2} aria-hidden="true" />
            <span>{cleanLabel}</span>
          </button>

          <button
            type="button"
            className="btn btn-warn"
            onClick={() => onRecordOutcome(problem.id, 'hints')}
          >
            Used Hints (+1d)
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onRecordOutcome(problem.id, 'struggled')}
          >
            Struggled (+3d)
          </button>
        </div>

        <div className="field-col">
          <label className="field-label" htmlFor="trigger-input">
            1-Line Pattern Trigger
          </label>
          <input
            id="trigger-input"
            type="text"
            className="input"
            placeholder="e.g. Decreasing stack of indices; pop on hotter day"
            value={entry?.trigger || ''}
            onChange={(e) => onUpdateField(problem.id, 'trigger', e.target.value)}
          />
        </div>

        <div className="field-col">
          <label className="field-label" htmlFor="notes-input">
            Python 3 Pitfalls, Complexity &amp; Edge Cases
          </label>
          <textarea
            id="notes-input"
            rows={5}
            className="textarea"
            placeholder="Time/space complexity, bug you hit, edge case to trace next cold review..."
            value={entry?.notes || ''}
            onChange={(e) => onUpdateField(problem.id, 'notes', e.target.value)}
          />
        </div>

        {problem.hint && (
          <div className="hint-box">
            <button
              type="button"
              className="hint-toggle"
              onClick={() => setShowHint((v) => !v)}
              aria-expanded={showHint}
            >
              {showHint ? (
                <>
                  <EyeOff size={14} strokeWidth={1.75} aria-hidden="true" />
                  <span>Hide pattern nudge</span>
                </>
              ) : (
                <>
                  <Eye size={14} strokeWidth={1.75} aria-hidden="true" />
                  <span>Stuck after 25m? Reveal 1-line pattern nudge</span>
                </>
              )}
            </button>
            {showHint && <p style={{ margin: '8px 0 0' }}>{problem.hint}</p>}
          </div>
        )}

        <div className="drawer-footer-actions">
          <span className="drawer-logged-meta">
            {entry?.lastSolvedAt ? (
              <>
                Last logged <span className="mono">{entry.lastSolvedAt}</span>
              </>
            ) : (
              'Never logged'
            )}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            {stage > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                onClick={() => onRecordOutcome(problem.id, 'reset')}
              >
                <RotateCcw size={13} strokeWidth={1.75} aria-hidden="true" />
                <span>Reset Stage</span>
              </button>
            )}
            {problem.custom && (
              <button
                type="button"
                className="btn btn-danger"
                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                onClick={() => onDeleteCustom(problem.id)}
              >
                <Trash2 size={13} strokeWidth={1.75} aria-hidden="true" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
