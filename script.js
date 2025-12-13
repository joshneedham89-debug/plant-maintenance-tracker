/* ---------------------------------------------------
   STORAGE KEYS
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";

/* ---------------------------------------------------
   GLOBAL STATE
--------------------------------------------------- */
let parts = [];
let currentTons = 0;
let categories = [];
let inventory = [];

let editingPartIndex = null;
let editingInventoryIndex = null;

let completingPartIndex = null;
let completionUsedItems = [];
let completionPhotos = [];

/* ---------------------------------------------------
   ELEMENT REFERENCES
--------------------------------------------------- */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

/* Dashboard */
const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const tonsRunEl = document.getElementById("tonsRun");
const completedTodayEl = document.getElementById("completedTodayCount");
const completedMonthEl = document.getElementById("completedMonthCount");

/* Tons */
const currentTonsInput = document.getElementById("currentTonsInput");
const updateTonsBtn = document.getElementById("updateTonsBtn");
const resetTonsBtn = document.getElementById("resetTonsBtn");

/* Maintenance */
const filterCategory = document.getElementById("filterCategory");
const partsList = document.getElementById("partsList");
const searchPartsInput = document.getElementById("searchPartsInput");

/* Inventory */
const inventoryList = document.getElementById("inventoryList");
const searchInventoryInput = document.getElementById("searchInventoryInput");

/* AC */
const ac_residual = document.getElementById("ac_residual");
const ac_rapPct = document.getElementById("ac_rapPct");
const ac_target = document.getElementById("ac_target");
const ac_tph = document.getElementById("ac_tph");
const ac_totalTons = document.getElementById("ac_totalTons");
const acCalcBtn = document.getElementById("acCalcBtn");
const ac_pumpRate = document.getElementById("ac_pumpRate");
const ac_totalAc = document.getElementById("ac_totalAc");

/* Complete Maintenance Panel */
const completePanelOverlay = document.getElementById("completePanelOverlay");
const completePanel = document.getElementById("completePanel");
const closeCompletePanelBtn = document.getElementById("closeCompletePanel");

const compDate = document.getElementById("compDate");
const compTons = document.getElementById("compTons");
const compNotes = document.getElementById("compNotes");
const saveCompletionBtn = document.getElementById("saveCompletionBtn");

/* Photos */
const compPhotoInput = document.getElementById("compPhotoInput");
const photoPreview = document.getElementById("photoPreview");
const photoViewer = document.getElementById("photoViewer");
const photoViewerImg = document.getElementById("photoViewerImg");

/* Toast */
const toastContainer = document.getElementById("toastContainer");

/* ---------------------------------------------------
   TOAST
--------------------------------------------------- */
function showToast(msg) {
  toastContainer.textContent = msg;
  toastContainer.classList.add("show");
  setTimeout(() => toastContainer.classList.remove("show"), 2500);
}

/* ---------------------------------------------------
   IMAGE COMPRESSION
--------------------------------------------------- */
function compressImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 900 / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    reader.readAsDataURL(file);
  });
}

/* ---------------------------------------------------
   PHOTO HANDLING
--------------------------------------------------- */
compPhotoInput?.addEventListener("change", async () => {
  for (const file of compPhotoInput.files) {
    const src = await compressImage(file);
    completionPhotos.push({ src });

    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => openPhotoViewer(src);
    photoPreview.appendChild(img);
  }
  compPhotoInput.value = "";
});

function openPhotoViewer(src) {
  photoViewerImg.src = src;
  photoViewer.classList.remove("hidden");
}

photoViewer?.addEventListener("click", () => {
  photoViewer.classList.add("hidden");
});

/* ---------------------------------------------------
   COMPLETE PANEL OPEN / CLOSE (FIXED)
--------------------------------------------------- */
function openCompletePanel(index) {
  completingPartIndex = index;

  compDate.value = new Date().toISOString().split("T")[0];
  compTons.value = currentTons;
  compNotes.value = "";

  completionPhotos = [];
  photoPreview.innerHTML = "";

  completionUsedItems = [];

  completePanelOverlay.classList.remove("hidden");
  setTimeout(() => completePanel.classList.add("show"), 10);
}

function closeCompletePanel() {
  completePanel.classList.remove("show");
  completePanelOverlay.classList.add("hidden");
}

closeCompletePanelBtn?.addEventListener("click", closeCompletePanel);

/* ---------------------------------------------------
   LOAD / SAVE
--------------------------------------------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  currentTonsInput.value = currentTons;

  renderDashboard();
  renderParts();
  renderInventory();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  localStorage.setItem(TONS_KEY, currentTons);
}

loadState();

/* ---------------------------------------------------
   RENDER PARTS (COMPLETE BUTTON FIXED)
--------------------------------------------------- */
function renderParts() {
  partsList.innerHTML = "";
  parts.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "part-card";
    card.innerHTML = `
      <div class="part-name">${p.name}</div>
      <button class="primary-btn">Complete</button>
    `;
    card.querySelector("button").onclick = () => openCompletePanel(index);
    partsList.appendChild(card);
  });
}

/* ---------------------------------------------------
   SAVE COMPLETION
--------------------------------------------------- */
saveCompletionBtn?.addEventListener("click", () => {
  const p = parts[completingPartIndex];
  if (!p) return;

  p.history = p.history || [];
  p.history.push({
    date: compDate.value,
    tons: Number(compTons.value),
    notes: compNotes.value,
    photos: completionPhotos.slice()
  });

  p.date = compDate.value;
  p.lastTons = Number(compTons.value);

  saveState();
  closeCompletePanel();
  renderParts();
  renderDashboard();
  showToast("Maintenance saved");
});

/* ---------------------------------------------------
   DASHBOARD
--------------------------------------------------- */
function renderDashboard() {
  tonsRunEl.textContent = currentTons;
}

/* ---------------------------------------------------
   AC CALCULATOR (UNCHANGED)
--------------------------------------------------- */
acCalcBtn?.addEventListener("click", () => {
  const pump =
    Number(ac_tph.value) *
    ((Number(ac_target.value) / 100) -
      ((Number(ac_rapPct.value) / 100) *
        (Number(ac_residual.value) / 100)));

  const needed =
    Number(ac_totalTons.value) *
    ((Number(ac_target.value) / 100) -
      ((Number(ac_rapPct.value) / 100) *
        (Number(ac_residual.value) / 100)));

  ac_pumpRate.textContent = pump.toFixed(3);
  ac_totalAc.textContent = needed.toFixed(2);
});

/* ---------------------------------------------------
   SAFETY: CLOSE ALL PANELS ON LOAD
--------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".panel-overlay")
    .forEach(o => o.classList.add("hidden"));
  document
    .querySelectorAll(".slide-panel")
    .forEach(p => p.classList.remove("show"));
});
