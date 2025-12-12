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

let completingPartIndex = null;
let completionUsedItems = []; // {invIndex, qty}

/* ---------------------------------------------------
   ELEMENT REFERENCES
--------------------------------------------------- */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const tonsRunEl = document.getElementById("tonsRun");
const completedTodayEl = document.getElementById("completedTodayCount");
const completedMonthEl = document.getElementById("completedMonthCount");

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
const partPanelOverlay = document.getElementById("partPanelOverlay");
const addPartPanel = document.getElementById("addPartPanel");
const closePartPanelBtn = document.getElementById("closePartPanel");
const partPanelTitle = document.getElementById("partPanelTitle");

const newPartName = document.getElementById("newPartName");
const newPartCategory = document.getElementById("newPartCategory");
const newPartSection = document.getElementById("newPartSection");
const newPartDays = document.getElementById("newPartDays");
const newPartTons = document.getElementById("newPartTons");
const savePartBtn = document.getElementById("savePartBtn");
const inventoryNameList = document.getElementById("inventoryNameList");

/* Inventory Slide Panel */
const inventoryPanelOverlay = document.getElementById("inventoryPanelOverlay");
const inventoryPanel = document.getElementById("inventoryPanel");
const closeInventoryPanelBtn = document.getElementById("closeInventoryPanel");
const inventoryPanelTitle = document.getElementById("inventoryPanelTitle");

const invPartName = document.getElementById("invPartName");
const invCategory = document.getElementById("invCategory");
const invLocation = document.getElementById("invLocation");
const invQty = document.getElementById("invQty");
const invNotes = document.getElementById("invNotes");
const saveInventoryBtn = document.getElementById("saveInventoryBtn");

/* Complete Maintenance Panel */
const completePanelOverlay = document.getElementById("completePanelOverlay");
const completePanel = document.getElementById("completePanel");
const closeCompletePanelBtn = document.getElementById("closeCompletePanel");
const compDate = document.getElementById("compDate");
const compTons = document.getElementById("compTons");
const compNotes = document.getElementById("compNotes");
const compInvSelect = document.getElementById("compInvSelect");
const compInvQty = document.getElementById("compInvQty");
const compAddItemBtn = document.getElementById("compAddItemBtn");
const compUsedList = document.getElementById("compUsedList");
const saveCompletionBtn = document.getElementById("saveCompletionBtn");

/* Toast */
const toastContainer = document.getElementById("toastContainer");
let toastTimeoutId = null;

/* ---------------------------------------------------
   TOAST HELPERS
--------------------------------------------------- */
function showToast(message, type = "success") {
  if (!toastContainer) return;
  toastContainer.textContent = message;
  toastContainer.className = "toast " + type;

  void toastContainer.offsetWidth; // restart animation

  toastContainer.classList.add("show");
  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => {
    toastContainer.classList.remove("show");
  }, 2500);
}

/* ---------------------------------------------------
   INIT
--------------------------------------------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  categories = PRELOADED_CATEGORIES;

  const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY));
  if (storedInventory && storedInventory.length) {
    inventory = storedInventory;
  } else {
    inventory = PRELOADED_INVENTORY.slice();
  }

  if (currentTonsInput) currentTonsInput.value = currentTons;

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
updateTonsBtn?.addEventListener("click", () => {
  const val = Number(currentTonsInput.value);
  if (!isNaN(val)) {
    currentTons = val;
    saveState();
    renderDashboard();
    showToast("Tons updated");
  }
});

resetTonsBtn?.addEventListener("click", () => {
  currentTons = 0;
  currentTonsInput.value = 0;
  saveState();
  renderDashboard();
  showToast("Tons reset");
});

/* ---------------------------------------------------
   DASHBOARD RENDER
--------------------------------------------------- */
function renderDashboard() {
  let ok = 0, due = 0, over = 0;
  let completedToday = 0;
  let completedMonth = 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const [year, month] = todayStr.split("-");

  parts.forEach(p => {
    const st = calculateStatus(p);
    if (st.status === "ok") ok++;
    else if (st.status === "due") due++;
    else over++;

    if (Array.isArray(p.history)) {
      p.history.forEach(h => {
        if (!h.date) return;
        if (h.date === todayStr) completedToday++;
        const [hy, hm] = h.date.split("-");
        if (hy === year && hm === month) completedMonth++;
      });
    }
  });

  okCountEl.textContent = ok;
  dueCountEl.textContent = due;
  overCountEl.textContent = over;
  tonsRunEl.textContent = currentTons;
  if (completedTodayEl) completedTodayEl.textContent = completedToday;
  if (completedMonthEl) completedMonthEl.textContent = completedMonth;
}

/* ---------------------------------------------------
   CATEGORY DROPDOWNS
--------------------------------------------------- */
function buildCategoryDropdown() {
  if (!filterCategory) return;
  filterCategory.innerHTML = `<option value="ALL">All Categories</option>`;
  categories.forEach(cat => {
    filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

function buildInventoryCategoryDropdown() {
  if (!invCategory) return;
  invCategory.innerHTML = "";
  categories.forEach(cat => {
    invCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

filterCategory?.addEventListener("change", renderParts);
searchPartsInput?.addEventListener("input", renderParts);

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
  if (!partsList) return;

  const selected = filterCategory ? filterCategory.value : "ALL";
  const query = searchPartsInput ? searchPartsInput.value.toLowerCase().trim() : "";

  partsList.innerHTML = "";

  const filtered = parts
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => {
      const catMatch = selected === "ALL" || p.category === selected;
      const searchMatch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.section || "").toLowerCase().includes(query);
      return catMatch && searchMatch;
    });

  filtered.forEach(({ p, idx }) => {
    const st = calculateStatus(p);
    const history = Array.isArray(p.history) ? p.history : [];

    let historyHtml = "";
    if (!history.length) {
      historyHtml = `<div class="part-meta">No maintenance history yet.</div>`;
    } else {
      const recent = history.slice().reverse().slice(0, 3);
      historyHtml = recent
        .map(h => {
          const noteBit = h.notes ? " – " + h.notes : "";
          return `<div class="part-meta">• ${h.date} – ${h.tons} tons${noteBit}</div>`;
        })
        .join("");
    }

    const card = document.createElement("div");
    card.className = `part-card status-${st.status}`;

    card.innerHTML = `
      <div class="part-main" data-index="${idx}">
        <div>
          <div class="part-name">${p.name}</div>
          <div class="part-meta">${p.category} — ${p.section}</div>
          <div class="part-meta">Last: ${p.date}</div>
          <div class="part-meta">Interval: ${p.days} days / ${p.tonInterval} tons</div>
          <div class="part-meta">Status: <b>${st.status.toUpperCase()}</b></div>
        </div>
        <div class="expand-icon">▼</div>
      </div>
      <div class="part-details" data-details-index="${idx}">
        <div class="part-meta">Days since: ${Math.floor(st.daysSince)}</div>
        <div class="part-meta">Tons since: ${st.tonsSince}</div>

        <div class="part-actions">
          <button class="complete-part-btn" data-index="${idx}">Complete</button>
          <button class="edit-part-btn" data-index="${idx}">Edit</button>
          <button class="duplicate-part-btn" data-index="${idx}">Duplicate</button>
          <button class="delete-part-btn" data-index="${idx}">Delete</button>
        </div>

        <div class="part-history">
          <div class="part-meta"><b>History:</b></div>
          ${historyHtml}
        </div>
      </div>
    `;

    partsList.appendChild(card);
  });
}

/* Expand / collapse & action buttons */
partsList?.addEventListener("click", (e) => {
  const main = e.target.closest(".part-main");
  if (main) {
    const idx = main.dataset.index;
    const details = partsList.querySelector(
      `.part-details[data-details-index="${idx}"]`
    );
    if (details) {
      details.classList.toggle("expanded");
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

  if (e.target.classList.contains("complete-part-btn")) {
    const index = Number(e.target.dataset.index);
    openCompletePanel(index);
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
  showToast("Part deleted");
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
  showToast("Part duplicated");
}

/* ---------------------------------------------------
   INVENTORY RENDER
--------------------------------------------------- */
function renderInventory() {
  if (!inventoryList) return;

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
inventoryList?.addEventListener("click", (e) => {
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
exportBtn?.addEventListener("click", () => {
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

  showToast("Data exported");
});

/* ---------------------------------------------------
   RESET EVERYTHING
--------------------------------------------------- */
resetAllBtn?.addEventListener("click", () => {
  if (confirm("Reset ALL data?")) {
    localStorage.clear();
    showToast("App reset", "success");
    location.reload();
  }
});

/* ---------------------------------------------------
   AC CALCULATOR
--------------------------------------------------- */
acCalcBtn?.addEventListener("click", () => {
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
  showToast("AC calculated");
});

/* ---------------------------------------------------
   ADD / EDIT PART — SLIDE-UP PANEL LOGIC
--------------------------------------------------- */

function openPartPanel(isEdit, index) {
  if (!partPanelOverlay || !addPartPanel) return;

  editingPartIndex = isEdit ? index : null;

  if (partPanelTitle) {
    partPanelTitle.textContent = isEdit ? "Edit Part" : "Add New Part";
  }

  if (newPartCategory) {
    newPartCategory.innerHTML = "";
    categories.forEach(c => {
      newPartCategory.innerHTML += `<option value="${c}">${c}</option>`;
    });
  }

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

  partPanelOverlay.classList.remove("hidden");
  setTimeout(() => {
    addPartPanel.classList.add("show");
  }, 20);
}

addPartBtn?.addEventListener("click", () => {
  openPartPanel(false, null);
});

function openPartForEdit(index) {
  openPartPanel(true, index);
}

function closePartPanel() {
  if (!partPanelOverlay || !addPartPanel) return;
  addPartPanel.classList.remove("show");
  setTimeout(() => {
    partPanelOverlay.classList.add("hidden");
  }, 250);
}

closePartPanelBtn?.addEventListener("click", closePartPanel);

partPanelOverlay?.addEventListener("click", (e) => {
  if (e.target === partPanelOverlay) {
    closePartPanel();
  }
});

/* When selecting part name from inventory, auto-set category */
newPartName?.addEventListener("change", () => {
  const name = newPartName.value.toLowerCase().trim();
  const match = inventory.find(item => item.part.toLowerCase() === name);
  if (match && newPartCategory) {
    newPartCategory.value = match.category;
  }
});

/* Save part (add or edit) */
savePartBtn?.addEventListener("click", () => {
  const name = newPartName.value.trim();
  const category = newPartCategory.value;
  const section = newPartSection.value.trim();
  const days = Number(newPartDays.value);
  const tonInterval = Number(newPartTons.value);

  if (!name || !category || !section || !days || !tonInterval) {
    showToast("Please fill all part fields", "error");
    return;
  }

  if (editingPartIndex !== null && parts[editingPartIndex]) {
    const existing = parts[editingPartIndex];
    parts[editingPartIndex] = {
      ...existing,
      name,
      category,
      section,
      days,
      tonInterval
    };
    showToast("Part updated");
  } else {
    const newPart = {
      name,
      category,
      section,
      days,
      tonInterval,
      date: new Date().toISOString().split("T")[0],
      lastTons: currentTons,
      history: []
    };
    parts.push(newPart);
    showToast("Part added");
  }

  saveState();
  renderParts();
  renderDashboard();
  closePartPanel();
});

/* ---------------------------------------------------
   INVENTORY – SLIDE-UP PANEL LOGIC
--------------------------------------------------- */

function openInventoryPanel(isEdit, index) {
  if (!inventoryPanelOverlay || !inventoryPanel) return;

  editingInventoryIndex = isEdit ? index : null;
  if (inventoryPanelTitle) {
    inventoryPanelTitle.textContent = isEdit
      ? "Edit Inventory Item"
      : "Add Inventory Item";
  }

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

  inventoryPanelOverlay.classList.remove("hidden");
  setTimeout(() => {
    inventoryPanel.classList.add("show");
  }, 20);
}

addInventoryBtn?.addEventListener("click", () => {
  openInventoryPanel(false, null);
});

function openInventoryForEdit(index) {
  openInventoryPanel(true, index);
}

function closeInventoryPanel() {
  if (!inventoryPanelOverlay || !inventoryPanel) return;
  inventoryPanel.classList.remove("show");
  setTimeout(() => {
    inventoryPanelOverlay.classList.add("hidden");
  }, 250);
}

closeInventoryPanelBtn?.addEventListener("click", closeInventoryPanel);

inventoryPanelOverlay?.addEventListener("click", (e) => {
  if (e.target === inventoryPanelOverlay) {
    closeInventoryPanel();
  }
});

/* Save inventory item */
saveInventoryBtn?.addEventListener("click", () => {
  const part = invPartName.value.trim();
  const category = invCategory.value;
  const location = invLocation.value.trim();
  const qty = Number(invQty.value);
  const notes = invNotes.value.trim();

  if (!part || !category || !location || !qty) {
    showToast("Fill part, category, location, qty", "error");
    return;
  }

  const itemData = { part, category, location, qty, notes };

  if (editingInventoryIndex !== null && inventory[editingInventoryIndex]) {
    inventory[editingInventoryIndex] = itemData;
    showToast("Inventory updated");
  } else {
    inventory.push(itemData);
    showToast("Inventory item added");
  }

  saveState();
  renderInventory();
  closeInventoryPanel();
});

/* Delete inventory item */
function deleteInventoryItem(index) {
  if (!confirm("Delete this inventory item?")) return;
  inventory.splice(index, 1);
  saveState();
  renderInventory();
  showToast("Inventory item deleted");
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

/* ---------------------------------------------------
   COMPLETE MAINTENANCE PANEL LOGIC
--------------------------------------------------- */

function openCompletePanel(index) {
  if (!completePanelOverlay || !completePanel) return;

  completingPartIndex = index;
  completionUsedItems = [];

  const p = parts[index];
  if (!p.history) p.history = [];

  const todayStr = new Date().toISOString().split("T")[0];
  compDate.value = todayStr;
  compTons.value = currentTons;
  compNotes.value = "";

  compInvSelect.innerHTML = `<option value="">Select inventory item</option>`;
  inventory.forEach((item, invIdx) => {
    compInvSelect.innerHTML += `<option value="${invIdx}">${item.part} (Qty: ${item.qty})</option>`;
  });

  compInvQty.value = "1";
  compUsedList.innerHTML = "";

  completePanelOverlay.classList.remove("hidden");
  setTimeout(() => {
    completePanel.classList.add("show");
  }, 20);
}

function closeCompletePanel() {
  if (!completePanelOverlay || !completePanel) return;
  completePanel.classList.remove("show");
  setTimeout(() => {
    completePanelOverlay.classList.add("hidden");
  }, 250);
}

closeCompletePanelBtn?.addEventListener("click", closeCompletePanel);

completePanelOverlay?.addEventListener("click", (e) => {
  if (e.target === completePanelOverlay) {
    closeCompletePanel();
  }
});

/* Add used inventory item to temp list */
compAddItemBtn?.addEventListener("click", () => {
  const invIndexStr = compInvSelect.value;
  const qty = Number(compInvQty.value);

  if (invIndexStr === "" || isNaN(qty) || qty <= 0) {
    showToast("Select an item & qty", "error");
    return;
  }

  const invIndex = Number(invIndexStr);
  const item = inventory[invIndex];
  if (!item) return;

  completionUsedItems.push({ invIndex, qty });

  const line = document.createElement("div");
  line.className = "part-meta";
  line.textContent = `• ${item.part} – ${qty}`;
  compUsedList.appendChild(line);

  compInvSelect.value = "";
  compInvQty.value = "1";
});

/* Save maintenance completion */
saveCompletionBtn?.addEventListener("click", () => {
  if (completingPartIndex === null || completingPartIndex < 0) {
    showToast("No part selected", "error");
    return;
  }

  const dateStr = compDate.value;
  const tonsVal = Number(compTons.value);
  const notes = compNotes.value.trim();

  if (!dateStr || isNaN(tonsVal)) {
    showToast("Enter date & tons", "error");
    return;
  }

  const part = parts[completingPartIndex];
  if (!part) return;
  if (!part.history) part.history = [];

  // Create history entry
  const historyEntry = {
    date: dateStr,
    tons: tonsVal,
    notes,
    usedItems: completionUsedItems.map(item => {
      const inv = inventory[item.invIndex];
      return {
        part: inv ? inv.part : "Unknown",
        qty: item.qty
      };
    })
  };

  part.history.push(historyEntry);

  // Reset part counters
  part.date = dateStr;
  part.lastTons = tonsVal;

  // Adjust inventory quantities
  completionUsedItems.forEach(item => {
    const inv = inventory[item.invIndex];
    if (inv) {
      inv.qty = Math.max(0, Number(inv.qty) - item.qty);
    }
  });

  saveState();
  renderParts();
  renderInventory();
  renderDashboard();

  showToast("Maintenance completed");
  closeCompletePanel();
});
