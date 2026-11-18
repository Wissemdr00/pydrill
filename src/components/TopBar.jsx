import React from 'react';
import { Menu, Pause, Play, RotateCcw } from 'lucide-react';
import { formatClock } from '../utils/srs';

const VIEW_HEADINGS = {
  today: {
    title: "Today's Interview Drill",
    subtitle: 'Due cold reviews first, followed by your next two unseen curriculum problems.',
  },
  curriculum: {
    title: '4-Week Python 3 Curriculum',
    subtitle: '52 high-yield interview problems ordered by pattern dependency.',
  },
  reviews: {
    title: 'Spaced-Repetition Reviews',
    subtitle: 'Clean solve schedules Day 3 → Day 14 → Mastered. Struggling resets to Day 3.',
  },
  cheatsheet: {
    title: 'Pattern & Constraint Cheat Sheet',
    subtitle: 'Mental triggers, input-size complexity targets, and Python 3 pitfalls.',
  },
};

export function TopBar({
  activeView,
  timerMode,
  secondsLeft,
  isRunning,
  onChangeMode,
  onToggleRun,
  onResetTimer,
  selectedProblem,
  onOpenMobile,
}) {
  const heading = VIEW_HEADINGS[activeView] || VIEW_HEADINGS.today;
  const finished = secondsLeft === 0;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          aria-label="Open navigation menu"
          onClick={onOpenMobile}
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>
        <div>
          <h1 className="topbar-title">{heading.title}</h1>
          <p className="topbar-subtitle">
            {selectedProblem && activeView !== 'cheatsheet'
              ? `Selected: #${selectedProblem.number} ${selectedProblem.title}`
              : heading.subtitle}
          </p>
        </div>
      </div>

      <div className="timer-controls" aria-label="Study session timer">
        <div className="preset-group" role="group" aria-label="Timer preset">
          <button
            type="button"
            className={`preset-btn ${timerMode === 'solve' ? 'active' : ''}`}
            onClick={() => onChangeMode('solve')}
          >
            25m Solve
          </button>
          <button
            type="button"
            className={`preset-btn ${timerMode === 'review' ? 'active' : ''}`}
            onClick={() => onChangeMode('review')}
          >
            15m Review
          </button>
        </div>

        <div className="timer-action-group">
          <div
            className={`timer-clock ${isRunning ? 'running' : ''} ${finished ? 'finished' : ''}`}
            aria-live="off"
          >
            {formatClock(secondsLeft)}
          </div>

          <button
            type="button"
            id="primary-timer-cta"
            className="btn btn-primary"
            onClick={onToggleRun}
          >
            {isRunning ? (
              <>
                <Pause size={15} strokeWidth={2} aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={15} strokeWidth={2} aria-hidden="true" />
                <span>{finished ? 'Restart' : 'Start Timer'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onResetTimer}
            aria-label="Reset timer"
            title="Reset timer"
          >
            <RotateCcw size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
}
