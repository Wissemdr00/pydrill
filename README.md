# PyDrill

A local-first study desk for running a structured **4-week Python 3 LeetCode interview plan** with built-in **spaced repetition**, a **25-minute solve timer**, and **1-line pattern trigger logging**.

Built to replace static Markdown checklists: open it once a day, clear due cold reviews first, drill the next two problems under a timer, and save every note directly to `data/progress.json` in your workspace.

---

## Why PyDrill

Most interview prep stalls for two reasons: doing random problems without locking in patterns, and solving a problem once only to forget the insight a week later. PyDrill builds the whole loop into one local screen:

- **Daily 75-minute cadence:** 15 min cold review of due problems, 50 min across 2 new problems (25-minute rule), and 10 min logging 1-line triggers and Python 3 pitfalls.
- **Pattern-first curriculum (52 problems):** Four weeks ordered by dependency—front-loading **Arrays & Hashing**, **Two Pointers**, **Sliding Window**, and **Monotonic Stack**, followed by **Binary Search**, **Linked Lists**, **Trees**, **Backtracking**, **Heaps**, **Graphs**, and starter **1D DP**.
- **Spaced-repetition engine:**
  - `Solved Clean` advances **Box 1 (+3 days)** → **Box 2 (+14 days)** → **Mastered**.
  - `Used Hints` schedules a **+1 day** retry.
  - `Struggled` resets the problem to **Box 1 (+3 days)**.
  - Due and overdue reviews automatically surface at the top of **Today's Queue**.
- **Pattern Taxonomy Strip & Self-Test Mask:** Filter any view by algorithmic family with live progress ratios, read that family's mental trigger and Python 3 idiom inline, and toggle **Self-Test Mask** to blur your logged triggers until hovered.
- **Inline Study Drawer:** Open any problem directly on LeetCode, edit your 1-line trigger and pitfall notes inline (auto-saved), reveal an optional 1-line nudge if stuck after 25 minutes, or add custom/untagged problems for Week 4 simulations and contests.
- **Built-in Cheat Sheet:** Quick reference for all 11 core pattern triggers, constraint-to-complexity bounds (`n <= 20` through `n <= 10^9`), and common Python 3 interview pitfalls.
- **Zero-dependency local persistence:** A tiny Python standard-library server (`server.py`) writes atomically to `data/progress.json` with offline `localStorage` fallback and 1-click JSON Export/Import.

---

## Quick Start

### Prerequisites
- **Node.js 18+** (for React + Vite)
- **Python 3.10+** (standard library only—no `pip install` needed)

### 1. Install dependencies & build
```bash
npm install
npm run build
```

### 2. Start the local server
```bash
python server.py
```

Open **http://127.0.0.1:8787/**. `server.py` serves both the built frontend (`dist/`) and the JSON persistence API backed by `data/progress.json`.

### Development mode (hot reload)
Run the Python API server and Vite dev server in two terminals:

```bash
# Terminal 1 — JSON persistence API on :8787
python server.py

# Terminal 2 — Vite dev server on :5173 (proxies /api -> :8787)
npm run dev
```

---

## Curriculum Overview

| Week | Focus | Core Patterns |
|---|---|---|
| **Week 1** | Pointer control & frequency maps | Arrays & Hashing, Two Pointers, Sliding Window |
| **Week 2** | Linear invariants & search spaces | Stack & Monotonic Stack, Binary Search, Linked Lists |
| **Week 3** | Recursive structure & priority queues | Trees (DFS/BFS), Backtracking, Heaps |
| **Week 4** | Graph traversal, starter DP & untagged drills | Graphs, 1D DP, Custom/Untagged simulations |

---

## Local API & Persistence

All progress lives in `data/progress.json` (created automatically on first start) using atomic temp-file replacement so partial writes never corrupt your log.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | `GET` | Health check and active storage path |
| `/api/progress` | `GET` | Load saved entries, custom problems, and start date |
| `/api/progress` | `PUT` | Validate and atomically save updated study state |

If `server.py` is stopped, the UI remains usable via browser `localStorage` and shows an offline status indicator in the sidebar until the server is back.

---

## Project Structure

```text
.
├── index.html                  # App entry & font imports (Figtree, JetBrains Mono)
├── server.py                   # Local Python 3 HTTP server + atomic JSON persistence
├── vite.config.js              # Vite config & /api proxy to :8787
├── package.json
├── data/
│   └── progress.json           # Your local study log & spaced-repetition schedule
└── src/
    ├── main.jsx
    ├── App.jsx                 # Views, filters, timer, and store sync
    ├── data/
    │   └── curriculum.js       # 52 curated problems, pattern triggers, pitfalls
    ├── utils/
    │   ├── srs.js              # Spaced-repetition state machine (+1d / +3d / +14d)
    │   └── api.js              # /api/progress client with localStorage fallback
    ├── components/
    │   ├── Sidebar.jsx         # Navigation rail, Week/Day progress, sync & export/import
    │   ├── TopBar.jsx          # 25m Solve / 15m Review countdown timer
    │   ├── TaxonomyStrip.jsx   # Pattern family filter strip with mastery bars
    │   ├── StudyDrawer.jsx     # Inline SRS actions, trigger & pitfall editor
    │   └── CheatSheetView.jsx  # Pattern triggers, Big-O constraint table, Py3 pitfalls
    └── styles/
        ├── tokens.css          # Design tokens & browser-surface theming
        └── app.css             # Layout shell, tables, drawer, responsive breakpoints
```

---

## Stack

- **Frontend:** React 18, Vite 6, `lucide-react`, vanilla CSS custom properties
- **Backend:** Python 3 `http.server` (`ThreadingHTTPServer`, zero external dependencies)
- **Storage:** Local JSON file (`data/progress.json`) + `localStorage` fallback
