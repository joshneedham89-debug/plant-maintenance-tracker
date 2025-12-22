/* =====================================================
   STORAGE KEYS
===================================================== */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";
const PMS_KEY = "pm_pms";

/* =====================================================
   GLOBAL STATE
===================================================== */
let parts = [];
let inventory = [];
let pms = [];
let currentTons = 0;

/* ===== Maintenance photos ===== */
let completionPhotos = [];

/* ===== PM photos ===== */
let pmPhotos = [];
let activePmId = null;

/* =====================================================
   LOAD / SAVE
===================================================== */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || PRELOADED_INVENTORY.slice();
  pms = JSON.parse(localStorage.getItem(PMS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  renderParts();
  renderPms();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  localStorage.setItem(PMS_KEY, JSON.stringify(pms));
  localStorage.setItem(TONS_KEY, currentTons);
}

document.addEventListener("DOMContentLoaded", loadState);

/* =====================================================
   SCREEN NAV
===================================================== */
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(btn.dataset.screen).classList.add("active");
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

/* =====================================================
   MAINTENANCE PARTS (unchanged logic)
===================================================== */
function renderParts() {
  const list = document.getElementById("partsList");
  if (!list) return;
  list.innerHTML = "";

  parts.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "part-card";
    card.innerHTML = `
      <div class="part-name">${p.name}</div>
      <div class="part-meta">${p.category} — ${p.section}</div>
      <button class="secondary-btn full" onclick="openComplete(${i})">Complete</button>
    `;
    list.appendChild(card);
  });
}

/* =====================================================
   COMPLETE MAINTENANCE (PHOTO FIX)
===================================================== */
function openComplete(index) {
  completionPhotos = [];
  document.getElementById("completePanelOverlay")?.classList.remove("hidden");
}

document.getElementById("compAddPhotoBtn")?.addEventListener("click", () => {
  document.getElementById("compPhotoInput").click();
});

document.getElementById("compPhotoInput")?.addEventListener("change", e => {
  [...e.target.files].forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      completionPhotos.push(reader.result);
      renderCompletionPhotos();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = "";
});

function renderCompletionPhotos() {
  const box = document.getElementById("compPhotoPreview");
  box.innerHTML = completionPhotos
    .map(src => `<img src="${src}" style="width:80px;border-radius:8px">`)
    .join("");
}

/* =====================================================
   PMS (NEW FEATURE – ISOLATED)
===================================================== */
function renderPms() {
  const list = document.getElementById("pmsList");
  if (!list) return;
  list.innerHTML = "";

  pms.forEach(pm => {
    const card = document.createElement("div");
    card.className = "pm-card";
    card.innerHTML = `
      <div class="pm-title">${pm.name}</div>
      <div class="pm-sub">${pm.area} — ${pm.frequency}</div>
      <button class="secondary-btn full" onclick="openPmComplete('${pm.id}')">Complete</button>
    `;
    list.appendChild(card);
  });
}

/* ===== Add / Edit PM ===== */
document.getElementById("openPmPanelBtn")?.addEventListener("click", () => {
  activePmId = null;
  document.getElementById("pmPanelOverlay").classList.remove("hidden");
});

document.getElementById("savePmBtn")?.addEventListener("click", () => {
  const pm = {
    id: "pm_" + Date.now(),
    area: pmArea.value,
    name: pmName.value,
    frequency: pmFrequency.value,
    notes: pmDefNotes.value,
    history: []
  };
  pms.push(pm);
  saveState();
  renderPms();
  document.getElementById("pmPanelOverlay").classList.add("hidden");
});

/* ===== Complete PM ===== */
function openPmComplete(id) {
  activePmId = id;
  pmPhotos = [];
  document.getElementById("pmCompleteOverlay").classList.remove("hidden");
}

document.getElementById("pmAddPhotoBtn")?.addEventListener("click", () => {
  document.getElementById("pmPhotoInput").click();
});

document.getElementById("pmPhotoInput")?.addEventListener("change", e => {
  [...e.target.files].forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      pmPhotos.push(reader.result);
      renderPmPhotos();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = "";
});

function renderPmPhotos() {
  const box = document.getElementById("pmPhotoPreview");
  box.innerHTML = pmPhotos
    .map(src => `<img src="${src}" style="width:80px;border-radius:8px">`)
    .join("");
}

document.getElementById("savePmCompletionBtn")?.addEventListener("click", () => {
  const pm = pms.find(p => p.id === activePmId);
  if (!pm) return;

  pm.history.push({
    date: pmCompDate.value,
    notes: pmCompNotes.value,
    photos: pmPhotos
  });

  saveState();
  renderPms();
  document.getElementById("pmCompleteOverlay").classList.add("hidden");
});
