/* =========================================================
   PM Tracker v7 – Full Logic
   Dashboard • Parts • Inventory • Settings • Modal System
   ========================================================= */

// ------------------------------
// Global State
// ------------------------------
let parts = JSON.parse(localStorage.getItem("pm_parts") || "[]");
let categories = JSON.parse(localStorage.getItem("pm_categories") || "[]");
let currentTons = Number(localStorage.getItem("pm_tons") || 0);

// Import inventory sheet data from inventory.js
// inventoryData = { "Category": [ {name, description}, ... ] }
if (typeof inventoryData === "undefined") {
  var inventoryData = {};
}

// Default categories if none exist
const defaultCats = [
  "Cold Feed", "Conveyor", "Dryer", "Baghouse", "Electrical",
  "Slat Conveyor", "Tank Farm", "Dust System", "Mixer",
  "Screens", "Controls", "Asphalt System", "Pumps",
  "Virgin – Other"
];

if (categories.length === 0) {
  categories = [...defaultCats];
  localStorage.setItem("pm_categories", JSON.stringify(categories));
}

// ------------------------------
// Utility Functions
// ------------------------------
function saveState() {
  localStorage.setItem("pm_parts", JSON.stringify(parts));
  localStorage.setItem("pm_tons", currentTons);
  localStorage.setItem("pm_categories", JSON.stringify(categories));
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

// Calculate part status
function calcStatus(part) {
  const d = daysSince(part.date);
  const interval = Number(part.days) || 0;
  const tonsSince = currentTons - (Number(part.lastTons) || 0);
  const tonInterval = Number(part.tonInterval) || 0;

  const daysLeft = interval ? interval - d : Infinity;
  const tonsLeft = tonInterval ? tonInterval - tonsSince : Infinity;

  let status = "ok";
  if (daysLeft < 0 || tonsLeft < 0) status = "overdue";
  else if (daysLeft <= Math.max(3, interval * 0.2) ||
           tonsLeft <= Math.max(100, tonInterval * 0.2)) status = "due";

  return { status, daysLeft, tonsLeft, daysAgo: d, tonsSince };
}

// ------------------------------
// Navigation
// ------------------------------
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav-pill").forEach(n => n.classList.remove("active"));
  document.querySelector(`[data-page="${id}"]`).classList.add("active");
}

document.querySelectorAll(".nav-pill").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.page));
});

// ------------------------------
// Dashboard Rendering
// ------------------------------
function renderDashboard() {
  document.getElementById("statTons").textContent = currentTons;
  document.getElementById("statParts").textContent = parts.length;

  let ok = 0, due = 0, over = 0;
  parts.forEach(p => {
    const s = calcStatus(p);
    if (s.status === "ok") ok++;
    if (s.status === "due") due++;
    if (s.status === "overdue") over++;
  });

  document.getElementById("statOK").textContent = ok;
  document.getElementById("statDue").textContent = due;
  document.getElementById("statOver").textContent = over;

  const next = parts
    .map(p => ({ ...calcStatus(p), name: p.name }))
    .filter(p => p.daysLeft > 0 && p.daysLeft !== Infinity)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0];

  document.getElementById("statNext").textContent =
    next ? `${next.name} (${next.daysLeft} days)` : "—";
}

// ------------------------------
// Tons Update
// ------------------------------
document.getElementById("btnUpdateTons").addEventListener("click", () => {
  const box = document.getElementById("inputTons");
  const val = Number(box.value);
  if (!isNaN(val)) {
    currentTons = val;
    saveState();
    renderDashboard();
    renderParts();
    box.value = "";
  }
});

// quick add buttons
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    currentTons += Number(chip.dataset.add);
    saveState();
    renderDashboard();
    renderParts();
  });
});

// ------------------------------
// Parts Page Rendering
// ------------------------------
function renderParts() {
  const list = document.getElementById("partsList");
  list.innerHTML = "";

  const catFilter = document.getElementById("filterCat").value;
  const search = document.getElementById("filterSearch").value.toLowerCase();

  let ok = 0, due = 0, over = 0;

  parts.forEach((p, index) => {
    if (catFilter !== "ALL" && p.category !== catFilter) return;
    if (!p.name.toLowerCase().includes(search)) return;

    const st = calcStatus(p);
    if (st.status === "ok") ok++;
    if (st.status === "due") due++;
    if (st.status === "overdue") over++;

    const div = document.createElement("div");
    div.className = "part-card";

    div.innerHTML = `
      <div class="part-info">
        <div class="part-title">${p.name}</div>
        <div class="part-meta">${p.category} • ${p.section || ""}</div>
        <div class="part-meta">Last: ${p.date} (${st.daysAgo} days ago)</div>
        <div class="part-meta">Interval Left: ${st.daysLeft} days</div>
        <div class="part-meta">Tons: ${st.tonsSince} / ${p.tonInterval}</div>
      </div>
      <div class="part-actions">
        <button onclick="editPart(${index})">Edit</button>
        <button onclick="deletePart(${index})">Del</button>
      </div>
    `;

    list.appendChild(div);
  });

  document.getElementById("sumOK").textContent = ok;
  document.getElementById("sumDue").textContent = due;
  document.getElementById("sumOver").textContent = over;
}

// Filters
document.getElementById("filterCat").addEventListener("change", renderParts);
document.getElementById("filterSearch").addEventListener("input", renderParts);

// ------------------------------
// Inventory Rendering
// ------------------------------
function renderInventory() {
  const box = document.getElementById("inventoryList");
  box.innerHTML = "";

  Object.keys(inventoryData).forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.className = "inv-category";
    catDiv.textContent = cat;
    box.appendChild(catDiv);

    inventoryData[cat].forEach(item => {
      const row = document.createElement("div");
      row.className = "inv-item";
      row.textContent = item.name;
      box.appendChild(row);
    });
  });
}

// ------------------------------
// Add/Edit Part Modal
// ------------------------------
let editingIndex = null;

function openAddPart() {
  editingIndex = null;
  document.getElementById("modalTitle").textContent = "Add Part";
  fillPartForm({});
  document.getElementById("partModal").classList.remove("hidden");
}

function editPart(i) {
  editingIndex = i;
  document.getElementById("modalTitle").textContent = "Edit Part";
  fillPartForm(parts[i]);
  document.getElementById("partModal").classList.remove("hidden");
}

function fillPartForm(p) {
  document.getElementById("partName").value = p.name || "";
  document.getElementById("partCat").value = p.category || categories[0];
  document.getElementById("partSec").value = p.section || "";
  document.getElementById("partDate").value = p.date || new Date().toISOString().slice(0,10);
  document.getElementById("partDays").value = p.days || 30;
  document.getElementById("partTons").value = p.lastTons || currentTons;
  document.getElementById("partTonInt").value = p.tonInterval || 10000;
  document.getElementById("partNotes").value = p.notes || "";
}

document.getElementById("btnSavePart").addEventListener("click", () => {
  const p = {
    name: document.getElementById("partName").value.trim(),
    category: document.getElementById("partCat").value,
    section: document.getElementById("partSec").value.trim(),
    date: document.getElementById("partDate").value,
    days: Number(document.getElementById("partDays").value),
    lastTons: Number(document.getElementById("partTons").value),
    tonInterval: Number(document.getElementById("partTonInt").value),
    notes: document.getElementById("partNotes").value.trim(),
  };

  if (!p.name) return alert("Name required");

  if (editingIndex === null) parts.unshift(p);
  else parts[editingIndex] = p;

  saveState();
  renderParts();
  renderDashboard();
  closeModal();
});

function deletePart(i) {
  if (!confirm("Delete this part?")) return;
  parts.splice(i,1);
  saveState();
  renderParts();
  renderDashboard();
}

function closeModal() {
  document.getElementById("partModal").classList.add("hidden");
}
document.getElementById("modalBG").addEventListener("click", closeModal);

// ------------------------------
// Settings
// ------------------------------
document.getElementById("switchTheme").addEventListener("change", e => {
  if (e.target.checked) {
    document.body.classList.add("light");
    localStorage.setItem("pm_theme", "light");
  } else {
    document.body.classList.remove("light");
    localStorage.setItem("pm_theme", "dark");
  }
});

if (localStorage.getItem("pm_theme") === "light") {
  document.body.classList.add("light");
  document.getElementById("switchTheme").checked = true;
}

// Reset Tons
document.getElementById("resetTons").addEventListener("click", () => {
  if (!confirm("Reset ALL tons to zero?")) return;
  currentTons = 0;
  saveState();
  renderDashboard();
  renderParts();
});

// Reset Everything
document.getElementById("resetAll").addEventListener("click", () => {
  if (!confirm("DELETE ALL DATA?")) return;

  parts = [];
  currentTons = 0;
  categories = [...defaultCats];
  saveState();

  renderDashboard();
  renderParts();
});

// ------------------------------
// Init
// ------------------------------
function init() {
  // load categories into dropdown
  const catSel = document.getElementById("partCat");
  catSel.innerHTML = "";
  categories.forEach(c => {
    const o = document.createElement("option");
    o.value = o.textContent = c;
    catSel.appendChild(o);
  });

  // load filter categories
  const filt = document.getElementById("filterCat");
  filt.innerHTML = `<option value="ALL">All</option>`;
  categories.forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    filt.appendChild(o);
  });

  renderDashboard();
  renderParts();
  renderInventory();
}

init();
