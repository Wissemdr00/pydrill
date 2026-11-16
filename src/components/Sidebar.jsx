import React, { useRef } from 'react';
import {
  BookOpen,
  CalendarClock,
  Download,
  Layers,
  ListChecks,
  Upload,
} from 'lucide-react';
import { daysBetweenISO, todayISO } from '../utils/srs';

export function Sidebar({
  activeView,
  onSelectView,
  todayCount,
  dueCount,
  overdueCount,
  solvedCount,
  totalCount,
  startedAt,
  syncStatus,
  onExport,
  onImport,
  mobileOpen,
  onCloseMobile,
}) {
  const fileRef = useRef(null);
  const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
  const elapsed = startedAt ? Math.max(0, daysBetweenISO(startedAt, todayISO())) : 0;
  const dayNum = Math.min(28, elapsed + 1);
  const weekNum = Math.min(4, Math.ceil(dayNum / 7));

  const navItems = [
    {
      id: 'today',
      label: "Today's Queue",
      icon: ListChecks,
      badge: todayCount > 0 ? String(todayCount) : null,
      badgeTone: dueCount > 0 ? 'warn' : '',
    },
    {
      id: 'curriculum',
      label: '4-Week Curriculum',
      icon: Layers,
      badge: `${solvedCount}/${totalCount}`,
      badgeTone: '',
    },
    {
      id: 'reviews',
      label: 'Due Reviews',
      icon: CalendarClock,
      badge: dueCount > 0 ? String(dueCount) : '0',
      badgeTone: overdueCount > 0 ? 'danger' : dueCount > 0 ? 'warn' : '',
    },
    {
      id: 'cheatsheet',
      label: 'Pattern Cheat Sheet',
      icon: BookOpen,
      badge: null,
      badgeTone: '',
    },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        onImport(parsed);
      } catch {
        onImport(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <div
        className={`rail-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside className={`rail ${mobileOpen ? 'open' : ''}`} aria-label="Primary navigation">
        <div className="rail-inner">
          <div className="rail-brand">
            <span className="brand-mark">
              PyDrill<span className="brand-dot">.</span>
            </span>
            <span className="brand-sub">PY3</span>
          </div>

          <nav className="rail-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-btn ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    onSelectView(item.id);
                    onCloseMobile();
                  }}
                >
                  <span className="nav-btn-left">
                    <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                    <span className="nav-label">{item.label}</span>
                  </span>
                  {item.badge !== null && (
                    <span className={`nav-badge ${item.badgeTone}`}>{item.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="rail-progress">
            <div className="rail-progress-row">
              <span>Curriculum logged</span>
              <strong>{pct}%</strong>
            </div>
            <div className="rail-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="rail-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="rail-cadence mono">
              Week {weekNum} · Day {dayNum} of 28
            </div>
            <p className="rail-ritual">
              Daily 75m loop: 15m cold review, 50m across 2 new problems, 10m pattern triggers.
            </p>
          </div>

          <div className="rail-footer">
            <div className="sync-row" role="status" aria-live="polite">
              <span
                className={`sync-dot ${
                  syncStatus === 'saving'
                    ? 'saving'
                    : syncStatus === 'offline'
                      ? 'offline'
                      : ''
                }`}
              />
              <span>
                {syncStatus === 'saving' && 'Saving to data/progress.json…'}
                {syncStatus === 'synced' && 'Synced · data/progress.json'}
                {syncStatus === 'offline' && 'Local cache (start server.py)'}
              </span>
            </div>

            <div className="rail-io">
              <button type="button" className="rail-io-btn" onClick={onExport}>
                <Download size={13} strokeWidth={1.75} aria-hidden="true" />
                <span>Export</span>
              </button>
              <button
                type="button"
                className="rail-io-btn"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={13} strokeWidth={1.75} aria-hidden="true" />
                <span>Import</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="sr-only"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
