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
let activeScreen = "dashboardScreen";

let editingPartIndex = null;
let editingInventoryIndex = null;

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
const searchPartsInput = document.getElementById("searchPartsInput");

const inventoryList = document.getElementById("inventoryList");
const addInventoryBtn = document.getElementById("addInventoryBtn");

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

/* Add Part Slide Panel */
const addPartPanel = document.getElementById("addPartPanel");
const closePartPanel = document.getElementById("closePartPanel");
const partPanelTitle = document.getElementById("partPanelTitle");

const newPartName = document.getElementById("newPartName");
const newPartCategory = document.getElementById("newPartCategory");
const newPartSection = document.getElementById("newPartSection");
const newPartDays = document.getElementById("newPartDays");
const newPartTons = document.getElementById("newPartTons");
const savePartBtn = document.getElementById("savePartBtn");
const inventoryNameList = document.getElementById("inventoryNameList");

/* Inventory Slide Panel */
const inventoryPanel = document.getElementById("inventoryPanel");
const closeInventoryPanel = document.getElementById("closeInventoryPanel");
const inventoryPanelTitle = document.getElementById("inventoryPanelTitle");

const invPartName = document.getElementById("invPartName");
const invCategory = document.getElementById("invCategory");
const invLocation = document.getElementById("invLocation");
const invQty = document.getElementById("invQty");
const invNotes = document.getElementById("invNotes");
const saveInventoryBtn = document.getElementById("saveInventoryBtn");

/* ---------------------------------------------------
   INIT
--------------------------------------------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  // Categories + default inventory come from inventory.js
  categories = PRELOADED_CATEGORIES;

  const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY));
  if (storedInventory && storedInventory.length) {
    inventory = storedInventory;
  } else {
    inventory = PRELOADED_INVENTORY.slice();
  }

  currentTonsInput.value = currentTons;

  buildCategoryDropdown();
  buildInventoryCategoryDropdown();
  buildInventoryNameDatalist();

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
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
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

function buildInventoryCategoryDropdown() {
  invCategory.innerHTML = "";
  categories.forEach(cat => {
    invCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

filterCategory.addEventListener("change", renderParts);
searchPartsInput.addEventListener("input", renderParts);

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
   RENDER PARTS (with search + expand + status colors)
--------------------------------------------------- */
function renderParts() {
  const selected = filterCategory.value;
  const query = searchPartsInput.value.toLowerCase().trim();

  partsList.innerHTML = "";

  const filtered = parts.filter(p => {
    const catMatch = selected === "ALL" || p.category === selected;
    const searchMatch = !query ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.section || "").toLowerCase().includes(query);
    return catMatch && searchMatch;
  });

  filtered.forEach((p, i) => {
    const st = calculateStatus(p);

    const card = document.createElement("div");
    card.className = `part-card status-${st.status}`;

    card.innerHTML = `
      <div class="part-main" data-index="${i}">
        <div>
          <div class="part-name">${p.name}</div>
          <div class="part-meta">${p.category} — ${p.section}</div>
          <div class="part-meta">Last: ${p.date}</div>
          <div class="part-meta">Interval: ${p.days} days / ${p.tonInterval} tons</div>
          <div class="part-meta">Status: <b>${st.status.toUpperCase()}</b></div>
        </div>
        <div class="expand-icon">▼</div>
      </div>
      <div class="part-details hidden" data-details-index="${i}">
        <div class="part-meta">Days since: ${Math.floor(st.daysSince)}</div>
        <div class="part-meta">Tons since: ${st.tonsSince}</div>

        <div class="part-actions">
          <button class="edit-part-btn" data-index="${i}">Edit</button>
          <button class="duplicate-part-btn" data-index="${i}">Duplicate</button>
          <button class="delete-part-btn" data-index="${i}">Delete</button>
        </div>
      </div>
    `;

    partsList.appendChild(card);
  });
}

/* Expand / collapse */
partsList.addEventListener("click", (e) => {
  const main = e.target.closest(".part-main");
  if (main) {
    const idx = main.dataset.index;
    const details = partsList.querySelector(`.part-details[data-details-index="${idx}"]`);
    if (details) {
      details.classList.toggle("hidden");
    }
    return;
  }

  if (e.target.classList.contains("edit-part-btn")) {
    const index = Number(e.target.dataset.index);
    openPartForEdit(index);
    return;
  }

  if (e.target.classList.contains("duplicate-part-btn")) {
    const index = Number(e.target.dataset.index);
    duplicatePart(index);
    return;
  }

  if (e.target.classList.contains("delete-part-btn")) {
    const index = Number(e.target.dataset.index);
    deletePart(index);
    return;
  }
});

/* ---------------------------------------------------
   DELETE PART
--------------------------------------------------- */
function deletePart(index) {
  if (!confirm("Delete this part?")) return;
  parts.splice(index, 1);
  saveState();
  renderParts();
  renderDashboard();
}

/* ---------------------------------------------------
   DUPLICATE PART
--------------------------------------------------- */
function duplicatePart(index) {
  const original = parts[index];
  if (!original) return;

  const copy = {
    ...original,
    name: original.name + " (Copy)",
    date: new Date().toISOString().split("T")[0],
    lastTons: currentTons
  };

  parts.push(copy);
  saveState();
  renderParts();
  renderDashboard();
}

/* ---------------------------------------------------
   INVENTORY RENDER
--------------------------------------------------- */
function renderInventory() {
  inventoryList.innerHTML = "";

  inventory.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "part-card";

    card.innerHTML = `
      <div class="part-name">${item.part}</div>
      <div class="part-meta">${item.category} — ${item.location}</div>
      <div class="part-meta">Qty: ${item.qty}</div>
      <div class="part-meta">${item.notes || ""}</div>
      <div class="part-actions">
        <button class="edit-inv-btn" data-index="${i}">Edit</button>
        <button class="delete-inv-btn" data-index="${i}">Delete</button>
      </div>
    `;

    inventoryList.appendChild(card);
  });

  buildInventoryNameDatalist();
}

/* Inventory actions (edit / delete) */
inventoryList.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-inv-btn")) {
    const index = Number(e.target.dataset.index);
    openInventoryForEdit(index);
    return;
  }
  if (e.target.classList.contains("delete-inv-btn")) {
    const index = Number(e.target.dataset.index);
    deleteInventoryItem(index);
    return;
  }
});

/* ---------------------------------------------------
   EXPORT FULL DATA
--------------------------------------------------- */
exportBtn.addEventListener("click", () => {
  const data = {
    parts,
    tons: currentTons,
    inventory
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

/* ---------------------------------------------------
   ADD / EDIT PART — SLIDE-UP PANEL LOGIC
--------------------------------------------------- */

function openPartPanel(isEdit, index) {
  editingPartIndex = isEdit ? index : null;

  // Title
  partPanelTitle.textContent = isEdit ? "Edit Part" : "Add New Part";

  // Categories
  newPartCategory.innerHTML = "";
  categories.forEach(c => {
    newPartCategory.innerHTML += `<option value="${c}">${c}</option>`;
  });

  // Prefill if editing
  if (isEdit && parts[index]) {
    const p = parts[index];
    newPartName.value = p.name;
    newPartCategory.value = p.category;
    newPartSection.value = p.section || "";
    newPartDays.value = p.days;
    newPartTons.value = p.tonInterval;
  } else {
    newPartName.value = "";
    newPartSection.value = "";
    newPartDays.value = "";
    newPartTons.value = "";
    if (categories.length) newPartCategory.value = categories[0];
  }

  // Show panel
  addPartPanel.classList.remove("hidden");
  setTimeout(() => {
    addPartPanel.classList.add("show");
  }, 20);
}

addPartBtn.addEventListener("click", () => {
  openPartPanel(false, null);
});

function openPartForEdit(index) {
  openPartPanel(true, index);
}

/* Close panel */
closePartPanel.addEventListener("click", () => {
  addPartPanel.classList.remove("show");
  setTimeout(() => {
    addPartPanel.classList.add("hidden");
  }, 250);
});

/* When selecting part name from inventory, auto-set category */
newPartName.addEventListener("change", () => {
  const name = newPartName.value.toLowerCase().trim();
  const match = inventory.find(item => item.part.toLowerCase() === name);
  if (match) {
    newPartCategory.value = match.category;
  }
});

/* Save part (add or edit) */
savePartBtn.addEventListener("click", () => {
  const name = newPartName.value.trim();
  const category = newPartCategory.value;
  const section = newPartSection.value.trim();
  const days = Number(newPartDays.value);
  const tonInterval = Number(newPartTons.value);

  if (!name || !category || !section || !days || !tonInterval) {
    alert("Please fill all fields.");
    return;
  }

  if (editingPartIndex !== null && parts[editingPartIndex]) {
    // Edit existing
    const existing = parts[editingPartIndex];
    parts[editingPartIndex] = {
      ...existing,
      name,
      category,
      section,
      days,
      tonInterval
    };
  } else {
    // New part
    const newPart = {
      name,
      category,
      section,
      days,
      tonInterval,
      date: new Date().toISOString().split("T")[0],
      lastTons: currentTons
    };
    parts.push(newPart);
  }

  saveState();
  renderParts();
  renderDashboard();

  addPartPanel.classList.remove("show");
  setTimeout(() => addPartPanel.classList.add("hidden"), 250);
});

/* ---------------------------------------------------
   INVENTORY – SLIDE-UP PANEL LOGIC
--------------------------------------------------- */

function openInventoryPanel(isEdit, index) {
  editingInventoryIndex = isEdit ? index : null;
  inventoryPanelTitle.textContent = isEdit ? "Edit Inventory Item" : "Add Inventory Item";

  // Rebuild categories
  buildInventoryCategoryDropdown();

  if (isEdit && inventory[index]) {
    const item = inventory[index];
    invPartName.value = item.part;
    invCategory.value = item.category;
    invLocation.value = item.location || "";
    invQty.value = item.qty;
    invNotes.value = item.notes || "";
  } else {
    invPartName.value = "";
    invLocation.value = "";
    invQty.value = "";
    invNotes.value = "";
    if (categories.length) invCategory.value = categories[0];
  }

  inventoryPanel.classList.remove("hidden");
  setTimeout(() => {
    inventoryPanel.classList.add("show");
  }, 20);
}

addInventoryBtn.addEventListener("click", () => {
  openInventoryPanel(false, null);
});

function openInventoryForEdit(index) {
  openInventoryPanel(true, index);
}

closeInventoryPanel.addEventListener("click", () => {
  inventoryPanel.classList.remove("show");
  setTimeout(() => {
    inventoryPanel.classList.add("hidden");
  }, 250);
});

/* Save inventory item */
saveInventoryBtn.addEventListener("click", () => {
  const part = invPartName.value.trim();
  const category = invCategory.value;
  const location = invLocation.value.trim();
  const qty = Number(invQty.value);
  const notes = invNotes.value.trim();

  if (!part || !category || !location || !qty) {
    alert("Please fill required fields (part, category, location, qty).");
    return;
  }

  const itemData = { part, category, location, qty, notes };

  if (editingInventoryIndex !== null && inventory[editingInventoryIndex]) {
    inventory[editingInventoryIndex] = itemData;
  } else {
    inventory.push(itemData);
  }

  saveState();
  renderInventory();

  inventoryPanel.classList.remove("show");
  setTimeout(() => inventoryPanel.classList.add("hidden"), 250);
});

/* Delete inventory item */
function deleteInventoryItem(index) {
  if (!confirm("Delete this inventory item?")) return;
  inventory.splice(index, 1);
  saveState();
  renderInventory();
}

/* ---------------------------------------------------
   INVENTORY NAME DATALIST (for syncing into parts)
--------------------------------------------------- */

function buildInventoryNameDatalist() {
  if (!inventoryNameList) return;
  inventoryNameList.innerHTML = "";
  inventory.forEach(item => {
    const option = document.createElement("option");
    option.value = item.part;
    inventoryNameList.appendChild(option);
  });
}
