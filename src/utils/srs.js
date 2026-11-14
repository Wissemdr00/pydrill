/**
 * Spaced-repetition state machine for PyDrill.
 *
 * Stages:
 *   0 = Unseen
 *   1 = Box 1 (Day-3 cold review scheduled)
 *   2 = Box 2 (Day-14 cold review scheduled)
 *   3 = Mastered (passed Day-14 cold recall)
 */

export function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysISO(baseISO, days) {
  const [y, m, d] = baseISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function daysBetweenISO(fromISO, toISO) {
  if (!fromISO || !toISO) return 0;
  const [y1, m1, d1] = fromISO.split('-').map(Number);
  const [y2, m2, d2] = toISO.split('-').map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.round((b - a) / 86400000);
}

export function getProblemState(entry, today = todayISO()) {
  if (!entry || !entry.stage) {
    return {
      code: 'unseen',
      label: 'Unseen',
      tone: 'neutral',
      isDue: false,
      overdueDays: 0,
      stage: 0,
    };
  }

  if (entry.stage >= 3) {
    return {
      code: 'mastered',
      label: 'Mastered',
      tone: 'ok',
      isDue: false,
      overdueDays: 0,
      stage: 3,
    };
  }

  const next = entry.nextReviewAt || today;
  const diff = daysBetweenISO(today, next); // <= 0 means due or overdue
  const stageTag = entry.stage === 1 ? 'Day 3' : 'Day 14';

  if (diff < 0) {
    return {
      code: 'overdue',
      label: `Overdue ${Math.abs(diff)}d`,
      tone: 'danger',
      isDue: true,
      overdueDays: Math.abs(diff),
      stage: entry.stage,
    };
  }

  if (diff === 0) {
    return {
      code: 'due',
      label: `Due · ${stageTag}`,
      tone: 'warn',
      isDue: true,
      overdueDays: 0,
      stage: entry.stage,
    };
  }

  return {
    code: 'scheduled',
    label: `${stageTag} in ${diff}d`,
    tone: 'scheduled',
    isDue: false,
    overdueDays: 0,
    stage: entry.stage,
  };
}

export function applyOutcome(prevEntry, outcome, today = todayISO()) {
  const base = prevEntry || {
    stage: 0,
    trigger: '',
    notes: '',
    attempts: 0,
    lastSolvedAt: null,
    nextReviewAt: null,
    lastOutcome: null,
  };

  if (outcome === 'reset') {
    return {
      ...base,
      stage: 0,
      nextReviewAt: null,
      lastOutcome: null,
    };
  }

  const attempts = (base.attempts || 0) + 1;

  if (outcome === 'clean') {
    const nextStage = Math.min(3, (base.stage || 0) + 1);
    const nextReviewAt =
      nextStage === 1
        ? addDaysISO(today, 3)
        : nextStage === 2
          ? addDaysISO(today, 14)
          : null;
    return {
      ...base,
      stage: nextStage,
      attempts,
      lastSolvedAt: today,
      nextReviewAt,
      lastOutcome: 'clean',
    };
  }

  // 'struggled' or 'hints' resets to Box 1 (3-day cold review, or 1-day retry for hints)
  const delay = outcome === 'hints' ? 1 : 3;
  return {
    ...base,
    stage: 1,
    attempts,
    lastSolvedAt: today,
    nextReviewAt: addDaysISO(today, delay),
    lastOutcome: outcome,
  };
}

export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = String(Math.floor(safe / 60)).padStart(2, '0');
  const secs = String(safe % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}
