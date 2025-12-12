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

/* Dashboard UI */
const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const tonsRunEl = document.getElementById("tonsRun");
const completedTodayEl = document.getElementById("completedTodayCount");
const completedMonthEl = document.getElementById("completedMonthCount");

/* Tons */
const currentTonsInput = document.getElementById("currentTonsInput");
const updateTonsBtn = document.getElementById("updateTonsBtn");
const resetTonsBtn = document.getElementById("resetTonsBtn");

/* Maintenance UI */
const filterCategory = document.getElementById("filterCategory");
const partsList = document.getElementById("partsList");
const addPartBtn = document.getElementById("addPartBtn");
const searchPartsInput = document.getElementById("searchPartsInput");

/* Inventory UI */
const inventoryList = document.getElementById("inventoryList");
const addInventoryBtn = document.getElementById("addInventoryBtn");
const searchInventoryInput = document.getElementById("searchInventoryInput");

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

/* Add/Edit Part Panel */
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

/* Inventory Panel */
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
   TOAST
--------------------------------------------------- */
function showToast(message, type = "success") {
  toastContainer.textContent = message;
  toastContainer.className = "toast " + type;
  void toastContainer.offsetWidth;
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
  inventory = storedInventory?.length ? storedInventory : PRELOADED_INVENTORY.slice();

  currentTonsInput.value = currentTons;

  buildCategoryDropdown();
  buildInventoryCategoryDropdown();
  buildInventoryNameDatalist();
  buildCompleteInventorySelect();

  renderDashboard();
  renderParts();
  renderInventory();
}

loadState();

/* ---------------------------------------------------
   SAVE
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

  if (screenId === "dashboardScreen") renderDashboard();
  if (screenId === "maintenanceScreen") renderParts();
  if (screenId === "inventoryScreen") renderInventory();
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

/* ---------------------------------------------------
   TONS
--------------------------------------------------- */

updateTonsBtn.addEventListener("click", () => {
  currentTons = Number(currentTonsInput.value);
  saveState();
  renderDashboard();
  showToast("Tons updated");
});

resetTonsBtn.addEventListener("click", () => {
  currentTons = 0;
  currentTonsInput.value = 0;
  saveState();
  renderDashboard();
  showToast("Tons reset");
});

/* ---------------------------------------------------
   DASHBOARD
--------------------------------------------------- */
function renderDashboard() {
  let ok = 0, due = 0, over = 0;
  let completedToday = 0;
  let completedMonth = 0;

  const today = new Date().toISOString().split("T")[0];
  const [year, month] = today.split("-");

  parts.forEach(p => {
    const st = calculateStatus(p);
    if (st.status === "ok") ok++;
    else if (st.status === "due") due++;
    else over++;

    if (Array.isArray(p.history)) {
      p.history.forEach(h => {
        if (h.date === today) completedToday++;
        const [hy, hm] = h.date.split("-");
        if (hy === year && hm === month) completedMonth++;
      });
    }
  });

  okCountEl.textContent = ok;
  dueCountEl.textContent = due;
  overCountEl.textContent = over;
  tonsRunEl.textContent = currentTons;
  completedTodayEl.textContent = completedToday;
  completedMonthEl.textContent = completedMonth;
}

/* ---------------------------------------------------
   CATEGORY DROPDOWNS
--------------------------------------------------- */
function buildCategoryDropdown() {
  filterCategory.innerHTML = `<option value="ALL">All Categories</option>`;
  categories.forEach(c => {
    filterCategory.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function buildInventoryCategoryDropdown() {
  invCategory.innerHTML = "";
  categories.forEach(c => {
    invCategory.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

filterCategory.addEventListener("change", renderParts);
searchPartsInput.addEventListener("input", renderParts);

/* ---------------------------------------------------
   STATUS CALC
--------------------------------------------------- */
function calculateStatus(p) {
  const daysSince = (Date.now() - new Date(p.date)) / 86400000;
  const tonsSince = currentTons - p.lastTons;

  let status = "ok";

  if (daysSince > p.days || tonsSince > p.tonInterval) status = "overdue";
  else if (p.days - daysSince < 5 || p.tonInterval - tonsSince < 500) status = "due";

  return { status, daysSince, tonsSince };
}

/* ---------------------------------------------------
   RENDER PARTS
--------------------------------------------------- */
function renderParts() {
  const selected = filterCategory.value;
  const query = searchPartsInput.value.toLowerCase().trim();

  partsList.innerHTML = "";

  parts.forEach((p, idx) => {
    const st = calculateStatus(p);

    const matchesCategory = selected === "ALL" || p.category === selected;
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.section.toLowerCase().includes(query);

    if (!matchesCategory || !matchesSearch) return;

    const historyHtml = (p.history || [])
      .slice().reverse().slice(0, 2)
      .map(h => `<div class="part-meta">• ${h.date} – ${h.tons} tons</div>`)
      .join("") || `<div class="part-meta">No history</div>`;

    const card = document.createElement("div");
    card.className = `part-card status-${st.status}`;

    card.innerHTML = `
      <div class="part-main" data-idx="${idx}">
        <div>
          <div class="part-name">${p.name}</div>
          <div class="part-meta">${p.category} — ${p.section}</div>
          <div class="part-meta">Last: ${p.date}</div>
          <div class="part-meta">Status: <b>${st.status.toUpperCase()}</b></div>
        </div>
        <div class="expand-icon">▼</div>
      </div>

      <div class="part-details" data-details="${idx}">
        <div class="part-meta">Days since: ${Math.floor(st.daysSince)}</div>
        <div class="part-meta">Tons since: ${st.tonsSince}</div>

        <div class="part-actions">
          <button class="complete-btn" data-idx="${idx}">Complete</button>
          <button class="edit-part-btn" data-idx="${idx}">Edit</button>
          <button class="duplicate-part-btn" data-idx="${idx}">Duplicate</button>
          <button class="delete-part-btn" data-idx="${idx}">Delete</button>
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

/* Expand/collapse + part actions */
partsList.addEventListener("click", (e) => {
  const main = e.target.closest(".part-main");
  if (main) {
    const idx = main.dataset.idx;
    document
      .querySelector(`.part-details[data-details="${idx}"]`)
      ?.classList.toggle("expanded");
    return;
  }

  if (e.target.classList.contains("edit-part-btn"))
    openPartForEdit(Number(e.target.dataset.idx));

  if (e.target.classList.contains("duplicate-part-btn"))
    duplicatePart(Number(e.target.dataset.idx));

  if (e.target.classList.contains("delete-part-btn"))
    deletePart(Number(e.target.dataset.idx));

  if (e.target.classList.contains("complete-btn"))
    openCompletePanel(Number(e.target.dataset.idx));
});

/* ---------------------------------------------------
   DELETE PART
--------------------------------------------------- */
function deletePart(i) {
  if (!confirm("Delete this part?")) return;
  parts.splice(i, 1);
  saveState();
  renderParts();
  renderDashboard();
  showToast("Part deleted");
}

/* ---------------------------------------------------
   DUPLICATE PART
--------------------------------------------------- */
function duplicatePart(i) {
  const p = parts[i];
  parts.push({
    ...p,
    name: p.name + " (Copy)",
    date: new Date().toISOString().split("T")[0],
    lastTons: currentTons,
  });
  saveState();
  renderParts();
  showToast("Part duplicated");
}

/* ---------------------------------------------------
   INVENTORY SEARCH + RENDER
--------------------------------------------------- */
function renderInventory() {
  const query = searchInventoryInput.value.toLowerCase().trim();
  inventoryList.innerHTML = "";

  inventory.forEach((item, idx) => {
    const matchesSearch =
      !query ||
      item.part.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query);

    if (!matchesSearch) return;

    const card = document.createElement("div");
    card.className = "part-card";

    card.innerHTML = `
      <div class="part-name">${item.part}</div>
      <div class="part-meta">${item.category} — ${item.location}</div>
      <div class="part-meta">Qty: ${item.qty}</div>
      <div class="part-meta">${item.notes || ""}</div>

      <div class="part-actions">
        <button class="edit-inv-btn" data-idx="${idx}">Edit</button>
        <button class="delete-inv-btn" data-idx="${idx}">Delete</button>
      </div>
    `;

    inventoryList.appendChild(card);
  });
}

/* Inventory search listener */
searchInventoryInput.addEventListener("input", renderInventory);

/* Inventory actions */
inventoryList.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-inv-btn"))
    openInventoryForEdit(Number(e.target.dataset.idx));

  if (e.target.classList.contains("delete-inv-btn"))
    deleteInventoryItem(Number(e.target.dataset.idx));
});

/* ---------------------------------------------------
   INVENTORY EDIT / DELETE
--------------------------------------------------- */
function deleteInventoryItem(i) {
  if (!confirm("Delete this item?")) return;
  inventory.splice(i, 1);
  saveState();
  renderInventory();
  buildCompleteInventorySelect();
  showToast("Inventory item deleted");
}

/* ---------------------------------------------------
   COMPLETE MAINTENANCE PANEL
--------------------------------------------------- */
function openCompletePanel(i) {
  completingPartIndex = i;
  completionUsedItems = [];

  const today = new Date().toISOString().split("T")[0];
  compDate.value = today;
  compTons.value = currentTons;
  compNotes.value = "";

  buildCompleteInventorySelect();
  compUsedList.innerHTML = "";

  completePanelOverlay.classList.remove("hidden");
  setTimeout(() => completePanel.classList.add("show"), 10);
}

function closeCompletePanel() {
  completePanel.classList.remove("show");
  setTimeout(() => completePanelOverlay.classList.add("hidden"), 250);
}

closeCompletePanelBtn.addEventListener("click", closeCompletePanel);

completePanelOverlay.addEventListener("click", (e) => {
  if (e.target === completePanelOverlay) closeCompletePanel();
});

/* ---------------------------------------------------
   BUILD INVENTORY DROPDOWN FOR COMPLETION
--------------------------------------------------- */
function buildCompleteInventorySelect() {
  compInvSelect.innerHTML = `<option value="">Select inventory item</option>`;
  inventory.forEach((item, idx) => {
    compInvSelect.innerHTML += `<option value="${idx}">
      ${item.part} (Qty: ${item.qty})
    </option>`;
  });
}

/* Add used inventory to list */
compAddItemBtn.addEventListener("click", () => {
  const invIndex = compInvSelect.value;
  const qty = Number(compInvQty.value);

  if (invIndex === "" || qty <= 0) return showToast("Select item + quantity", "error");

  completionUsedItems.push({ invIndex: Number(invIndex), qty });

  const item = inventory[invIndex];
  const line = document.createElement("div");
  line.className = "part-meta";
  line.textContent = `• ${item.part} – ${qty}`;
  compUsedList.appendChild(line);

  compInvSelect.value = "";
  compInvQty.value = 1;
});

/* ---------------------------------------------------
   SAVE COMPLETION
--------------------------------------------------- */
saveCompletionBtn.addEventListener("click", () => {
  const p = parts[completingPartIndex];
  const date = compDate.value;
  const tons = Number(compTons.value);
  const notes = compNotes.value.trim();

  if (!date || isNaN(tons)) return showToast("Enter date + tons", "error");

  /* Create history entry */
  const historyEntry = {
    date,
    tons,
    notes,
    usedItems: completionUsedItems.map(u => ({
      part: inventory[u.invIndex].part,
      qty: u.qty
    }))
  };

  if (!p.history) p.history = [];
  p.history.push(historyEntry);

  /* Reset part */
  p.date = date;
  p.lastTons = tons;

  /* Update inventory quantities */
  completionUsedItems.forEach(u => {
    inventory[u.invIndex].qty = Math.max(0, inventory[u.invIndex].qty - u.qty);
  });

  saveState();
  renderParts();
  renderInventory();
  renderDashboard();

  showToast("Maintenance logged");
  closeCompletePanel();
});

/* ---------------------------------------------------
   AC CALCULATOR
--------------------------------------------------- */
acCalcBtn.addEventListener("click", () => {
  const R = Number(ac_residual.value) / 100;
  const RAPpct = Number(ac_rapPct.value) / 100;
  const ACtarget = Number(ac_target.value) / 100;
  const TPH = Number(ac_tph.value);
  const total = Number(ac_totalTons.value);

  const pump = TPH * (ACtarget - (RAPpct * R));
  const needed = total * (ACtarget - (RAPpct * R));

  ac_pumpRate.textContent = pump.toFixed(3);
  ac_totalAc.textContent = needed.toFixed(2);

  showToast("AC calculated");
});

/* ---------------------------------------------------
   EXPORT DATA
--------------------------------------------------- */
exportBtn.addEventListener("click", () => {
  const data = { parts, currentTons, inventory };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "maintenance_data.json";
  a.click();

  showToast("Exported");
});

/* ---------------------------------------------------
   RESET ALL
--------------------------------------------------- */
resetAllBtn.addEventListener("click", () => {
  if (!confirm("Reset ALL data?")) return;
  localStorage.clear();
  showToast("Reset complete");
  location.reload();
});
