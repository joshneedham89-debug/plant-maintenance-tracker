/* ===================================================
   PHASE 2 FULL BASELINE (BUTTONS RESTORED)
   Phase 3 will be added AFTER this is confirmed
=================================================== */

/* ---------- STORAGE ---------- */
const PARTS_KEY = "pm_parts";
const INVENTORY_KEY = "pm_inventory";
const TONS_KEY = "pm_tons";

/* ---------- STATE ---------- */
let parts = [];
let inventory = [];
let currentTons = 0;
let completingPartIndex = null;
let editingPartIndex = null;
let editingInventoryIndex = null;
let completionUsedItems = [];

/* ---------- ELEMENTS ---------- */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

/* Dashboard */
const tonsRunEl = document.getElementById("tonsRun");
const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const completedTodayEl = document.getElementById("completedTodayCount");
const completedMonthEl = document.getElementById("completedMonthCount");

/* Tons */
const currentTonsInput = document.getElementById("currentTonsInput");
const updateTonsBtn = document.getElementById("updateTonsBtn");
const resetTonsBtn = document.getElementById("resetTonsBtn");

/* Maintenance */
const partsList = document.getElementById("partsList");
const addPartBtn = document.getElementById("addPartBtn");
const searchPartsInput = document.getElementById("searchPartsInput");
const filterCategory = document.getElementById("filterCategory");

/* Part panel */
const partPanelOverlay = document.getElementById("partPanelOverlay");
const addPartPanel = document.getElementById("addPartPanel");
const closePartPanelBtn = document.getElementById("closePartPanel");
const savePartBtn = document.getElementById("savePartBtn");
const partPanelTitle = document.getElementById("partPanelTitle");

const newPartName = document.getElementById("newPartName");
const newPartCategory = document.getElementById("newPartCategory");
const newPartSection = document.getElementById("newPartSection");
const newPartDays = document.getElementById("newPartDays");
const newPartTons = document.getElementById("newPartTons");

/* Inventory */
const inventoryList = document.getElementById("inventoryList");
const addInventoryBtn = document.getElementById("addInventoryBtn");
const searchInventoryInput = document.getElementById("searchInventoryInput");

/* Inventory panel */
const inventoryPanelOverlay = document.getElementById("inventoryPanelOverlay");
const inventoryPanel = document.getElementById("inventoryPanel");
const closeInventoryPanelBtn = document.getElementById("closeInventoryPanel");
const saveInventoryBtn = document.getElementById("saveInventoryBtn");

const invPartName = document.getElementById("invPartName");
const invCategory = document.getElementById("invCategory");
const invLocation = document.getElementById("invLocation");
const invQty = document.getElementById("invQty");
const invNotes = document.getElementById("invNotes");

/* Complete maintenance */
const completePanelOverlay = document.getElementById("completePanelOverlay");
const completePanel = document.getElementById("completePanel");
const closeCompletePanelBtn = document.getElementById("closeCompletePanel");
const saveCompletionBtn = document.getElementById("saveCompletionBtn");
const compDate = document.getElementById("compDate");
const compTons = document.getElementById("compTons");
const compNotes = document.getElementById("compNotes");

/* AC Calc */
const acCalcBtn = document.getElementById("acCalcBtn");
const ac_residual = document.getElementById("ac_residual");
const ac_rapPct = document.getElementById("ac_rapPct");
const ac_target = document.getElementById("ac_target");
const ac_tph = document.getElementById("ac_tph");
const ac_totalTons = document.getElementById("ac_totalTons");
const ac_pumpRate = document.getElementById("ac_pumpRate");
const ac_totalAc = document.getElementById("ac_totalAc");

/* Settings */
const exportBtn = document.getElementById("exportBtn");
const resetAllBtn = document.getElementById("resetAllBtn");

/* ---------- NAV ---------- */
function showScreen(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.screen === id));
}
navButtons.forEach(b => b.onclick = () => showScreen(b.dataset.screen));

/* ---------- LOAD / SAVE ---------- */
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

/* ---------- DASHBOARD ---------- */
function renderDashboard() {
  tonsRunEl.textContent = currentTons;
  okCountEl.textContent = parts.length;
  dueCountEl.textContent = 0;
  overCountEl.textContent = 0;
  completedTodayEl.textContent = 0;
  completedMonthEl.textContent = 0;
}

/* ---------- PARTS ---------- */
function renderParts() {
  partsList.innerHTML = "";
  parts.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${p.name}</strong><br>
      ${p.category} — ${p.section}
      <button class="primary-btn full">Complete</button>
    `;
    card.querySelector("button").onclick = () => openCompletePanel(i);
    partsList.appendChild(card);
  });
}

addPartBtn.onclick = () => {
  editingPartIndex = null;
  partPanelTitle.textContent = "Add New Part";
  newPartName.value = "";
  newPartCategory.value = "";
  newPartSection.value = "";
  newPartDays.value = "";
  newPartTons.value = "";
  partPanelOverlay.classList.remove("hidden");
  setTimeout(() => addPartPanel.classList.add("show"), 10);
};

closePartPanelBtn.onclick = () => {
  addPartPanel.classList.remove("show");
  partPanelOverlay.classList.add("hidden");
};

savePartBtn.onclick = () => {
  const part = {
    name: newPartName.value,
    category: newPartCategory.value,
    section: newPartSection.value,
    days: Number(newPartDays.value),
    tonInterval: Number(newPartTons.value),
    history: []
  };
  parts.push(part);
  saveState();
  closePartPanelBtn.onclick();
  renderParts();
};

/* ---------- INVENTORY ---------- */
function renderInventory() {
  inventoryList.innerHTML = "";
  inventory.forEach(i => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = `${i.part} (${i.qty})`;
    inventoryList.appendChild(div);
  });
}

addInventoryBtn.onclick = () => {
  editingInventoryIndex = null;
  invPartName.value = "";
  invCategory.value = "";
  invLocation.value = "";
  invQty.value = "";
  invNotes.value = "";
  inventoryPanelOverlay.classList.remove("hidden");
  setTimeout(() => inventoryPanel.classList.add("show"), 10);
};

closeInventoryPanelBtn.onclick = () => {
  inventoryPanel.classList.remove("show");
  inventoryPanelOverlay.classList.add("hidden");
};

saveInventoryBtn.onclick = () => {
  inventory.push({
    part: invPartName.value,
    category: invCategory.value,
    location: invLocation.value,
    qty: Number(invQty.value),
    notes: invNotes.value
  });
  saveState();
  closeInventoryPanelBtn.onclick();
  renderInventory();
};

/* ---------- COMPLETE MAINT ---------- */
function openCompletePanel(i) {
  completingPartIndex = i;
  compDate.value = new Date().toISOString().split("T")[0];
  compTons.value = currentTons;
  compNotes.value = "";
  completePanelOverlay.classList.remove("hidden");
  setTimeout(() => completePanel.classList.add("show"), 10);
}

closeCompletePanelBtn.onclick = () => {
  completePanel.classList.remove("show");
  completePanelOverlay.classList.add("hidden");
};

saveCompletionBtn.onclick = () => {
  const p = parts[completingPartIndex];
  if (!p) return;
  p.history.push({
    date: compDate.value,
    tons: Number(compTons.value),
    notes: compNotes.value
  });
  saveState();
  closeCompletePanelBtn.onclick();
  renderParts();
};

/* ---------- TONS ---------- */
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

/* ---------- AC CALC ---------- */
acCalcBtn.onclick = () => {
  const pump =
    Number(ac_tph.value) *
    ((Number(ac_target.value) / 100) -
      ((Number(ac_rapPct.value) / 100) *
        (Number(ac_residual.value) / 100)));
  const total =
    Number(ac_totalTons.value) *
    ((Number(ac_target.value) / 100) -
      ((Number(ac_rapPct.value) / 100) *
        (Number(ac_residual.value) / 100)));
  ac_pumpRate.textContent = pump.toFixed(2);
  ac_totalAc.textContent = total.toFixed(2);
};

/* ---------- SETTINGS ---------- */
exportBtn.onclick = () => {
  const blob = new Blob(
    [JSON.stringify({ parts, inventory, currentTons }, null, 2)],
    { type: "application/json" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "maintenance_data.json";
  a.click();
};

resetAllBtn.onclick = () => {
  if (!confirm("Reset ALL data?")) return;
  localStorage.clear();
  location.reload();
};

/* ---------- INIT ---------- */
loadState();
