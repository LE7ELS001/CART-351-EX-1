const ROWS = 6, COLS = 16;
let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let counts = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let totalSubmissions = 0;
let activeWindow = 0;
let recent = [];
const $ = sel => document.querySelector(sel);

let visStep = -1;
function getColCells(c) {
  return Array.from(document.querySelectorAll(`.cell[data-c="${c}"]`));
}
function highlightStep(c) {
  if (visStep >= 0) getColCells(visStep).forEach(el => el.classList.remove("now"));
  getColCells(c).forEach(el => {
    el.classList.add("now");
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 160);
  });
  visStep = c;
}

function buildGrid() {
  const wrap = $("#grid");
  wrap.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.onclick = () => toggleCell(r, c, cell);
      row.appendChild(cell);
    }
    wrap.appendChild(row);
  }
  syncGridUI();
}

function toggleCell(r, c, el) {
  grid[r][c] = grid[r][c] ? 0 : 1;
  if (el) el.classList.toggle("on", !!grid[r][c]);
}

function syncGridUI() {
  document.querySelectorAll(".cell").forEach(el => {
    const r = +el.dataset.r, c = +el.dataset.c;
    el.classList.toggle("on", !!grid[r][c]);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  buildGrid();
  $("#clear").onclick = () => { grid = grid.map(row => row.map(() => 0)); syncGridUI(); };
  $("#random").onclick = () => { grid = grid.map(row => row.map(() => Math.random() < 0.25 ? 1 : 0)); syncGridUI(); };
  $("#preview").onclick = playPreview;
  $("#submit").onclick = submitBeat;
  $("#refresh").onclick = fetchData;
  $("#play").onclick = playDrums;
  $("#stop").onclick = stopAudio;
  const clearBtn = $("#clearJson"); if (clearBtn) clearBtn.onclick = clearServerData;
  fetchData();
});

async function submitBeat() {
  const name = $("#name").value.trim();
  const res = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pattern: grid, name })
  });
  const data = await res.json();
  if (data.ok) {
    await fetchData();
    $("#submit").textContent = "Submitted!";
    setTimeout(() => $("#submit").textContent = "Submit Beat", 800);
  } else {
    alert("Submit failed: " + (data.error || "unknown"));
  }
}

async function fetchData() {
  const res = await fetch("/data");
  const data = await res.json();
  counts = data.counts;
  totalSubmissions = data.total_submissions;
  activeWindow = data.active_window;
  recent = data.recent || [];
  $("#countLabel").textContent = `Total submissions: ${totalSubmissions}`;
  $("#windowLabel").textContent = `Active window: ${activeWindow}`;
  drawHeatmap();
  renderRecent();
}

function drawHeatmap() {
  const canvas = $("#heatmap");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cellW = canvas.width / COLS;
  const cellH = canvas.height / ROWS;
  let max = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) max = Math.max(max, counts[r][c]);
  const norm = v => max ? v / max : 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = norm(counts[r][c]);
      const val = Math.round(255 * t);
      const g = val;
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      ctx.fillRect(c * cellW, r * cellH, Math.ceil(cellW) - 1, Math.ceil(cellH) - 1);
    }
  }
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * cellW, 0); ctx.lineTo(c * cellW, canvas.height); ctx.stroke(); }
  for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * cellH); ctx.lineTo(canvas.width, r * cellH); ctx.stroke(); }
}

let drumSynths = null;
let drumLoop = null;
let previewLoop = null;

function ensureDrumSynths() {
  if (drumSynths) return drumSynths;
  drumSynths = [
    new Tone.MembraneSynth().toDestination(),
    new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.12, sustain: 0 } }).toDestination(),
    new Tone.MetalSynth({ resonance: 400, harmonicity: 5.1 }).toDestination(),
    new Tone.Synth().toDestination(),
    new Tone.MembraneSynth({ pitchDecay: 0.03 }).toDestination(),
    new Tone.Synth({ oscillator: { type: 'square' } }).toDestination()
  ];
  return drumSynths;
}

function tuneRealtime() {
  try { Tone.context.latencyHint = "interactive"; } catch (e) { }
  Tone.Draw.anticipation = 0.02;
}

async function playPreview() {
  await Tone.start();
  ensureDrumSynths();
  tuneRealtime();
  if (drumLoop) { drumLoop.stop(); drumLoop.dispose(); drumLoop = null; }
  if (previewLoop) previewLoop.dispose();
  document.querySelectorAll(".cell.now").forEach(el => el.classList.remove("now"));
  visStep = -1;
  let step = 0;
  previewLoop = new Tone.Loop((time) => {
    const s = step;
    Tone.Draw.schedule(() => highlightStep(s), time);
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][s]) {
        if (r === 0) drumSynths[0].triggerAttackRelease("C2", "8n", time, 0.7);
        else if (r === 1) drumSynths[1].triggerAttackRelease("8n", time, 0.6);
        else if (r === 2) drumSynths[2].triggerAttackRelease("E4", "16n", time, 0.5);
        else if (r === 3) drumSynths[3].triggerAttackRelease("C4", "16n", time, 0.5);
        else if (r === 4) drumSynths[4].triggerAttackRelease("G2", "8n", time, 0.55);
        else if (r === 5) drumSynths[5].triggerAttackRelease("C5", "32n", time, 0.45);
      }
    }
    step = (step + 1) % COLS;
  }, "16n");
  if (!Tone.Transport.state || Tone.Transport.state === "stopped") Tone.Transport.bpm.value = 110;
  previewLoop.start(0);
  Tone.Transport.start();
}

async function playDrums() {
  await Tone.start();
  ensureDrumSynths();
  tuneRealtime();
  if (previewLoop) { previewLoop.stop(); previewLoop.dispose(); previewLoop = null; }
  let max = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) max = Math.max(max, counts[r][c]);
  const vel = (r, c) => (max ? counts[r][c] / max : 0);
  if (drumLoop) drumLoop.dispose();
  document.querySelectorAll(".cell.now").forEach(el => el.classList.remove("now"));
  visStep = -1;
  let step = 0;
  drumLoop = new Tone.Loop((time) => {
    const s = step;
    Tone.Draw.schedule(() => highlightStep(s), time);
    for (let r = 0; r < ROWS; r++) {
      const v = vel(r, s);
      if (v > 0.01) {
        if (r === 0) drumSynths[0].triggerAttackRelease("C2", "8n", time, 0.6 * v);
        else if (r === 1) drumSynths[1].triggerAttackRelease("8n", time, 0.6 * v);
        else if (r === 2) drumSynths[2].triggerAttackRelease("E4", "16n", time, 0.5 * v);
        else if (r === 3) drumSynths[3].triggerAttackRelease("C4", "16n", time, 0.4 * v);
        else if (r === 4) drumSynths[4].triggerAttackRelease("G2", "8n", time, 0.5 * v);
        else if (r === 5) drumSynths[5].triggerAttackRelease("C5", "32n", time, 0.4 * v);
      }
    }
    step = (step + 1) % COLS;
  }, "16n");
  if (!Tone.Transport.state || Tone.Transport.state === "stopped") Tone.Transport.bpm.value = 110;
  drumLoop.start(0);
  Tone.Transport.start();
}

function stopAudio() {
  if (drumLoop) { drumLoop.stop(); drumLoop.dispose(); drumLoop = null; }
  if (previewLoop) { previewLoop.stop(); previewLoop.dispose(); previewLoop = null; }
  Tone.Transport.stop();
  document.querySelectorAll(".cell.now").forEach(el => el.classList.remove("now"));
  visStep = -1;
}

function renderRecent() {
  const list = $("#recentList");
  list.innerHTML = "";
  recent.forEach(item => {
    const card = document.createElement("div");
    card.className = "melody-card";
    card.innerHTML = `<strong>${item.name || "Anonymous"}</strong> · <span>${item.when || ""}</span>`;
    list.appendChild(card);
  });
}

async function clearServerData() {
  if (!confirm("Clear all stored data?")) return;
  const res = await fetch("/clear", { method: "POST" });
  const data = await res.json();
  if (data.ok) {
    await fetchData();
    alert("All data cleared.");
  } else {
    alert("Failed to clear.");
  }
}
