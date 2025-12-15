/* =========================================================
   STORAGE KEYS
========================================================= */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";
const PROBLEMS_KEY = "pm_problems";

/* =========================================================
   GLOBAL STATE
========================================================= */
let parts = [];
let currentTons = 0;
let inventory = [];
let categories = PRELOADED_CATEGORIES || [];

let editingPartIndex = null;
let editingInventoryIndex = null;
let completingPartIndex = null;

let completionUsedItems = [];
let completionPhotos = [];

/* ---- Problems ---- */
let problems = [];
let problemPhotosDraft = [];

/* ---- Lightbox ---- */
let lightboxImages = [];
let lightboxIndex = 0;
let touchStartX = null;

/* =========================================================
   ELEMENT REFERENCES
========================================================= */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

/* Dashboard */
const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const tonsRunEl = document.getElementById("tonsRun");
const openProblemsCountEl = document.getElementById("openProblemsCount");

/* Tons */
const currentTonsInput = document.getElementById("currentTonsInput");
const updateTonsBtn = document.getElementById("updateTonsBtn");
const resetTonsBtn = document.getElementById("resetTonsBtn");

/* Maintenance */
const partsList = document.getElementById("partsList");
const addPartBtn = document.getElementById("addPartBtn");
const filterCategory = document.getElementById("filterCategory");
const searchPartsInput = document.getElementById("searchPartsInput");

/* Inventory */
const inventoryList = document.getElementById("inventoryList");

/* Problem Panel (Dashboard) */
const openProblemPanelBtn = document.getElementById("openProblemPanelBtn");
const problemPanelOverlay = document.getElementById("problemPanelOverlay");
const problemPanel = document.getElementById("problemPanel");
const closeProblemPanel = document.getElementById("closeProblemPanel");

const probTitle = document.getElementById("probTitle");
const probDesc = document.getElementById("probDesc");
const probSeverity = document.getElementById("probSeverity");
const probStatus = document.getElementById("probStatus");
const probAddPhotoBtn = document.getElementById("probAddPhotoBtn");
const probPhotoInput = document.getElementById("probPhotoInput");
const probPhotoPreview = document.getElementById("probPhotoPreview");
const probSubmitBtn = document.getElementById("probSubmitBtn");

/* Problems list (Maintenance) */
const problemsList = document.getElementById("problemsList");
const probFilter = document.getElementById("probFilter");

/* Lightbox */
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxCounter = document.getElementById("lightboxCounter");

/* Toast */
const toastContainer = document.getElementById("toastContainer");

/* =========================================================
   UTILITIES
========================================================= */
function showToast(msg, type = "success") {
  toastContainer.textContent = msg;
  toastContainer.className = `toast ${type} show`;
  setTimeout(() => toastContainer.classList.remove("show"), 2500);
}

function genId() {
  return "p_" + Math.random().toString(36).slice(2) + Date.now();
}

/* =========================================================
   LIGHTBOX
========================================================= */
function openLightbox(images, start = 0) {
  lightboxImages = images;
  lightboxIndex = start;
  lightboxOverlay.classList.remove("hidden");
  updateLightbox();
}

function updateLightbox() {
  lightboxImg.src = lightboxImages[lightboxIndex];
  lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
}

function closeLightboxFn() {
  lightboxOverlay.classList.add("hidden");
}

lightboxPrev.onclick = () => {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  updateLightbox();
};
lightboxNext.onclick = () => {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  updateLightbox();
};
lightboxClose.onclick = closeLightboxFn;

/* =========================================================
   STATE LOAD / SAVE
========================================================= */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;
  inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || PRELOADED_INVENTORY;
  problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];

  currentTonsInput.value = currentTons;

  buildCategoryFilter();
  renderDashboard();
  renderParts();
  renderProblems();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, currentTons);
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
}

/* =========================================================
   SCREEN NAVIGATION
========================================================= */
navButtons.forEach(btn => {
  btn.onclick = () => {
    screens.forEach(s => s.classList.remove("active"));
    document.getElementById(btn.dataset.screen).classList.add("active");
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  };
});

/* =========================================================
   DASHBOARD
========================================================= */
function renderDashboard() {
  let ok = 0, due = 0, over = 0;

  parts.forEach(p => {
    const daysSince = (Date.now() - new Date(p.date)) / 86400000;
    const tonsSince = currentTons - p.lastTons;

    if (daysSince > p.days || tonsSince > p.tonInterval) over++;
    else if (p.days - daysSince < 5 || p.tonInterval - tonsSince < 500) due++;
    else ok++;
  });

  okCountEl.textContent = ok;
  dueCountEl.textContent = due;
  overCountEl.textContent = over;
  tonsRunEl.textContent = currentTons;
  openProblemsCountEl.textContent = problems.filter(p => p.status === "Open").length;
}

updateTonsBtn.onclick = () => {
  currentTons = Number(currentTonsInput.value);
  saveState();
  renderDashboard();
};

resetTonsBtn.onclick = () => {
  currentTons = 0;
  currentTonsInput.value = 0;
  saveState();
  renderDashboard();
};

/* =========================================================
   PARTS
========================================================= */
function buildCategoryFilter() {
  filterCategory.innerHTML = `<option value="ALL">All</option>`;
  categories.forEach(c => filterCategory.innerHTML += `<option>${c}</option>`);
}

function renderParts() {
  partsList.innerHTML = "";
  parts.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "part-card";
    card.innerHTML = `
      <div class="part-name">${p.name}</div>
      <div class="part-meta">${p.category} - ${p.section}</div>
      <button data-i="${i}" class="complete-btn">Complete</button>
    `;
    partsList.appendChild(card);
  });
}

/* =========================================================
   PROBLEM PANEL (Dashboard)
========================================================= */
openProblemPanelBtn.onclick = () => {
  problemPanelOverlay.classList.remove("hidden");
  setTimeout(() => problemPanel.classList.add("show"), 10);
};

function closeProblemPanelFn() {
  problemPanel.classList.remove("show");
  setTimeout(() => problemPanelOverlay.classList.add("hidden"), 250);
}

closeProblemPanel.onclick = closeProblemPanelFn;
problemPanelOverlay.onclick = e => {
  if (e.target === problemPanelOverlay) closeProblemPanelFn();
};

/* Photos */
probAddPhotoBtn.onclick = () => probPhotoInput.click();

probPhotoInput.onchange = () => {
  [...probPhotoInput.files].forEach(f => {
    const r = new FileReader();
    r.onload = () => {
      problemPhotosDraft.push(r.result);
      renderProblemPhotos();
    };
    r.readAsDataURL(f);
  });
};

function renderProblemPhotos() {
  probPhotoPreview.innerHTML = problemPhotosDraft
    .map((p, i) => `<img src="${p}" data-i="${i}">`)
    .join("");
}

/* Submit */
probSubmitBtn.onclick = () => {
  if (!probTitle.value) return showToast("Title required", "error");

  problems.unshift({
    id: genId(),
    title: probTitle.value,
    description: probDesc.value,
    severity: probSeverity.value,
    status: probStatus.value,
    photos: problemPhotosDraft,
    createdAt: new Date().toISOString()
  });

  probTitle.value = "";
  probDesc.value = "";
  problemPhotosDraft = [];
  renderProblemPhotos();

  saveState();
  renderDashboard();
  renderProblems();
  closeProblemPanelFn();
  showToast("Problem reported");
};

/* =========================================================
   PROBLEMS LIST (Maintenance)
========================================================= */
function renderProblems() {
  problemsList.innerHTML = "";
  problems.forEach(p => {
    const card = document.createElement("div");
    card.className = "problem-card";
    card.innerHTML = `
      <div class="problem-title">${p.title}</div>
      <div class="problem-meta">${p.status}</div>
      ${p.photos.map((ph,i)=>`<img src="${ph}" onclick='openLightbox(${JSON.stringify(p.photos)},${i})'>`).join("")}
    `;
    problemsList.appendChild(card);
  });
}

/* =========================================================
   INIT
========================================================= */
loadState();
