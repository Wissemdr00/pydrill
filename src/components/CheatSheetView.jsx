import React from 'react';
import {
  CONSTRAINT_CHEAT_TABLE,
  PATTERN_FAMILIES,
  PYTHON3_PITFALLS,
} from '../data/curriculum';

export function CheatSheetView({ onJumpToPattern }) {
  return (
    <div className="cheatsheet-page">
      <section>
        <div className="section-head">
          <h2>Core Pattern Mental Triggers</h2>
          <span>Priority focus patterns marked with amber dot</span>
        </div>
        <div className="cheat-grid" style={{ marginTop: '12px' }}>
          {PATTERN_FAMILIES.map((fam) => (
            <article key={fam.id} className="cheat-panel">
              <div className="cheat-panel-head">
                <h3>
                  {fam.focus && <span className="tax-focus-dot" aria-hidden="true" />}
                  {fam.name}
                </h3>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                  {fam.targetComplexity}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
                {fam.trigger}
              </p>
              <code className="code-line">{fam.idiom}</code>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                <strong>Watch out:</strong> {fam.pitfall}
              </p>
              <div style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  className="hint-toggle"
                  onClick={() => onJumpToPattern(fam.id)}
                >
                  Open {fam.name} problems →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Constraint-to-Complexity Cheat Table</h2>
          <span>Read input constraint n before picking an algorithm</span>
        </div>
        <div className="table-scroll" style={{ marginTop: '12px' }}>
          <table className="pitfall-table">
            <thead>
              <tr>
                <th>Input Constraint</th>
                <th>Target Complexity</th>
                <th>Typical Patterns</th>
              </tr>
            </thead>
            <tbody>
              {CONSTRAINT_CHEAT_TABLE.map((row) => (
                <tr key={row.constraint}>
                  <td className="mono" style={{ fontWeight: 600 }}>{row.constraint}</td>
                  <td className="mono">{row.complexity}</td>
                  <td>{row.patterns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Python 3 Interview Pitfalls</h2>
          <span>Common bugs to check before clicking Submit</span>
        </div>
        <div className="table-scroll" style={{ marginTop: '12px' }}>
          <table className="pitfall-table">
            <thead>
              <tr>
                <th>Pitfall</th>
                <th>Buggy</th>
                <th>Idiomatic Python 3</th>
              </tr>
            </thead>
            <tbody>
              {PYTHON3_PITFALLS.map((row) => (
                <tr key={row.title}>
                  <td style={{ fontWeight: 600 }}>{row.title}</td>
                  <td className="mono" style={{ color: 'var(--danger-ink)', fontSize: '0.78rem' }}>
                    {row.wrong}
                  </td>
                  <td className="mono" style={{ color: 'var(--ok-ink)', fontSize: '0.78rem' }}>
                    {row.right}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
