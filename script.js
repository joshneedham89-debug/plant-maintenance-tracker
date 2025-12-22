/* ---------------------------------------------------
   STORAGE KEYS
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";

/* ===== Phase 3.4: PMs storage ===== */
const PMS_KEY = "pm_pms";
/* ===== End Phase 3.4 ===== */

/* ===== Phase 3.2: Problems storage ===== */
const PROBLEMS_KEY = "pm_problems";
/* ===== End Phase 3.2 ===== */

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

/* ===== Phase 3: Maintenance Photos (optional) ===== */
let completionPhotos = []; // array of dataURL strings
/* ===== End Phase 3 ===== */

/* ===== Phase 3.4: PMs ===== */
let pms = []; // PM definitions + history
let pmPhotos = []; // photos for a PM completion
let currentPmFilter = "ALL";
let editingPmId = null;
let completingPmId = null;
let viewingPmId = null;
/* ===== End Phase 3.4 ===== */

/* ===== Phase 3.2: Problems ===== */
let problems = [];
let problemPhotos = []; // array of dataURL strings

/* ===== Phase 3.3: Problems list UI state ===== */
let currentProblemFilter = "ALL";
let viewingProblemId = null;
/* ===== End Phase 3.3 ===== */

/* ===== End Phase 3.2 ===== */

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

/* ===== Phase 3.2: Open problems count ===== */
const openProblemsCountEl = document.getElementById("openProblemsCount");
/* ===== End Phase 3.2 ===== */

/* ===== Phase 3.4: PMs UI ===== */
const openPmPanelBtn = document.getElementById("openPmPanelBtn");
const pmFilterBtns = document.querySelectorAll(".pm-filter");
const pmsListEl = document.getElementById("pmsList");

const pmPanelOverlay = document.getElementById("pmPanelOverlay");
const pmPanel = document.getElementById("pmPanel");
const closePmPanelBtn = document.getElementById("closePmPanel");
const pmPanelTitle = document.getElementById("pmPanelTitle");
const pmArea = document.getElementById("pmArea");
const pmName = document.getElementById("pmName");
const pmFrequency = document.getElementById("pmFrequency");
const pmCustomDaysLabel = document.getElementById("pmCustomDaysLabel");
const pmCustomDays = document.getElementById("pmCustomDays");
const pmDefNotes = document.getElementById("pmDefNotes");
const savePmBtn = document.getElementById("savePmBtn");

const pmCompleteOverlay = document.getElementById("pmCompleteOverlay");
const pmCompletePanel = document.getElementById("pmCompletePanel");
const closePmCompleteBtn = document.getElementById("closePmComplete");
const pmCompleteTitle = document.getElementById("pmCompleteTitle");
const pmCompDate = document.getElementById("pmCompDate");
const pmCompNotes = document.getElementById("pmCompNotes");
const pmAddPhotoBtn = document.getElementById("pmAddPhotoBtn");
const pmPhotoInput = document.getElementById("pmPhotoInput");
const pmPhotoPreview = document.getElementById("pmPhotoPreview");
const savePmCompletionBtn = document.getElementById("savePmCompletionBtn");

const pmDetailOverlay = document.getElementById("pmDetailOverlay");
const pmDetailPanel = document.getElementById("pmDetailPanel");
const closePmDetailBtn = document.getElementById("closePmDetail");
const pmDetailTitle = document.getElementById("pmDetailTitle");
const pmDetailMeta = document.getElementById("pmDetailMeta");
const pmDetailHistory = document.getElementById("pmDetailHistory");
const pmCompleteBtn = document.getElementById("pmCompleteBtn");
const pmEditBtn = document.getElementById("pmEditBtn");
const pmDeleteBtn = document.getElementById("pmDeleteBtn");
/* ===== End Phase 3.4 ===== */

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

/* Add/Edit Part Panel (overlay version in your HTML) */
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

/* Inventory Panel (overlay version in your HTML) */
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

/* ===== Phase 3: Maintenance Photos UI ===== */
const compAddPhotoBtn = document.getElementById("compAddPhotoBtn");
const compPhotoInput = document.getElementById("compPhotoInput");
const compPhotoPreview = document.getElementById("compPhotoPreview");
/* ===== End Phase 3 ===== */

/* ===== Phase 3.2: Problems UI refs ===== */
const openProblemPanelBtn = document.getElementById("openProblemPanelBtn");
const openProblemPanelBtn2 = document.getElementById("openProblemPanelBtn2");
const problemPanelOverlay = document.getElementById("problemPanelOverlay");
const problemPanel = document.getElementById("problemPanel");
const closeProblemPanelBtn = document.getElementById("closeProblemPanel");

const probTitle = document.getElementById("probTitle");
const probCategory = document.getElementById("probCategory");
const probLocation = document.getElementById("probLocation");
const probSeverity = document.getElementById("probSeverity");
const probStatus = document.getElementById("probStatus");
const probNotes = document.getElementById("probNotes");
const saveProblemBtn = document.getElementById("saveProblemBtn");

const probAddPhotoBtn = document.getElementById("probAddPhotoBtn");
const probPhotoInput = document.getElementById("probPhotoInput");
const probPhotoPreview = document.getElementById("probPhotoPreview");

/* Problems list + filter */
const problemsListEl = document.getElementById("problemsList");
const problemFilterBtns = document.querySelectorAll(".prob-filter");

/* Problem detail panel */
const problemDetailOverlay = document.getElementById("problemDetailOverlay");
const problemDetailPanel = document.getElementById("problemDetailPanel");
const closeProblemDetailBtn = document.getElementById("closeProblemDetail");
const problemDetailTitle = document.getElementById("problemDetailTitle");
const problemDetailMeta = document.getElementById("problemDetailMeta");
const problemDetailStatus = document.getElementById("problemDetailStatus");
const problemDetailPhotos = document.getElementById("problemDetailPhotos");
const resolveLogBtn = document.getElementById("resolveLogBtn");
const deleteProblemBtn = document.getElementById("deleteProblemBtn");
/* ===== End Phase 3.2 ===== */

/* ===== Phase 3.1/3.2: Lightbox ===== */
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxImg = document.getElementById("lightboxImg");
/* ===== End Lightbox ===== */

/* Toast */
const toastContainer = document.getElementById("toastContainer");
let toastTimeoutId = null;

/* ---------------------------------------------------
   HELPERS
--------------------------------------------------- */
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
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
   LIGHTBOX
--------------------------------------------------- */
function openLightbox(src) {
  if (!lightboxOverlay || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxOverlay.classList.remove("hidden");
  lightboxOverlay.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  if (!lightboxOverlay || !lightboxImg) return;
  lightboxOverlay.classList.add("hidden");
  lightboxOverlay.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
}

lightboxClose?.addEventListener("click", closeLightbox);
lightboxOverlay?.addEventListener("click", (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightboxOverlay && !lightboxOverlay.classList.contains("hidden")) {
    closeLightbox();
  }
});

/* ---------------------------------------------------
   INIT
--------------------------------------------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  // categories + default inventory come from inventory.js
  categories = Array.isArray(PRELOADED_CATEGORIES) ? PRELOADED_CATEGORIES : [];

  const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY));
  inventory = storedInventory?.length ? storedInventory : (PRELOADED_INVENTORY?.slice?.() || []);

  /* ===== Phase 3.4: load PMs ===== */
  pms = JSON.parse(localStorage.getItem(PMS_KEY)) || [];
  /* ===== End Phase 3.4 ===== */

  /* ===== Phase 3.2: load problems ===== */
  problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];
  /* ===== End Phase 3.2 ===== */

  if (currentTonsInput) currentTonsInput.value = currentTons;

  buildCategoryDropdown();
  buildInventoryCategoryDropdown();
  buildInventoryNameDatalist();
  buildCompleteInventorySelect();

  /* ===== Phase 3.4: PM UI defaults ===== */
  if (pmFrequency) {
    const isCustom = (pmFrequency.value || "").startsWith("Custom");
    pmCustomDaysLabel?.classList.toggle("hidden", !isCustom);
    pmCustomDays?.classList.toggle("hidden", !isCustom);
  }
  /* ===== End Phase 3.4 ===== */

  /* ===== Phase 3.2: build problem category dropdown ===== */
  buildProblemCategoryDropdown();
  /* ===== End Phase 3.2 ===== */

  renderDashboard();
  renderParts();
  renderInventory();
  /* ===== Phase 3.4: render PMs ===== */
  renderPmsList();
  /* ===== End Phase 3.4 ===== */
  /* ===== Phase 3.3: render problems list ===== */
  renderProblemsList();
  /* ===== End Phase 3.3 ===== */
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, String(currentTons));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));

  /* ===== Phase 3.4: save PMs ===== */
  localStorage.setItem(PMS_KEY, JSON.stringify(pms));
  /* ===== End Phase 3.4 ===== */

  /* ===== Phase 3.2: save problems ===== */
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
  /* ===== End Phase 3.2 ===== */
}

loadState();

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
  if (screenId === "maintenanceScreen") { renderParts(); renderPmsList(); renderProblemsList(); }
  if (screenId === "inventoryScreen") renderInventory();
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

/* ---------------------------------------------------
   TONS
--------------------------------------------------- */
updateTonsBtn?.addEventListener("click", () => {
  currentTons = Number(currentTonsInput.value) || 0;
  saveState();
  renderDashboard();
  showToast("Tons updated");
});

resetTonsBtn?.addEventListener("click", () => {
  currentTons = 0;
  if (currentTonsInput) currentTonsInput.value = 0;
  saveState();
  renderDashboard();
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

  /* ===== Phase 3.2: Open problems count ===== */
  if (openProblemsCountEl) {
    const openCount = (problems || []).filter(p => (p.status || "Open") !== "Resolved").length;
    openProblemsCountEl.textContent = String(openCount);
  }
  /* ===== End Phase 3.2 ===== */
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
          <div class="part-name">${escapeHtml(p.name)}</div>
          <div class="part-meta">${escapeHtml(p.category)} — ${escapeHtml(p.section)}</div>
          <div class="part-meta">Last: ${escapeHtml(p.date)}</div>
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

  // show overlay + slide panel
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
      date: new Date().toISOString().split("T")[0],
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
      <div class="part-name">${escapeHtml(item.part)}</div>
      <div class="part-meta">${escapeHtml(item.category)} — ${escapeHtml(item.location)}</div>
      <div class="part-meta">Qty: ${escapeHtml(item.qty)}</div>
      <div class="part-meta">${escapeHtml(item.notes || "")}</div>

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
  if (e.target.classList.contains("edit-inv-btn"))
    openInventoryForEdit(Number(e.target.dataset.idx));

  if (e.target.classList.contains("delete-inv-btn"))
    deleteInventoryItem(Number(e.target.dataset.idx));
});

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

addInventoryBtn?.addEventListener("click", () => openInventoryPanel(false, null));
function openInventoryForEdit(index) { openInventoryPanel(true, index); }

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
  completionPhotos = [];

  const today = new Date().toISOString().split("T")[0];
  compDate.value = today;
  compTons.value = currentTons;
  compNotes.value = "";

  if (compPhotoPreview) compPhotoPreview.innerHTML = "";
  if (compPhotoInput) compPhotoInput.value = "";

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
completePanelOverlay?.addEventListener("click", (e) => {
  if (e.target === completePanelOverlay) closeCompletePanel();
});

function buildCompleteInventorySelect() {
  if (!compInvSelect) return;
  compInvSelect.innerHTML = `<option value="">Select inventory item</option>`;
  inventory.forEach((item, idx) => {
    compInvSelect.innerHTML += `<option value="${idx}">
      ${escapeHtml(item.part)} (Qty: ${escapeHtml(item.qty)})
    </option>`;
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

/* ===== Phase 3: Maintenance Photos ===== */
function renderCompletionPhotoPreview() {
  if (!compPhotoPreview) return;

  if (!completionPhotos.length) {
    compPhotoPreview.innerHTML = "";
    return;
  }

  compPhotoPreview.innerHTML = `
    <div class="photo-preview-grid">
      ${completionPhotos.map((src, idx) => `
        <div class="photo-thumb">
          <img src="${src}" alt="Maintenance Photo ${idx + 1}">
          <button class="photo-remove" data-idx="${idx}" title="Remove">✖</button>
        </div>
      `).join("")}
    </div>
  `;
}

compAddPhotoBtn?.addEventListener("click", () => {
  compPhotoInput?.click();
});

compPhotoInput?.addEventListener("change", () => {
  const files = Array.from(compPhotoInput.files || []);
  if (!files.length) return;

  const MAX_ADD = 8;
  const toAdd = files.slice(0, MAX_ADD);

  let added = 0;
  toAdd.forEach(file => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      completionPhotos.push(String(reader.result || ""));
      added++;
      if (added === toAdd.length) {
        renderCompletionPhotoPreview();
        showToast(`Added ${toAdd.length} photo${toAdd.length > 1 ? "s" : ""}`);
      }
    };
    reader.readAsDataURL(file);
  });

  compPhotoInput.value = "";
});

compPhotoPreview?.addEventListener("click", (e) => {
  const btn = e.target.closest(".photo-remove");
  if (btn) {
    const idx = Number(btn.dataset.idx);
    if (!Number.isFinite(idx)) return;
    completionPhotos.splice(idx, 1);
    renderCompletionPhotoPreview();
    showToast("Photo removed");
    return;
  }

  const img = e.target?.tagName === "IMG" ? e.target : null;
  if (img && img.src) openLightbox(img.src);
});
/* ===== End Phase 3 ===== */

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
    photos: completionPhotos.slice(),
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
   EXPORT DATA
--------------------------------------------------- */
exportBtn?.addEventListener("click", () => {
  const data = { parts, currentTons, inventory, pms, problems };
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

/* ===================================================
   Phase 3.2: PROBLEM CATEGORY DROPDOWN
=================================================== */
function buildProblemCategoryDropdown() {
  if (!probCategory) return;
  probCategory.innerHTML = "";
  categories.forEach(c => {
    probCategory.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

/* ===================================================
   Phase 3.2: REPORT A PROBLEM PANEL
=================================================== */
function openProblemPanel() {
  if (probTitle) probTitle.value = "";
  if (probLocation) probLocation.value = "";
  if (probNotes) probNotes.value = "";
  if (probSeverity) probSeverity.value = "Medium";
  if (probStatus) probStatus.value = "Open";

  buildProblemCategoryDropdown();
  if (probCategory && categories.length) probCategory.value = categories[0];

  // reset photos
  problemPhotos = [];
  if (probPhotoPreview) probPhotoPreview.innerHTML = "";
  if (probPhotoInput) probPhotoInput.value = "";

  problemPanelOverlay?.classList.remove("hidden");
  setTimeout(() => problemPanel?.classList.add("show"), 10);
}

function closeProblemPanel() {
  problemPanel?.classList.remove("show");
  setTimeout(() => problemPanelOverlay?.classList.add("hidden"), 250);
}

openProblemPanelBtn?.addEventListener("click", openProblemPanel);
openProblemPanelBtn2?.addEventListener("click", openProblemPanel);
closeProblemPanelBtn?.addEventListener("click", closeProblemPanel);
problemPanelOverlay?.addEventListener("click", (e) => {
  if (e.target === problemPanelOverlay) closeProblemPanel();
});

function renderProblemPhotoPreview() {
  if (!probPhotoPreview) return;

  if (!problemPhotos.length) {
    probPhotoPreview.innerHTML = "";
    return;
  }

  probPhotoPreview.innerHTML = `
    <div class="photo-preview-grid">
      ${problemPhotos.map((src, idx) => `
        <div class="photo-thumb">
          <img src="${src}" alt="Problem Photo ${idx + 1}">
          <button class="photo-remove" data-idx="${idx}" title="Remove">✖</button>
        </div>
      `).join("")}
    </div>
  `;
}

probAddPhotoBtn?.addEventListener("click", () => {
  probPhotoInput?.click();
});

probPhotoInput?.addEventListener("change", () => {
  const files = Array.from(probPhotoInput.files || []);
  if (!files.length) return;

  const MAX_ADD = 8;
  const toAdd = files.slice(0, MAX_ADD);

  let added = 0;
  toAdd.forEach(file => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      problemPhotos.push(String(reader.result || ""));
      added++;
      if (added === toAdd.length) {
        renderProblemPhotoPreview();
        showToast(`Added ${toAdd.length} photo${toAdd.length > 1 ? "s" : ""}`);
      }
    };
    reader.readAsDataURL(file);
  });

  probPhotoInput.value = "";
});

// tap thumb to view full-screen + remove
probPhotoPreview?.addEventListener("click", (e) => {
  const btn = e.target.closest(".photo-remove");
  if (btn) {
    const idx = Number(btn.dataset.idx);
    if (!Number.isFinite(idx)) return;
    problemPhotos.splice(idx, 1);
    renderProblemPhotoPreview();
    showToast("Photo removed");
    return;
  }

  const img = e.target?.tagName === "IMG" ? e.target : null;
  if (img && img.src) openLightbox(img.src);
});

saveProblemBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  const title = (probTitle?.value || "").trim();
  const category = probCategory?.value || "";
  const location = (probLocation?.value || "").trim();
  const severity = probSeverity?.value || "Medium";
  const status = probStatus?.value || "Open";
  const notes = (probNotes?.value || "").trim();

  if (!title || !category || !location) {
    showToast("Fill Title / Category / Location", "error");
    return;
  }

  const item = {
    id: "prob_" + Date.now(),
    createdAt: new Date().toISOString(),
    title,
    category,
    location,
    severity,
    status,
    notes,
    photos: problemPhotos.slice()
  };

  problems.unshift(item);
  saveState();
  renderDashboard();
  renderProblemsList();

  showToast("Problem saved");
  closeProblemPanel();
});

/* ===================================================
   Phase 3.4: PMs (Preventive Maintenance)
   - Add/Edit PM definitions
   - Complete PM w/ optional photos
   - History stored on each PM
=================================================== */

function pmFreqToDays(freq, customDays) {
  const f = String(freq || "Weekly");
  if (f === "Daily") return 1;
  if (f === "Weekly") return 7;
  if (f === "Monthly") return 30;
  if (f === "Custom") {
    const d = Number(customDays);
    return Number.isFinite(d) && d > 0 ? d : 7;
  }
  // "Custom (days)" label fallback
  if (f.toLowerCase().includes("custom")) {
    const d = Number(customDays);
    return Number.isFinite(d) && d > 0 ? d : 7;
  }
  return 7;
}

function pmDueStatus(pm) {
  const intervalDays = pmFreqToDays(pm.frequency, pm.customDays);
  const last = pm.lastCompletedDate || pm.createdDate || new Date().toISOString().split("T")[0];
  const lastTime = new Date(last + "T00:00:00").getTime();
  const nowTime = new Date().setHours(0,0,0,0);
  const daysSince = Math.floor((nowTime - lastTime) / 86400000);
  const remaining = intervalDays - daysSince;
  let status = "ok";
  if (remaining < 0) status = "overdue";
  else if (remaining <= 1) status = "due";
  return { status, intervalDays, daysSince, remaining };
}

function renderPmsList() {
  if (!pmsListEl) return;
  pmsListEl.innerHTML = "";

  // sync button highlight
  pmFilterBtns?.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.pmfilter === currentPmFilter);
  });

  const filtered = pms
    .filter(pm => currentPmFilter === "ALL" || pm.area === currentPmFilter)
    .slice();

  if (!filtered.length) {
    pmsListEl.innerHTML = `<div class="part-meta">No PMs yet. Tap <b>+ Add PM</b>.</div>`;
    return;
  }

  filtered.forEach(pm => {
    const st = pmDueStatus(pm);
    const pillClass = st.status === "overdue" ? "pm-overdue" : (st.status === "due" ? "pm-due" : "pm-ok");
    const pillText = st.status === "overdue" ? "Overdue" : (st.status === "due" ? "Due" : "OK");

    const card = document.createElement("div");
    card.className = "pm-card";
    card.dataset.pmid = pm.id;
    card.innerHTML = `
      <div class="pm-card-top">
        <div>
          <div class="pm-title">${escapeHtml(pm.name || "PM")}</div>
          <div class="pm-sub">${escapeHtml(pm.area || "")} • ${escapeHtml(pm.frequency || "Weekly")}</div>
          <div class="pm-sub">Last: ${escapeHtml(pm.lastCompletedDate || "—")}</div>
        </div>
        <div class="pm-pill ${pillClass}">${pillText}</div>
      </div>
    `;
    pmsListEl.appendChild(card);
  });
}

// filter buttons
pmFilterBtns?.forEach(btn => {
  btn.addEventListener("click", () => {
    currentPmFilter = btn.dataset.pmfilter || "ALL";
    renderPmsList();
  });
});

// open detail panel by tapping card
pmsListEl?.addEventListener("click", (e) => {
  const card = e.target.closest(".pm-card");
  if (!card) return;
  const id = card.dataset.pmid;
  if (!id) return;
  openPmDetail(id);
});

function openPmPanel(isEdit, id) {
  editingPmId = isEdit ? id : null;
  if (pmPanelTitle) pmPanelTitle.textContent = isEdit ? "Edit PM" : "Add PM";

  const pm = isEdit ? pms.find(x => x.id === id) : null;
  if (pmArea) pmArea.value = pm?.area || "Cold Feed";
  if (pmName) pmName.value = pm?.name || "";

  if (pmFrequency) {
    const f = pm?.frequency || "Weekly";
    pmFrequency.value = f;
  }
  if (pmCustomDays) pmCustomDays.value = pm?.customDays ?? "";
  if (pmDefNotes) pmDefNotes.value = pm?.notes || "";

  // show/hide custom days
  if (pmFrequency) {
    const isCustom = (pmFrequency.value || "").toLowerCase().includes("custom");
    pmCustomDaysLabel?.classList.toggle("hidden", !isCustom);
    pmCustomDays?.classList.toggle("hidden", !isCustom);
  }

  pmPanelOverlay?.classList.remove("hidden");
  setTimeout(() => pmPanel?.classList.add("show"), 10);
}

function closePmPanel() {
  pmPanel?.classList.remove("show");
  setTimeout(() => pmPanelOverlay?.classList.add("hidden"), 250);
}

openPmPanelBtn?.addEventListener("click", () => openPmPanel(false, null));
closePmPanelBtn?.addEventListener("click", closePmPanel);
pmPanelOverlay?.addEventListener("click", (e) => {
  if (e.target === pmPanelOverlay) closePmPanel();
});

pmFrequency?.addEventListener("change", () => {
  const isCustom = (pmFrequency.value || "").toLowerCase().includes("custom");
  pmCustomDaysLabel?.classList.toggle("hidden", !isCustom);
  pmCustomDays?.classList.toggle("hidden", !isCustom);
});

savePmBtn?.addEventListener("click", () => {
  const area = pmArea?.value || "";
  const name = (pmName?.value || "").trim();
  const freqRaw = pmFrequency?.value || "Weekly";
  const frequency = freqRaw.toLowerCase().includes("custom") ? "Custom" : freqRaw;
  const customDays = Number(pmCustomDays?.value);
  const notes = (pmDefNotes?.value || "").trim();

  if (!area || !name || !frequency) {
    showToast("Fill Area + PM Name + Frequency", "error");
    return;
  }

  if (frequency === "Custom" && (!Number.isFinite(customDays) || customDays <= 0)) {
    showToast("Enter Custom Days", "error");
    return;
  }

  if (editingPmId) {
    const idx = pms.findIndex(x => x.id === editingPmId);
    if (idx >= 0) {
      pms[idx] = {
        ...pms[idx],
        area,
        name,
        frequency,
        customDays: frequency === "Custom" ? customDays : null,
        notes
      };
    }
  } else {
    const today = new Date().toISOString().split("T")[0];
    pms.unshift({
      id: "pm_" + Date.now(),
      createdAt: new Date().toISOString(),
      createdDate: today,
      area,
      name,
      frequency,
      customDays: frequency === "Custom" ? customDays : null,
      notes,
      lastCompletedDate: "",
      history: []
    });
  }

  saveState();
  renderPmsList();
  closePmPanel();
  showToast(editingPmId ? "PM updated" : "PM added");
});

function openPmComplete(id) {
  completingPmId = id;
  pmPhotos = [];
  if (pmPhotoPreview) pmPhotoPreview.innerHTML = "";
  if (pmPhotoInput) pmPhotoInput.value = "";

  const pm = pms.find(x => x.id === id);
  if (pmCompleteTitle) pmCompleteTitle.textContent = `Complete PM: ${pm?.name || ""}`;

  const today = new Date().toISOString().split("T")[0];
  if (pmCompDate) pmCompDate.value = today;
  if (pmCompNotes) pmCompNotes.value = "";

  pmCompleteOverlay?.classList.remove("hidden");
  setTimeout(() => pmCompletePanel?.classList.add("show"), 10);
}

function closePmComplete() {
  pmCompletePanel?.classList.remove("show");
  setTimeout(() => pmCompleteOverlay?.classList.add("hidden"), 250);
}

closePmCompleteBtn?.addEventListener("click", closePmComplete);
pmCompleteOverlay?.addEventListener("click", (e) => {
  if (e.target === pmCompleteOverlay) closePmComplete();
});

function renderPmPhotoPreview() {
  if (!pmPhotoPreview) return;
  if (!pmPhotos.length) {
    pmPhotoPreview.innerHTML = "";
    return;
  }
  pmPhotoPreview.innerHTML = `
    <div class="photo-preview-grid">
      ${pmPhotos.map((src, idx) => `
        <div class="photo-thumb">
          <img src="${src}" alt="PM Photo ${idx + 1}">
          <button class="photo-remove" data-idx="${idx}" title="Remove">✖</button>
        </div>
      `).join("")}
    </div>
  `;
}

pmAddPhotoBtn?.addEventListener("click", () => pmPhotoInput?.click());

pmPhotoInput?.addEventListener("change", () => {
  const files = Array.from(pmPhotoInput.files || []);
  if (!files.length) return;

  const MAX_ADD = 8;
  const toAdd = files.slice(0, MAX_ADD);

  let added = 0;
  toAdd.forEach(file => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      pmPhotos.push(String(reader.result || ""));
      added++;
      if (added === toAdd.length) {
        renderPmPhotoPreview();
        showToast(`Added ${toAdd.length} photo${toAdd.length > 1 ? "s" : ""}`);
      }
    };
    reader.readAsDataURL(file);
  });

  pmPhotoInput.value = "";
});

pmPhotoPreview?.addEventListener("click", (e) => {
  const btn = e.target.closest(".photo-remove");
  if (btn) {
    const idx = Number(btn.dataset.idx);
    if (!Number.isFinite(idx)) return;
    pmPhotos.splice(idx, 1);
    renderPmPhotoPreview();
    showToast("Photo removed");
    return;
  }
  const img = e.target?.tagName === "IMG" ? e.target : null;
  if (img && img.src) openLightbox(img.src);
});

savePmCompletionBtn?.addEventListener("click", () => {
  const pm = pms.find(x => x.id === completingPmId);
  if (!pm) return;

  const date = pmCompDate?.value || "";
  const notes = (pmCompNotes?.value || "").trim();
  if (!date) {
    showToast("Pick a date", "error");
    return;
  }

  const entry = {
    date,
    notes,
    photos: pmPhotos.slice()
  };

  if (!Array.isArray(pm.history)) pm.history = [];
  pm.history.unshift(entry);
  pm.lastCompletedDate = date;

  saveState();
  renderPmsList();
  if (viewingPmId) renderPmDetail(viewingPmId);
  closePmComplete();
  showToast("PM saved");
});

function openPmDetail(id) {
  viewingPmId = id;
  renderPmDetail(id);
  pmDetailOverlay?.classList.remove("hidden");
  setTimeout(() => pmDetailPanel?.classList.add("show"), 10);
}

function closePmDetail() {
  pmDetailPanel?.classList.remove("show");
  setTimeout(() => pmDetailOverlay?.classList.add("hidden"), 250);
}

closePmDetailBtn?.addEventListener("click", closePmDetail);
pmDetailOverlay?.addEventListener("click", (e) => {
  if (e.target === pmDetailOverlay) closePmDetail();
});

function renderPmDetail(id) {
  const pm = pms.find(x => x.id === id);
  if (!pm) return;

  if (pmDetailTitle) pmDetailTitle.textContent = pm.name || "PM";

  const st = pmDueStatus(pm);
  if (pmDetailMeta) {
    pmDetailMeta.innerHTML = `
      <div><b>Area:</b> ${escapeHtml(pm.area || "")}</div>
      <div><b>Frequency:</b> ${escapeHtml(pm.frequency || "")}${pm.frequency === "Custom" ? ` (${pm.customDays} days)` : ""}</div>
      <div><b>Last Done:</b> ${escapeHtml(pm.lastCompletedDate || "—")}</div>
      <div><b>Due:</b> ${st.status === "overdue" ? "Overdue" : (st.status === "due" ? "Due" : "OK")} (${st.remaining} day${Math.abs(st.remaining) === 1 ? "" : "s"} ${st.remaining >= 0 ? "remaining" : "past due"})</div>
      ${pm.notes ? `<div><b>Notes:</b> ${escapeHtml(pm.notes)}</div>` : ""}
    `;
  }

  if (pmDetailHistory) {
    const hist = Array.isArray(pm.history) ? pm.history : [];
    if (!hist.length) {
      pmDetailHistory.innerHTML = `<div class="part-meta">No PM history yet.</div>`;
    } else {
      pmDetailHistory.innerHTML = hist
        .slice(0, 10)
        .map(h => {
          const photoCount = Array.isArray(h.photos) ? h.photos.length : 0;
          const photoStrip = photoCount
            ? `<div class="history-photo-strip">${h.photos.slice(0,6).map(src => `<img src="${src}" alt="PM photo" data-src="${src}">`).join("")}${photoCount > 6 ? `<span class="history-photo-more">+${photoCount - 6}</span>` : ""}</div>`
            : "";
          return `
            <div class="part-card" style="margin:10px 0;">
              <div class="part-name">${escapeHtml(h.date || "")}</div>
              <div class="part-meta">${escapeHtml(h.notes || "")}</div>
              ${photoStrip}
            </div>
          `;
        })
        .join("");
    }
  }
}

// lightbox in PM history
pmDetailHistory?.addEventListener("click", (e) => {
  const img = e.target?.tagName === "IMG" ? e.target : null;
  if (img && img.dataset.src) openLightbox(img.dataset.src);
});

pmCompleteBtn?.addEventListener("click", () => {
  if (!viewingPmId) return;
  openPmComplete(viewingPmId);
});

pmEditBtn?.addEventListener("click", () => {
  if (!viewingPmId) return;
  closePmDetail();
  openPmPanel(true, viewingPmId);
});

pmDeleteBtn?.addEventListener("click", () => {
  if (!viewingPmId) return;
  if (!confirm("Delete this PM?")) return;
  pms = pms.filter(x => x.id !== viewingPmId);
  saveState();
  closePmDetail();
  renderPmsList();
  showToast("PM deleted");
});

/* ===================================================
   Phase 3.3: PROBLEMS LIST (inside Maintenance)
   - status pills
   - tap -> slide detail panel
   - Resolve & Log Maintenance (auto-create part + log)
=================================================== */

function getProblemStatusClass(status) {
  const s = String(status || "Open");
  if (s === "Resolved") return "status-resolved";
  if (s === "In Progress") return "status-inprogress";
  return "status-open";
}

function renderProblemsList() {
  if (!problemsListEl) return;

  // keep filters in sync
  problemFilterBtns?.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === currentProblemFilter);
  });

  const filtered = (problems || []).filter(p => {
    if (currentProblemFilter === "ALL") return true;
    return (p.status || "Open") === currentProblemFilter;
  });

  if (!filtered.length) {
    problemsListEl.innerHTML = `<div class="part-meta">No problems yet.</div>`;
    return;
  }

  problemsListEl.innerHTML = filtered.map(p => {
    const status = p.status || "Open";
    const pillClass = getProblemStatusClass(status);
    const created = (p.createdAt || "").split("T")[0] || "";
    return `
      <div class="problem-card" data-probid="${p.id}">
        <div class="problem-card-top">
          <div>
            <div class="problem-title">${escapeHtml(p.title || "Problem")}</div>
            <div class="problem-sub">${escapeHtml(p.category || "")} — ${escapeHtml(p.location || "")}</div>
            <div class="problem-sub">${created ? `Created: ${created}` : ""}</div>
          </div>
          <span class="status-pill ${pillClass}">${escapeHtml(status)}</span>
        </div>
      </div>
    `;
  }).join("");
}

/* Filters */
problemFilterBtns?.forEach(btn => {
  btn.addEventListener("click", () => {
    currentProblemFilter = btn.dataset.filter || "ALL";
    renderProblemsList();
  });
});

/* Open detail on tap */
problemsListEl?.addEventListener("click", (e) => {
  const card = e.target.closest(".problem-card");
  if (!card) return;
  const id = card.dataset.probid;
  if (!id) return;
  openProblemDetail(id);
});

function openProblemDetail(id) {
  viewingProblemId = id;
  renderProblemDetail(id);

  problemDetailOverlay?.classList.remove("hidden");
  setTimeout(() => problemDetailPanel?.classList.add("show"), 10);
}

function closeProblemDetail() {
  problemDetailPanel?.classList.remove("show");
  setTimeout(() => problemDetailOverlay?.classList.add("hidden"), 250);
}

closeProblemDetailBtn?.addEventListener("click", closeProblemDetail);
problemDetailOverlay?.addEventListener("click", (e) => {
  if (e.target === problemDetailOverlay) closeProblemDetail();
});

function renderProblemDetail(id) {
  const p = (problems || []).find(x => x.id === id);
  if (!p) return;

  if (problemDetailTitle) problemDetailTitle.textContent = p.title || "Problem";

  const created = (p.createdAt || "").split("T")[0] || "";
  if (problemDetailMeta) {
    problemDetailMeta.innerHTML = `
      <div><b>Category:</b> ${escapeHtml(p.category || "")}</div>
      <div><b>Location:</b> ${escapeHtml(p.location || "")}</div>
      <div><b>Severity:</b> ${escapeHtml(p.severity || "")}</div>
      <div><b>Created:</b> ${escapeHtml(created || "")}</div>
      ${p.notes ? `<div><b>Notes:</b> ${escapeHtml(p.notes)}</div>` : ""}
    `;
  }

  if (problemDetailStatus) {
    const statuses = ["Open", "In Progress", "Resolved"];
    problemDetailStatus.innerHTML = statuses.map(s => {
      const cls = getProblemStatusClass(s);
      const isActive = (p.status || "Open") === s;
      return `<button class="status-pill ${cls}" data-setstatus="${s}" style="opacity:${isActive ? "1" : "0.55"}">${s}</button>`;
    }).join("");
  }

  if (problemDetailPhotos) {
    const list = Array.isArray(p.photos) ? p.photos : [];
    if (!list.length) {
      problemDetailPhotos.innerHTML = `<div class="part-meta">No photos</div>`;
    } else {
      problemDetailPhotos.innerHTML = `
        <div class="photo-preview-grid">
          ${list.map((src, idx) => `
            <div class="photo-thumb">
              <img src="${src}" alt="Problem Photo ${idx + 1}">
            </div>
          `).join("")}
        </div>
      `;
    }
  }
}

/* Change status inside detail */
problemDetailStatus?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-setstatus]");
  if (!btn) return;
  const status = btn.dataset.setstatus;
  const p = problems.find(x => x.id === viewingProblemId);
  if (!p) return;
  p.status = status;
  saveState();
  renderDashboard();
  renderProblemsList();
  renderProblemDetail(viewingProblemId);
  showToast("Status updated");
});

/* Tap photos in detail -> lightbox */
problemDetailPhotos?.addEventListener("click", (e) => {
  const img = e.target?.tagName === "IMG" ? e.target : null;
  if (img && img.src) openLightbox(img.src);
});

/* Delete problem */
deleteProblemBtn?.addEventListener("click", () => {
  if (!viewingProblemId) return;
  if (!confirm("Delete this problem?")) return;
  problems = problems.filter(x => x.id !== viewingProblemId);
  saveState();
  renderDashboard();
  renderProblemsList();
  closeProblemDetail();
  showToast("Problem deleted");
});

/* Resolve & Log Maintenance (simple: mark resolved) */
resolveLogBtn?.addEventListener("click", () => {
  const p = problems.find(x => x.id === viewingProblemId);
  if (!p) return;
  p.status = "Resolved";
  saveState();
  renderDashboard();
  renderProblemsList();
  renderProblemDetail(viewingProblemId);
  showToast("Marked Resolved");
});
