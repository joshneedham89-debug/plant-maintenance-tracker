/* ---------------------------------------------------
   STORAGE KEYS
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";

/* NEW: daily rollover key */
const DAY_ROLLOVER_KEY = "pm_rollover_day";

/* ---------------------------------------------------
   GLOBAL STATE
--------------------------------------------------- */
let parts = [];
let currentTons = 0;
let categories = [];
let inventory = [];

let editingPartIndex = null;
let editingInventoryIndex = null;

let completingPartIndex = null;
let completionUsedItems = []; // {invIndex, qty}

/* ---------------------------------------------------
   ELEMENT REFERENCES
   (initialized on DOMContentLoaded to fix tabs reliably)
--------------------------------------------------- */
let screens = [];
let navButtons = [];

/* Dashboard UI */
let okCountEl, dueCountEl, overCountEl, tonsRunEl, completedTodayEl, completedMonthEl;

/* Tons */
let currentTonsInput, updateTonsBtn, resetTonsBtn;

/* Maintenance UI */
let filterCategory, partsList, addPartBtn, searchPartsInput;

/* Inventory UI */
let inventoryList, addInventoryBtn, searchInventoryInput;

/* AC Calculator */
let ac_residual, ac_rapPct, ac_target, ac_tph, ac_totalTons, acCalcBtn, ac_pumpRate, ac_totalAc;

/* Settings */
let exportBtn, resetAllBtn;

/* Add/Edit Part Panel (overlay version in your HTML) */
let partPanelOverlay, addPartPanel, closePartPanelBtn, partPanelTitle;
let newPartName, newPartCategory, newPartSection, newPartDays, newPartTons, savePartBtn, inventoryNameList;

/* Inventory Panel (overlay version in your HTML) */
let inventoryPanelOverlay, inventoryPanel, closeInventoryPanelBtn, inventoryPanelTitle;
let invPartName, invCategory, invLocation, invQty, invNotes, saveInventoryBtn;

/* Complete Maintenance Panel */
let completePanelOverlay, completePanel, closeCompletePanelBtn;
let compDate, compTons, compNotes, compInvSelect, compInvQty, compAddItemBtn, compUsedList, saveCompletionBtn;

/* Toast */
let toastContainer;
let toastTimeoutId = null;

/* ---------------------------------------------------
   HELPERS
--------------------------------------------------- */
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function addDaysToISO(isoDate, daysToAdd) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Number(daysToAdd || 0));
  return d.toISOString().split("T")[0];
}

/* ---------------------------------------------------
   TOAST
--------------------------------------------------- */
function showToast(message, type = "success") {
  if (!toastContainer) return;

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
   DAILY ROLLOVER (PM auto-rollover / daily reset hook)
--------------------------------------------------- */
function handleDailyRollover() {
  const today = todayStr();
  const last = localStorage.getItem(DAY_ROLLOVER_KEY);

  if (last !== today) {
    localStorage.setItem(DAY_ROLLOVER_KEY, today);

    // If you later add "daily PM checklist checkboxes", this is where you reset them.
    // For now we just refresh renders so "Due Today" and counts are always correct.
  }
}

/* ---------------------------------------------------
   INIT
--------------------------------------------------- */
function initDomRefs() {
  screens = Array.from(document.querySelectorAll(".screen"));
  navButtons = Array.from(document.querySelectorAll(".nav-btn"));

  okCountEl = document.getElementById("okCount");
  dueCountEl = document.getElementById("dueCount");
  overCountEl = document.getElementById("overCount");
  tonsRunEl = document.getElementById("tonsRun");
  completedTodayEl = document.getElementById("completedTodayCount");
  completedMonthEl = document.getElementById("completedMonthCount");

  currentTonsInput = document.getElementById("currentTonsInput");
  updateTonsBtn = document.getElementById("updateTonsBtn");
  resetTonsBtn = document.getElementById("resetTonsBtn");

  filterCategory = document.getElementById("filterCategory");
  partsList = document.getElementById("partsList");
  addPartBtn = document.getElementById("addPartBtn");
  searchPartsInput = document.getElementById("searchPartsInput");

  inventoryList = document.getElementById("inventoryList");
  addInventoryBtn = document.getElementById("addInventoryBtn");
  searchInventoryInput = document.getElementById("searchInventoryInput");

  ac_residual = document.getElementById("ac_residual");
  ac_rapPct = document.getElementById("ac_rapPct");
  ac_target = document.getElementById("ac_target");
  ac_tph = document.getElementById("ac_tph");
  ac_totalTons = document.getElementById("ac_totalTons");
  acCalcBtn = document.getElementById("acCalcBtn");
  ac_pumpRate = document.getElementById("ac_pumpRate");
  ac_totalAc = document.getElementById("ac_totalAc");

  exportBtn = document.getElementById("exportBtn");
  resetAllBtn = document.getElementById("resetAllBtn");

  partPanelOverlay = document.getElementById("partPanelOverlay");
  addPartPanel = document.getElementById("addPartPanel");
  closePartPanelBtn = document.getElementById("closePartPanel");
  partPanelTitle = document.getElementById("partPanelTitle");

  newPartName = document.getElementById("newPartName");
  newPartCategory = document.getElementById("newPartCategory");
  newPartSection = document.getElementById("newPartSection");
  newPartDays = document.getElementById("newPartDays");
  newPartTons = document.getElementById("newPartTons");
  savePartBtn = document.getElementById("savePartBtn");
  inventoryNameList = document.getElementById("inventoryNameList");

  inventoryPanelOverlay = document.getElementById("inventoryPanelOverlay");
  inventoryPanel = document.getElementById("inventoryPanel");
  closeInventoryPanelBtn = document.getElementById("closeInventoryPanel");
  inventoryPanelTitle = document.getElementById("inventoryPanelTitle");

  invPartName = document.getElementById("invPartName");
  invCategory = document.getElementById("invCategory");
  invLocation = document.getElementById("invLocation");
  invQty = document.getElementById("invQty");
  invNotes = document.getElementById("invNotes");
  saveInventoryBtn = document.getElementById("saveInventoryBtn");

  completePanelOverlay = document.getElementById("completePanelOverlay");
  completePanel = document.getElementById("completePanel");
  closeCompletePanelBtn = document.getElementById("closeCompletePanel");

  compDate = document.getElementById("compDate");
  compTons = document.getElementById("compTons");
  compNotes = document.getElementById("compNotes");
  compInvSelect = document.getElementById("compInvSelect");
  compInvQty = document.getElementById("compInvQty");
  compAddItemBtn = document.getElementById("compAddItemBtn");
  compUsedList = document.getElementById("compUsedList");
  saveCompletionBtn = document.getElementById("saveCompletionBtn");

  toastContainer = document.getElementById("toastContainer");
}

function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  // categories + default inventory come from inventory.js
  categories = Array.isArray(PRELOADED_CATEGORIES) ? PRELOADED_CATEGORIES : [];

  const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY));
  inventory = storedInventory?.length ? storedInventory : (PRELOADED_INVENTORY?.slice?.() || []);

  if (currentTonsInput) currentTonsInput.value = currentTons;

  buildCategoryDropdown();
  buildInventoryCategoryDropdown();
  buildInventoryNameDatalist();
  buildCompleteInventorySelect();

  renderDashboard();
  renderParts();
  renderInventory();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, String(currentTons));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

/* ---------------------------------------------------
   SCREEN SWITCHING (tabs fix)
--------------------------------------------------- */
function showScreen(screenId) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(screenId)?.classList.add("active");

  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === screenId);
  });

  if (screenId === "dashboardScreen") renderDashboard();
  if (screenId === "maintenanceScreen") renderParts();
  if (screenId === "inventoryScreen") renderInventory();
}

function bindNavTabs() {
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => showScreen(btn.dataset.screen));
  });
}

/* ---------------------------------------------------
   TONS
--------------------------------------------------- */
function bindTonsButtons() {
  updateTonsBtn?.addEventListener("click", () => {
    // Keep your existing behavior (set tons to entered value)
    currentTons = Number(currentTonsInput.value) || 0;
    saveState();
    renderDashboard();
    renderParts();
    showToast("Tons updated");
  });

  resetTonsBtn?.addEventListener("click", () => {
    currentTons = 0;
    if (currentTonsInput) currentTonsInput.value = 0;
    saveState();
    renderDashboard();
    renderParts();
    showToast("Tons reset");
  });
}

/* ---------------------------------------------------
   DASHBOARD
--------------------------------------------------- */
function renderDashboard() {
  if (!okCountEl) return;

  let ok = 0, due = 0, over = 0;
  let completedToday = 0;
  let completedMonth = 0;

  const today = todayStr();
  const [year, month] = today.split("-");

  parts.forEach(p => {
    const st = calculateStatus(p);

    if (st.status === "ok") ok++;
    else if (st.status === "due" || st.status === "duetoday") due++;
    else over++;

    if (Array.isArray(p.history)) {
      p.history.forEach(h => {
        if (h.date === today) completedToday++;
        const [hy, hm] = (h.date || "").split("-");
        if (hy === year && hm === month) completedMonth++;
      });
    }
  });

  okCountEl.textContent = ok;
  dueCountEl.textContent = due;
  overCountEl.textContent = over;
  if (tonsRunEl) tonsRunEl.textContent = currentTons;

  if (completedTodayEl) completedTodayEl.textContent = completedToday;
  if (completedMonthEl) completedMonthEl.textContent = completedMonth;
}

/* ---------------------------------------------------
   CATEGORY DROPDOWNS
--------------------------------------------------- */
function buildCategoryDropdown() {
  if (!filterCategory) return;
  filterCategory.innerHTML = `<option value="ALL">All Categories</option>`;
  categories.forEach(c => {
    filterCategory.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function buildInventoryCategoryDropdown() {
  if (!invCategory) return;
  invCategory.innerHTML = "";
  categories.forEach(c => {
    invCategory.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function bindMaintenanceFilters() {
  filterCategory?.addEventListener("change", renderParts);
  searchPartsInput?.addEventListener("input", renderParts);
}

/* ---------------------------------------------------
   STATUS CALC (adds "DUE TODAY")
--------------------------------------------------- */
function calculateStatus(p) {
  const lastDate = p.date;
  const daysInterval = Number(p.days) || 0;

  const daysSince = (Date.now() - new Date(lastDate)) / 86400000;
  const tonsSince = currentTons - (Number(p.lastTons) || 0);

  const dueDate = lastDate ? addDaysToISO(lastDate, daysInterval) : "";
  const isDueTodayByDays = !!dueDate && dueDate === todayStr();

  let status = "ok";

  // overdue first
  if ((daysInterval > 0 && daysSince > daysInterval) || (Number(p.tonInterval) > 0 && tonsSince > Number(p.tonInterval))) {
    status = "overdue";
  } else if (isDueTodayByDays) {
    // NEW: due today (days-based)
    status = "duetoday";
  } else {
    // due soon
    const daysLeft = daysInterval - daysSince;
    const tonsLeft = Number(p.tonInterval) - tonsSince;

    if (daysLeft < 5 || tonsLeft < 500) status = "due";
  }

  return { status, daysSince, tonsSince, dueDate, isDueTodayByDays };
}

/* ---------------------------------------------------
   RENDER PARTS (shows DUE TODAY pill)
--------------------------------------------------- */
function renderParts() {
  if (!partsList) return;

  const selected = filterCategory?.value || "ALL";
  const query = (searchPartsInput?.value || "").toLowerCase().trim();

  partsList.innerHTML = "";

  parts.forEach((p, idx) => {
    const st = calculateStatus(p);

    const matchesCategory = selected === "ALL" || p.category === selected;
    const matchesSearch =
      !query ||
      (p.name || "").toLowerCase().includes(query) ||
      (p.category || "").toLowerCase().includes(query) ||
      (p.section || "").toLowerCase().includes(query);

    if (!matchesCategory || !matchesSearch) return;

    const historyHtml = (p.history || [])
      .slice().reverse().slice(0, 2)
      .map(h => `<div class="part-meta">• ${h.date} – ${h.tons} tons</div>`)
      .join("") || `<div class="part-meta">No history</div>`;

    const card = document.createElement("div");
    const cardStatusClass = (st.status === "duetoday") ? "status-duetoday" : `status-${st.status}`;
    card.className = `part-card ${cardStatusClass}`;

    const pills = [];
    if (st.status === "duetoday") pills.push(`<span class="pill today">DUE TODAY</span>`);
    if (st.status === "overdue") pills.push(`<span class="pill overdue">OVERDUE</span>`);

    card.innerHTML = `
      <div class="part-main" data-idx="${idx}">
        <div>
          <div class="part-name">${p.name}</div>
          <div class="part-meta">${p.category} — ${p.section}</div>
          <div class="part-meta">Last: ${p.date}</div>
          ${st.dueDate ? `<div class="part-meta">Next Due: ${st.dueDate}</div>` : ``}
          <div class="part-meta">Status: <b>${String(st.status).toUpperCase()}</b></div>
          ${pills.length ? `<div class="pills-row">${pills.join("")}</div>` : ``}
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
function bindPartsListClicks() {
  partsList?.addEventListener("click", (e) => {
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
}

/* ---------------------------------------------------
   PART: ADD/EDIT PANEL (overlay)
--------------------------------------------------- */
function openPartPanel(isEdit, index) {
  editingPartIndex = isEdit ? index : null;

  if (partPanelTitle) partPanelTitle.textContent = isEdit ? "Edit Part" : "Add New Part";

  // categories dropdown for the panel
  if (newPartCategory) {
    newPartCategory.innerHTML = "";
    categories.forEach(c => {
      newPartCategory.innerHTML += `<option value="${c}">${c}</option>`;
    });
  }

  if (isEdit && parts[index]) {
    const p = parts[index];
    newPartName.value = p.name || "";
    newPartCategory.value = p.category || (categories[0] || "");
    newPartSection.value = p.section || "";
    newPartDays.value = p.days ?? "";
    newPartTons.value = p.tonInterval ?? "";
  } else {
    newPartName.value = "";
    newPartSection.value = "";
    newPartDays.value = "";
    newPartTons.value = "";
    if (categories.length) newPartCategory.value = categories[0];
  }

  partPanelOverlay?.classList.remove("hidden");
  setTimeout(() => addPartPanel?.classList.add("show"), 10);
}

function closePartPanel() {
  addPartPanel?.classList.remove("show");
  setTimeout(() => partPanelOverlay?.classList.add("hidden"), 250);
}

function bindPartPanel() {
  addPartBtn?.addEventListener("click", () => openPartPanel(false, null));
  closePartPanelBtn?.addEventListener("click", closePartPanel);
  partPanelOverlay?.addEventListener("click", (e) => {
    if (e.target === partPanelOverlay) closePartPanel();
  });

  // If user selects an inventory name, auto-set category
  newPartName?.addEventListener("change", () => {
    const name = newPartName.value.toLowerCase().trim();
    const match = inventory.find(item => (item.part || "").toLowerCase() === name);
    if (match && newPartCategory) newPartCategory.value = match.category;
  });

  savePartBtn?.addEventListener("click", () => {
    const name = newPartName.value.trim();
    const category = newPartCategory.value;
    const section = newPartSection.value.trim();
    const days = Number(newPartDays.value);
    const tonInterval = Number(newPartTons.value);

    if (!name || !category || !section || !days || !tonInterval) {
      showToast("Fill all 5 fields", "error");
      return;
    }

    if (editingPartIndex !== null && parts[editingPartIndex]) {
      const existing = parts[editingPartIndex];
      parts[editingPartIndex] = { ...existing, name, category, section, days, tonInterval };
    } else {
      parts.push({
        name,
        category,
        section,
        days,
        tonInterval,
        date: todayStr(),
        lastTons: currentTons,
        history: []
      });
    }

    saveState();
    renderParts();
    renderDashboard();
    closePartPanel();
    showToast(editingPartIndex !== null ? "Part updated" : "Part added");
  });
}

function openPartForEdit(index) { openPartPanel(true, index); }

/* ---------------------------------------------------
   DELETE / DUPLICATE PART
--------------------------------------------------- */
function deletePart(i) {
  if (!confirm("Delete this part?")) return;
  parts.splice(i, 1);
  saveState();
  renderParts();
  renderDashboard();
  showToast("Part deleted");
}

function duplicatePart(i) {
  const p = parts[i];
  if (!p) return;

  parts.push({
    ...p,
    name: p.name + " (Copy)",
    date: todayStr(),
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
  if (!inventoryList) return;

  const query = (searchInventoryInput?.value || "").toLowerCase().trim();
  inventoryList.innerHTML = "";

  inventory.forEach((item, idx) => {
    const matchesSearch =
      !query ||
      (item.part || "").toLowerCase().includes(query) ||
      (item.category || "").toLowerCase().includes(query) ||
      (item.location || "").toLowerCase().includes(query);

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

  buildInventoryNameDatalist();
  buildCompleteInventorySelect();
}

function bindInventorySearch() {
  searchInventoryInput?.addEventListener("input", renderInventory);

  inventoryList?.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-inv-btn"))
      openInventoryForEdit(Number(e.target.dataset.idx));

    if (e.target.classList.contains("delete-inv-btn"))
      deleteInventoryItem(Number(e.target.dataset.idx));
  });
}

/* ---------------------------------------------------
   INVENTORY: ADD/EDIT PANEL (overlay)
--------------------------------------------------- */
function openInventoryPanel(isEdit, index) {
  editingInventoryIndex = isEdit ? index : null;

  if (inventoryPanelTitle) {
    inventoryPanelTitle.textContent = isEdit ? "Edit Inventory Item" : "Add Inventory Item";
  }

  buildInventoryCategoryDropdown();

  if (isEdit && inventory[index]) {
    const item = inventory[index];
    invPartName.value = item.part || "";
    invCategory.value = item.category || (categories[0] || "");
    invLocation.value = item.location || "";
    invQty.value = item.qty ?? "";
    invNotes.value = item.notes || "";
  } else {
    invPartName.value = "";
    invLocation.value = "";
    invQty.value = "";
    invNotes.value = "";
    if (categories.length) invCategory.value = categories[0];
  }

  inventoryPanelOverlay?.classList.remove("hidden");
  setTimeout(() => inventoryPanel?.classList.add("show"), 10);
}

function closeInventoryPanel() {
  inventoryPanel?.classList.remove("show");
  setTimeout(() => inventoryPanelOverlay?.classList.add("hidden"), 250);
}

function bindInventoryPanel() {
  addInventoryBtn?.addEventListener("click", () => openInventoryPanel(false, null));
  closeInventoryPanelBtn?.addEventListener("click", closeInventoryPanel);
  inventoryPanelOverlay?.addEventListener("click", (e) => {
    if (e.target === inventoryPanelOverlay) closeInventoryPanel();
  });

  saveInventoryBtn?.addEventListener("click", () => {
    const part = invPartName.value.trim();
    const category = invCategory.value;
    const location = invLocation.value.trim();
    const qty = Number(invQty.value);
    const notes = invNotes.value.trim();

    if (!part || !category || !location || !Number.isFinite(qty)) {
      showToast("Fill part/category/location/qty", "error");
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
    closeInventoryPanel();
    showToast(editingInventoryIndex !== null ? "Inventory updated" : "Inventory added");
  });
}

function openInventoryForEdit(index) { openInventoryPanel(true, index); }

function deleteInventoryItem(i) {
  if (!confirm("Delete this item?")) return;
  inventory.splice(i, 1);
  saveState();
  renderInventory();
  showToast("Inventory item deleted");
}

/* ---------------------------------------------------
   INVENTORY NAME DATALIST (sync into parts)
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
   COMPLETE MAINTENANCE PANEL
--------------------------------------------------- */
function openCompletePanel(i) {
  completingPartIndex = i;
  completionUsedItems = [];

  const today = todayStr();
  compDate.value = today;
  compTons.value = currentTons;
  compNotes.value = "";

  buildCompleteInventorySelect();
  compUsedList.innerHTML = "";

  completePanelOverlay?.classList.remove("hidden");
  setTimeout(() => completePanel?.classList.add("show"), 10);
}

function closeCompletePanel() {
  completePanel?.classList.remove("show");
  setTimeout(() => completePanelOverlay?.classList.add("hidden"), 250);
}

function buildCompleteInventorySelect() {
  if (!compInvSelect) return;
  compInvSelect.innerHTML = `<option value="">Select inventory item</option>`;
  inventory.forEach((item, idx) => {
    compInvSelect.innerHTML += `<option value="${idx}">
      ${item.part} (Qty: ${item.qty})
    </option>`;
  });
}

function bindCompletePanel() {
  closeCompletePanelBtn?.addEventListener("click", closeCompletePanel);
  completePanelOverlay?.addEventListener("click", (e) => {
    if (e.target === completePanelOverlay) closeCompletePanel();
  });

  compAddItemBtn?.addEventListener("click", () => {
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

  saveCompletionBtn?.addEventListener("click", () => {
    const p = parts[completingPartIndex];
    if (!p) return;

    const date = compDate.value;
    const tons = Number(compTons.value);
    const notes = (compNotes.value || "").trim();

    if (!date || isNaN(tons)) return showToast("Enter date + tons", "error");

    const historyEntry = {
      date,
      tons,
      notes,
      usedItems: completionUsedItems.map(u => ({
        part: inventory[u.invIndex]?.part || "Unknown",
        qty: u.qty
      }))
    };

    if (!p.history) p.history = [];
    p.history.push(historyEntry);

    p.date = date;
    p.lastTons = tons;

    completionUsedItems.forEach(u => {
      if (!inventory[u.invIndex]) return;
      inventory[u.invIndex].qty = Math.max(0, Number(inventory[u.invIndex].qty) - u.qty);
    });

    saveState();
    renderParts();
    renderInventory();
    renderDashboard();

    showToast("Maintenance logged");
    closeCompletePanel();
  });
}

/* ---------------------------------------------------
   AC CALCULATOR
--------------------------------------------------- */
function bindAcCalc() {
  acCalcBtn?.addEventListener("click", () => {
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
}

/* ---------------------------------------------------
   EXPORT DATA
--------------------------------------------------- */
function bindExport() {
  exportBtn?.addEventListener("click", () => {
    const data = { parts, currentTons, inventory };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "maintenance_data.json";
    a.click();

    showToast("Exported");
  });
}

/* ---------------------------------------------------
   RESET ALL
--------------------------------------------------- */
function bindResetAll() {
  resetAllBtn?.addEventListener("click", () => {
    if (!confirm("Reset ALL data?")) return;
    localStorage.clear();
    showToast("Reset complete");
    location.reload();
  });
}

/* ---------------------------------------------------
   STARTUP (fix tabs + ensure daily rollover runs)
--------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initDomRefs();
  handleDailyRollover();

  // bind UI events first (tabs/buttons reliable)
  bindNavTabs();
  bindTonsButtons();
  bindMaintenanceFilters();
  bindPartsListClicks();
  bindPartPanel();

  bindInventorySearch();
  bindInventoryPanel();

  bindCompletePanel();
  bindAcCalc();
  bindExport();
  bindResetAll();

  // load data + initial render
  loadState();
});
