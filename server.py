"""Lightweight local persistence server for PyDrill (Python 3 LeetCode Study Desk).

Stores all progress, pattern triggers, notes, and spaced-repetition dates directly
in data/progress.json inside this workspace. Uses only the Python standard library.

Usage:
    python server.py            # serves API + built dist/ (if built) on http://127.0.0.1:8787
    python server.py --port 8787
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
DATA_FILE = DATA_DIR / "progress.json"
DIST_DIR = ROOT_DIR / "dist"


def default_state() -> dict:
    return {
        "version": 1,
        "startedAt": datetime.now(timezone.utc).date().isoformat(),
        "updatedAt": None,
        "entries": {},
        "customProblems": [],
        "sessions": [],
    }


def load_progress() -> dict:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        state = default_state()
        save_progress(state)
        return state
    try:
        with DATA_FILE.open("r", encoding="utf-8") as fh:
            data = json.load(fh)
        if not isinstance(data, dict):
            return default_state()
        data.setdefault("version", 1)
        data.setdefault("entries", {})
        data.setdefault("customProblems", [])
        data.setdefault("sessions", [])
        return data
    except (json.JSONDecodeError, OSError):
        return default_state()


def save_progress(payload: dict) -> str:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    saved_at = datetime.now(timezone.utc).isoformat()
    payload["version"] = 1
    payload["updatedAt"] = saved_at
    tmp_path = DATA_FILE.with_suffix(".json.tmp")
    with tmp_path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    os.replace(tmp_path, DATA_FILE)
    return saved_at


class PyDrillHandler(BaseHTTPRequestHandler):
    server_version = "PyDrillLocal/1.0"

    def _send_json(self, status: int, data: dict) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _serve_static(self, raw_path: str) -> None:
        if not DIST_DIR.exists():
            self._send_json(
                404,
                {
                    "error": "Frontend bundle not built yet. Run `npm run dev` for Vite dev server or `npm run build` to serve from server.py."
                },
            )
            return

        rel = raw_path.lstrip("/") or "index.html"
        candidate = (DIST_DIR / rel).resolve()
        if not str(candidate).startswith(str(DIST_DIR.resolve())) or not candidate.is_file():
            candidate = DIST_DIR / "index.html"

        mime, _ = mimetypes.guess_type(str(candidate))
        content = candidate.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mime or "application/octet-stream")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._send_json(204, {})

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._send_json(200, {"ok": True, "file": "data/progress.json"})
            return
        if parsed.path == "/api/progress":
            self._send_json(200, load_progress())
            return
        self._serve_static(parsed.path)

    def do_PUT(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/api/progress":
            self._send_json(404, {"error": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json(400, {"error": "Invalid Content-Length"})
            return

        if length <= 0 or length > 5_000_000:
            self._send_json(400, {"error": "Payload empty or exceeds 5MB limit"})
            return

        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            self._send_json(400, {"error": f"Invalid JSON: {exc}"})
            return

        if not isinstance(payload, dict) or not isinstance(payload.get("entries"), dict):
            self._send_json(400, {"error": "Payload must include an `entries` object"})
            return

        saved_at = save_progress(payload)
        self._send_json(200, {"ok": True, "savedAt": saved_at, "file": "data/progress.json"})

    def log_message(self, format: str, *args) -> None:
        # Keep console output concise
        print(f"[PyDrill] {self.address_string()} - {format % args}")


def main() -> None:
    parser = argparse.ArgumentParser(description="PyDrill local JSON persistence server")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8787")))
    args = parser.parse_args()

    load_progress()
    server = ThreadingHTTPServer((args.host, args.port), PyDrillHandler)
    print(f"PyDrill server running at http://{args.host}:{args.port}")
    print(f"Saving study data to {DATA_FILE}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down PyDrill server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
