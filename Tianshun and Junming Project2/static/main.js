const ROWS = 6, COLS = 16;
let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let totalSubmissions = 0;
let activeWindow = 0;
let recent = [];
const $ = sel => document.querySelector(sel);

let visStep = -1;
function getColCells(c) { return Array.from(document.querySelectorAll(`.cell[data-c="${c}"]`)); }
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

  // Fetch initial data on load
  fetchData();
});

async function submitBeat() {
  const name = $("#name").value.trim();
  const message = $("#message").value.trim();
  const kit = ($("#kit")?.value || "standard");
  const res = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pattern: grid, name, message, kit })
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
  const counts = data.counts;
  totalSubmissions = data.total_submissions;
  activeWindow = data.active_window;
  recent = data.recent || [];
  $("#countLabel").textContent = `Total submissions: ${totalSubmissions}`;
  $("#windowLabel").textContent = `Active window: ${activeWindow}`;
  drawHeatmap(counts);
  renderRecent();
}

function drawHeatmap(counts) {
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
      ctx.fillStyle = `rgb(${val},${val},${val})`;
      ctx.fillRect(c * cellW, r * cellH, Math.ceil(cellW) - 1, Math.ceil(cellH) - 1);
    }
  }
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * cellW, 0); ctx.lineTo(c * cellW, canvas.height); ctx.stroke(); }
  for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * cellH); ctx.lineTo(canvas.width, r * cellH); ctx.stroke(); }
}

let previewLoop = null;
let drumLoop = null;

function createSynths(kit) {
  if (kit === "8bit") {
    return [
      new Tone.MembraneSynth({ octaves: 2, pitchDecay: 0.02, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.05 } }).toDestination(),
      new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.12, sustain: 0 } }).toDestination(),
      new Tone.MetalSynth({ frequency: 400, modulationIndex: 8, resonance: 300, harmonicity: 10 }).toDestination(),
      new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.005, decay: 0.08, sustain: 0.1, release: 0.1 } }).toDestination(),
      new Tone.MembraneSynth({ octaves: 1.5, pitchDecay: 0.04 }).toDestination(),
      new Tone.Synth({ oscillator: { type: 'square' } }).toDestination()
    ];
  } else if (kit === "techno") {
    return [
      new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 3 }).toDestination(),
      new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.08, sustain: 0 } }).toDestination(),
      new Tone.MetalSynth({ resonance: 400, harmonicity: 5.1, modulationIndex: 16 }).toDestination(),
      new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.003, decay: 0.07, sustain: 0.05, release: 0.08 } }).toDestination(),
      new Tone.MembraneSynth({ pitchDecay: 0.02, octaves: 2.5 }).toDestination(),
      new Tone.Synth({ oscillator: { type: 'pulse' } }).toDestination()
    ];
  } else if (kit === "acoustic") {
    return [
      new Tone.MembraneSynth({ octaves: 2, pitchDecay: 0.03, envelope: { attack: 0.002, decay: 0.25, sustain: 0, release: 0.12 } }).toDestination(),
      new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).toDestination(),
      new Tone.MetalSynth({ resonance: 200, harmonicity: 4.5 }).toDestination(),
      new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.002, decay: 0.1, sustain: 0.05, release: 0.15 } }).toDestination(),
      new Tone.MembraneSynth({ pitchDecay: 0.025 }).toDestination(),
      new Tone.Synth({ oscillator: { type: 'triangle' } }).toDestination()
    ];
  } else if (kit === "trap") {
    return [
      new Tone.MembraneSynth({ frequency: 45, octaves: 4, pitchDecay: 0.06, envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.4 } }).toDestination(),
      new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.15, sustain: 0 } }).toDestination(),
      new Tone.MetalSynth({ resonance: 500, harmonicity: 6.5 }).toDestination(),
      new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.002, decay: 0.12, sustain: 0.05, release: 0.12 } }).toDestination(),
      new Tone.MembraneSynth({ pitchDecay: 0.05 }).toDestination(),
      new Tone.Synth({ oscillator: { type: 'pulse' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 } }).toDestination()
    ];
  } else {
    return [
      new Tone.MembraneSynth().toDestination(),
      new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.12, sustain: 0 } }).toDestination(),
      new Tone.MetalSynth({ resonance: 400, harmonicity: 5.1 }).toDestination(),
      new Tone.Synth().toDestination(),
      new Tone.MembraneSynth({ pitchDecay: 0.03 }).toDestination(),
      new Tone.Synth({ oscillator: { type: 'square' } }).toDestination()
    ];
  }
}

function tuneRealtime() {
  try { Tone.context.latencyHint = "interactive"; } catch (e) { }
  Tone.Draw.anticipation = 0.02;
}

async function playPreview() {
  await Tone.start();
  tuneRealtime();
  if (drumLoop) { drumLoop.stop(); drumLoop.dispose(); drumLoop = null; }
  if (previewLoop) previewLoop.dispose();
  const synths = createSynths($("#kit")?.value || "standard");
  document.querySelectorAll(".cell.now").forEach(el => el.classList.remove("now"));
  visStep = -1;
  let step = 0;
  previewLoop = new Tone.Loop((time) => {
    const s = step;
    Tone.Draw.schedule(() => highlightStep(s), time);
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][s]) {
        if (r === 0) synths[0].triggerAttackRelease("C2", "8n", time, 0.7);
        else if (r === 1) synths[1].triggerAttackRelease("8n", time, 0.6);
        else if (r === 2) synths[2].triggerAttackRelease("16n", time, 0.5);
        else if (r === 3) synths[3].triggerAttackRelease("C4", "16n", time, 0.5);
        else if (r === 4) synths[4].triggerAttackRelease("G2", "8n", time, 0.55);
        else if (r === 5) synths[5].triggerAttackRelease("C5", "32n", time, 0.45);
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
  tuneRealtime();
  if (previewLoop) { previewLoop.stop(); previewLoop.dispose(); previewLoop = null; }
  if (drumLoop) { drumLoop.stop(); drumLoop.dispose(); drumLoop = null; }

  const participants = (recent || []).map(item => ({
    kit: (item.kit || "standard"),
    pattern: item.pattern || []
  }));
  const synthSets = participants.map(p => createSynths(p.kit));

  document.querySelectorAll(".cell.now").forEach(el => el.classList.remove("now"));
  visStep = -1;
  let step = 0;

  drumLoop = new Tone.Loop((time) => {
    const s = step;
    Tone.Draw.schedule(() => highlightStep(s), time);
    for (let i = 0; i < participants.length; i++) {
      const pat = participants[i].pattern;
      const synths = synthSets[i];
      if (!pat || !pat.length) continue;
      for (let r = 0; r < ROWS; r++) {
        if (pat[r][s]) {
          if (r === 0) synths[0].triggerAttackRelease("C2", "8n", time, 0.7);
          else if (r === 1) synths[1].triggerAttackRelease("8n", time, 0.6);
          else if (r === 2) synths[2].triggerAttackRelease("16n", time, 0.5);
          else if (r === 3) synths[3].triggerAttackRelease("C4", "16n", time, 0.4);
          else if (r === 4) synths[4].triggerAttackRelease("G2", "8n", time, 0.5);
          else if (r === 5) synths[5].triggerAttackRelease("C5", "32n", time, 0.4);
        }
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
    const who = item.name || "Anonymous";
    const when = item.when || "";
    const text = (item.message || "").replace(/\n/g, "<br>");
    const kit = item.kit || "standard";
    const card = document.createElement("div");
    card.className = "melody-card";
    card.innerHTML = `<strong>${who}</strong> · <em>${kit}</em> · <span>${when}</span><div style="margin-top:6px;color:#bbb">${text}</div>`;
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

// recording
let recorder = null;
let recBlob = null;
let recUrl = null;

function ensureRecorder() {
  if (!recorder) {
    recorder = new Tone.Recorder();
    Tone.getDestination().connect(recorder);
  }
  return recorder;
}

async function startRecording() {
  await Tone.start();
  ensureRecorder();
  const a = $("#recDownload");
  a.style.display = "none";
  if (recUrl) { URL.revokeObjectURL(recUrl); recUrl = null; }
  recBlob = null;
  recorder.start();
  $("#recStart").textContent = "Recording...";
  $("#recStart").disabled = true;
  $("#recStop").disabled = false;
}

async function stopRecording() {
  if (!recorder) return;
  const blob = await recorder.stop();
  recBlob = blob;
  recUrl = URL.createObjectURL(blob);
  const a = $("#recDownload");
  a.href = recUrl;
  a.style.display = "inline-block";
  $("#recStart").textContent = "Start Recording";
  $("#recStart").disabled = false;
  $("#recStop").disabled = true;
}

window.addEventListener("DOMContentLoaded", () => {
  const btnStart = $("#recStart");
  const btnStop = $("#recStop");
  if (btnStart && btnStop) {
    btnStop.disabled = true;
    btnStart.onclick = startRecording;
    btnStop.onclick = stopRecording;
  }
});
