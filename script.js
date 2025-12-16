/* ===================================================
   Plant Maintenance Tracker – Phase 3.2.1 STABLE
   FULL BASELINE – COPY / PASTE
=================================================== */

/* ---------------- STORAGE KEYS ---------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";
const PROBLEMS_KEY = "pm_problems";

/* ---------------- GLOBAL STATE ---------------- */
let parts = [];
let inventory = [];
let categories = [];
let problems = [];
let currentTons = 0;

let editingPartIndex = null;
let completingPartIndex = null;

/* ---------------- DOM READY ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  loadState();
  bindEvents();
});

/* ---------------- ELEMENT CACHE ---------------- */
let screens, navButtons;
let partsList, filterCategory, searchPartsInput, addPartBtn;
let inventoryList, searchInventoryInput, addInventoryBtn;
let currentTonsInput, updateTonsBtn, resetTonsBtn;
let okCountEl, dueCountEl, overCountEl, tonsRunEl;
let openProblemsCountEl, exportBtn, resetAllBtn;

function cacheElements() {
  screens = document.querySelectorAll(".screen");
  navButtons = document.querySelectorAll(".nav-btn");

  partsList = document.getElementById("partsList");
  filterCategory = document.getElementById("filterCategory");
  searchPartsInput = document.getElementById("searchPartsInput");
  addPartBtn = document.getElementById("addPartBtn");

  inventoryList = document.getElementById("inventoryList");
  searchInventoryInput = document.getElementById("searchInventoryInput");
  addInventoryBtn = document.getElementById("addInventoryBtn");

  currentTonsInput = document.getElementById("currentTonsInput");
  updateTonsBtn = document.getElementById("updateTonsBtn");
  resetTonsBtn = document.getElementById("resetTonsBtn");

  okCountEl = document.getElementById("okCount");
  dueCountEl = document.getElementById("dueCount");
  overCountEl = document.getElementById("overCount");
  tonsRunEl = document.getElementById("tonsRun");
  openProblemsCountEl = document.getElementById("openProblemsCount");

  exportBtn = document.getElementById("exportBtn");
  resetAllBtn = document.getElementById("resetAllBtn");
}

/* ---------------- LOAD / SAVE ---------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  inventory =
    JSON.parse(localStorage.getItem(INVENTORY_KEY)) ||
    (PRELOADED_INVENTORY ? PRELOADED_INVENTORY.slice() : []);

  categories = Array.isArray(PRELOADED_CATEGORIES)
    ? PRELOADED_CATEGORIES
    : [];

  problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  buildCategoryDropdown();
  renderDashboard();
  renderParts();
  renderInventory();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
  localStorage.setItem(TONS_KEY, String(currentTons));
}

/* ---------------- EVENTS ---------------- */
function bindEvents() {
  navButtons.forEach(btn =>
    btn.addEventListener("click", () => showScreen(btn.dataset.screen))
  );

  updateTonsBtn?.addEventListener("click", addTons);
  resetTonsBtn?.addEventListener("click", resetTons);

  filterCategory?.addEventListener("change", renderParts);
  searchPartsInput?.addEventListener("input", renderParts);
  searchInventoryInput?.addEventListener("input", renderInventory);

  exportBtn?.addEventListener("click", exportData);
  resetAllBtn?.addEventListener("click", resetAll);
}

/* ---------------- NAV ---------------- */
function showScreen(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");

  navButtons.forEach(b =>
    b.classList.toggle("active", b.dataset.screen === id)
  );

  if (id === "maintenanceScreen") renderParts();
  if (id === "inventoryScreen") renderInventory();
  if (id === "dashboardScreen") renderDashboard();
}

/* ---------------- TONS ---------------- */
function addTons() {
  const add = Number(currentTonsInput.value);
  if (!add || add <= 0) return alert("Enter tons to add");

  currentTons += add;
  currentTonsInput.value = "";
  saveState();
  renderDashboard();
}

function resetTons() {
  if (!confirm("Reset tons to 0?")) return;
  currentTons = 0;
  saveState();
  renderDashboard();
}

/* ---------------- DASHBOARD ---------------- */
function renderDashboard() {
  let ok = 0,
    due = 0,
    over = 0;

  parts.forEach(p => {
    const status = calculateStatus(p);
    if (status === "ok") ok++;
    else if (status === "due") due++;
    else over++;
  });

  okCountEl.textContent = ok;
  dueCountEl.textContent = due;
  overCountEl.textContent = over;
  tonsRunEl.textContent = currentTons;

  openProblemsCountEl.textContent = problems.filter(
    p => p.status === "Open"
  ).length;
}

/* ---------------- MAINTENANCE ---------------- */
function calculateStatus(p) {
  const days = (Date.now() - new Date(p.date)) / 86400000;
  const tons = currentTons - (p.lastTons || 0);

  if (days > p.days || tons > p.tonInterval) return "over";
  if (p.days - days < 5 || p.tonInterval - tons < 500) return "due";
  return "ok";
}

function renderParts() {
  if (!partsList) return;
  partsList.innerHTML = "";

  const cat = filterCategory.value;
  const q = searchPartsInput.value.toLowerCase();

  parts.forEach(p => {
    if (cat !== "ALL" && p.category !== cat) return;
    if (q && !p.name.toLowerCase().includes(q)) return;

    const card = document.createElement("div");
    card.className = "part-card";
    card.innerHTML = `
      <div class="part-name">${p.name}</div>
      <div class="part-meta">${p.category} — ${p.section}</div>
    `;
    partsList.appendChild(card);
  });
}

function buildCategoryDropdown() {
  filterCategory.innerHTML = `<option value="ALL">All Categories</option>`;
  categories.forEach(c => {
    filterCategory.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

/* ---------------- INVENTORY ---------------- */
function renderInventory() {
  if (!inventoryList) return;
  inventoryList.innerHTML = "";

  inventory.forEach(i => {
    const card = document.createElement("div");
    card.className = "part-card";
    card.innerHTML = `
      <div class="part-name">${i.part}</div>
      <div class="part-meta">${i.category} — ${i.location}</div>
      <div class="part-meta">Qty: ${i.qty}</div>
    `;
    inventoryList.appendChild(card);
  });
}

/* ---------------- EXPORT / RESET ---------------- */
function exportData() {
  const data = { parts, inventory, problems, currentTons };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "maintenance_data.json";
  a.click();
}

function resetAll() {
  if (!confirm("Reset ALL data?")) return;
  localStorage.clear();
  location.reload();
        }
