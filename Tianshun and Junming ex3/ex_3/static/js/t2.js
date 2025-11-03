// CART 351 — Exercise III | t2.js
// ======================================

const cvs = document.getElementById("draw");
const ctx = cvs.getContext("2d");
const accent = document.getElementById("accent");
const mood = document.getElementById("mood");
const sendBtn = document.getElementById("sendBtn");
const toast = document.getElementById("toast");

const path = [];
let drawing = false;

function resizeCanvasDPR() {
  const dpr = window.devicePixelRatio || 1;
  const rect = cvs.getBoundingClientRect();
  cvs.width = Math.floor(rect.width * dpr);
  cvs.height = Math.floor(rect.height * dpr);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}
resizeCanvasDPR();
window.addEventListener("resize", resizeCanvasDPR);

cvs.addEventListener("pointerdown", e => {
  drawing = true;
  path.length = 0;
  addPoint(e);
});
cvs.addEventListener("pointermove", e => {
  if (!drawing) return;
  addPoint(e);
  draw();
});
window.addEventListener("pointerup", () => drawing = false);

function addPoint(e) {
  const rect = cvs.getBoundingClientRect();
  path.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: Date.now() });
  if (path.length > 256) path.shift(); 
}

function draw() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = accent.value;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}

async function sendData() {
  const body = {
    mood: mood.value,
    accent: accent.value,

    path: path.filter((_, i) => i % 4 === 0)
  };

  try {
    const res = await fetch("/postData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (json.ok) {
      showToast(`${json.message} \n mood: ${body.mood} | points: ${body.path.length}`);
      loadRecent(); 
    } else {
      showToast(json.message || "Unknown error", true);
    }
  } catch (err) {
    showToast("Network error: " + err.message, true);
  }
}

function showToast(msg, isError = false) {
  toast.textContent = msg;
  toast.className = "toast " + (isError ? "error" : "success");
  toast.style.setProperty("--accent", accent.value);
  toast.animate([{ transform: "scale(0.8)" }, { transform: "scale(1.0)" }], {
    duration: 180,
    easing: "ease-out"
  });
}

sendBtn.addEventListener("click", sendData);

async function loadRecent() {
  try {
    const res = await fetch("/api/data");
    const json = await res.json();
    const ul = document.getElementById("recent");
    if (!ul) return;
    ul.innerHTML = "";

    if (json.ok && Array.isArray(json.items)) {
      json.items.slice(0, 10).forEach((e, idx) => {
        const li = document.createElement("li");
        li.style.padding = "10px 12px";
        li.style.border = "1px solid #2e3240";
        li.style.borderRadius = "12px";
        li.style.display = "grid";
        li.style.gridTemplateColumns = "180px 1fr";
        li.style.gap = "12px";
        li.style.alignItems = "center";

        const thumb = document.createElement("canvas");
        thumb.width = 160;
        thumb.height = 100;
        thumb.style.borderRadius = "8px";
        thumb.style.background = "#10131a";
        thumb.style.outline = "1px solid #2a2e3a";
        thumb.style.cursor = "pointer";
        thumb.title = "Click to preview";

        const info = document.createElement("div");
        info.innerHTML = `
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <span style="opacity:.7;">#${idx + 1}</span>
            <span>${e.server_timestamp || "—"}</span>
            <span>${e.mood || "—"}</span>
            <span style="display:inline-flex;align-items:center;gap:6px;">
              <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${e.accent || "#999"};"></span>
              <code>${e.accent || ""}</code>
            </span>
            <span style="opacity:.8;">points: ${(e.path || []).length}</span>
          </div>
        `;

        li.appendChild(thumb);
        li.appendChild(info);
        ul.appendChild(li);

        drawPathOnCanvas(thumb, e.path || [], e.accent || "#8f7aff");

        thumb.addEventListener("click", () => {
          openPreviewModal(e.path || [], e.accent || "#8f7aff");
        });
      });
    }
  } catch (err) {
  }
}

function drawPathOnCanvas(canvas, path, strokeColor) {
  const ctx2 = canvas.getContext("2d");
  ctx2.clearRect(0, 0, canvas.width, canvas.height);
  if (!path.length) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of path) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;

  const pad = 10;
  const scale = Math.min(
    (canvas.width - pad * 2) / w,
    (canvas.height - pad * 2) / h
  );
  const offsetX = (canvas.width - w * scale) / 2;
  const offsetY = (canvas.height - h * scale) / 2;

  ctx2.lineWidth = 3;
  ctx2.lineJoin = "round";
  ctx2.lineCap = "round";
  ctx2.strokeStyle = strokeColor;
  ctx2.globalAlpha = 0.95;

  ctx2.beginPath();
  path.forEach((p, i) => {
    const x = (p.x - minX) * scale + offsetX;
    const y = (p.y - minY) * scale + offsetY;
    if (i === 0) ctx2.moveTo(x, y);
    else ctx2.lineTo(x, y);
  });
  ctx2.stroke();
}


let modal, modalBg, modalCanvas, modalCtx, modalClose;

function ensureModal() {
  if (modal) return; 

  modalBg = document.createElement("div");
  modalBg.style.position = "fixed";
  modalBg.style.inset = "0";
  modalBg.style.background = "rgba(0,0,0,.5)";
  modalBg.style.opacity = "0";
  modalBg.style.pointerEvents = "none";
  modalBg.style.transition = "opacity .18s ease-out";
  document.body.appendChild(modalBg);

  modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.left = "50%";
  modal.style.top = "50%";
  modal.style.transform = "translate(-50%,-50%) scale(.96)";
  modal.style.width = "720px";
  modal.style.maxWidth = "92vw";
  modal.style.background = "#0f1117";
  modal.style.border = "1px solid #2a2e3a";
  modal.style.borderRadius = "16px";
  modal.style.boxShadow = "0 10px 40px rgba(0,0,0,.5)";
  modal.style.opacity = "0";
  modal.style.transition = "opacity .18s ease-out, transform .18s ease-out";
  modal.style.padding = "16px";
  modal.style.display = "grid";
  modal.style.gridTemplateRows = "auto 1fr";
  modal.style.gap = "12px";
  modal.style.pointerEvents = "none";
  document.body.appendChild(modal);

  const topbar = document.createElement("div");
  topbar.style.display = "flex";
  topbar.style.justifyContent = "space-between";
  topbar.style.alignItems = "center";
  topbar.innerHTML = `<strong style="color:#e7e9ee;">Preview</strong>`;
  modal.appendChild(topbar);

  modalClose = document.createElement("button");
  modalClose.textContent = "Close";
  modalClose.style.padding = "8px 12px";
  modalClose.style.borderRadius = "10px";
  modalClose.style.border = "1px solid #3a3f52";
  modalClose.style.background = "#11131a";
  modalClose.style.color = "#e7e9ee";
  modalClose.style.cursor = "pointer";
  topbar.appendChild(modalClose);

  const wrap = document.createElement("div");
  wrap.style.background = "#0c0e14";
  wrap.style.border = "1px solid #2a2e3a";
  wrap.style.borderRadius = "12px";
  wrap.style.display = "grid";
  wrap.style.placeItems = "center";
  modal.appendChild(wrap);

  modalCanvas = document.createElement("canvas");
  modalCanvas.width = 960;  
  modalCanvas.height = 540;
  modalCanvas.style.maxWidth = "100%";
  modalCanvas.style.borderRadius = "10px";
  wrap.appendChild(modalCanvas);

  modalCtx = modalCanvas.getContext("2d");

  function hide() {
    modalBg.style.opacity = "0";
    modal.style.opacity = "0";
    modal.style.transform = "translate(-50%,-50%) scale(.96)";
    setTimeout(() => {
      modalBg.style.pointerEvents = "none";
      modal.style.pointerEvents = "none";
    }, 180);
  }
  modalBg.addEventListener("click", hide);
  modalClose.addEventListener("click", hide);

  modal.show = function() {
    modalBg.style.pointerEvents = "auto";
    modal.style.pointerEvents = "auto";
    modalBg.style.opacity = "1";
    modal.style.opacity = "1";
    modal.style.transform = "translate(-50%,-50%) scale(1)";
  };
}

function openPreviewModal(pathData, color) {
  ensureModal();

  drawPathOnCanvas(modalCanvas, pathData, color);
  modal.show();

  playPathOnCanvas(modalCanvas, pathData, color, 1400);
}

function playPathOnCanvas(canvas, pathData, color, duration = 1200) {
  const ctx3 = canvas.getContext("2d");
  if (!pathData.length) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pathData) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const pad = 20;
  const scale = Math.min(
    (canvas.width - pad * 2) / w,
    (canvas.height - pad * 2) / h
  );
  const offsetX = (canvas.width - w * scale) / 2;
  const offsetY = (canvas.height - h * scale) / 2;

  let start = null;
  function frame(ts) {
    if (!start) start = ts;
    const t = Math.min(1, (ts - start) / duration); // 0 → 1
    const count = Math.max(2, Math.floor(t * pathData.length));

    ctx3.clearRect(0, 0, canvas.width, canvas.height);
    ctx3.lineWidth = 6;
    ctx3.lineJoin = "round";
    ctx3.lineCap = "round";
    ctx3.strokeStyle = color;
    ctx3.globalAlpha = 0.95;

    ctx3.beginPath();
    for (let i = 0; i < count; i++) {
      const p = pathData[i];
      const x = (p.x - minX) * scale + offsetX;
      const y = (p.y - minY) * scale + offsetY;
      if (i === 0) ctx3.moveTo(x, y);
      else ctx3.lineTo(x, y);
    }
    ctx3.stroke();

    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

loadRecent();

