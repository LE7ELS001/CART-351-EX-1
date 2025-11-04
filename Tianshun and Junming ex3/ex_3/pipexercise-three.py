# CART 351 — Exercise III | Flask + JS + Fetch
# Team: 1) Tianshun Wu  2) Junming He
# File: pipexercise-three.py
# Python: 3.13+  | Flask installed in the active virtual environment
# ---------------------------------------------------------------
# [1] Imports
from flask import Flask, render_template, request, jsonify, url_for
import os
from datetime import datetime
import ast   

# [2] App setup
app = Flask(__name__)

# [3] Ensure data path (relative to this file)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_FILE = os.path.join(BASE_DIR, "files", "data.txt")


def read_data_entries(max_items=100):
    entries = []
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("==="):
                    continue
                try:
                    d = ast.literal_eval(line) 
                    entries.append(d)
                except:
                    continue
    return list(reversed(entries))[:max_items]


# [4] Index route
@app.route("/")
def index():
    return render_template("index.html")


# [5] /t2 route
@app.route("/t2")
def t2():
    return render_template("t2.html")


# [6] POST endpoint to save data
@app.route("/postDataFetch", methods=["POST"])
def post_data():
    payload = request.get_json(silent=True) or {}
    payload["server_timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    try:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, "a", encoding="utf-8") as f:
            f.write(str(payload) + "\n")

        return jsonify({
            "ok": True,
            "message": "Saved! Thanks for your submission.",
            "echo": payload
        }), 200
    except Exception as e:
        return jsonify({
            "ok": False,
            "message": f"Server error: {e}"
        }), 500


@app.route("/api/data")
def api_data():
    entries = read_data_entries(200)
    return jsonify({"ok": True, "items": entries})


# [7] Run server
if __name__ == "__main__":
    app.run(debug=True)
