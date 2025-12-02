/* ============================================================
   DATA KEYS
============================================================ */
const KEY_PARTS = "pm_parts";
const KEY_INVENTORY = "pm_inventory";
const KEY_TONS = "pm_tons";
const KEY_THEME = "pm_theme";

/* Preloaded Inventory (auto-inserted on first load) */
const PRELOADED_INVENTORY = [
  { category: "Conveyor", part: "Tail Pulley", location: "Cold Feed", qty: 2, notes: "OEM new" },
  { category: "Dryer", part: "Burner Nozzle", location: "Burner House", qty: 1, notes: "" }
];

/* ============================================================
   APP STATE
============================================================ */
let parts = [];
let inventory = [];
let currentTons = 0;
let activeTab = "dashboard";

/* ============================================================
   LOAD STATE
============================================================ */
function loadState() {
  parts = JSON.parse(localStorage.getItem(KEY_PARTS)) || [];
  inventory = JSON.parse(localStorage.getItem(KEY_INVENTORY)) || PRELOADED_INVENTORY.slice();
  currentTons = Number(localStorage.getItem(KEY_TONS)) || 0;

  if (localStorage.getItem(KEY_THEME) === "light") {
    document.body.classList.add("light");
  }

  renderDashboard();
  renderParts();
  renderInventory();
}

/* ============================================================
   SAVE STATE
============================================================ */
function saveState() {
  localStorage.setItem(KEY_PARTS, JSON.stringify(parts));
  localStorage.setItem(KEY_INVENTORY, JSON.stringify(inventory));
  localStorage.setItem(KEY_TONS, currentTons);
}

/* ============================================================
   NAVIGATION
============================================================ */
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    switchTab(target);
  });
});

function switchTab(tab) {
  activeTab = tab;

  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("screen-" + tab).classList.add("active");

  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.querySelector(`.nav-item[data-tab="${tab}"]`).classList.add("active");

  if (tab === "parts") renderParts();
  if (tab === "inventory") renderInventory();
}

/* ============================================================
   TONS COUNTER
============================================================ */
document.getElementById("addTonBtn").addEventListener("click", () => {
  currentTons++;
  saveState();
  renderDashboard();
});

document.getElementById("resetTonsBtn").addEventListener("click", () => {
  if (confirm("Reset tons count?")) {
    currentTons = 0;
    saveState();
    renderDashboard();
  }
});

/* ============================================================
   ADD PART MODAL
============================================================ */
const partModal = document.getElementById("partModal");

document.getElementById("openAddPartBtn").addEventListener("click", () => {
  openPartModal();
});

document.getElementById("closePartModal").addEventListener("click", () => {
  partModal.style.display = "none";
});

function openPartModal(existing = null, index = null) {
  partModal.style.display = "flex";

  document.getElementById("partName").value = existing?.name || "";
  document.getElementById("partCat").value = existing?.category || "";
  document.getElementById("partLoc").value = existing?.section || "";
  document.getElementById("partDate").value = existing?.date || "";
  document.getElementById("partInterval").value = existing?.interval || "";
  document.getElementById("partLastTons").value = existing?.lastTons || currentTons;
  document.getElementById("partNotes").value = existing?.notes || "";

  document.getElementById("savePartBtn").onclick = () => {
    savePart(index);
  };
}

function savePart(index) {
  const obj = {
    name: document.getElementById("partName").value.trim(),
    category: document.getElementById("partCat").value.trim(),
    section: document.getElementById("partLoc").value.trim(),
    date: document.getElementById("partDate").value,
    interval: Number(document.getElementById("partInterval").value || 0),
    lastTons: Number(document.getElementById("partLastTons").value || 0),
    notes: document.getElementById("partNotes").value.trim()
  };

  if (!obj.name) {
    alert("Part name is required");
    return;
  }

  if (index != null) {
    parts[index] = obj;
  } else {
    parts.unshift(obj);
  }

  saveState();
  renderParts();
  renderDashboard();
  partModal.style.display = "none";
}

/* ============================================================
   PART STATUS
============================================================ */
function calcStatus(part) {
  const daysSince = part.date ? (Date.now() - new Date(part.date)) / 86400000 : 9999;
  const daysLeft = part.interval ? part.interval - daysSince : 9999;

  let tonsSince = currentTons - part.lastTons;
  let tonsLeft = part.interval ? part.interval - tonsSince : 9999;

  if (daysLeft <= 0 || tonsLeft <= 0) return "overdue";
  if (daysLeft <= 7 || tonsLeft <= 500) return "due";
  return "ok";
}

/* ============================================================
   RENDER PARTS
============================================================ */
function renderParts() {
  const area = document.getElementById("partsList");
  area.innerHTML = "";

  if (parts.length === 0) {
    area.innerHTML = `<div class="placeholder-text">No parts added yet</div>`;
    return;
  }

  parts.forEach((p, i) => {
    const status = calcStatus(p);
    const card = document.createElement("div");
    card.className = `list-card ${status}`;
    card.innerHTML = `
      <div class="list-title">${p.name}</div>
      <div class="list-sub">${p.category} — ${p.section}</div>
      <div class="list-notes">Last: ${p.date || "—"} • Interval: ${p.interval}</div>
      <button class="btn-secondary" onclick="openPartModal(${JSON.stringify(p)}, ${i})">Edit</button>
    `;
    area.appendChild(card);
  });
}

/* ============================================================
   RENDER INVENTORY
============================================================ */
function renderInventory() {
  const area = document.getElementById("inventoryList");
  area.innerHTML = "";

  if (inventory.length === 0) {
    area.innerHTML = `<div class="placeholder-text">No inventory loaded</div>`;
    return;
  }

  inventory.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "list-card";
    card.innerHTML = `
      <div class="list-title">${item.part}</div>
      <div class="list-sub">${item.category} — ${item.location}</div>
      <div class="list-notes">Qty: ${item.qty}</div>
    `;
    area.appendChild(card);
  });
}

/* ============================================================
   SETTINGS
============================================================ */
document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem(KEY_THEME, document.body.classList.contains("light") ? "light" : "dark");
});

/* ============================================================
   DASHBOARD SUMMARY
============================================================ */
function renderDashboard() {
  document.getElementById("tonsValue").textContent = currentTons;

  let ok = 0, due = 0, overdue = 0;
  parts.forEach(p => {
    const s = calcStatus(p);
    if (s === "ok") ok++;
    else if (s === "due") due++;
    else overdue++;
  });

  document.getElementById("statOK").textContent = ok;
  document.getElementById("statDue").textContent = due;
  document.getElementById("statOver").textContent = overdue;
}

/* ============================================================
   INITIALIZE APP
============================================================ */
loadState();
switchTab("dashboard");
