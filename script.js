/* ---------------------------------------------------
   STORAGE KEYS
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const CATEGORIES_KEY = "pm_categories";

/* ---------------------------------------------------
   GLOBAL STATE
--------------------------------------------------- */
let parts = [];
let currentTons = 0;
let categories = [];
let activeScreen = "dashboardScreen";

/* ---------------------------------------------------
   ELEMENT REFERENCES
--------------------------------------------------- */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const tonsRunEl = document.getElementById("tonsRun");

const currentTonsInput = document.getElementById("currentTonsInput");
const updateTonsBtn = document.getElementById("updateTonsBtn");
const resetTonsBtn = document.getElementById("resetTonsBtn");

const filterCategory = document.getElementById("filterCategory");
const partsList = document.getElementById("partsList");
const addPartBtn = document.getElementById("addPartBtn");

const inventoryList = document.getElementById("inventoryList");

/* AC Calculator */
const ac_residual = document.getElementById("ac_residual");
const ac_rapPct = document.getElementById("ac_rapPct");
const ac_target = document.getElementById("ac_target");
const ac_tph = document.getElementById("ac_tph");
const ac_totalTons = document.getElementById("ac_totalTons");
const acCalcBtn = document.getElementById("acCalcBtn");

const ac_pumpRate = document.getElementById("ac_pumpRate");
const ac_totalAc = document.getElementById("ac_totalAc");

/* Settings */
const exportBtn = document.getElementById("exportBtn");
const resetAllBtn = document.getElementById("resetAllBtn");

/* ---------------------------------------------------
   INIT
--------------------------------------------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  // Categories come from inventory.js (preloaded)
  categories = PRELOADED_CATEGORIES;

  currentTonsInput.value = currentTons;
  buildCategoryDropdown();
  renderDashboard();
  renderParts();
  renderInventory();
}

loadState();

/* ---------------------------------------------------
   SAVE STATE
--------------------------------------------------- */
function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, currentTons);
}

/* ---------------------------------------------------
   SCREEN SWITCHING
--------------------------------------------------- */
function showScreen(screenId) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");

  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === screenId);
  });

  activeScreen = screenId;

  if (screenId === "maintenanceScreen") renderParts();
  if (screenId === "inventoryScreen") renderInventory();
  if (screenId === "dashboardScreen") renderDashboard();
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

/* ---------------------------------------------------
   TON UPDATE / RESET
--------------------------------------------------- */
updateTonsBtn.addEventListener("click", () => {
  const val = Number(currentTonsInput.value);
  if (!isNaN(val)) {
    currentTons = val;
    saveState();
    renderDashboard();
  }
});

resetTonsBtn.addEventListener("click", () => {
  currentTons = 0;
  currentTonsInput.value = 0;
  saveState();
  renderDashboard();
});

/* ---------------------------------------------------
   DASHBOARD RENDER
--------------------------------------------------- */
function renderDashboard() {
  let ok = 0, due = 0, over = 0;

  parts.forEach(p => {
    const st = calculateStatus(p);
    if (st.status === "ok") ok++;
    else if (st.status === "due") due++;
    else over++;
  });

  okCountEl.textContent = ok;
  dueCountEl.textContent = due;
  overCountEl.textContent = over;
  tonsRunEl.textContent = currentTons;
}

/* ---------------------------------------------------
   CATEGORY DROPDOWN
--------------------------------------------------- */
function buildCategoryDropdown() {
  filterCategory.innerHTML = `<option value="ALL">All Categories</option>`;
  categories.forEach(cat => {
    filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

filterCategory.addEventListener("change", renderParts);

/* ---------------------------------------------------
   MAINTENANCE STATUS CALC
--------------------------------------------------- */
function calculateStatus(part) {
  const daysSince = (Date.now() - new Date(part.date)) / (1000 * 60 * 60 * 24);
  const tonsSince = currentTons - part.lastTons;

  let status = "ok";

  if (daysSince > part.days || tonsSince > part.tonInterval) {
    status = "overdue";
  } else if (
    part.days - daysSince < 5 ||
    part.tonInterval - tonsSince < 500
  ) {
    status = "due";
  }

  return { status, daysSince, tonsSince };
}

/* ---------------------------------------------------
   RENDER PARTS
--------------------------------------------------- */
function renderParts() {
  const selected = filterCategory.value;
  partsList.innerHTML = "";

  const filtered = selected === "ALL"
    ? parts
    : parts.filter(p => p.category === selected);

  filtered.forEach((p, i) => {
    const st = calculateStatus(p);

    const card = document.createElement("div");
    card.className = "part-card";

    card.innerHTML = `
      <div class="part-name">${p.name}</div>
      <div class="part-meta">${p.category} — ${p.section}</div>
      <div class="part-meta">Last: ${p.date}</div>
      <div class="part-meta">Interval: ${p.days} days / ${p.tonInterval} tons</div>
      <div class="part-meta">Status: <b>${st.status.toUpperCase()}</b></div>

      <div class="part-actions">
        <button onclick="deletePart(${i})">Delete</button>
      </div>
    `;

    partsList.appendChild(card);
  });
}

/* ---------------------------------------------------
   DELETE PART
--------------------------------------------------- */
function deletePart(index) {
  if (!confirm("Delete this part?")) return;
  parts.splice(index, 1);
  saveState();
  renderParts();
}

/* ---------------------------------------------------
   INVENTORY RENDER
--------------------------------------------------- */
function renderInventory() {
  inventoryList.innerHTML = "";

  PRELOADED_INVENTORY.forEach(item => {
    const card = document.createElement("div");
    card.className = "part-card";

    card.innerHTML = `
      <div class="part-name">${item.part}</div>
      <div class="part-meta">${item.category} — ${item.location}</div>
      <div class="part-meta">Qty: ${item.qty}</div>
      <div class="part-meta">${item.notes || ""}</div>
    `;

    inventoryList.appendChild(card);
  });
}

/* ---------------------------------------------------
   EXPORT FULL DATA
--------------------------------------------------- */
exportBtn.addEventListener("click", () => {
  const data = {
    parts,
    tons: currentTons,
    inventory: PRELOADED_INVENTORY
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "maintenance_export.json";
  a.click();
});

/* ---------------------------------------------------
   RESET EVERYTHING
--------------------------------------------------- */
resetAllBtn.addEventListener("click", () => {
  if (confirm("Reset ALL data?")) {
    localStorage.clear();
    location.reload();
  }
});

/* ---------------------------------------------------
   AC CALCULATOR
--------------------------------------------------- */
acCalcBtn.addEventListener("click", () => {
  const R = Number(ac_residual.value) / 100;
  const RAPpct = Number(ac_rapPct.value) / 100;
  const ACtarget = Number(ac_target.value) / 100;
  const TPH = Number(ac_tph.value);
  const totalTons = Number(ac_totalTons.value);

  const acFromRAP = RAPpct * R;
  const virginAC = ACtarget - acFromRAP;

  const pumpRate = TPH * virginAC;
  const totalAC = totalTons * virginAC;

  ac_pumpRate.textContent = pumpRate.toFixed(3);
  ac_totalAc.textContent = totalAC.toFixed(2);
});
