/* ===================================================
   Plant Maintenance Tracker – Phase 3.2.1 STABLE
=================================================== */

const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";
const PROBLEMS_KEY = "pm_problems";

let parts = [];
let inventory = [];
let categories = [];
let problems = [];
let currentTons = 0;

document.addEventListener("DOMContentLoaded", () => {
  cache();
  loadState();
  bind();
});

/* ---------------- ELEMENT CACHE ---------------- */
let screens, navButtons, partsList, filterCategory, searchPartsInput;
let inventoryList, searchInventoryInput;
let currentTonsInput, updateTonsBtn, resetTonsBtn;
let okCountEl, dueCountEl, overCountEl, tonsRunEl, openProblemsCountEl;
let exportBtn, resetAllBtn;

function cache() {
  screens = document.querySelectorAll(".screen");
  navButtons = document.querySelectorAll(".nav-btn");
  partsList = document.getElementById("partsList");
  filterCategory = document.getElementById("filterCategory");
  searchPartsInput = document.getElementById("searchPartsInput");
  inventoryList = document.getElementById("inventoryList");
  searchInventoryInput = document.getElementById("searchInventoryInput");
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
  inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || PRELOADED_INVENTORY.slice();
  problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];
  categories = PRELOADED_CATEGORIES.slice();
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
function bind() {
  navButtons.forEach(b => b.addEventListener("click", () => showScreen(b.dataset.screen)));
  updateTonsBtn.onclick = addTons;
  resetTonsBtn.onclick = resetTons;
  filterCategory.onchange = renderParts;
  searchPartsInput.oninput = renderParts;
  searchInventoryInput.oninput = renderInventory;
  exportBtn.onclick = exportData;
  resetAllBtn.onclick = resetAll;
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
  let ok = 0, due = 0, over = 0;
  parts.forEach(p => {
    const s = calcStatus(p);
    if (s === "ok") ok++; else if (s === "due") due++; else over++;
  });
  okCountEl.textContent = ok;
  dueCountEl.textContent = due;
  overCountEl.textContent = over;
  tonsRunEl.textContent = currentTons;
  openProblemsCountEl.textContent = problems.filter(p => p.status === "Open").length;
}

/* ---------------- MAINTENANCE ---------------- */
function calcStatus(p) {
  const days = (Date.now() - new Date(p.date)) / 86400000;
  const tons = currentTons - (p.lastTons || 0);
  if (days > p.days || tons > p.tonInterval) return "over";
  if (p.days - days < 5 || p.tonInterval - tons < 500) return "due";
  return "ok";
}

function renderParts() {
  partsList.innerHTML = "";
  const cat = filterCategory.value;
  const q = searchPartsInput.value.toLowerCase();
  parts.forEach(p => {
    if (cat !== "ALL" && p.category !== cat) return;
    if (q && !p.name.toLowerCase().includes(q)) return;
    const d = document.createElement("div");
    d.className = "part-card";
    d.innerHTML = `<div class="part-name">${p.name}</div><div class="part-meta">${p.category} — ${p.section}</div>`;
    partsList.appendChild(d);
  });
}

function buildCategoryDropdown() {
  filterCategory.innerHTML = `<option value="ALL">All Categories</option>`;
  categories.forEach(c => filterCategory.innerHTML += `<option>${c}</option>`);
}

/* ---------------- INVENTORY ---------------- */
function renderInventory() {
  inventoryList.innerHTML = "";
  inventory.forEach(i => {
    const d = document.createElement("div");
    d.className = "part-card";
    d.innerHTML = `<div class="part-name">${i.part}</div><div class="part-meta">${i.category} — ${i.location}</div><div class="part-meta">Qty: ${i.qty}</div>`;
    inventoryList.appendChild(d);
  });
}

/* ---------------- NAV ---------------- */
function showScreen(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.screen === id));
}

/* ---------------- EXPORT / RESET ---------------- */
function exportData() {
  const blob = new Blob([JSON.stringify({ parts, inventory, problems, currentTons }, null, 2)]);
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
