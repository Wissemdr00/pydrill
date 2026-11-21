import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Plus, Search, X } from 'lucide-react';
import {
  CURRICULUM_PROBLEMS,
  PATTERN_FAMILIES,
  PATTERN_MAP,
  WEEKS,
} from './data/curriculum';
import {
  applyOutcome,
  getProblemState,
  todayISO,
} from './utils/srs';
import {
  createEmptyStore,
  loadProgressStore,
  saveProgressStore,
} from './utils/api';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { TaxonomyStrip } from './components/TaxonomyStrip';
import { StudyDrawer } from './components/StudyDrawer';
import { CheatSheetView } from './components/CheatSheetView';

function playTimerChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.52);
  } catch {
    // ignore audio block
  }
}

export default function App() {
  const [store, setStore] = useState(createEmptyStore);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [activeView, setActiveView] = useState('today');
  const [activePattern, setActivePattern] = useState('all');
  const [weekFilter, setWeekFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maskTriggers, setMaskTriggers] = useState(false);
  const [selectedId, setSelectedId] = useState('1');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Custom problem inline form
  const [showAddForm, setShowAddForm] = useState(false);
  const [customNum, setCustomNum] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDiff, setCustomDiff] = useState('Medium');
  const [customPattern, setCustomPattern] = useState('sliding-window');

  // Timer state
  const [timerMode, setTimerMode] = useState('solve');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const saveTimerRef = useRef(null);
  const hydratedRef = useRef(false);
  const today = todayISO();

  // Initial load from local Python server (with localStorage fallback)
  useEffect(() => {
    let cancelled = false;
    loadProgressStore().then(({ data, source }) => {
      if (cancelled) return;
      setStore(data);
      setSyncStatus(source === 'server' ? 'synced' : 'offline');
      hydratedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced auto-save to server.py -> data/progress.json
  const persistStore = (nextStore, immediate = false) => {
    setStore(nextStore);
    if (!hydratedRef.current) return;
    setSyncStatus('saving');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const runSave = async () => {
      const res = await saveProgressStore(nextStore);
      setSyncStatus(res.source === 'server' ? 'synced' : 'offline');
    };

    if (immediate) {
      runSave();
    } else {
      saveTimerRef.current = setTimeout(runSave, 350);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return undefined;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          playTimerChime();
          setNotice(
            timerMode === 'solve'
              ? '25-minute solve block complete. If stuck, reveal the 1-line nudge or ask your Python 3 Socratic coach for Rung 1.'
              : '15-minute cold review block complete. Log whether you recalled it cleanly or struggled.'
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, timerMode]);

  const handleChangeTimerMode = (mode) => {
    setIsRunning(false);
    setTimerMode(mode);
    setSecondsLeft(mode === 'solve' ? 25 * 60 : 15 * 60);
  };

  const handleToggleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(timerMode === 'solve' ? 25 * 60 : 15 * 60);
      setIsRunning(true);
      return;
    }
    setIsRunning((r) => !r);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(timerMode === 'solve' ? 25 * 60 : 15 * 60);
  };

  const allProblems = useMemo(() => {
    return [...CURRICULUM_PROBLEMS, ...(store.customProblems || [])];
  }, [store.customProblems]);

  const entries = store.entries || {};

  // Derived metrics
  const { dueProblems, scheduledProblems, nextUnseenProblems, solvedCount, overdueCount } =
    useMemo(() => {
      const due = [];
      const scheduled = [];
      const unseen = [];
      let solved = 0;
      let overdue = 0;

      for (const p of allProblems) {
        const st = getProblemState(entries[p.id], today);
        if (st.stage >= 1) solved += 1;
        if (st.isDue) {
          due.push({ problem: p, state: st });
          if (st.code === 'overdue') overdue += 1;
        } else if (st.code === 'scheduled') {
          scheduled.push({ problem: p, state: st });
        } else if (st.code === 'unseen') {
          unseen.push(p);
        }
      }

      due.sort((a, b) => b.state.overdueDays - a.state.overdueDays);
      scheduled.sort((a, b) =>
        (entries[a.problem.id]?.nextReviewAt || '').localeCompare(
          entries[b.problem.id]?.nextReviewAt || ''
        )
      );

      return {
        dueProblems: due.map((x) => x.problem),
        scheduledProblems: scheduled.map((x) => x.problem),
        nextUnseenProblems: unseen.slice(0, 2),
        solvedCount: solved,
        overdueCount: overdue,
      };
    }, [allProblems, entries, today]);

  const todayQueue = useMemo(() => {
    const base = [...dueProblems, ...nextUnseenProblems];
    if (activePattern === 'all') return base;
    return base.filter((p) => p.pattern === activePattern);
  }, [dueProblems, nextUnseenProblems, activePattern]);

  const filteredCurriculum = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allProblems.filter((p) => {
      if (activePattern !== 'all' && p.pattern !== activePattern) return false;
      if (weekFilter !== 'all' && String(p.week) !== weekFilter) return false;

      const st = getProblemState(entries[p.id], today);
      if (statusFilter === 'unseen' && st.code !== 'unseen') return false;
      if (statusFilter === 'due' && !st.isDue) return false;
      if (statusFilter === 'scheduled' && st.code !== 'scheduled') return false;
      if (statusFilter === 'mastered' && st.code !== 'mastered') return false;

      if (q) {
        const trigger = (entries[p.id]?.trigger || '').toLowerCase();
        const hit =
          String(p.number).includes(q) ||
          p.title.toLowerCase().includes(q) ||
          (PATTERN_MAP[p.pattern]?.name || '').toLowerCase().includes(q) ||
          trigger.includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [allProblems, activePattern, weekFilter, statusFilter, searchQuery, entries, today]);

  const selectedProblem = useMemo(() => {
    return allProblems.find((p) => p.id === selectedId) || todayQueue[0] || allProblems[0];
  }, [allProblems, selectedId, todayQueue]);

  // Handlers
  const handleRecordOutcome = (problemId, outcome) => {
    const nextEntry = applyOutcome(entries[problemId], outcome, today);
    const nextStore = {
      ...store,
      entries: {
        ...entries,
        [problemId]: nextEntry,
      },
    };
    persistStore(nextStore, true);
  };

  const handleUpdateField = (problemId, field, value) => {
    const prev = entries[problemId] || {
      stage: 0,
      trigger: '',
      notes: '',
      attempts: 0,
      lastSolvedAt: null,
      nextReviewAt: null,
      lastOutcome: null,
    };
    const nextStore = {
      ...store,
      entries: {
        ...entries,
        [problemId]: {
          ...prev,
          [field]: value,
        },
      },
    };
    persistStore(nextStore, false);
  };

  const handleAddCustomProblem = (e) => {
    e.preventDefault();
    const cleanTitle = customTitle.trim();
    if (!cleanTitle) return;
    const num = Number(customNum) || 9000 + (store.customProblems?.length || 0) + 1;
    const slug = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const id = `custom-${Date.now()}`;
    const newProb = {
      id,
      number: num,
      title: cleanTitle,
      slug,
      difficulty: customDiff,
      week: 4,
      days: 'Untagged',
      pattern: customPattern,
      targetComplexity: PATTERN_MAP[customPattern]?.targetComplexity || 'O(n)',
      hint: '',
      custom: true,
    };
    const nextStore = {
      ...store,
      customProblems: [...(store.customProblems || []), newProb],
    };
    persistStore(nextStore, true);
    setSelectedId(id);
    setCustomNum('');
    setCustomTitle('');
    setShowAddForm(false);
    setNotice(`Added #${num} ${cleanTitle} to your curriculum and saved to data/progress.json.`);
  };

  const handleDeleteCustom = (problemId) => {
    const nextCustom = (store.customProblems || []).filter((p) => p.id !== problemId);
    const nextEntries = { ...entries };
    delete nextEntries[problemId];
    persistStore({ ...store, customProblems: nextCustom, entries: nextEntries }, true);
    setSelectedId(CURRICULUM_PROBLEMS[0].id);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pydrill-progress-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (parsed) => {
    if (!parsed || typeof parsed !== 'object' || typeof parsed.entries !== 'object') {
      setNotice('Import failed: please select a valid PyDrill progress.json file.');
      return;
    }
    persistStore(
      {
        version: 1,
        startedAt: parsed.startedAt || today,
        updatedAt: null,
        entries: parsed.entries,
        customProblems: Array.isArray(parsed.customProblems) ? parsed.customProblems : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      },
      true
    );
    setNotice('Progress imported and saved to data/progress.json.');
  };

  const activePatternObj =
    activePattern !== 'all'
      ? PATTERN_MAP[activePattern]
      : PATTERN_MAP[selectedProblem?.pattern] || PATTERN_FAMILIES[0];

  const renderProblemTable = (rows, emptyTitle, emptyBody) => {
    if (rows.length === 0) {
      return (
        <div className="empty-state">
          <h3>{emptyTitle}</h3>
          <p>{emptyBody}</p>
          {activePattern !== 'all' && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActivePattern('all')}
            >
              Show all patterns
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="table-panel">
        <div className="table-scroll">
          <table className="problem-table">
            <colgroup>
              <col className="col-w-id" />
              <col className="col-w-problem" />
              <col className="col-w-pattern col-hide-sm" />
              <col className="col-w-diff" />
              <col className="col-w-state" />
              <col className="col-w-trigger col-hide-sm" />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>Problem</th>
                <th className="col-hide-sm">Pattern</th>
                <th>Diff</th>
                <th>Review State</th>
                <th className="col-hide-sm">1-Line Trigger</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const entry = entries[p.id];
                const st = getProblemState(entry, today);
                const isSelected = selectedProblem?.id === p.id;
                const triggerText = entry?.trigger?.trim();

                return (
                  <tr
                    key={p.id}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => setSelectedId(p.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedId(p.id);
                      }
                    }}
                  >
                    <td className="col-id">{p.number}</td>
                    <td>
                      <div className="problem-title-cell">
                        <span>{p.title}</span>
                        <span className="week-tag">W{p.week}</span>
                      </div>
                    </td>
                    <td className="col-hide-sm col-pattern-cell">
                      {PATTERN_MAP[p.pattern]?.name || p.pattern}
                    </td>
                    <td>
                      <span className={`diff-${p.difficulty.toLowerCase()}`}>
                        {p.difficulty === 'Medium' ? 'Med' : p.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${st.tone}`}>{st.label}</span>
                    </td>
                    <td className="col-hide-sm trigger-cell">
                      {triggerText ? (
                        maskTriggers ? (
                          <span className="trigger-masked" title="Hover row to reveal trigger">
                            {triggerText}
                          </span>
                        ) : (
                          triggerText
                        )
                      ) : (
                        <span style={{ color: 'var(--ink-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        todayCount={dueProblems.length + nextUnseenProblems.length}
        dueCount={dueProblems.length}
        overdueCount={overdueCount}
        solvedCount={solvedCount}
        totalCount={allProblems.length}
        startedAt={store.startedAt}
        syncStatus={syncStatus}
        onExport={handleExport}
        onImport={handleImport}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="main-area">
        <TopBar
          activeView={activeView}
          timerMode={timerMode}
          secondsLeft={secondsLeft}
          isRunning={isRunning}
          onChangeMode={handleChangeTimerMode}
          onToggleRun={handleToggleTimer}
          onResetTimer={handleResetTimer}
          selectedProblem={selectedProblem}
          onOpenMobile={() => setMobileNavOpen(true)}
        />

        {activeView !== 'cheatsheet' && (
          <TaxonomyStrip
            problems={allProblems}
            entries={entries}
            activePattern={activePattern}
            onSelectPattern={setActivePattern}
          />
        )}

        {activeView === 'cheatsheet' ? (
          <CheatSheetView
            onJumpToPattern={(patternId) => {
              setActivePattern(patternId);
              setActiveView('curriculum');
            }}
          />
        ) : (
          <div className="workspace-split">
            <main className="workspace-main">
              {notice && (
                <div className="inline-notice" role="status">
                  <span>{notice}</span>
                  <button
                    type="button"
                    className="btn btn-icon"
                    style={{ width: 26, height: 26, padding: 0, color: 'inherit' }}
                    aria-label="Dismiss message"
                    onClick={() => setNotice('')}
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              )}

              {/* Active pattern mental trigger card */}
              <section className="trigger-banner" aria-label="Pattern mental trigger">
                <div className="trigger-banner-body">
                  <div className="trigger-banner-title">
                    <span>{activePatternObj.name} — Mental Trigger</span>
                    {activePatternObj.focus && (
                      <span className="status-pill warn">Focus Area</span>
                    )}
                  </div>
                  <p className="trigger-banner-text">{activePatternObj.trigger}</p>
                  <code className="trigger-banner-idiom">{activePatternObj.idiom}</code>
                </div>
                <div className="trigger-banner-meta">
                  <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                    Target {activePatternObj.targetComplexity}
                  </span>
                  <button
                    type="button"
                    className={`toggle-chip ${maskTriggers ? 'active' : ''}`}
                    onClick={() => setMaskTriggers((m) => !m)}
                    title="Hide your logged 1-line triggers in the table until hovered so you can self-test recall"
                  >
                    {maskTriggers ? (
                      <>
                        <EyeOff size={13} strokeWidth={1.75} />
                        <span>Triggers Masked</span>
                      </>
                    ) : (
                      <>
                        <Eye size={13} strokeWidth={1.75} />
                        <span>Self-Test Mask</span>
                      </>
                    )}
                  </button>
                </div>
              </section>

              {activeView === 'today' && (
                <>
                  <div className="section-head">
                    <h2>Today&apos;s Drill Queue</h2>
                    <span>
                      {dueProblems.length} due cold review{dueProblems.length === 1 ? '' : 's'} ·{' '}
                      {nextUnseenProblems.length} next new
                    </span>
                  </div>
                  {renderProblemTable(
                    todayQueue,
                    'No problems in this filtered view',
                    'Clear the pattern filter above to see today’s due reviews and next two curriculum problems.'
                  )}

                  <div className="section-head" style={{ marginTop: '14px' }}>
                    <h2>Up Next in Week 1 — Focus Ramp</h2>
                    <button
                      type="button"
                      className="hint-toggle"
                      onClick={() => setActiveView('curriculum')}
                    >
                      View all {allProblems.length} problems →
                    </button>
                  </div>
                  {renderProblemTable(
                    allProblems
                      .filter(
                        (p) =>
                          (activePattern === 'all' || p.pattern === activePattern) &&
                          !todayQueue.some((t) => t.id === p.id)
                      )
                      .slice(0, 6),
                    'Every matching problem is already in today’s queue',
                    'Switch to the 4-Week Curriculum tab to browse all 52 problems or add custom untagged drills.'
                  )}
                </>
              )}

              {activeView === 'curriculum' && (
                <>
                  <div className="toolbar">
                    <div className="toolbar-left">
                      <div className="seg-tabs" role="group" aria-label="Filter by week">
                        <button
                          type="button"
                          className={`seg-tab ${weekFilter === 'all' ? 'active' : ''}`}
                          onClick={() => setWeekFilter('all')}
                        >
                          All Weeks
                        </button>
                        {WEEKS.map((w) => (
                          <button
                            key={w.week}
                            type="button"
                            className={`seg-tab ${weekFilter === String(w.week) ? 'active' : ''}`}
                            onClick={() => setWeekFilter(String(w.week))}
                          >
                            W{w.week}
                          </button>
                        ))}
                      </div>

                      <select
                        className="select"
                        aria-label="Filter by status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All statuses</option>
                        <option value="unseen">Unseen</option>
                        <option value="due">Due now</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="mastered">Mastered</option>
                      </select>

                      <div className="search-wrap">
                        <Search size={14} strokeWidth={1.75} className="search-icon" aria-hidden="true" />
                        <input
                          type="search"
                          className="input search-input"
                          placeholder="Search #, title, trigger..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddForm((v) => !v)}
                    >
                      <Plus size={14} strokeWidth={2} aria-hidden="true" />
                      <span>Add Untagged</span>
                    </button>
                  </div>

                  {showAddForm && (
                    <form className="custom-form" onSubmit={handleAddCustomProblem}>
                      <div className="field-col">
                        <label className="field-label" htmlFor="c-num">LC #</label>
                        <input
                          id="c-num"
                          type="number"
                          className="input"
                          placeholder="42"
                          value={customNum}
                          onChange={(e) => setCustomNum(e.target.value)}
                        />
                      </div>
                      <div className="field-col">
                        <label className="field-label" htmlFor="c-title">Problem Title</label>
                        <input
                          id="c-title"
                          type="text"
                          className="input"
                          required
                          placeholder="Trapping Rain Water"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                        />
                      </div>
                      <div className="field-col">
                        <label className="field-label" htmlFor="c-diff">Difficulty</label>
                        <select
                          id="c-diff"
                          className="select"
                          value={customDiff}
                          onChange={(e) => setCustomDiff(e.target.value)}
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div className="field-col">
                        <label className="field-label" htmlFor="c-pat">Pattern</label>
                        <select
                          id="c-pat"
                          className="select"
                          value={customPattern}
                          onChange={(e) => setCustomPattern(e.target.value)}
                        >
                          {PATTERN_FAMILIES.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Save
                      </button>
                    </form>
                  )}

                  {weekFilter !== 'all' && (
                    <div className="section-head">
                      <h2>{WEEKS[Number(weekFilter) - 1]?.title}</h2>
                      <span>{WEEKS[Number(weekFilter) - 1]?.goal}</span>
                    </div>
                  )}

                  {renderProblemTable(
                    filteredCurriculum,
                    'No matching problems',
                    'Try clearing your search query, week tab, or status filter.'
                  )}
                </>
              )}

              {activeView === 'reviews' && (
                <>
                  <div className="section-head">
                    <h2>Due Today &amp; Overdue</h2>
                    <span>{dueProblems.length} ready for cold recall</span>
                  </div>
                  {renderProblemTable(
                    activePattern === 'all'
                      ? dueProblems
                      : dueProblems.filter((p) => p.pattern === activePattern),
                    'No cold reviews due yet',
                    'Whenever you mark a problem "Solved Clean" in Today’s Queue, PyDrill schedules its first cold review 3 days later—then 14 days later after a clean recall.'
                  )}

                  <div className="section-head" style={{ marginTop: '14px' }}>
                    <h2>Upcoming Scheduled Reviews</h2>
                    <span>{scheduledProblems.length} in Day-3 or Day-14 box</span>
                  </div>
                  {renderProblemTable(
                    activePattern === 'all'
                      ? scheduledProblems
                      : scheduledProblems.filter((p) => p.pattern === activePattern),
                    'Nothing scheduled yet',
                    'Solved problems will appear here with their countdown until the next cold review date.'
                  )}
                </>
              )}
            </main>

            <StudyDrawer
              problem={selectedProblem}
              entry={selectedProblem ? entries[selectedProblem.id] : null}
              onRecordOutcome={handleRecordOutcome}
              onUpdateField={handleUpdateField}
              onDeleteCustom={handleDeleteCustom}
            />
          </div>
        )}
      </div>
    </div>
  );
}
