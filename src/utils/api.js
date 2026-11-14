const LOCAL_KEY = 'pydrill_progress_v1';

export function createEmptyStore() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return {
    version: 1,
    startedAt: `${y}-${m}-${d}`,
    updatedAt: null,
    entries: {},
    customProblems: [],
    sessions: [],
  };
}

export async function loadProgressStore() {
  try {
    const res = await fetch('/api/progress', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    return { data, source: 'server' };
  } catch {
    try {
      const cached = localStorage.getItem(LOCAL_KEY);
      if (cached) {
        return { data: JSON.parse(cached), source: 'offline' };
      }
    } catch {
      // ignore storage errors
    }
    return { data: createEmptyStore(), source: 'offline' };
  }
}

export async function saveProgressStore(payload) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage quota errors
  }

  try {
    const res = await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    return { ok: true, source: 'server', savedAt: body.savedAt };
  } catch {
    return { ok: false, source: 'offline', savedAt: null };
  }
}
