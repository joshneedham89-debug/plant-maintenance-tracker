/* ========================================================
   STORAGE KEYS
======================================================== */
const STORE_PARTS = "pm_parts_v9";
const STORE_INVENTORY = "pm_inventory_v9";
const STORE_TONS = "pm_tons_v9";
const STORE_THEME = "pm_theme_v9";
const STORE_CATEGORIES = "pm_categories_v9";

/* ========================================================
   DEFAULT CATEGORIES
======================================================== */
const DEFAULT_CATEGORIES = [
  "Cold Feed",
  "Conveyor",
  "Dryer",
  "Baghouse",
  "Electrical",
  "Slat Conveyor",
  "Tank Farm",
  "Dust System",
  "Mixer",
  "Screens",
  "Controls",
  "Asphalt System",
  "Pumps",
  "Virgin – Other",
  "Drag Conveyor",
  "Collar",
  "Recycle Conveyor",
  "Bin System",
  "Flights",
  "Bearings",
  "Reducers",
  "Motors",
  "Other"
];

/* ========================================================
   APP STATE
======================================================== */
let parts = [];
let inventory = [];
let categories = [];
let currentTons = 0;

let editingPartIndex = null;
let editingInventoryIndex = null;

/* ========================================================
   DOM ELEMENTS
======================================================== */
// Navigation
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

// Dashboard
const dashTotalParts = document.getElementById("dashTotalParts");
const dashTons = document.getElementById("dashTons");
const dashOverdue = document.getElementById("dashOverdue");
const dashOk = document.getElementById("dashOk");
const dashDue = document.getElementById("dashDue");
const dashNextDue = document.getElementById("dashNextDue");

// Tons
const tonsInput = document.getElementById("tonsInput");
const btnSetTons = document.getElementById("btnSetTons");
const tonsChips = document.querySelectorAll(".chip");

// Parts
const partsList = document.getElementById("partsList");
const partsCategoryFilter = document.getElementById("partsCategoryFilter");
const partsSearch = document.getElementById("partsSearch");
const btnOpenAddPart = document.getElementById("btnOpenAddPart");

const partsOkSummary = document.getElementById("partsOkSummary");
const partsDueSummary = document.getElementById("partsDueSummary");
const partsOverSummary = document.getElementById("partsOverSummary");

// Inventory
const inventoryList = document.getElementById("inventoryList");
const inventoryCategoryFilter = document.getElementById("inventoryCategoryFilter");
const inventorySearch = document.getElementById("inventorySearch");
const btnOpenAddInventory = document.getElementById("btnOpenAddInventory");

// Settings
const settingsTons = document.getElementById("settingsTons");
const settingsTonsInput = document.getElementById("settingsTonsInput");
const btnSettingsSetTons = document.getElementById("btnSettingsSetTons");
const btnResetTons = document.getElementById("btnResetTons");

const themeToggle = document.getElementById("themeToggle");
const btnExportData = document.getElementById("btnExportData");
const btnResetAll = document.getElementById("btnResetAll");

// Modals – Parts
const partModal = document.getElementById("partModal");
const partModalTitle = document.getElementById("partModalTitle");
const partCategory = document.getElementById("partCategory");
const partName = document.getElementById("partName");
const partSection = document.getElementById("partSection");
const partDate = document.getElementById("partDate");
const partDays = document.getElementById("partDays");
const partLastTons = document.getElementById("partLastTons");
const partTonInterval = document.getElementById("partTonInterval");
const partNotes = document.getElementById("partNotes");
const btnSavePart = document.getElementById("btnSavePart");
const btnCancelPart = document.getElementById("btnCancelPart");

const partMoreToggle = document.getElementById("partMoreToggle");
const partMoreFields = document.getElementById("partMoreFields");

// Modals – Inventory
const inventoryModal = document.getElementById("inventoryModal");
const inventoryModalTitle = document.getElementById("inventoryModalTitle");
const invCategory = document.getElementById("invCategory");
const invName = document.getElementById("invName");
const invPartNumber = document.getElementById("invPartNumber");
const invQty = document.getElementById("invQty");
const invNotes = document.getElementById("invNotes");
const btnSaveInventory = document.getElementById("btnSaveInventory");
const btnCancelInventory = document.getElementById("btnCancelInventory");

/* ========================================================
   LOAD STATE
======================================================== */
function loadState() {
  parts = JSON.parse(localStorage.getItem(STORE_PARTS) || "[]");
  inventory = JSON.parse(localStorage.getItem(STORE_INVENTORY) || "[]");
  currentTons = Number(localStorage.getItem(STORE_TONS) || "0");

  categories = JSON.parse(localStorage.getItem(STORE_CATEGORIES));
  if (!categories || !categories.length) {
    categories = DEFAULT_CATEGORIES.slice();
  }

  // Theme
  const theme = localStorage.getItem(STORE_THEME);
  if (theme === "light") {
    document.body.classList.add("light");
    themeToggle.checked = true;
  }

  populateCategoryDropdowns();
  updateDashboard();
  renderParts();
  renderInventory();
}

function saveState() {
  localStorage.setItem(STORE_PARTS, JSON.stringify(parts));
  localStorage.setItem(STORE_INVENTORY, JSON.stringify(inventory));
  localStorage.setItem(STORE_TONS, currentTons);
  localStorage.setItem(STORE_CATEGORIES, JSON.stringify(categories));
}

/* ========================================================
   CATEGORY DROPDOWNS
======================================================== */
function populateCategoryDropdowns() {
  const lists = [partsCategoryFilter, partCategory, inventoryCategoryFilter, invCategory];

  lists.forEach(list => {
    list.innerHTML = "";

    // “All” option for page filters only
    if (list === partsCategoryFilter || list === inventoryCategoryFilter) {
      const all = document.createElement("option");
      all.value = "ALL";
      all.textContent = "All";
      list.appendChild(all);
    }

    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = opt.textContent = cat;
      list.appendChild(opt);
    });
  });
}

/* ========================================================
   STATUS CALCULATION FOR PARTS
======================================================== */
function calcPartStatus(part) {
  const daysSince = part.date ? Math.floor((Date.now() - new Date(part.date)) / 86400000) : Infinity;
  const daysLeft = part.days ? part.days - daysSince : Infinity;

  const tonsSince = currentTons - (part.lastTons || 0);
  const tonsLeft = part.tonInterval ? part.tonInterval - tonsSince : Infinity;

  let status = "ok";
  if (daysLeft < 0 || tonsLeft < 0) status = "over";
  else if (daysLeft < 5 || tonsLeft < 500) status = "due";

  return { status, daysLeft, tonsLeft };
}

/* ========================================================
   RENDER PARTS
======================================================== */
function renderParts() {
  partsList.innerHTML = "";

  const search = partsSearch.value.toLowerCase();
  const filter = partsCategoryFilter.value;

  let ok = 0, due = 0, over = 0;

  parts.forEach((p, i) => {
    if (filter !== "ALL" && p.category !== filter) return;
    if (search && !p.name.toLowerCase().includes(search)) return;

    const st = calcPartStatus(p);

    if (st.status === "ok") ok++;
    if (st.status === "due") due++;
    if (st.status === "over") over++;

    const card = document.createElement("div");
    card.className = "part-card";

    const left = document.createElement("div");
    left.className = "part-left";
    left.innerHTML = `
      <div class="part-name">${p.name}</div>
      <div class="part-meta">${p.category} • ${p.section || ""}</div>
      <div class="part-meta">Last: ${p.date || "-"}</div>
      <div class="part-meta">Status: ${st.status.toUpperCase()}</div>
    `;

    const actions = document.createElement("div");
    actions.className = "part-actions";

    const edit = document.createElement("button");
    edit.className = "secondary-btn small";
    edit.textContent = "Edit";
    edit.onclick = () => openPartModal(i);

    const del = document.createElement("button");
    del.className = "danger-btn small";
    del.textContent = "Del";
    del.onclick = () => deletePart(i);

    actions.append(edit, del);
    card.append(left, actions);
    partsList.appendChild(card);
  });

  partsOkSummary.textContent = `🟢 OK: ${ok}`;
  partsDueSummary.textContent = `🟡 Due: ${due}`;
  partsOverSummary.textContent = `🔴 Over: ${over}`;
}

/* ========================================================
   ADD / EDIT PARTS
======================================================== */
function openPartModal(index) {
  editingPartIndex = index;

  if (index === null) {
    partModalTitle.textContent = "Add Part";
    partCategory.value = categories[0];
    partName.value = "";
    partSection.value = "";
    partDate.value = new Date().toISOString().split("T")[0];
    partDays.value = "";
    partLastTons.value = currentTons;
    partTonInterval.value = "";
    partNotes.value = "";
  } else {
    const p = parts[index];
    partModalTitle.textContent = "Edit Part";

    partCategory.value = p.category;
    partName.value = p.name;
    partSection.value = p.section;
    partDate.value = p.date;
    partDays.value = p.days;
    partLastTons.value = p.lastTons;
    partTonInterval.value = p.tonInterval;
    partNotes.value = p.notes;
  }

  partModal.classList.remove("hidden");
}

btnSavePart.onclick = () => {
  const obj = {
    category: partCategory.value,
    name: partName.value.trim(),
    section: partSection.value.trim(),
    date: partDate.value,
    days: Number(partDays.value),
    lastTons: Number(partLastTons.value),
    tonInterval: Number(partTonInterval.value),
    notes: partNotes.value.trim(),
  };

  if (!obj.name) {
    alert("Part name required.");
    return;
  }

  if (editingPartIndex === null) parts.push(obj);
  else parts[editingPartIndex] = obj;

  saveState();
  renderParts();
  updateDashboard();
  partModal.classList.add("hidden");
};

btnCancelPart.onclick = () => {
  partModal.classList.add("hidden");
};

function deletePart(i) {
  if (!confirm("Delete this part?")) return;
  parts.splice(i, 1);
  saveState();
  renderParts();
  updateDashboard();
}

/* ========================================================
   INVENTORY SYSTEM
======================================================== */
function renderInventory() {
  inventoryList.innerHTML = "";

  const search = inventorySearch.value.toLowerCase();
  const filter = inventoryCategoryFilter.value;

  inventory.forEach((it, i) => {
    if (filter !== "ALL" && it.category !== filter) return;
    if (search && !it.name.toLowerCase().includes(search)) return;

    const card = document.createElement("div");
    card.className = "inventory-card";

    const left = document.createElement("div");
    left.className = "inventory-left";
    left.innerHTML = `
      <div class="inventory-name">${it.name}</div>
      <div class="inventory-meta">${it.category}</div>
      <div class="inventory-meta">Qty: ${it.qty}</div>
    `;

    const actions = document.createElement("div");
    actions.className = "inventory-actions";

    const edit = document.createElement("button");
    edit.className = "secondary-btn small";
    edit.textContent = "Edit";
    edit.onclick = () => openInventoryModal(i);

    const del = document.createElement("button");
    del.className = "danger-btn small";
    del.textContent = "Del";
    del.onclick = () => deleteInventory(i);

    actions.append(edit, del);
    card.append(left, actions);
    inventoryList.appendChild(card);
  });
}

function openInventoryModal(index) {
  editingInventoryIndex = index;

  if (index === null) {
    inventoryModalTitle.textContent = "Add Inventory Item";
    invCategory.value = categories[0];
    invName.value = "";
    invPartNumber.value = "";
    invQty.value = "1";
    invNotes.value = "";
  } else {
    const it = inventory[index];
    inventoryModalTitle.textContent = "Edit Inventory Item";
    invCategory.value = it.category;
    invName.value = it.name;
    invPartNumber.value = it.partNumber;
    invQty.value = it.qty;
    invNotes.value = it.notes;
  }

  inventoryModal.classList.remove("hidden");
}

btnSaveInventory.onclick = () => {
  const obj = {
    category: invCategory.value,
    name: invName.value.trim(),
    partNumber: invPartNumber.value.trim(),
    qty: Number(invQty.value),
    notes: invNotes.value.trim(),
  };

  if (!obj.name) {
    alert("Inventory item name required.");
    return;
  }

  if (editingInventoryIndex === null) inventory.push(obj);
  else inventory[editingInventoryIndex] = obj;

  saveState();
  renderInventory();
  inventoryModal.classList.add("hidden");
};

btnCancelInventory.onclick = () => {
  inventoryModal.classList.add("hidden");
};

function deleteInventory(i) {
  if (!confirm("Delete this item?")) return;
  inventory.splice(i, 1);
  saveState();
  renderInventory();
}

/* ========================================================
   DASHBOARD
======================================================== */
function updateDashboard() {
  dashTotalParts.textContent = parts.length;
  dashTons.textContent = currentTons;

  let ok = 0, due = 0, over = 0;
  let bestNext = Infinity;
  let bestName = "—";

  parts.forEach(p => {
    const st = calcPartStatus(p);

    if (st.status === "ok") ok++;
    if (st.status === "due") due++;
    if (st.status === "over") over++;

    if (st.daysLeft < bestNext && st.daysLeft >= 0) {
      bestNext = st.daysLeft;
      bestName = p.name;
    }
  });

  dashOk.textContent = ok;
  dashDue.textContent = due;
  dashOverdue.textContent = over;

  dashNextDue.textContent = bestNext === Infinity ? "—" : `${bestName} (${bestNext} days)`;

  settingsTons.textContent = currentTons;
}

/* ========================================================
   TONS CONTROLS
======================================================== */
btnSetTons.onclick = () => {
  const n = Number(tonsInput.value);
  if (isNaN(n)) return;
  currentTons = n;
  saveState();
  updateDashboard();
  renderParts();
};

tonsChips.forEach(chip => {
  chip.onclick = () => {
    const add = Number(chip.dataset.addtons);
    currentTons += add;
    saveState();
    updateDashboard();
    renderParts();
  };
});

btnSettingsSetTons.onclick = () => {
  const n = Number(settingsTonsInput.value);
  if (!isNaN(n)) {
    currentTons = n;
    saveState();
    updateDashboard();
    renderParts();
  }
};

btnResetTons.onclick = () => {
  if (!confirm("Reset tons to 0?")) return;
  currentTons = 0;
  saveState();
  updateDashboard();
  renderParts();
};

/* ========================================================
   SETTINGS
======================================================== */
themeToggle.onchange = () => {
  if (themeToggle.checked) {
    document.body.classList.add("light");
    localStorage.setItem(STORE_THEME, "light");
  } else {
    document.body.classList.remove("light");
    localStorage.setItem(STORE_THEME, "dark");
  }
};

btnExportData.onclick = () => {
  const data = {
    parts,
    inventory,
    currentTons,
    categories
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "maintenance_export.json";
  a.click();
  URL.revokeObjectURL(url);
};

btnResetAll.onclick = () => {
  if (!confirm("Reset ALL data?")) return;

  parts = [];
  inventory = [];
  currentTons = 0;

  saveState();
  updateDashboard();
  renderParts();
  renderInventory();
};

/* ========================================================
   PAGE NAVIGATION
======================================================== */
navButtons.forEach(btn => {
  btn.onclick = () => {
    const page = btn.dataset.page;

    // Activate nav
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Activate page
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(`page-${page}`).classList.add("active");
  };
});

/* ========================================================
   INIT
======================================================== */
loadState();
