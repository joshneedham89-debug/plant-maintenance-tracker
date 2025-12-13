
/* ===================================================
   PHASE 2 BASELINE + PHASE 3 (SAFE PHOTOS)
=================================================== */

/* ---------------- STORAGE ---------------- */
const PARTS_KEY = "pm_parts";
const INVENTORY_KEY = "pm_inventory";
const TONS_KEY = "pm_tons";

/* ---------------- STATE ---------------- */
let parts = [];
let inventory = [];
let currentTons = 0;
let completingPartIndex = null;

/* ---------------- ELEMENTS ---------------- */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

const partsList = document.getElementById("partsList");
const inventoryList = document.getElementById("inventoryList");

const tonsRunEl = document.getElementById("tonsRun");
const currentTonsInput = document.getElementById("currentTonsInput");

const updateTonsBtn = document.getElementById("updateTonsBtn");
const resetTonsBtn = document.getElementById("resetTonsBtn");

/* Complete panel */
const completePanelOverlay = document.getElementById("completePanelOverlay");
const completePanel = document.getElementById("completePanel");
const closeCompletePanelBtn = document.getElementById("closeCompletePanel");
const saveCompletionBtn = document.getElementById("saveCompletionBtn");
const compDate = document.getElementById("compDate");
const compTons = document.getElementById("compTons");
const compNotes = document.getElementById("compNotes");

/* Toast */
const toast = document.getElementById("toastContainer");

/* ---------------- NAV ---------------- */
function showScreen(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  navButtons.forEach(b =>
    b.classList.toggle("active", b.dataset.screen === id)
  );
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

/* ---------------- LOAD / SAVE ---------------- */
function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  localStorage.setItem(TONS_KEY, currentTons);
}

function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;
  currentTonsInput.value = currentTons;
  renderDashboard();
  renderParts();
  renderInventory();
}

/* ---------------- DASHBOARD ---------------- */
function renderDashboard() {
  tonsRunEl.textContent = currentTons;
}

/* ---------------- PARTS ---------------- */
function renderParts() {
  partsList.innerHTML = "";
  parts.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${p.name || "Part"}</strong>
      <button class="primary-btn full">Complete</button>
    `;
    card.querySelector("button").onclick = () => openCompletePanel(index);
    partsList.appendChild(card);
  });
}

/* ---------------- INVENTORY ---------------- */
function renderInventory() {
  inventoryList.innerHTML = "";
  inventory.forEach(i => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = `${i.part} (${i.qty})`;
    inventoryList.appendChild(div);
  });
}

/* ---------------- TONS ---------------- */
updateTonsBtn.onclick = () => {
  currentTons = Number(currentTonsInput.value) || 0;
  saveState();
  renderDashboard();
};

resetTonsBtn.onclick = () => {
  currentTons = 0;
  currentTonsInput.value = 0;
  saveState();
  renderDashboard();
};

/* ---------------- COMPLETE PANEL ---------------- */
function openCompletePanel(index) {
  completingPartIndex = index;
  compDate.value = new Date().toISOString().split("T")[0];
  compTons.value = currentTons;
  compNotes.value = "";
  completePanelOverlay.classList.remove("hidden");
  setTimeout(() => completePanel.classList.add("show"), 10);
}

function closeCompletePanel() {
  completePanel.classList.remove("show");
  completePanelOverlay.classList.add("hidden");
}

closeCompletePanelBtn.onclick = closeCompletePanel;

/* ---------------- PHASE 3: PHOTOS (SAFE) ---------------- */
let photoViewer;
let photoViewerImg;

document.addEventListener("DOMContentLoaded", () => {
  photoViewer = document.createElement("div");
  photoViewer.className = "photo-viewer hidden";
  photoViewer.innerHTML = "<img>";
  document.body.appendChild(photoViewer);
  photoViewerImg = photoViewer.querySelector("img");
  photoViewer.onclick = () => photoViewer.classList.add("hidden");
});

function compressImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const r = new FileReader();
    r.onload = e => img.src = e.target.result;
    img.onload = () => {
      const c = document.createElement("canvas");
      const s = Math.min(1, 900 / img.width);
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.7));
    };
    r.readAsDataURL(file);
  });
}

saveCompletionBtn.onclick = async () => {
  const p = parts[completingPartIndex];
  if (!p) return;

  let photos = [];
  if (confirm("Add photos?")) {
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = "image/*";
    picker.multiple = true;

    await new Promise(res => {
      picker.onchange = async () => {
        for (const f of picker.files) {
          photos.push(await compressImage(f));
        }
        res();
      };
      picker.click();
    });
  }

  p.history = p.history || [];
  p.history.push({
    date: compDate.value,
    tons: Number(compTons.value),
    notes: compNotes.value,
    photos
  });

  saveState();
  closeCompletePanel();
  renderParts();
  renderDashboard();
};

/* ---------------- INIT ---------------- */
loadState();
