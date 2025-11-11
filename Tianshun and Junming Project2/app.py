from flask import Flask, render_template, request, jsonify
from pathlib import Path
import json, uuid, threading, datetime

app = Flask(__name__)
DATA_DIR = Path("data")
DATA_FILE = DATA_DIR / "patterns.json"
DATA_DIR.mkdir(exist_ok=True)

_lock = threading.Lock()

def _init_store():
    if not DATA_FILE.exists():
        with DATA_FILE.open("w", encoding="utf-8") as f:
            json.dump({"submissions": []}, f, ensure_ascii=False, indent=2)

def _load():
    with DATA_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)

def _save(data):
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route("/")
def index():
    return render_template("index.html", title="Collective Groove")

def _is_6x16_pattern(pat):
    return isinstance(pat, list) and len(pat) == 6 and all(isinstance(r, list) and len(r) == 16 for r in pat)

@app.route("/submit", methods=["POST"])
def submit():
    payload = request.get_json(silent=True) or {}
    pattern = payload.get("pattern")
    name = (payload.get("name") or "").strip()[:32]
    msg = (payload.get("message") or "").strip()[:200]
    kit = (payload.get("kit") or "standard").strip().lower()[:20]
    if not _is_6x16_pattern(pattern):
        return jsonify({"ok": False, "error": "bad pattern shape (need 6x16)"}), 400
    norm_pat = [[1 if c else 0 for c in row] for row in pattern]
    with _lock:
        store = _load()
        store["submissions"].append({
            "id": str(uuid.uuid4()),
            "when": datetime.datetime.utcnow().isoformat() + "Z",
            "name": name,
            "message": msg,
            "kit": kit,
            "pattern": norm_pat
        })
        _save(store)
    return jsonify({"ok": True})

@app.route("/data")
def data():
    with _lock:
        store = _load()
        subs = store.get("submissions", [])
    window = list(reversed(subs))[:5]
    window = list(reversed(window))
    rows, cols = 6, 16
    counts = [[0]*cols for _ in range(rows)]
    for s in window:
        pat = s.get("pattern", [])
        if _is_6x16_pattern(pat):
            for r in range(rows):
                for c in range(cols):
                    counts[r][c] += 1 if pat[r][c] else 0
    recent_meta = [{
        "name": s.get("name") or "Anonymous",
        "when": s.get("when"),
        "message": s.get("message", ""),
        "kit": s.get("kit", "standard"),
        "pattern": s.get("pattern", [])
    } for s in window]
    return jsonify({
        "total_submissions": len(subs),
        "active_window": len(window),
        "counts": counts,
        "recent": recent_meta
    })


@app.route("/clear", methods=["POST"])
def clear_data():
    with _lock:
        _save({"submissions": []})
    return jsonify({"ok": True})

if __name__ == "__main__":
    _init_store()
    app.run(debug=True)
