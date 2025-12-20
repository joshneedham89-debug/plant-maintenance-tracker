/* ---------------------------------------------------
   Plant Maintenance Tracker – Gold Baseline (Local)
   Minimal required changes + requested add-ons

   ✅ Tons: Update adds only
   ✅ Reset Tons moved to Settings
   ✅ Problems: Save works with photos (async FileReader fix)
   ✅ PMs: Daily/Weekly by area, history by day, optional photo
   ✅ Supervisor mode: toggle (PM editing + problem status tools)
--------------------------------------------------- */

/* ---------------------------------------------------
   STORAGE KEYS (existing keys kept)
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";

// NEW (isolated – requested)
const PROBLEMS_KEY = "pm_problems";
const PMS_KEY = "pm_pms";
const SETTINGS_KEY = "pm_settings";

/* ---------------------------------------------------
   GLOBAL STATE
--------------------------------------------------- */
let parts = [];
let currentTons = 0;
let categories = [];
let inventory = [];

let problems = [];
let pms = [];
let settings = { supervisor: false };

let editingPartIndex = null;
let editingInventoryIndex = null;

let completingPartIndex = null;
let completionUsedItems = []; // {invIndex, qty}

// Maintenance sub-tabs
let activeMaintTab = "parts"; // parts | pms | problems
let editingPmId = null;
let loggingPmId = null;

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
const resetTonsBtn = document.getElementById("resetTonsBtn"); // moved to Settings

/* Maintenance UI */
const filterCategory = document.getElementById("filterCategory");
const partsList = document.getElementById("partsList");
const addPartBtn = document.getElementById("addPartBtn");
const searchPartsInput = document.getElementById("searchPartsInput");

/* Maintenance tabs + containers */
const maintTabParts = document.getElementById("maintTabParts");
const maintTabPMs = document.getElementById("maintTabPMs");
const maintTabProblems = document.getElementById("maintTabProblems");

const maintPartsControls = document.getElementById("maintPartsControls");
const maintPMControls = document.getElementById("maintPMControls");
const maintProblemsControls = document.getElementById("maintProblemsControls");

const pmList = document.getElementById("pmList");
const problemsList = document.getElementById("problemsList");

const supervisorBadge = document.getElementById("supervisorBadge");

/* PM controls */
const pmAreaFilter = document.getElementById("pmAreaFilter");
const pmFreqFilter = document.getElementById("pmFreqFilter");
const openPMPanelBtn = document.getElementById("openPMPanelBtn");

/* Problems controls */
const problemStatusFilter = document.getElementById("problemStatusFilter");
const openProblemPanelBtn = document.getElementById("openProblemPanelBtn");

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
const supervisorToggle = document.getElementById("supervisorToggle");

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

/* PM Panel */
const pmPanelOverlay = document.getElementById("pmPanelOverlay");
const pmPanel = document.getElementById("pmPanel");
const pmPanelTitle = document.getElementById("pmPanelTitle");
const closePMPanel = document.getElementById("closePMPanel");

const pmArea = document.getElementById("pmArea");
const pmFrequency = document.getElementById("pmFrequency");
const pmTitle = document.getElementById("pmTitle");
const pmNotes = document.getElementById("pmNotes");
const savePMBtn = document.getElementById("savePMBtn");

/* PM Log Panel */
const pmCompleteOverlay = document.getElementById("pmCompleteOverlay");
const pmCompletePanel = document.getElementById("pmCompletePanel");
const closePMComplete = document.getElementById("closePMComplete");
const pmLogDate = document.getElementById("pmLogDate");
const pmLogNotes = document.getElementById("pmLogNotes");
const pmLogPhoto = document.getElementById("pmLogPhoto");
const savePMLogBtn = document.getElementById("savePMLogBtn");

/* Problem Panel */
const problemPanelOverlay = document.getElementById("problemPanelOverlay");
const problemPanel = document.getElementById("problemPanel");
const closeProblemPanel = document.getElementById("closeProblemPanel");

const problemArea = document.getElementById("problemArea");
const problemSeverity = document.getElementById("problemSeverity");
const problemTitle = document.getElementById("problemTitle");
const problemNotes = document.getElementById("problemNotes");
const problemPhotos = document.getElementById("problemPhotos");
const saveProblemBtn = document.getElementById("saveProblemBtn");

/* Toast */
const toastContainer = document.getElementById("toastContainer");
let toastTimeoutId = null;

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
   HELPERS
--------------------------------------------------- */
function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeJsonParse(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("read failed"));
    r.onload = () => resolve(String(r.result || ""));
    r.readAsDataURL(file);
  });
}

// ✅ Fix for “save problem doesn’t save with photo”
async function readFilesAsDataUrls(fileList, maxCount = 4) {
  const files = Array.from(fileList || []).slice(0, maxCount);
  const urls = [];
  for (const f of files) {
    urls.push(await readFileAsDataUrl(f));
  }
  return urls;
}

function setSupervisorUI() {
  if (supervisorToggle) supervisorToggle.checked = !!settings.supervisor;
  if (supervisorBadge) supervisorBadge.classList.toggle("hidden", !settings.supervisor);
}

/* ---------------------------------------------------
   INIT / LOAD / SAVE
--------------------------------------------------- */
function loadState() {
  parts = safeJsonParse(localStorage.getItem(PARTS_KEY), []) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  categories = Array.isArray(PRELOADED_CATEGORIES) ? PRELOADED_CATEGORIES : [];
  const storedInventory = safeJsonParse(localStorage.getItem(INVENTORY_KEY), null);
  inventory = storedInventory?.length ? storedInventory : (PRELOADED_INVENTORY?.slice?.() || []);

  problems = safeJsonParse(localStorage.getItem(PROBLEMS_KEY), []) || [];
  pms = safeJsonParse(localStorage.getItem(PMS_KEY), []) || [];
  settings = safeJsonParse(localStorage.getItem(SETTINGS_KEY), { supervisor: false }) || { supervisor: false };

  // Tons input is now “ADD” amount – keep blank
  if (currentTonsInput) currentTonsInput.value = "";

  buildCategoryDropdown();
  buildInventoryCategoryDropdown();
  buildInventoryNameDatalist();
  buildCompleteInventorySelect();

  buildPmAreaDropdowns();
  buildProblemAreaDropdowns();

  // Seed PMs if empty (safe default list)
  if (!Array.isArray(pms) || pms.length === 0) {
    seedDefaultPMs();
    saveState();
  }

  setSupervisorUI();

  renderDashboard();
  renderParts();
  renderInventory();
  renderPMs();
  renderProblems();

  setMaintenanceTab(activeMaintTab);
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, String(currentTons));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));

  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
  localStorage.setItem(PMS_KEY, JSON.stringify(pms));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

loadState();

/* ---------------------------------------------------
   PWA: Service Worker registration (safe, minimal)
--------------------------------------------------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      // silent fail – app still works without SW
    });
  });
}

/* ---------------------------------------------------
   SCREEN SWITCHING
--------------------------------------------------- */
function showScreen(screenId) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(screenId)?.classList.add("active");

  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === screenId);
  });

  if (screenId === "dashboardScreen") renderDashboard();
  if (screenId === "maintenanceScreen") setMaintenanceTab(activeMaintTab);
  if (screenId === "inventoryScreen") renderInventory();
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

/* ---------------------------------------------------
   TONS (ADD ONLY)
--------------------------------------------------- */
updateTonsBtn?.addEventListener("click", () => {
  const add = Number(currentTonsInput?.value);
  if (!Number.isFinite(add) || add <= 0) {
    showToast("Enter tons to ADD", "error");
    return;
  }

  currentTons = Number(currentTons) + add;
  if (currentTonsInput) currentTonsInput.value = "";
  saveState();
  renderDashboard();
  renderParts();
  showToast(`Added ${add} tons`);
});

resetTonsBtn?.addEventListener("click", () => {
  if (!confirm("Reset Tons to 0?")) return;
  currentTons = 0;
  saveState();
  renderDashboard();
  renderParts();
  showToast("Tons reset");
});

/* ---------------------------------------------------
   DASHBOARD
--------------------------------------------------- */
function renderDashboard() {
  if (!okCountEl) return;

  let ok = 0, due = 0, over = 0;
  let completedToday = 0;
  let completedMonth = 0;

  const today = todayISO();
  const [year, month] = today.split("-");

  parts.forEach(p => {
    const st = calculateStatus(p);
    if (st.status === "ok") ok++;
    else if (st.status === "due") due++;
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

filterCategory?.addEventListener("change", renderParts);
searchPartsInput?.addEventListener("input", renderParts);

/* ---------------------------------------------------
   STATUS CALC
--------------------------------------------------- */
function calculateStatus(p) {
  const daysSince = (Date.now() - new Date(p.date)) / 86400000;
  const tonsSince = currentTons - (Number(p.lastTons) || 0);

  let status = "ok";
  if (daysSince > p.days || tonsSince > p.tonInterval) status = "overdue";
  else if (p.days - daysSince < 5 || p.tonInterval - tonsSince < 500) status = "due";

  return { status, daysSince, tonsSince };
}

/* ---------------------------------------------------
   RENDER PARTS
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
partsList?.addEventListener("click", (e) => {
  const main = e.target.closest(".part-main");
  if (main) {
    const idx = main.dataset.idx;
    document.querySelector(`.part-details[data-details="${idx}"]`)?.classList.toggle("expanded");
    return;
  }

  if (e.target.classList.contains("edit-part-btn")) openPartForEdit(Number(e.target.dataset.idx));
  if (e.target.classList.contains("duplicate-part-btn")) duplicatePart(Number(e.target.dataset.idx));
  if (e.target.classList.contains("delete-part-btn")) deletePart(Number(e.target.dataset.idx));
  if (e.target.classList.contains("complete-btn")) openCompletePanel(Number(e.target.dataset.idx));
});

/* ---------------------------------------------------
   PART: ADD/EDIT PANEL
--------------------------------------------------- */
function openPartPanel(isEdit, index) {
  editingPartIndex = isEdit ? index : null;
  if (partPanelTitle) partPanelTitle.textContent = isEdit ? "Edit Part" : "Add New Part";

  if (newPartCategory) {
    newPartCategory.innerHTML = "";
    categories.forEach(c => (newPartCategory.innerHTML += `<option value="${c}">${c}</option>`));
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

addPartBtn?.addEventListener("click", () => openPartPanel(false, null));
function openPartForEdit(index) { openPartPanel(true, index); }

closePartPanelBtn?.addEventListener("click", closePartPanel);
partPanelOverlay?.addEventListener("click", (e) => { if (e.target === partPanelOverlay) closePartPanel(); });

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
      name, category, section, days, tonInterval,
      date: todayISO(),
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
    date: todayISO(),
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

searchInventoryInput?.addEventListener("input", renderInventory);

inventoryList?.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-inv-btn")) openInventoryForEdit(Number(e.target.dataset.idx));
  if (e.target.classList.contains("delete-inv-btn")) deleteInventoryItem(Number(e.target.dataset.idx));
});

/* ---------------------------------------------------
   INVENTORY: ADD/EDIT PANEL
--------------------------------------------------- */
function openInventoryPanel(isEdit, index) {
  editingInventoryIndex = isEdit ? index : null;
  if (inventoryPanelTitle) inventoryPanelTitle.textContent = isEdit ? "Edit Inventory Item" : "Add Inventory Item";
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

addInventoryBtn?.addEventListener("click", () => openInventoryPanel(false, null));
function openInventoryForEdit(index) { openInventoryPanel(true, index); }

closeInventoryPanelBtn?.addEventListener("click", closeInventoryPanel);
inventoryPanelOverlay?.addEventListener("click", (e) => { if (e.target === inventoryPanelOverlay) closeInventoryPanel(); });

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
  if (editingInventoryIndex !== null && inventory[editingInventoryIndex]) inventory[editingInventoryIndex] = itemData;
  else inventory.push(itemData);

  saveState();
  renderInventory();
  closeInventoryPanel();
  showToast(editingInventoryIndex !== null ? "Inventory updated" : "Inventory added");
});

function deleteInventoryItem(i) {
  if (!confirm("Delete this item?")) return;
  inventory.splice(i, 1);
  saveState();
  renderInventory();
  showToast("Inventory item deleted");
}

/* ---------------------------------------------------
   INVENTORY NAME DATALIST
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

  compDate.value = todayISO();
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

closeCompletePanelBtn?.addEventListener("click", closeCompletePanel);
completePanelOverlay?.addEventListener("click", (e) => { if (e.target === completePanelOverlay) closeCompletePanel(); });

function buildCompleteInventorySelect() {
  if (!compInvSelect) return;
  compInvSelect.innerHTML = `<option value="">Select inventory item</option>`;
  inventory.forEach((item, idx) => {
    compInvSelect.innerHTML += `<option value="${idx}">${item.part} (Qty: ${item.qty})</option>`;
  });
}

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

/* ---------------------------------------------------
   AC CALCULATOR
--------------------------------------------------- */
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

/* ---------------------------------------------------
   SETTINGS: SUPERVISOR TOGGLE
--------------------------------------------------- */
supervisorToggle?.addEventListener("change", () => {
  settings.supervisor = !!supervisorToggle.checked;
  saveState();
  setSupervisorUI();
  renderPMs();
  renderProblems();
  showToast(settings.supervisor ? "Supervisor enabled" : "Supervisor disabled");
});

/* ---------------------------------------------------
   EXPORT DATA
--------------------------------------------------- */
exportBtn?.addEventListener("click", () => {
  const data = { parts, currentTons, inventory, problems, pms, settings };
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
resetAllBtn?.addEventListener("click", () => {
  if (!confirm("Reset ALL data?")) return;
  localStorage.clear();
  showToast("Reset complete");
  location.reload();
});

/* ---------------------------------------------------
   MAINTENANCE TABS
--------------------------------------------------- */
function setMaintenanceTab(tab) {
  activeMaintTab = tab;

  maintTabParts?.classList.toggle("active", tab === "parts");
  maintTabPMs?.classList.toggle("active", tab === "pms");
  maintTabProblems?.classList.toggle("active", tab === "problems");

  maintPartsControls?.classList.toggle("hidden", tab !== "parts");
  maintPMControls?.classList.toggle("hidden", tab !== "pms");
  maintProblemsControls?.classList.toggle("hidden", tab !== "problems");

  partsList?.classList.toggle("hidden", tab !== "parts");
  pmList?.classList.toggle("hidden", tab !== "pms");
  problemsList?.classList.toggle("hidden", tab !== "problems");

  if (tab === "parts") renderParts();
  if (tab === "pms") renderPMs();
  if (tab === "problems") renderProblems();
}

maintTabParts?.addEventListener("click", () => setMaintenanceTab("parts"));
maintTabPMs?.addEventListener("click", () => setMaintenanceTab("pms"));
maintTabProblems?.addEventListener("click", () => setMaintenanceTab("problems"));

/* ---------------------------------------------------
   PMs (NEW)
--------------------------------------------------- */
const PM_AREAS = [
  "Cold Feed",
  "RAP Side",
  "Drum",
  "Drag",
  "Top Silos"
];

function buildPmAreaDropdowns() {
  if (pmAreaFilter) {
    pmAreaFilter.innerHTML =
      `<option value="ALL">All Areas</option>` +
      PM_AREAS.map(a => `<option value="${a}">${a}</option>`).join("");
  }
  if (pmArea) {
    pmArea.innerHTML = PM_AREAS.map(a => `<option value="${a}">${a}</option>`).join("");
  }
}

function seedDefaultPMs() {
  const defaults = [
    { area:"Cold Feed", frequency:"Daily", title:"Walk belts & check tracking", notes:"Look for rub points, frayed edges" },
    { area:"Cold Feed", frequency:"Weekly", title:"Check tail pulleys & guards", notes:"Hardware tight, guards intact" },

    { area:"RAP Side", frequency:"Daily", title:"Check RAP belt tracking / spillage", notes:"Clean build-up" },
    { area:"RAP Side", frequency:"Weekly", title:"Inspect bearings & take-up", notes:"Heat/noise/play" },

    { area:"Drum", frequency:"Daily", title:"Check drum flights / burner area", notes:"Listen for unusual vibration" },
    { area:"Drum", frequency:"Weekly", title:"Inspect trunnions & tires", notes:"Grease points, wear marks" },

    { area:"Drag", frequency:"Daily", title:"Check drag chain & cleanout", notes:"Watch for carryback" },
    { area:"Drag", frequency:"Weekly", title:"Inspect sprockets / reducers", notes:"Oil leaks, alignment" },

    { area:"Top Silos", frequency:"Daily", title:"Check silo gates / air", notes:"Leaks, slow gates" },
    { area:"Top Silos", frequency:"Weekly", title:"Inspect catwalks / handrails", notes:"Loose bolts, trip hazards" }
  ];

  pms = defaults.map(d => ({
    id: uid("pm"),
    area: d.area,
    frequency: d.frequency,
    title: d.title,
    notes: d.notes || "",
    history: []
  }));
}

pmAreaFilter?.addEventListener("change", renderPMs);
pmFreqFilter?.addEventListener("change", renderPMs);

function renderPMs() {
  if (!pmList) return;

  const areaSel = pmAreaFilter?.value || "ALL";
  const freqSel = pmFreqFilter?.value || "ALL";

  const filtered = (pms || []).filter(pm => {
    const areaOk = areaSel === "ALL" || pm.area === areaSel;
    const freqOk = freqSel === "ALL" || pm.frequency === freqSel;
    return areaOk && freqOk;
  });

  pmList.innerHTML = "";

  if (filtered.length === 0) {
    pmList.innerHTML = `<div class="card"><div class="part-meta">No PMs found.</div></div>`;
    return;
  }

  filtered.forEach(pm => {
    const last = (pm.history || []).slice().reverse()[0];
    const lastLine = last ? `Last: ${last.date}${last.notes ? " — " + last.notes : ""}` : "Last: None";

    const card = document.createElement("div");
    card.className = "part-card";

    const canEdit = !!settings.supervisor;

    card.innerHTML = `
      <div class="part-main" data-pmid="${pm.id}">
        <div>
          <div class="part-name">${pm.title}</div>
          <div class="part-meta">${pm.area} — ${pm.frequency}</div>
          <div class="part-meta">${pm.notes || ""}</div>
          <div class="part-meta">${lastLine}</div>
        </div>
        <div class="expand-icon">▼</div>
      </div>

      <div class="part-details" data-pmdetails="${pm.id}">
        <div class="part-actions">
          <button class="pm-log-btn" data-pmid="${pm.id}">Log</button>
          ${canEdit ? `<button class="pm-edit-btn" data-pmid="${pm.id}">Edit</button>` : ""}
          ${canEdit ? `<button class="pm-del-btn" data-pmid="${pm.id}">Delete</button>` : ""}
        </div>

        <div class="part-history">
          <div class="part-meta"><b>History:</b></div>
          ${
            (pm.history || []).slice().reverse().slice(0, 5).map(h => {
              const hasPhoto = !!h.photo;
              return `<div class="part-meta">• ${h.date}${h.notes ? " — " + h.notes : ""}${hasPhoto ? " 📷" : ""}</div>`;
            }).join("") || `<div class="part-meta">No history</div>`
          }
        </div>
      </div>
    `;

    pmList.appendChild(card);
  });
}

pmList?.addEventListener("click", (e) => {
  const main = e.target.closest(".part-main");
  if (main && main.dataset.pmid) {
    const id = main.dataset.pmid;
    document.querySelector(`.part-details[data-pmdetails="${id}"]`)?.classList.toggle("expanded");
    return;
  }

  if (e.target.classList.contains("pm-log-btn")) openPMLog(e.target.dataset.pmid);
  if (e.target.classList.contains("pm-edit-btn")) openPMForEdit(e.target.dataset.pmid);
  if (e.target.classList.contains("pm-del-btn")) deletePM(e.target.dataset.pmid);
});

/* PM Add/Edit Panel */
function openPMPanel(isEdit, id = null) {
  editingPmId = isEdit ? id : null;
  if (pmPanelTitle) pmPanelTitle.textContent = isEdit ? "Edit PM" : "Add PM";

  pmArea.value = PM_AREAS[0] || "Cold Feed";
  pmFrequency.value = "Daily";
  pmTitle.value = "";
  pmNotes.value = "";

  if (isEdit) {
    const pm = (pms || []).find(x => x.id === id);
    if (pm) {
      pmArea.value = pm.area;
      pmFrequency.value = pm.frequency;
      pmTitle.value = pm.title;
      pmNotes.value = pm.notes || "";
    }
  }

  pmPanelOverlay?.classList.remove("hidden");
  setTimeout(() => pmPanel?.classList.add("show"), 10);
}

function closePMPanelFn() {
  pmPanel?.classList.remove("show");
  setTimeout(() => pmPanelOverlay?.classList.add("hidden"), 250);
}

openPMPanelBtn?.addEventListener("click", () => {
  if (!settings.supervisor) {
    showToast("Enable Supervisor Mode to add/edit PMs", "error");
    return;
  }
  openPMPanel(false, null);
});

closePMPanel?.addEventListener("click", closePMPanelFn);
pmPanelOverlay?.addEventListener("click", (e) => { if (e.target === pmPanelOverlay) closePMPanelFn(); });

function openPMForEdit(id) {
  if (!settings.supervisor) return;
  openPMPanel(true, id);
}

savePMBtn?.addEventListener("click", () => {
  if (!settings.supervisor) return showToast("Supervisor only", "error");

  const areaVal = (pmArea?.value || "").trim();
  const freqVal = (pmFrequency?.value || "").trim();
  const titleVal = (pmTitle?.value || "").trim();
  const notesVal = (pmNotes?.value || "").trim();

  if (!areaVal || !freqVal || !titleVal) {
    showToast("Fill area/frequency/title", "error");
    return;
  }

  if (editingPmId) {
    const pm = pms.find(x => x.id === editingPmId);
    if (pm) {
      pm.area = areaVal;
      pm.frequency = freqVal;
      pm.title = titleVal;
      pm.notes = notesVal;
    }
  } else {
    pms.push({
      id: uid("pm"),
      area: areaVal,
      frequency: freqVal,
      title: titleVal,
      notes: notesVal,
      history: []
    });
  }

  saveState();
  renderPMs();
  closePMPanelFn();
  showToast(editingPmId ? "PM updated" : "PM added");
});

function deletePM(id) {
  if (!settings.supervisor) return;
  if (!confirm("Delete this PM?")) return;
  pms = pms.filter(x => x.id !== id);
  saveState();
  renderPMs();
  showToast("PM deleted");
}

/* PM Log Panel */
function openPMLog(id) {
  loggingPmId = id;
  pmLogDate.value = todayISO();
  pmLogNotes.value = "";
  pmLogPhoto.value = "";

  pmCompleteOverlay?.classList.remove("hidden");
  setTimeout(() => pmCompletePanel?.classList.add("show"), 10);
}

function closePMLog() {
  pmCompletePanel?.classList.remove("show");
  setTimeout(() => pmCompleteOverlay?.classList.add("hidden"), 250);
}

closePMComplete?.addEventListener("click", closePMLog);
pmCompleteOverlay?.addEventListener("click", (e) => { if (e.target === pmCompleteOverlay) closePMLog(); });

savePMLogBtn?.addEventListener("click", async () => {
  const pm = pms.find(x => x.id === loggingPmId);
  if (!pm) return;

  const date = (pmLogDate?.value || "").trim();
  if (!date) return showToast("Pick a date", "error");

  const notes = (pmLogNotes?.value || "").trim();
  let photo = "";

  const file = pmLogPhoto?.files?.[0];
  if (file) {
    try {
      photo = await readFileAsDataUrl(file);
    } catch {
      showToast("Photo failed to load", "error");
      return;
    }
  }

  if (!pm.history) pm.history = [];
  pm.history.push({ date, notes, photo });

  saveState();
  renderPMs();
  closePMLog();
  showToast("PM logged");
});

/* ---------------------------------------------------
   PROBLEMS (NEW)
--------------------------------------------------- */
function buildProblemAreaDropdowns() {
  if (problemArea) {
    problemArea.innerHTML = PM_AREAS.map(a => `<option value="${a}">${a}</option>`).join("");
  }
}

problemStatusFilter?.addEventListener("change", renderProblems);

function statusPill(status) {
  if (status === "Resolved") return `<span class="pill pill-resolved">Resolved</span>`;
  if (status === "In Progress") return `<span class="pill pill-progress">In Progress</span>`;
  return `<span class="pill pill-open">Open</span>`;
}

function renderProblems() {
  if (!problemsList) return;

  const sel = problemStatusFilter?.value || "ALL";
  const list = (problems || []).slice().reverse().filter(p => sel === "ALL" || (p.status || "Open") === sel);

  problemsList.innerHTML = "";

  if (list.length === 0) {
    problemsList.innerHTML = `<div class="card"><div class="part-meta">No problems.</div></div>`;
    return;
  }

  list.forEach(pr => {
    const card = document.createElement("div");
    card.className = "part-card";

    const created = pr.createdAt ? pr.createdAt.split("T")[0] : "";
    const status = pr.status || "Open";

    const thumbs = (pr.photos || []).slice(0, 4)
      .map(src => `<img class="thumb" src="${src}" alt="photo">`).join("");

    const supervisorTools = settings.supervisor ? `
      <div class="part-actions">
        <button class="pr-status-btn" data-id="${pr.id}" data-status="Open">Open</button>
        <button class="pr-status-btn" data-id="${pr.id}" data-status="In Progress">In Progress</button>
        <button class="pr-status-btn" data-id="${pr.id}" data-status="Resolved">Resolved</button>
        <button class="pr-del-btn" data-id="${pr.id}">Delete</button>
      </div>
    ` : "";

    card.innerHTML = `
      <div class="part-main" data-prid="${pr.id}">
        <div>
          <div class="part-name">${pr.title || "Problem"}</div>
          <div class="part-meta">${pr.area} — Severity: ${pr.severity || "Medium"}</div>
          <div class="part-meta">Created: ${created}</div>
          <div class="part-meta">Status: ${statusPill(status)}</div>
        </div>
        <div class="expand-icon">▼</div>
      </div>

      <div class="part-details" data-prdetails="${pr.id}">
        <div class="part-meta">${pr.notes || ""}</div>
        ${thumbs ? `<div class="thumb-row">${thumbs}</div>` : `<div class="part-meta">No photos</div>`}
        ${supervisorTools}
      </div>
    `;

    problemsList.appendChild(card);
  });
}

problemsList?.addEventListener("click", (e) => {
  const main = e.target.closest(".part-main");
  if (main && main.dataset.prid) {
    const id = main.dataset.prid;
    document.querySelector(`.part-details[data-prdetails="${id}"]`)?.classList.toggle("expanded");
    return;
  }

  if (e.target.classList.contains("pr-status-btn")) {
    if (!settings.supervisor) return;
    const id = e.target.dataset.id;
    const status = e.target.dataset.status;
    const pr = problems.find(x => x.id === id);
    if (pr) {
      pr.status = status;
      saveState();
      renderProblems();
      showToast("Status updated");
    }
  }

  if (e.target.classList.contains("pr-del-btn")) {
    if (!settings.supervisor) return;
    const id = e.target.dataset.id;
    if (!confirm("Delete this problem?")) return;
    problems = problems.filter(x => x.id !== id);
    saveState();
    renderProblems();
    showToast("Problem deleted");
  }
});

/* Problem Panel */
function openProblemPanel() {
  problemArea.value = PM_AREAS[0] || "Cold Feed";
  problemSeverity.value = "Medium";
  problemTitle.value = "";
  problemNotes.value = "";
  problemPhotos.value = "";

  problemPanelOverlay?.classList.remove("hidden");
  setTimeout(() => problemPanel?.classList.add("show"), 10);
}

function closeProblemPanelFn() {
  problemPanel?.classList.remove("show");
  setTimeout(() => problemPanelOverlay?.classList.add("hidden"), 250);
}

openProblemPanelBtn?.addEventListener("click", openProblemPanel);

closeProblemPanel?.addEventListener("click", closeProblemPanelFn);
problemPanelOverlay?.addEventListener("click", (e) => { if (e.target === problemPanelOverlay) closeProblemPanelFn(); });

saveProblemBtn?.addEventListener("click", async () => {
  const areaVal = (problemArea?.value || "").trim();
  const sevVal = (problemSeverity?.value || "").trim();
  const titleVal = (problemTitle?.value || "").trim();
  const notesVal = (problemNotes?.value || "").trim();

  if (!areaVal || !titleVal) {
    showToast("Fill area + title", "error");
    return;
  }

  let photoUrls = [];
  try {
    photoUrls = await readFilesAsDataUrls(problemPhotos?.files, 4);
  } catch {
    showToast("Photo failed to load", "error");
    return;
  }

  problems.push({
    id: uid("pr"),
    area: areaVal,
    severity: sevVal || "Medium",
    title: titleVal,
    notes: notesVal,
    status: "Open",
    createdAt: new Date().toISOString(),
    photos: photoUrls
  });

  saveState();
  renderProblems();
  closeProblemPanelFn();
  showToast("Problem saved");
});
