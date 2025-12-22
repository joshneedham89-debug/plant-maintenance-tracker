/* =====================================================
   Plant Maintenance Tracker — GOLD BASELINE + FIX PACK
   Fixes:
   - Maintenance sub-tabs click binding (Parts / PMs / Problems)
   - Dashboard "Report a Problem" restored (original behavior)
   - Maintenance completion photos restored (optional)
   - Supervisor toggle refreshes all screens so it “actually works”
===================================================== */

/* ---------------------------------------------------
   STORAGE KEYS
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";

// PM + Problems
const PROBLEMS_KEY = "pm_problems";
const PMS_KEY = "pm_pms";
const SETTINGS_KEY = "pm_settings";

/* ---------------------------------------------------
   GLOBAL STATE
--------------------------------------------------- */
let parts = [];
let currentTons = 0;
let categories = Array.isArray(window.PRELOADED_CATEGORIES) ? PRELOADED_CATEGORIES : [];

let inventory = [];
let problems = [];
let pms = [];
let settings = { supervisor: false };

let editingPartIndex = null;
let editingInventoryIndex = null;

let completingPartIndex = null;
let completionUsedItems = []; // {invIndex, qty}
let completionPhotos = [];    // RESTORED: completion photo dataURLs

// Maintenance sub-tabs
let activeMaintTab = "parts"; // parts | pms | problems
let editingPmId = null;
let loggingPmId = null;

/* ---------------------------------------------------
   ELEMENT REFERENCES
--------------------------------------------------- */
const screens = Array.from(document.querySelectorAll(".screen"));
const navButtons = Array.from(document.querySelectorAll(".nav-btn"));

/* Dashboard UI */
const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const tonsRunEl = document.getElementById("tonsRun");
const completedTodayEl = document.getElementById("completedTodayCount");
const completedMonthEl = document.getElementById("completedMonthCount");
const openProblemsCountEl = document.getElementById("openProblemsCount");

/* Tons */
const currentTonsInput = document.getElementById("currentTonsInput");
const updateTonsBtn = document.getElementById("updateTonsBtn");
const resetTonsBtn = document.getElementById("resetTonsBtn");

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
const supervisorBadge = document.getElementById("supervisorBadge");

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

// RESTORED: Maintenance photo controls
const compAddPhotoBtn = document.getElementById("compAddPhotoBtn");
const compPhotoInput = document.getElementById("compPhotoInput");
const compPhotoPreview = document.getElementById("compPhotoPreview");

/* PM controls */
const pmAreaFilter = document.getElementById("pmAreaFilter");
const openPMLogPanelBtn = document.getElementById("openPMLogPanelBtn");

const pmLogPanelOverlay = document.getElementById("pmLogPanelOverlay");
const pmLogPanel = document.getElementById("pmLogPanel");
const pmLogPanelTitle = document.getElementById("pmLogPanelTitle");
const closePMLogPanel = document.getElementById("closePMLogPanel");
const pmLogDate = document.getElementById("pmLogDate");
const pmLogNotes = document.getElementById("pmLogNotes");
const pmLogPhoto = document.getElementById("pmLogPhoto");
const savePMLogBtn = document.getElementById("savePMLogBtn");

/* Problem controls */
const problemStatusFilter = document.getElementById("problemStatusFilter");
const openProblemPanelBtn = document.getElementById("openProblemPanelBtn");
const openProblemPanelBtnDash = document.getElementById("openProblemPanelBtnDash");

const problemPanelOverlay = document.getElementById("problemPanelOverlay");
const problemPanel = document.getElementById("problemPanel");
const problemPanelTitle = document.getElementById("problemPanelTitle");
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
   HELPERS
--------------------------------------------------- */
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function showToast(message, type = "success") {
  if (!toastContainer) return;
  toastContainer.textContent = message;
  toastContainer.className = "toast " + type;
  void toastContainer.offsetWidth;
  toastContainer.classList.add("show");
  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => toastContainer.classList.remove("show"), 2500);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function readFilesAsDataUrls(fileList, maxCount = 4) {
  const files = Array.from(fileList || []).slice(0, maxCount);
  const urls = [];
  for (const f of files) {
    urls.push(await readFileAsDataUrl(f));
  }
  return urls;
}

/* ---------------------------------------------------
   STATE
--------------------------------------------------- */
function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, String(currentTons));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
  localStorage.setItem(PMS_KEY, JSON.stringify(pms));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY));
  inventory = storedInventory?.length ? storedInventory : (PRELOADED_INVENTORY?.slice?.() || []);

  problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];
  pms = JSON.parse(localStorage.getItem(PMS_KEY)) || [];

  const storedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
  if (storedSettings && typeof storedSettings === "object") settings = { ...settings, ...storedSettings };

  if (currentTonsInput) currentTonsInput.value = "";

  seedDefaultPMsIfEmpty();
  setSupervisorUI();

  buildCategoryDropdowns();
  buildInventoryNameDatalist();
  buildProblemAreasDropdown();
  buildPmAreaDropdown();
  buildCompleteInventorySelect();

  renderDashboard();
  renderParts();
  renderInventory();
  renderPMs();
  renderProblems();
  setMaintenanceTab(activeMaintTab);
}

function seedDefaultPMsIfEmpty() {
  if (Array.isArray(pms) && pms.length) return;

  // Minimal safe default list (can be edited later)
  pms = [
    { id: "pm_coldfeed", area: "Cold Feed", name: "Cold Feed Daily", freq: "Daily", logs: [] },
    { id: "pm_rap", area: "RAP Side", name: "RAP Daily", freq: "Daily", logs: [] },
    { id: "pm_drum", area: "Drum", name: "Drum Daily", freq: "Daily", logs: [] },
    { id: "pm_drag", area: "Drag", name: "Drag Daily", freq: "Daily", logs: [] },
    { id: "pm_silos", area: "Top Silos", name: "Top Silos Daily", freq: "Daily", logs: [] }
  ];
}

/* ---------------------------------------------------
   NAV (Bottom Tabs)
--------------------------------------------------- */
function showScreen(screenId) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(screenId)?.classList.add("active");

  navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.screen === screenId));

  if (screenId === "dashboardScreen") renderDashboard();
  if (screenId === "maintenanceScreen") {
    setMaintenanceTab(activeMaintTab);
  }
  if (screenId === "inventoryScreen") renderInventory();
}

navButtons.forEach(btn => btn.addEventListener("click", () => showScreen(btn.dataset.screen)));

/* ---------------------------------------------------
   Maintenance Sub-Tabs (FIXED)
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

// ✅ FIX: these were missing (tabs didn’t work)
maintTabParts?.addEventListener("click", () => setMaintenanceTab("parts"));
maintTabPMs?.addEventListener("click", () => setMaintenanceTab("pms"));
maintTabProblems?.addEventListener("click", () => setMaintenanceTab("problems"));

/* ---------------------------------------------------
   Supervisor UI
--------------------------------------------------- */
function setSupervisorUI() {
  if (supervisorToggle) supervisorToggle.checked = !!settings.supervisor;
  if (supervisorBadge) supervisorBadge.classList.toggle("hidden", !settings.supervisor);
}

supervisorToggle?.addEventListener("change", () => {
  settings.supervisor = !!supervisorToggle.checked;
  saveState();
  setSupervisorUI();

  // ✅ Make it “actually work” immediately
  renderDashboard();
  renderParts();
  renderPMs();
  renderProblems();

  showToast(settings.supervisor ? "Supervisor enabled" : "Supervisor disabled");
});

/* ---------------------------------------------------
   DASHBOARD
--------------------------------------------------- */
function renderDashboard() {
  let ok = 0, due = 0, over = 0;

  const today = todayStr();
  const [year, month] = today.split("-");

  let completedToday = 0;
  let completedMonth = 0;

  parts.forEach(p => {
    const st = calculateStatus(p);

    if (st === "ok") ok++;
    else if (st === "due") due++;
    else over++;

    if (Array.isArray(p.history)) {
      p.history.forEach(h => {
        if (h.date === today) completedToday++;
        const [hy, hm] = (h.date || "").split("-");
        if (hy === year && hm === month) completedMonth++;
      });
    }
  });

  const openProblems = (problems || []).filter(pr => (pr.status || "Open") !== "Resolved").length;

  okCountEl && (okCountEl.textContent = ok);
  dueCountEl && (dueCountEl.textContent = due);
  overCountEl && (overCountEl.textContent = over);
  tonsRunEl && (tonsRunEl.textContent = currentTons);
  completedTodayEl && (completedTodayEl.textContent = completedToday);
  completedMonthEl && (completedMonthEl.textContent = completedMonth);
  openProblemsCountEl && (openProblemsCountEl.textContent = openProblems);
}

/* ---------------------------------------------------
   TONS
--------------------------------------------------- */
updateTonsBtn?.addEventListener("click", () => {
  const add = Number(currentTonsInput.value) || 0;
  if (add <= 0) return showToast("Enter tons to add", "error");

  currentTons += add;
  currentTonsInput.value = "";
  saveState();
  renderDashboard();
  renderParts();
  showToast("Tons added");
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
   DROPDOWNS
--------------------------------------------------- */
function buildCategoryDropdowns() {
  filterCategory && (filterCategory.innerHTML = `<option value="ALL">All Categories</option>`);
  categories.forEach(c => {
    filterCategory && (filterCategory.innerHTML += `<option value="${c}">${c}</option>`);
  });

  if (newPartCategory) {
    newPartCategory.innerHTML = "";
    categories.forEach(c => (newPartCategory.innerHTML += `<option value="${c}">${c}</option>`));
  }

  if (invCategory) {
    invCategory.innerHTML = "";
    categories.forEach(c => (invCategory.innerHTML += `<option value="${c}">${c}</option>`));
  }
}

function buildInventoryNameDatalist() {
  if (!inventoryNameList) return;
  inventoryNameList.innerHTML = "";
  inventory.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.part;
    inventoryNameList.appendChild(opt);
  });
}

function buildProblemAreasDropdown() {
  if (!problemArea) return;
  problemArea.innerHTML = "";
  categories.forEach(c => (problemArea.innerHTML += `<option value="${c}">${c}</option>`));
}

function buildPmAreaDropdown() {
  if (!pmAreaFilter) return;
  const uniqueAreas = Array.from(new Set((pms || []).map(p => p.area))).filter(Boolean);
  pmAreaFilter.innerHTML = `<option value="ALL">All Areas</option>`;
  uniqueAreas.forEach(a => (pmAreaFilter.innerHTML += `<option value="${a}">${a}</option>`));
}

function buildCompleteInventorySelect() {
  if (!compInvSelect) return;
  compInvSelect.innerHTML = `<option value="">Select inventory item</option>`;
  inventory.forEach((item, idx) => {
    compInvSelect.innerHTML += `<option value="${idx}">${item.part} (Qty: ${item.qty})</option>`;
  });
}

/* ---------------------------------------------------
   STATUS (Parts)
--------------------------------------------------- */
function calculateStatus(p) {
  const lastDate = p.date;
  const daysInterval = Number(p.days) || 0;

  const daysSince = (Date.now() - new Date(lastDate)) / 86400000;
  const tonsSince = currentTons - (Number(p.lastTons) || 0);

  if ((daysInterval > 0 && daysSince > daysInterval) || (Number(p.tonInterval) > 0 && tonsSince > Number(p.tonInterval))) {
    return "overdue";
  }

  const daysLeft = daysInterval - daysSince;
  const tonsLeft = Number(p.tonInterval) - tonsSince;

  if (daysLeft < 5 || tonsLeft < 500) return "due";
  return "ok";
}

/* ---------------------------------------------------
   PARTS RENDER
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
      .map(h => {
        const thumbs = (h.photos && h.photos.length)
          ? `<div class="photo-row">${h.photos.slice(0,4).map(u => '<img class="photo-thumb" src="' + u + '">').join("")}</div>`
          : "";
        return `<div class="part-meta">• ${h.date} – ${h.tons} tons</div>${thumbs}`;
      })
      .join("") || `<div class="part-meta">No history</div>`;

    const card = document.createElement("div");
    card.className = `part-card status-${st}`;

    card.innerHTML = `
      <div class="part-main" data-idx="${idx}">
        <div>
          <div class="part-name">${p.name}</div>
          <div class="part-meta">${p.category} — ${p.section}</div>
          <div class="part-meta">Last: ${p.date}</div>
          <div class="part-meta">Status: <b>${String(st).toUpperCase()}</b></div>
        </div>
        <div class="expand-icon">▼</div>
      </div>

      <div class="part-details" data-details="${idx}">
        <div class="part-meta">Last tons: ${p.lastTons}</div>

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

filterCategory?.addEventListener("change", renderParts);
searchPartsInput?.addEventListener("input", renderParts);

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
   PART PANEL
--------------------------------------------------- */
function openPartPanel(isEdit, index) {
  editingPartIndex = isEdit ? index : null;
  partPanelTitle && (partPanelTitle.textContent = isEdit ? "Edit Part" : "Add New Part");

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

function openPartForEdit(index) { openPartPanel(true, index); }

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
    lastTons: currentTons
  });

  saveState();
  renderParts();
  showToast("Part duplicated");
}

/* ---------------------------------------------------
   INVENTORY RENDER
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

/* Inventory Panel */
function openInventoryPanel(isEdit, index) {
  editingInventoryIndex = isEdit ? index : null;
  inventoryPanelTitle && (inventoryPanelTitle.textContent = isEdit ? "Edit Inventory Item" : "Add Inventory Item");

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

function openInventoryForEdit(index) { openInventoryPanel(true, index); }

function deleteInventoryItem(i) {
  if (!confirm("Delete this item?")) return;
  inventory.splice(i, 1);
  saveState();
  renderInventory();
  showToast("Inventory item deleted");
}

/* ---------------------------------------------------
   COMPLETE MAINTENANCE (RESTORED PHOTOS)
--------------------------------------------------- */
function openCompletePanel(i) {
  completingPartIndex = i;
  completionUsedItems = [];
  completionPhotos = [];
  if (compPhotoInput) compPhotoInput.value = "";
  if (compPhotoPreview) compPhotoPreview.innerHTML = "";

  compDate.value = todayStr();
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

function renderCompletionPhotoPreview() {
  if (!compPhotoPreview) return;
  compPhotoPreview.innerHTML = "";
  completionPhotos.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.className = "photo-thumb";
    compPhotoPreview.appendChild(img);
  });
}

compAddPhotoBtn?.addEventListener("click", () => compPhotoInput?.click());

compPhotoInput?.addEventListener("change", async () => {
  const urls = await readFilesAsDataUrls(compPhotoInput.files, 8);
  completionPhotos = completionPhotos.concat(urls);
  renderCompletionPhotoPreview();
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
    photos: completionPhotos.slice(), // ✅ RESTORED
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
   PMs (Basic rendering + Log)
--------------------------------------------------- */
function renderPMs() {
  if (!pmList) return;

  const sel = pmAreaFilter?.value || "ALL";
  const list = (pms || []).filter(p => sel === "ALL" || p.area === sel);

  pmList.innerHTML = "";
  if (list.length === 0) {
    pmList.innerHTML = `<div class="card"><div class="part-meta">No PMs.</div></div>`;
    return;
  }

  list.forEach(pm => {
    const last = (pm.logs || []).slice().reverse()[0];
    const lastDate = last?.date || "—";
    const card = document.createElement("div");
    card.className = "part-card";

    const supervisorTools = settings.supervisor ? `
      <div class="part-actions">
        <button class="pm-edit-btn" data-id="${pm.id}">Edit</button>
      </div>` : "";

    card.innerHTML = `
      <div class="part-name">${pm.name}</div>
      <div class="part-meta">${pm.area} • ${pm.freq}</div>
      <div class="part-meta">Last log: ${lastDate}</div>
      <div class="part-actions">
        <button class="pm-log-btn" data-id="${pm.id}">Log PM</button>
      </div>
      ${supervisorTools}
    `;

    pmList.appendChild(card);
  });
}

pmAreaFilter?.addEventListener("change", renderPMs);

function openPMLogPanel(pmId) {
  loggingPmId = pmId;
  const pm = (pms || []).find(x => x.id === pmId);
  pmLogPanelTitle && (pmLogPanelTitle.textContent = pm ? `Log PM — ${pm.name}` : "Log PM");

  pmLogDate.value = todayStr();
  pmLogNotes.value = "";
  if (pmLogPhoto) pmLogPhoto.value = "";

  pmLogPanelOverlay?.classList.remove("hidden");
  setTimeout(() => pmLogPanel?.classList.add("show"), 10);
}

function closePMLogPanelFn() {
  pmLogPanel?.classList.remove("show");
  setTimeout(() => pmLogPanelOverlay?.classList.add("hidden"), 250);
}

openPMLogPanelBtn?.addEventListener("click", () => {
  // log first PM in list if none selected
  const first = (pms || [])[0];
  if (!first) return showToast("No PMs found", "error");
  openPMLogPanel(first.id);
});

closePMLogPanel?.addEventListener("click", closePMLogPanelFn);
pmLogPanelOverlay?.addEventListener("click", (e) => { if (e.target === pmLogPanelOverlay) closePMLogPanelFn(); });

pmList?.addEventListener("click", (e) => {
  if (e.target.classList.contains("pm-log-btn")) openPMLogPanel(e.target.dataset.id);
});

savePMLogBtn?.addEventListener("click", async () => {
  const pm = (pms || []).find(x => x.id === loggingPmId);
  if (!pm) return;

  const date = pmLogDate.value || todayStr();
  const notes = (pmLogNotes.value || "").trim();
  let photo = null;

  if (pmLogPhoto?.files?.[0]) {
    photo = await readFileAsDataUrl(pmLogPhoto.files[0]);
  }

  if (!pm.logs) pm.logs = [];
  pm.logs.push({ date, notes, photo });

  saveState();
  renderPMs();
  showToast("PM logged");
  closePMLogPanelFn();
});

/* ---------------------------------------------------
   Problems (Original: list + status + photos)
--------------------------------------------------- */
function pillForStatus(status) {
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

    const photosRow = (pr.photos && pr.photos.length)
      ? `<div class="photo-row">${pr.photos.slice(0,4).map(u => '<img class="photo-thumb" src="' + u + '">').join("")}</div>`
      : "";

    const supervisorTools = settings.supervisor ? `
      <div class="part-actions" style="margin-top:10px;">
        <button class="prob-status-btn" data-id="${pr.id}" data-status="Open">Open</button>
        <button class="prob-status-btn" data-id="${pr.id}" data-status="In Progress">In Progress</button>
        <button class="prob-status-btn" data-id="${pr.id}" data-status="Resolved">Resolved</button>
        <button class="prob-delete-btn" data-id="${pr.id}">Delete</button>
      </div>` : "";

    card.innerHTML = `
      <div class="part-name">${pr.title}</div>
      <div class="part-meta">${pr.area} • Severity: ${pr.severity}</div>
      <div class="part-meta">Status: ${pillForStatus(pr.status || "Open")}</div>
      <div class="part-meta">${pr.notes || ""}</div>
      ${photosRow}
      ${supervisorTools}
    `;

    problemsList.appendChild(card);
  });
}

problemStatusFilter?.addEventListener("change", renderProblems);

function openProblemPanel() {
  problemPanelTitle && (problemPanelTitle.textContent = "Report Problem");
  problemArea && (problemArea.value = categories[0] || "");
  problemSeverity && (problemSeverity.value = "Low");
  problemTitle && (problemTitle.value = "");
  problemNotes && (problemNotes.value = "");
  if (problemPhotos) problemPhotos.value = "";

  problemPanelOverlay?.classList.remove("hidden");
  setTimeout(() => problemPanel?.classList.add("show"), 10);
}

function closeProblemPanelFn() {
  problemPanel?.classList.remove("show");
  setTimeout(() => problemPanelOverlay?.classList.add("hidden"), 250);
}

openProblemPanelBtn?.addEventListener("click", openProblemPanel);

// ✅ Dashboard button restored (routes to Maint → Problems, then opens panel)
openProblemPanelBtnDash?.addEventListener("click", () => {
  showScreen("maintenanceScreen");
  setMaintenanceTab("problems");
  openProblemPanel();
});

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

  const photoUrls = await readFilesAsDataUrls(problemPhotos?.files, 4);

  problems.push({
    id: "prob_" + Date.now(),
    createdAt: new Date().toISOString(),
    area: areaVal,
    severity: sevVal || "Low",
    title: titleVal,
    notes: notesVal,
    status: "Open",
    photos: photoUrls
  });

  saveState();
  renderProblems();
  renderDashboard();
  showToast("Problem saved");
  closeProblemPanelFn();
});

problemsList?.addEventListener("click", (e) => {
  if (e.target.classList.contains("prob-status-btn")) {
    if (!settings.supervisor) return;
    const id = e.target.dataset.id;
    const status = e.target.dataset.status;
    const pr = (problems || []).find(x => x.id === id);
    if (!pr) return;
    pr.status = status;
    saveState();
    renderProblems();
    renderDashboard();
    showToast("Status updated");
  }

  if (e.target.classList.contains("prob-delete-btn")) {
    if (!settings.supervisor) return;
    const id = e.target.dataset.id;
    if (!confirm("Delete this problem?")) return;
    problems = (problems || []).filter(x => x.id !== id);
    saveState();
    renderProblems();
    renderDashboard();
    showToast("Problem deleted");
  }
});

/* ---------------------------------------------------
   EXPORT / RESET
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

resetAllBtn?.addEventListener("click", () => {
  if (!confirm("Reset ALL data?")) return;
  localStorage.clear();
  showToast("Reset complete");
  location.reload();
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
   START
--------------------------------------------------- */
loadState();
