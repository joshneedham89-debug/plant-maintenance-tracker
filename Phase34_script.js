/*
GOLD BASELINE VERIFIED
Baseline: Locked (Pre-Phase 3.4)
Changes: Additive Only
No Existing Logic Modified
*/
/* ---------------------------------------------------
   STORAGE KEYS
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";
const PROBLEMS_KEY = "pm_problems";
const PMS_KEY = "pm_pms";

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

/* Photos */
let completionPhotos = [];
let problemPhotos = [];
let pmCompletionPhotos = [];

/* Problems */
let problems = [];
let currentProblemFilter = "ALL";
let viewingProblemId = null;

/* PMs */
let pms = [];
let currentPmFilter = "ALL";
let editingPmId = null;
let completingPmId = null;

/* ---------------------------------------------------
   ELEMENT REFERENCES
--------------------------------------------------- */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

/* Dashboard */
const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const tonsRunEl = document.getElementById("tonsRun");
const completedTodayEl = document.getElementById("completedTodayCount");
const completedMonthEl = document.getElementById("completedMonthCount");
const openProblemsCountEl = document.getElementById("openProblemsCount");
const pmDueTodayCountEl = document.getElementById("pmDueTodayCount");

/* Tons */
const currentTonsInput = document.getElementById("currentTonsInput");
const updateTonsBtn = document.getElementById("updateTonsBtn");
const resetTonsBtn = document.getElementById("resetTonsBtn");

/* Maintenance */
const filterCategory = document.getElementById("filterCategory");
const partsList = document.getElementById("partsList");
const addPartBtn = document.getElementById("addPartBtn");
const searchPartsInput = document.getElementById("searchPartsInput");

/* Inventory */
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
const exportPmComplianceBtn = document.getElementById("exportPmComplianceBtn");
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

const compAddPhotoBtn = document.getElementById("compAddPhotoBtn");
const compPhotoInput = document.getElementById("compPhotoInput");
const compPhotoPreview = document.getElementById("compPhotoPreview");

/* Lightbox */
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

/* Problem Panel */
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

const probAddPhotoBtn = document.getElementById("probAddPhotoBtn");
const probPhotoInput = document.getElementById("probPhotoInput");
const probPhotoPreview = document.getElementById("probPhotoPreview");

const saveProblemBtn = document.getElementById("saveProblemBtn");

/* Problems list + detail */
const problemsListEl = document.getElementById("problemsList");
const problemFilterBtns = document.querySelectorAll(".prob-filter");

const problemDetailOverlay = document.getElementById("problemDetailOverlay");
const problemDetailPanel = document.getElementById("problemDetailPanel");
const closeProblemDetailBtn = document.getElementById("closeProblemDetail");
const problemDetailTitle = document.getElementById("problemDetailTitle");
const problemDetailMeta = document.getElementById("problemDetailMeta");
const problemDetailStatus = document.getElementById("problemDetailStatus");
const problemDetailPhotos = document.getElementById("problemDetailPhotos");
const resolveLogBtn = document.getElementById("resolveLogBtn");
const deleteProblemBtn = document.getElementById("deleteProblemBtn");

/* PMs */
const openPmPanelBtn = document.getElementById("openPmPanelBtn");
const pmsListEl = document.getElementById("pmsList");
const pmFilterBtns = document.querySelectorAll(".pm-filter");

const pmPanelOverlay = document.getElementById("pmPanelOverlay");
const pmPanel = document.getElementById("pmPanel");
const pmPanelTitle = document.getElementById("pmPanelTitle");
const closePmPanelBtn = document.getElementById("closePmPanel");
const pmName = document.getElementById("pmName");
const pmArea = document.getElementById("pmArea");
const pmFrequency = document.getElementById("pmFrequency");
const savePmBtn = document.getElementById("savePmBtn");

const pmCompleteOverlay = document.getElementById("pmCompleteOverlay");
const pmCompletePanel = document.getElementById("pmCompletePanel");
const pmCompleteTitle = document.getElementById("pmCompleteTitle");
const closePmCompleteBtn = document.getElementById("closePmComplete");
const pmCompDate = document.getElementById("pmCompDate");
const pmCompNotes = document.getElementById("pmCompNotes");
const pmAddPhotoBtn = document.getElementById("pmAddPhotoBtn");
const pmPhotoInput = document.getElementById("pmPhotoInput");
const pmPhotoPreview = document.getElementById("pmPhotoPreview");
const savePmCompletionBtn = document.getElementById("savePmCompletionBtn");

/* PM Gallery */
const pmGalleryOverlay = document.getElementById("pmGalleryOverlay");
const pmGalleryPanel = document.getElementById("pmGalleryPanel");
const pmGalleryTitle = document.getElementById("pmGalleryTitle");
const closePmGalleryBtn = document.getElementById("closePmGallery");
const pmGalleryMeta = document.getElementById("pmGalleryMeta");
const pmGalleryGrid = document.getElementById("pmGalleryGrid");

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
   GOLD FIX: Image compression (prevents localStorage quota failure)
--------------------------------------------------- */
function compressImage(base64, maxWidth = 900, quality = 0.72) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = base64;
  });
}

/* ---------------------------------------------------
   Lightbox
--------------------------------------------------- */
function openLightbox(src) {
  if (!lightboxOverlay || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxOverlay.classList.remove("hidden");
  lightboxOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightboxOverlay || !lightboxImg) return;
  lightboxOverlay.classList.add("hidden");
  lightboxOverlay.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  document.body.style.overflow = "";
}

lightboxClose?.addEventListener("click", closeLightbox);
lightboxOverlay?.addEventListener("click", (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightboxOverlay && !lightboxOverlay.classList.contains("hidden")) closeLightbox();
});

/* ---------------------------------------------------
   INIT / SAVE (quota-safe)
--------------------------------------------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  categories = Array.isArray(PRELOADED_CATEGORIES) ? PRELOADED_CATEGORIES : [];

  const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY));
  inventory = storedInventory?.length ? storedInventory : (PRELOADED_INVENTORY?.slice?.() || []);

  problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];
  pms = JSON.parse(localStorage.getItem(PMS_KEY)) || [];

  if (currentTonsInput) currentTonsInput.value = currentTons;

  buildCategoryDropdown();
  buildInventoryCategoryDropdown();
  buildInventoryNameDatalist();
  buildCompleteInventorySelect();
  buildProblemCategoryDropdown();
  buildPmAreaDropdown();

  renderDashboard();
  renderParts();
  renderInventory();
  renderProblemsList();
  renderPmsList();
}

function saveState() {
  try {
    localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
    localStorage.setItem(TONS_KEY, String(currentTons));
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
    localStorage.setItem(PMS_KEY, JSON.stringify(pms));
    return true;
  } catch (err) {
    console.error("Save failed (quota?)", err);
    showToast("Save failed: storage full. Use fewer photos or export + reset.", "error");
    return false;
  }
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
  if (screenId === "maintenanceScreen") {
    renderParts();
    renderProblemsList();
    renderPmsList();
  }
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
  if (!saveState()) return;
  renderDashboard();
  showToast("Tons updated");
});

resetTonsBtn?.addEventListener("click", () => {
  currentTons = 0;
  if (currentTonsInput) currentTonsInput.value = 0;
  if (!saveState()) return;
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

  if (openProblemsCountEl) {
    const openCount = (problems || []).filter(p => (p.status || "Open") === "Open").length;
    openProblemsCountEl.textContent = openCount;
  }

  if (pmDueTodayCountEl) {
    const duePmCount = (pms || []).filter(pm => isPmDue(pm)).length;
    pmDueTodayCountEl.textContent = duePmCount;
  }
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
      .map(h => {
        const photos = Array.isArray(h.photos) ? h.photos : [];
        const strip = photos.length ? `
          <div class="photo-preview-grid">
            ${photos.slice(0, 6).map(src => `
              <div class="photo-thumb"><img src="${src}" alt="photo"></div>
            `).join("")}
          </div>
        ` : "";
        return `
          <div class="part-meta">• ${h.date} – ${h.tons} tons${photos.length ? ` – 📷 ${photos.length}` : ""}</div>
          ${strip}
        `;
      })
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

partsList?.addEventListener("click", (e) => {
  const img = e.target?.tagName === "IMG" ? e.target : null;
  if (img?.src && img.closest(".photo-thumb")) {
    openLightbox(img.src);
    return;
  }

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
    categories.forEach(c => { newPartCategory.innerHTML += `<option value="${c}">${c}</option>`; });
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
      date: new Date().toISOString().split("T")[0],
      lastTons: currentTons,
      history: []
    });
  }

  if (!saveState()) return;
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
  if (!saveState()) return;
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

  if (!saveState()) return;
  renderParts();
  showToast("Part duplicated");
}

/* ---------------------------------------------------
   INVENTORY
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
  if (e.target.classList.contains("edit-inv-btn")) openInventoryForEdit(Number(e.target.dataset.idx));
  if (e.target.classList.contains("delete-inv-btn")) deleteInventoryItem(Number(e.target.dataset.idx));
});

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

  if (editingInventoryIndex !== null && inventory[editingInventoryIndex]) {
    inventory[editingInventoryIndex] = itemData;
  } else {
    inventory.push(itemData);
  }

  if (!saveState()) return;
  renderInventory();
  closeInventoryPanel();
  showToast(editingInventoryIndex !== null ? "Inventory updated" : "Inventory added");
});

function deleteInventoryItem(i) {
  if (!confirm("Delete this item?")) return;
  inventory.splice(i, 1);
  if (!saveState()) return;
  renderInventory();
  showToast("Inventory item deleted");
}

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
   COMPLETE MAINTENANCE PANEL + PHOTO SAVE (compressed)
--------------------------------------------------- */
function openCompletePanel(i, prefill) {
  completingPartIndex = i;
  completionUsedItems = [];

  completionPhotos = [];
  if (compPhotoPreview) compPhotoPreview.innerHTML = "";
  if (compPhotoInput) compPhotoInput.value = "";

  const today = new Date().toISOString().split("T")[0];
  compDate.value = today;
  compTons.value = currentTons;
  compNotes.value = "";

  if (prefill && typeof prefill === "object") {
    if (prefill.notes && compNotes) compNotes.value = String(prefill.notes);
    if (Array.isArray(prefill.photos)) {
      completionPhotos = prefill.photos.slice();
      renderCompletionPhotoPreview();
    }
  }

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

function renderCompletionPhotoPreview() {
  if (!compPhotoPreview) return;
  if (!completionPhotos.length) { compPhotoPreview.innerHTML = ""; return; }

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

compAddPhotoBtn?.addEventListener("click", () => compPhotoInput?.click());

compPhotoInput?.addEventListener("change", async () => {
  const files = Array.from(compPhotoInput.files || []);
  if (!files.length) return;

  const MAX_ADD = 4; // GOLD stability
  const toAdd = files.slice(0, MAX_ADD);

  for (const file of toAdd) {
    if (!file.type.startsWith("image/")) continue;

    const base64 = await readFileAsDataURL(file);
    const compressed = await compressImage(base64);
    completionPhotos.push(compressed);
  }

  compPhotoInput.value = "";
  renderCompletionPhotoPreview();
  showToast(`Added ${toAdd.length} photo${toAdd.length > 1 ? "s" : ""}`);
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
    })),
    photos: completionPhotos.slice()
  };

  if (!p.history) p.history = [];
  p.history.push(historyEntry);

  p.date = date;
  p.lastTons = tons;

  completionUsedItems.forEach(u => {
    if (!inventory[u.invIndex]) return;
    inventory[u.invIndex].qty = Math.max(0, Number(inventory[u.invIndex].qty) - u.qty);
  });

  if (!saveState()) return;

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
  const data = { parts, currentTons, inventory, problems, pms };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, "maintenance_data.json");
  showToast("Exported");
});

/* GOLD: PM Compliance export (CSV) */
exportPmComplianceBtn?.addEventListener("click", () => {
  const csv = buildPmComplianceCsv();
  const blob = new Blob([csv], { type: "text/csv" });
  downloadBlob(blob, `pm_compliance_${getTodayStr()}.csv`);
  showToast("PM compliance exported");
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
   PROBLEMS (includes compressed photo add)
=================================================== */
function buildProblemCategoryDropdown() {
  if (!probCategory) return;
  probCategory.innerHTML = "";
  (categories || []).forEach(c => { probCategory.innerHTML += `<option value="${c}">${c}</option>`; });
}

function openProblemPanel() {
  if (probTitle) probTitle.value = "";
  if (probLocation) probLocation.value = "";
  if (probNotes) probNotes.value = "";
  if (probSeverity) probSeverity.value = "Medium";
  if (probStatus) probStatus.value = "Open";

  buildProblemCategoryDropdown();
  if (probCategory && categories.length) probCategory.value = categories[0];

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
problemPanelOverlay?.addEventListener("click", (e) => { if (e.target === problemPanelOverlay) closeProblemPanel(); });

function renderProblemPhotoPreview() {
  if (!probPhotoPreview) return;
  if (!problemPhotos.length) { probPhotoPreview.innerHTML = ""; return; }

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

probAddPhotoBtn?.addEventListener("click", () => probPhotoInput?.click());

probPhotoInput?.addEventListener("change", async () => {
  const files = Array.from(probPhotoInput.files || []);
  if (!files.length) return;

  const MAX_ADD = 4;
  const toAdd = files.slice(0, MAX_ADD);

  for (const file of toAdd) {
    if (!file.type.startsWith("image/")) continue;
    const base64 = await readFileAsDataURL(file);
    const compressed = await compressImage(base64);
    problemPhotos.push(compressed);
  }

  probPhotoInput.value = "";
  renderProblemPhotoPreview();
  showToast(`Added ${toAdd.length} photo${toAdd.length > 1 ? "s" : ""}`);
});

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
  if (img?.src) openLightbox(img.src);
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
    title, category, location, severity, status, notes,
    photos: problemPhotos.slice()
  };

  problems.unshift(item);

  if (!saveState()) return;

  renderDashboard();
  renderProblemsList();

  showToast("Problem saved");
  closeProblemPanel();
});

/* Problems list + detail */
function getProblemStatusClass(status) {
  const s = String(status || "Open");
  if (s === "Resolved") return "status-resolved";
  if (s === "In Progress") return "status-inprogress";
  return "status-open";
}

problemFilterBtns?.forEach(btn => {
  btn.addEventListener("click", () => {
    currentProblemFilter = btn.dataset.filter || "ALL";
    renderProblemsList();
  });
});

function renderProblemsList() {
  if (!problemsListEl) return;

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

problemsListEl?.addEventListener("click", (e) => {
  const card = e.target.closest(".problem-card");
  if (!card) return;
  const id = card.dataset.probid;
  if (id) openProblemDetail(id);
});

function openProblemDetail(problemId) {
  const p = (problems || []).find(x => x.id === problemId);
  if (!p) return;

  viewingProblemId = problemId;

  if (problemDetailTitle) problemDetailTitle.textContent = p.title || "Problem";

  const created = (p.createdAt || "").split("T")[0] || "";
  const metaLines = [
    created ? `Created: <b>${escapeHtml(created)}</b>` : "",
    `Category: <b>${escapeHtml(p.category || "")}</b>`,
    `Location: <b>${escapeHtml(p.location || "")}</b>`,
    `Severity: <b>${escapeHtml(p.severity || "Medium")}</b>`,
    p.notes ? `Notes: <b>${escapeHtml(p.notes)}</b>` : ""
  ].filter(Boolean);

  if (problemDetailMeta) problemDetailMeta.innerHTML = metaLines.join("<br>");

  if (problemDetailStatus) {
    const statuses = ["Open", "In Progress", "Resolved"];
    problemDetailStatus.innerHTML = statuses.map(s => {
      const cls = getProblemStatusClass(s);
      const active = (p.status || "Open") === s ? "style=\"outline:2px solid var(--accent);\"" : "";
      return `<button class="status-pill ${cls}" data-setstatus="${escapeHtml(s)}" ${active}>${escapeHtml(s)}</button>`;
    }).join("");
  }

  if (problemDetailPhotos) {
    const photos = Array.isArray(p.photos) ? p.photos : [];
    if (!photos.length) {
      problemDetailPhotos.innerHTML = `<div class="part-meta">No photos</div>`;
    } else {
      problemDetailPhotos.innerHTML = `
        <div class="photo-preview-grid">
          ${photos.map((src, idx) => `
            <div class="photo-thumb"><img src="${src}" alt="Problem Photo ${idx + 1}"></div>
          `).join("")}
        </div>
      `;
    }
  }

  problemDetailOverlay?.classList.remove("hidden");
  setTimeout(() => problemDetailPanel?.classList.add("show"), 10);
}

function closeProblemDetail() {
  problemDetailPanel?.classList.remove("show");
  setTimeout(() => problemDetailOverlay?.classList.add("hidden"), 250);
  viewingProblemId = null;
}

closeProblemDetailBtn?.addEventListener("click", closeProblemDetail);
problemDetailOverlay?.addEventListener("click", (e) => { if (e.target === problemDetailOverlay) closeProblemDetail(); });

problemDetailStatus?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-setstatus]");
  if (!btn || !viewingProblemId) return;

  const p = (problems || []).find(x => x.id === viewingProblemId);
  if (!p) return;

  p.status = btn.dataset.setstatus || "Open";
  if (!saveState()) return;

  renderDashboard();
  renderProblemsList();
  openProblemDetail(viewingProblemId);
});

problemDetailPhotos?.addEventListener("click", (e) => {
  const img = e.target?.tagName === "IMG" ? e.target : null;
  if (img?.src) openLightbox(img.src);
});

resolveLogBtn?.addEventListener("click", () => {
  if (!viewingProblemId) return;
  const p = (problems || []).find(x => x.id === viewingProblemId);
  if (!p) return;

  p.status = "Resolved";
  if (!saveState()) return;

  renderDashboard();
  renderProblemsList();

  const name = p.title || "Problem Fix";
  const category = p.category || (categories[0] || "Other");
  const section = p.location || "Plant";

  let partIndex = parts.findIndex(x =>
    (x.name || "").trim() === name.trim() &&
    (x.category || "") === category &&
    (x.section || "").trim() === section.trim()
  );

  if (partIndex === -1) {
    parts.push({
      name,
      category,
      section,
      days: 3650,
      tonInterval: 9999999,
      date: new Date().toISOString().split("T")[0],
      lastTons: currentTons,
      history: []
    });
    partIndex = parts.length - 1;
  }

  openCompletePanel(partIndex, {
    notes: `Resolved problem: ${name}${p.notes ? " — " + p.notes : ""}`,
    photos: Array.isArray(p.photos) ? p.photos.slice() : []
  });

  closeProblemDetail();
  showToast("Problem resolved + ready to log maintenance");
});

deleteProblemBtn?.addEventListener("click", () => {
  if (!viewingProblemId) return;
  if (!confirm("Delete this problem?")) return;

  problems = (problems || []).filter(p => p.id !== viewingProblemId);
  if (!saveState()) return;

  renderDashboard();
  renderProblemsList();
  closeProblemDetail();
  showToast("Problem deleted");
});

/* ===================================================
   PMs (Due Today + Gallery + compressed photo save)
=================================================== */
function buildPmAreaDropdown() {
  if (!pmArea) return;
  const PM_AREAS = ["Cold Feed", "RAP", "Drum", "Drag", "Silos", "Scales"];
  pmArea.innerHTML = "";
  PM_AREAS.forEach(a => { pmArea.innerHTML += `<option value="${a}">${a}</option>`; });
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getPmLastDate(pm) {
  const h = Array.isArray(pm.history) ? pm.history : [];
  if (!h.length) return "";
  return h[h.length - 1]?.date || "";
}

function isPmDue(pm) {
  const today = getTodayStr();
  const last = getPmLastDate(pm);
  const freq = pm.frequency || "Daily";
  if (!last) return true;

  if (freq === "Daily") return last !== today;

  const lastMs = new Date(last).getTime();
  const nowMs = new Date(today).getTime();
  const days = Math.floor((nowMs - lastMs) / 86400000);
  return days >= 7;
}

function openPmPanel(isEdit, id) {
  editingPmId = isEdit ? id : null;
  if (pmPanelTitle) pmPanelTitle.textContent = isEdit ? "Edit PM" : "Add PM";
  buildPmAreaDropdown();

  if (isEdit) {
    const item = (pms || []).find(x => x.id === id);
    if (item) {
      if (pmName) pmName.value = item.name || "";
      if (pmArea) pmArea.value = item.area || "Cold Feed";
      if (pmFrequency) pmFrequency.value = item.frequency || "Daily";
    }
  } else {
    if (pmName) pmName.value = "";
    if (pmArea) pmArea.value = "Cold Feed";
    if (pmFrequency) pmFrequency.value = "Daily";
  }

  pmPanelOverlay?.classList.remove("hidden");
  setTimeout(() => pmPanel?.classList.add("show"), 10);
}

function closePmPanel() {
  pmPanel?.classList.remove("show");
  setTimeout(() => pmPanelOverlay?.classList.add("hidden"), 250);
  editingPmId = null;
}

openPmPanelBtn?.addEventListener("click", () => openPmPanel(false, null));
closePmPanelBtn?.addEventListener("click", closePmPanel);
pmPanelOverlay?.addEventListener("click", (e) => { if (e.target === pmPanelOverlay) closePmPanel(); });

savePmBtn?.addEventListener("click", () => {
  const name = (pmName?.value || "").trim();
  const area = pmArea?.value || "Cold Feed";
  const frequency = pmFrequency?.value || "Daily";
  if (!name) return showToast("Enter PM name", "error");

  if (editingPmId) {
    const idx = (pms || []).findIndex(x => x.id === editingPmId);
    if (idx >= 0) pms[idx] = { ...pms[idx], name, area, frequency };
  } else {
    pms.unshift({
      id: "pm_" + Date.now(),
      createdAt: new Date().toISOString(),
      name, area, frequency,
      history: []
    });
  }

  if (!saveState()) return;

  renderPmsList();
  renderDashboard();
  showToast(editingPmId ? "PM updated" : "PM added");
  closePmPanel();
});

pmFilterBtns?.forEach(btn => {
  btn.addEventListener("click", () => {
    currentPmFilter = btn.dataset.pmfilter || "ALL";
    renderPmsList();
  });
});

function countPmPhotoTotal(pm) {
  const h = Array.isArray(pm.history) ? pm.history : [];
  return h.reduce((acc, entry) => acc + (Array.isArray(entry.photos) ? entry.photos.length : 0), 0);
}

function renderPmsList() {
  if (!pmsListEl) return;

  pmFilterBtns?.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.pmfilter === currentPmFilter);
  });

  const filtered = (pms || []).filter(pm => {
    if (currentPmFilter === "ALL") return true;
    const due = isPmDue(pm);
    if (currentPmFilter === "DUE") return due;
    if (currentPmFilter === "DONE") return !due;
    return true;
  });

  if (!filtered.length) {
    pmsListEl.innerHTML = `<div class="part-meta">No PMs yet. Tap <b>+ Add PM</b>.</div>`;
    return;
  }

  pmsListEl.innerHTML = filtered.map(pm => {
    const last = getPmLastDate(pm);
    const due = isPmDue(pm);
    const pill = due ? `<span class="pm-pill pm-due">DUE</span>` : `<span class="pm-pill pm-done">DONE</span>`;
    const historyCount = Array.isArray(pm.history) ? pm.history.length : 0;
    const photoTotal = countPmPhotoTotal(pm);

    return `
      <div class="pm-card" data-pmid="${pm.id}">
        <div class="pm-card-top">
          <div>
            <div class="pm-title">${escapeHtml(pm.name || "PM")}</div>
            <div class="pm-sub">${escapeHtml(pm.area || "")} — ${escapeHtml(pm.frequency || "")}</div>
            <div class="pm-sub">${last ? `Last: ${escapeHtml(last)}` : "Last: (none)"}${historyCount ? ` • History: ${historyCount}` : ""}${photoTotal ? ` • 📷 ${photoTotal}` : ""}</div>
          </div>
          ${pill}
        </div>

        <div class="pm-actions">
          <button class="pm-complete-btn" data-pmid="${pm.id}">Complete</button>
          <button class="pm-edit-btn" data-pmid="${pm.id}">Edit</button>
          <button class="pm-gallery-btn" data-pmid="${pm.id}">Gallery</button>
          <button class="pm-delete-btn" data-pmid="${pm.id}">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

pmsListEl?.addEventListener("click", (e) => {
  const id = e.target?.dataset?.pmid || e.target.closest("[data-pmid]")?.dataset?.pmid;
  if (!id) return;

  if (e.target.classList.contains("pm-edit-btn")) return openPmPanel(true, id);

  if (e.target.classList.contains("pm-delete-btn")) {
    if (!confirm("Delete this PM?")) return;
    pms = (pms || []).filter(x => x.id !== id);
    if (!saveState()) return;
    renderPmsList();
    renderDashboard();
    return showToast("PM deleted");
  }

  if (e.target.classList.contains("pm-complete-btn")) return openPmComplete(id);

  if (e.target.classList.contains("pm-gallery-btn")) return openPmGallery(id);
});

function openPmComplete(id) {
  completingPmId = id;
  pmCompletionPhotos = [];
  if (pmPhotoPreview) pmPhotoPreview.innerHTML = "";
  if (pmPhotoInput) pmPhotoInput.value = "";

  const pm = (pms || []).find(x => x.id === id);
  if (!pm) return;

  if (pmCompleteTitle) pmCompleteTitle.textContent = `Complete PM — ${pm.name || ""}`;
  if (pmCompDate) pmCompDate.value = getTodayStr();
  if (pmCompNotes) pmCompNotes.value = "";

  pmCompleteOverlay?.classList.remove("hidden");
  setTimeout(() => pmCompletePanel?.classList.add("show"), 10);
}

function closePmComplete() {
  pmCompletePanel?.classList.remove("show");
  setTimeout(() => pmCompleteOverlay?.classList.add("hidden"), 250);
  completingPmId = null;
}

closePmCompleteBtn?.addEventListener("click", closePmComplete);
pmCompleteOverlay?.addEventListener("click", (e) => { if (e.target === pmCompleteOverlay) closePmComplete(); });

function renderPmPhotoPreview() {
  if (!pmPhotoPreview) return;
  if (!pmCompletionPhotos.length) { pmPhotoPreview.innerHTML = ""; return; }

  pmPhotoPreview.innerHTML = `
    <div class="photo-preview-grid">
      ${pmCompletionPhotos.map((src, idx) => `
        <div class="photo-thumb">
          <img src="${src}" alt="PM Photo ${idx + 1}">
          <button class="photo-remove" data-idx="${idx}" title="Remove">✖</button>
        </div>
      `).join("")}
    </div>
  `;
}

pmAddPhotoBtn?.addEventListener("click", () => pmPhotoInput?.click());

pmPhotoInput?.addEventListener("change", async () => {
  const files = Array.from(pmPhotoInput.files || []);
  if (!files.length) return;

  const MAX_ADD = 4;
  const toAdd = files.slice(0, MAX_ADD);

  for (const file of toAdd) {
    if (!file.type.startsWith("image/")) continue;
    const base64 = await readFileAsDataURL(file);
    const compressed = await compressImage(base64);
    pmCompletionPhotos.push(compressed);
  }

  pmPhotoInput.value = "";
  renderPmPhotoPreview();
  showToast(`Added ${toAdd.length} photo${toAdd.length > 1 ? "s" : ""}`);
});

pmPhotoPreview?.addEventListener("click", (e) => {
  const btn = e.target.closest(".photo-remove");
  if (btn) {
    const idx = Number(btn.dataset.idx);
    if (!Number.isFinite(idx)) return;
    pmCompletionPhotos.splice(idx, 1);
    renderPmPhotoPreview();
    showToast("Photo removed");
    return;
  }
  const img = e.target?.tagName === "IMG" ? e.target : null;
  if (img?.src) openLightbox(img.src);
});

savePmCompletionBtn?.addEventListener("click", () => {
  if (!completingPmId) return;
  const pm = (pms || []).find(x => x.id === completingPmId);
  if (!pm) return;

  const date = pmCompDate?.value || getTodayStr();
  const notes = (pmCompNotes?.value || "").trim();
  if (!date) return showToast("Pick a date", "error");

  const entry = { date, notes, photos: pmCompletionPhotos.slice() };
  if (!Array.isArray(pm.history)) pm.history = [];
  pm.history.push(entry);

  if (!saveState()) return;

  renderPmsList();
  renderDashboard();
  showToast("PM logged");
  closePmComplete();
});

/* PM GALLERY */
function collectPmGalleryPhotos(pm) {
  const out = [];
  const h = Array.isArray(pm.history) ? pm.history : [];
  h.forEach(entry => {
    const photos = Array.isArray(entry.photos) ? entry.photos : [];
    photos.forEach(src => out.push({ src, date: entry.date || "" }));
  });
  return out;
}

function openPmGallery(id) {
  const pm = (pms || []).find(x => x.id === id);
  if (!pm) return;

  const photos = collectPmGalleryPhotos(pm);
  if (pmGalleryTitle) pmGalleryTitle.textContent = `PM Photos — ${pm.name || ""}`;
  if (pmGalleryMeta) pmGalleryMeta.textContent = photos.length
    ? `${pm.area || ""} • ${pm.frequency || ""} • Total photos: ${photos.length}`
    : `${pm.area || ""} • ${pm.frequency || ""} • No photos yet`;

  if (pmGalleryGrid) {
    if (!photos.length) {
      pmGalleryGrid.innerHTML = `<div class="part-meta">No photos logged for this PM yet.</div>`;
    } else {
      pmGalleryGrid.innerHTML = `
        <div class="photo-preview-grid">
          ${photos.map((p, idx) => `
            <div>
              <div class="photo-thumb">
                <img src="${p.src}" alt="PM Photo ${idx + 1}">
              </div>
              <div class="photo-caption">${escapeHtml(p.date || "")}</div>
            </div>
          `).join("")}
        </div>
      `;
    }
  }

  pmGalleryOverlay?.classList.remove("hidden");
  setTimeout(() => pmGalleryPanel?.classList.add("show"), 10);
}

function closePmGallery() {
  pmGalleryPanel?.classList.remove("show");
  setTimeout(() => pmGalleryOverlay?.classList.add("hidden"), 250);
}

closePmGalleryBtn?.addEventListener("click", closePmGallery);
pmGalleryOverlay?.addEventListener("click", (e) => { if (e.target === pmGalleryOverlay) closePmGallery(); });

pmGalleryGrid?.addEventListener("click", (e) => {
  const img = e.target?.tagName === "IMG" ? e.target : null;
  if (img?.src) openLightbox(img.src);
});

/* ===================================================
   PARTS STATUS FILTER / SEARCH
=================================================== */
function buildCompleteInventorySelect() { /* already above uses inventory */ }

/* ---------------------------------------------------
   EXPORT: PM Compliance CSV (Supervisor)
   - Month-to-date expected vs completed
--------------------------------------------------- */
function buildPmComplianceCsv() {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth(); // 0-based
  const dayOfMonth = today.getDate();

  // Month-to-date expected:
  // Daily: expected = days elapsed this month (1..today)
  // Weekly: expected = number of weeks elapsed (ceil(day/7))
  const expectedDaily = dayOfMonth;
  const expectedWeekly = Math.ceil(dayOfMonth / 7);

  const rows = [
    ["PM Name","Area","Frequency","Expected (MTD)","Completed (MTD)","Compliance %","Last Completed","Due Today"]
  ];

  const monthStr = String(m + 1).padStart(2,"0");
  const ymPrefix = `${y}-${monthStr}-`;

  (pms || []).forEach(pm => {
    const freq = pm.frequency || "Daily";
    const expected = (freq === "Weekly") ? expectedWeekly : expectedDaily;

    const completions = (Array.isArray(pm.history) ? pm.history : [])
      .filter(h => (h.date || "").startsWith(ymPrefix))
      .map(h => h.date)
      .filter(Boolean);

    // daily: count unique dates; weekly: count entries
    const completed = (freq === "Weekly")
      ? completions.length
      : new Set(completions).size;

    const compliance = expected > 0 ? Math.min(100, Math.round((completed / expected) * 100)) : 0;
    const last = getPmLastDate(pm) || "";
    const dueToday = isPmDue(pm) ? "YES" : "NO";

    rows.push([
      pm.name || "",
      pm.area || "",
      freq,
      String(expected),
      String(completed),
      String(compliance),
      last,
      dueToday
    ]);
  });

  return rows.map(r => r.map(csvEscape).join(",")).join("\n");
}

function csvEscape(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replaceAll('"','""')}"`;
  }
  return s;
}

/* ---------------------------------------------------
   EXPORT helpers
--------------------------------------------------- */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function readFileAsDataURL(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

/* ---------------------------------------------------
   UTIL
--------------------------------------------------- */
function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
   }


/* ===================================================
   Phase 3.4 (Additive Only) — PMs Tab + Checklist Completion + Roles
   ZERO-DRIFT MODE: This block is isolated and does NOT modify
   existing functions or execution paths. It only adds new listeners
   and reads/writes localStorage using existing keys.
=================================================== */
(() => {
  "use strict";

  // Existing key (do not change)
  const PM34_PMS_KEY = "pm_pms";

  // New namespaced keys (optional, backward compatible)
  const PM34_ROLE_KEY = "pm34_role";
  const PM34_ADMIN_PIN_KEY = "pm34_admin_pin";

  const ROLES = ["Ground", "Maintenance", "Supervisor", "Admin"];
  const AREAS = ["Cold Feed", "RAP", "Drum", "Drag", "Silos", "Scales"];

  // UI refs (all new IDs/classes)
  const navBtn = document.getElementById("pm34NavBtn");
  const pmScreen = document.getElementById("pm34Screen");
  const pmList = document.getElementById("pm34List");
  const dueLine = document.getElementById("pm34DueLine");
  const addPmBtn = document.getElementById("pm34AddPmBtn"); // admin-only (Phase 3.4)
  const filterBtns = Array.from(document.querySelectorAll(".pm34-filter"));

  // Complete modal
  const compOverlay = document.getElementById("pm34CompleteOverlay");
  const compTitle = document.getElementById("pm34CompleteTitle");
  const compDate = document.getElementById("pm34CompleteDate");
  const compNotes = document.getElementById("pm34CompleteNotes");
  const checklistBlock = document.getElementById("pm34ChecklistBlock");
  const checklistEl = document.getElementById("pm34Checklist");
  const checklistHint = document.getElementById("pm34ChecklistHint");
  const addPhotoBtn = document.getElementById("pm34AddPhotoBtn");
  const photoInput = document.getElementById("pm34PhotoInput");
  const photoGrid = document.getElementById("pm34PhotoGrid");
  const photoCount = document.getElementById("pm34PhotoCount");
  const completeBtn = document.getElementById("pm34CompleteBtn");
  const closeComplete = document.getElementById("pm34CloseComplete");

  // Admin/roles settings
  const roleSelect = document.getElementById("pm34RoleSelect");
  const adminStatusChip = document.getElementById("pm34AdminStatus");
  const adminUnlockBtn = document.getElementById("pm34AdminUnlockBtn");
  const adminLockBtn = document.getElementById("pm34AdminLockBtn");
  const adminPanel = document.getElementById("pm34AdminPanel");
  const pinNew = document.getElementById("pm34PinNew");
  const pinConfirm = document.getElementById("pm34PinConfirm");
  const savePinBtn = document.getElementById("pm34SavePinBtn");

  // PIN modal
  const pinOverlay = document.getElementById("pm34PinOverlay");
  const pinInput = document.getElementById("pm34PinInput");
  const pinMsg = document.getElementById("pm34PinMsg");
  const pinSubmit = document.getElementById("pm34SubmitPinBtn");
  const pinClose = document.getElementById("pm34ClosePin");

  // State (isolated)
  let pmFilter = "DUE";
  let currentRole = loadRole();
  let adminUnlocked = false;

  let completingPmId = null;
  let checklistState = [];
  let completionPhotos = [];

  // Guard: if new UI not present, do nothing (baseline safe)
  if (!navBtn || !pmScreen) return;

  function loadRole() {
    const r = String(localStorage.getItem(PM34_ROLE_KEY) || "Maintenance");
    if (ROLES.includes(r)) return r;
    return "Maintenance";
  }
  function saveRole(r) {
    localStorage.setItem(PM34_ROLE_KEY, r);
  }

  function getAdminPin() {
    return String(localStorage.getItem(PM34_ADMIN_PIN_KEY) || "");
  }
  function setAdminPin(pin) {
    localStorage.setItem(PM34_ADMIN_PIN_KEY, String(pin));
  }
  function validPin(pin) {
    return /^[0-9]{4,8}$/.test(String(pin || "").trim());
  }

  function can(action) {
    // Locked matrix for PM34 (new flow only)
    // view: all; complete/checklist/photos: not Ground; manage: Admin + unlocked
    if (action === "view") return true;
    if (action === "complete" || action === "checklist" || action === "photos") return currentRole !== "Ground";
    if (action === "manage") return currentRole === "Admin" && adminUnlocked;
    return false;
  }

  function readPms() {
    try {
      const raw = localStorage.getItem(PM34_PMS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  function writePms(arr) {
    try {
      localStorage.setItem(PM34_PMS_KEY, JSON.stringify(arr || []));
      return true;
    } catch (e) {
      toast("Save failed (storage full). Export photos or reduce images.");
      return false;
    }
  }

  function todayStr() {
    const d = new Date();
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const dd = String(d.getDate()).padStart(2,"0");
    const yyyy = String(d.getFullYear());
    return `${yyyy}-${mm}-${dd}`;
  }

  function parseDate(s) {
    // supports YYYY-MM-DD or MM/DD/YYYY (fallback)
    const str = String(s || "").trim();
    if (!str) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str+"T00:00:00");
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [m,d,y]=str.split("/");
      return new Date(`${y}-${m}-${d}T00:00:00`);
    }
    const d = new Date(str);
    return Number.isFinite(d.getTime()) ? d : null;
  }

  function lastDoneDate(pm) {
    const h = Array.isArray(pm.history) ? pm.history : [];
    if (!h.length) return "";
    return String(h[0].date || "");
  }

  function isDue(pm) {
    const freq = String(pm.frequency || "Daily");
    const last = parseDate(lastDoneDate(pm));
    if (!last) return true;
    const now = parseDate(todayStr());
    const diffDays = Math.floor((now - last) / (1000*60*60*24));
    if (freq === "Weekly") return diffDays >= 7;
    return diffDays >= 1; // Daily default
  }

  function visAllows(pm) {
    // Optional visibility object; default visible
    const v = pm && pm.visibility;
    if (!v) return true;
    if (currentRole === "Admin") return v.Admin !== false;
    if (currentRole === "Supervisor") return v.Supervisor !== false;
    if (currentRole === "Maintenance") return v.Maintenance !== false;
    if (currentRole === "Ground") return v.Ground !== false;
    return true;
  }

  function groupByArea(pms) {
    const g = {};
    AREAS.forEach(a => g[a] = []);
    pms.forEach(pm => {
      const a = AREAS.includes(pm.area) ? pm.area : AREAS[0];
      g[a].push(pm);
    });
    return g;
  }

  // Screen show/hide isolated (doesn't touch existing .screen logic)
  function showPm34() {
    pmScreen.classList.remove("hidden");
    pmScreen.setAttribute("aria-hidden", "false");
    navBtn.classList.add("pm34-active");
    render();
  }
  function hidePm34() {
    pmScreen.classList.add("hidden");
    pmScreen.setAttribute("aria-hidden", "true");
    navBtn.classList.remove("pm34-active");
    closeCompleteModal();
    closePinModal();
  }

  // Close PM34 if user taps any existing nav button (additive listener)
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const nav = t.closest(".nav-btn");
    if (nav) hidePm34();
  });

  navBtn.addEventListener("click", () => {
    const isOpen = !pmScreen.classList.contains("hidden");
    if (isOpen) hidePm34();
    else showPm34();
  });

  // Filters
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      pmFilter = String(btn.dataset.filter || "DUE");
      filterBtns.forEach(b => b.classList.toggle("active", b === btn));
      render();
    });
  });

  // Add PM (admin-only) — placeholder behavior is NOT allowed.
  // We will reuse existing "Add PM" UI if it exists in baseline by clicking it,
  // but WITHOUT changing any baseline logic.
  addPmBtn.addEventListener("click", () => {
    if (!can("manage")) return toast("Admin only (unlock PIN).");
    // Try to open existing baseline Add PM panel if it exists (id may vary).
    const legacyBtn = document.querySelector("#openPmPanelBtn, #addPmBtn, [data-action='add-pm']");
    if (legacyBtn instanceof HTMLElement) {
      legacyBtn.click();
      return;
    }
    toast("Add PM uses the existing PM add panel in Gold Baseline.");
  });

  // Role select
  function applyRoleUi() {
    if (roleSelect) roleSelect.value = currentRole;
    const isAdmin = currentRole === "Admin";
    const unlocked = isAdmin && adminUnlocked;
    if (adminStatusChip) adminStatusChip.textContent = unlocked ? "Unlocked" : "Locked";
    if (adminLockBtn) adminLockBtn.classList.toggle("hidden", !unlocked);
    if (adminPanel) adminPanel.classList.toggle("hidden", !unlocked);
  }

  if (roleSelect) {
    roleSelect.addEventListener("change", () => {
      const next = String(roleSelect.value || "Maintenance");
      currentRole = ROLES.includes(next) ? next : "Maintenance";
      saveRole(currentRole);
      // If role changes away from Admin, lock admin
      if (currentRole !== "Admin") adminUnlocked = false;
      applyRoleUi();
      render();
    });
  }

  // PIN modal open/close
  function openPinModal(msg) {
    if (pinMsg) pinMsg.textContent = msg || "";
    if (pinInput) pinInput.value = "";
    pinOverlay.classList.remove("hidden");
    pinOverlay.setAttribute("aria-hidden", "false");
  }
  function closePinModal() {
    if (!pinOverlay) return;
    pinOverlay.classList.add("hidden");
    pinOverlay.setAttribute("aria-hidden", "true");
    if (pinMsg) pinMsg.textContent = "";
    if (pinInput) pinInput.value = "";
  }

  if (pinClose) pinClose.addEventListener("click", closePinModal);
  if (pinOverlay) pinOverlay.addEventListener("click", (e) => { if (e.target === pinOverlay) closePinModal(); });

  if (adminUnlockBtn) adminUnlockBtn.addEventListener("click", () => {
    if (currentRole !== "Admin") return toast("Set role to Admin first.");
    const stored = getAdminPin();
    if (!stored) openPinModal("No PIN set yet. Enter a new PIN to set it.");
    else openPinModal("Enter Admin PIN");
  });

  if (pinSubmit) pinSubmit.addEventListener("click", () => {
    if (currentRole !== "Admin") return;
    const entered = String(pinInput.value || "").trim();
    const stored = getAdminPin();

    if (!stored) {
      if (!validPin(entered)) {
        if (pinMsg) pinMsg.textContent = "PIN must be 4–8 digits.";
        return;
      }
      setAdminPin(entered);
      adminUnlocked = true;
      closePinModal();
      applyRoleUi();
      toast("Admin unlocked (PIN set).");
      return;
    }

    if (entered === stored) {
      adminUnlocked = true;
      closePinModal();
      applyRoleUi();
      toast("Admin unlocked.");
    } else {
      if (pinMsg) pinMsg.textContent = "Incorrect PIN.";
      toast("Incorrect PIN.");
    }
  });

  if (adminLockBtn) adminLockBtn.addEventListener("click", () => {
    adminUnlocked = false;
    applyRoleUi();
    toast("Admin locked.");
  });

  if (savePinBtn) savePinBtn.addEventListener("click", () => {
    if (!can("manage")) return toast("Admin only.");
    const p1 = String(pinNew.value || "").trim();
    const p2 = String(pinConfirm.value || "").trim();
    if (!validPin(p1)) return toast("PIN must be 4–8 digits.");
    if (p1 !== p2) return toast("PINs do not match.");
    setAdminPin(p1);
    pinNew.value = "";
    pinConfirm.value = "";
    toast("PIN saved.");
  });

  // Completion modal logic
  function openCompleteModal(pm) {
    completingPmId = pm.id;
    completionPhotos = [];
    renderPhotoGrid();

    if (compTitle) compTitle.textContent = `Complete PM - ${pm.area || "PM"}`;
    if (compDate) compDate.value = todayStr();
    if (compNotes) compNotes.value = "";

    const checklist = Array.isArray(pm.checklist) ? pm.checklist : [];
    checklistState = checklist.map(() => false);

    // Checklist block
    if (checklist.length) {
      checklistBlock.classList.remove("hidden");
      checklistEl.innerHTML = checklist.map((item, idx) => {
        const disabled = !can("checklist");
        return `
          <label class="pm34-check ${disabled ? "disabled" : ""}">
            <input type="checkbox" data-idx="${idx}" ${disabled ? "disabled" : ""}>
            <span>${escapeHtml(item)}</span>
          </label>
        `;
      }).join("");
      if (checklistHint) checklistHint.textContent = can("checklist")
        ? "Check all items to enable completion."
        : "Ground role is view-only.";
      // Disabled until all checked
      setCompleteEnabled(false);
    } else {
      checklistBlock.classList.add("hidden");
      checklistEl.innerHTML = "";
      setCompleteEnabled(true);
    }

    // Photos permission
    const photosOk = can("photos");
    addPhotoBtn.disabled = !photosOk;
    addPhotoBtn.style.opacity = photosOk ? "" : "0.55";

    // Complete permission
    if (!can("complete")) {
      setCompleteEnabled(false);
      completeBtn.textContent = "View Only";
      completeBtn.disabled = true;
    } else {
      completeBtn.textContent = "Complete PM";
    }

    compOverlay.classList.remove("hidden");
    compOverlay.setAttribute("aria-hidden", "false");
  }

  function closeCompleteModal() {
    if (!compOverlay) return;
    compOverlay.classList.add("hidden");
    compOverlay.setAttribute("aria-hidden", "true");
    completingPmId = null;
    checklistState = [];
    completionPhotos = [];
    if (checklistEl) checklistEl.innerHTML = "";
    renderPhotoGrid();
  }

  function setCompleteEnabled(enabled) {
    if (!completeBtn) return;
    completeBtn.disabled = !enabled;
  }

  if (closeComplete) closeComplete.addEventListener("click", closeCompleteModal);
  if (compOverlay) compOverlay.addEventListener("click", (e) => { if (e.target === compOverlay) closeCompleteModal(); });

  if (checklistEl) checklistEl.addEventListener("change", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    const idx = Number(t.dataset.idx);
    if (!Number.isFinite(idx)) return;
    checklistState[idx] = !!t.checked;
    const all = checklistState.length ? checklistState.every(Boolean) : true;
    // Only enable if role can complete
    if (can("complete")) setCompleteEnabled(all);
  });

  // Photos
  function updatePhotoCount() {
    if (photoCount) photoCount.textContent = String(completionPhotos.length);
  }
  function renderPhotoGrid() {
    if (!photoGrid) return;
    updatePhotoCount();
    photoGrid.innerHTML = completionPhotos.map(src => `<img src="${src}" alt="photo">`).join("");
  }
  async function filesToBase64(files, max) {
    const arr = Array.from(files || []).slice(0, max);
    const reads = arr.map(f => new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ""));
      r.onerror = () => resolve("");
      r.readAsDataURL(f);
    }));
    const res = await Promise.all(reads);
    return res.filter(Boolean);
  }

  addPhotoBtn.addEventListener("click", () => {
    if (!can("photos")) return;
    photoInput.click();
  });

  photoInput.addEventListener("change", async () => {
    if (!can("photos")) return;
    const add = await filesToBase64(photoInput.files, 4 - completionPhotos.length);
    completionPhotos = completionPhotos.concat(add).slice(0, 4);
    renderPhotoGrid();
    photoInput.value = "";
  });

  // Complete
  completeBtn.addEventListener("click", () => {
    if (!can("complete")) return;

    const pms = readPms();
    const idx = pms.findIndex(x => x && x.id === completingPmId);
    if (idx < 0) return;

    const pm = pms[idx];
    const checklist = Array.isArray(pm.checklist) ? pm.checklist : [];
    if (checklist.length) {
      const all = checklistState.length ? checklistState.every(Boolean) : false;
      if (!all) return toast("Check all checklist items first.");
    }

    const entry = {
      date: compDate.value || todayStr(),
      notes: String(compNotes.value || "").trim(),
      photos: completionPhotos.slice(0, 4)
    };
    if (checklist.length) entry.checklistResults = checklistState.slice();

    pm.history = Array.isArray(pm.history) ? pm.history : [];
    pm.history.unshift(entry);

    pms[idx] = pm;
    if (!writePms(pms)) return;

    closeCompleteModal();
    render();
    toast("PM completed.");
  });

  // PM list click
  pmList.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const card = t.closest("[data-pm34-id]");
    if (!card) return;
    const id = card.getAttribute("data-pm34-id");
    const pms = readPms().filter(visAllows);
    const pm = pms.find(x => x && x.id === id);
    if (!pm) return;

    if (t.closest(".pm34-do-complete")) {
      // Ground is view-only
      if (!can("complete")) return toast("Ground is view-only for PMs.");
      // If due filter shows only due, but can still complete
      openCompleteModal(pm);
      return;
    }
  });

  function render() {
    const raw = readPms().filter(visAllows);

    const dueCount = raw.filter(isDue).length;
    if (dueLine) dueLine.textContent = `${dueCount} PMs due today`;

    // Admin-only button visibility
    addPmBtn.style.display = can("manage") ? "" : "none";

    const list = raw.filter(pm => {
      const due = isDue(pm);
      if (pmFilter === "DUE") return due;
      if (pmFilter === "DONE") return !due;
      return true; // ALL
    });

    if (!list.length) {
      pmList.innerHTML = `<div class="pm34-card">No PMs in this filter.</div>`;
      return;
    }

    const grouped = groupByArea(list);
    pmList.innerHTML = AREAS.map(area => {
      const items = grouped[area] || [];
      if (!items.length) return "";
      return `
        <div class="pm34-area">
          <div class="pm34-area-title">${escapeHtml(area)}</div>
          ${items.map(pm => {
            const due = isDue(pm);
            const last = lastDoneDate(pm);
            const checklist = Array.isArray(pm.checklist) ? pm.checklist.length : 0;
            const pill = due ? `<span class="pm34-pill due">DUE</span>` : `<span class="pm34-pill done">DONE</span>`;
            const hint = `${escapeHtml(pm.frequency || "Daily")}${last ? " • Last: " + escapeHtml(last) : ""}${checklist ? " • ☑️ " + checklist : ""}`;
            return `
              <div class="pm34-card" data-pm34-id="${escapeHtml(pm.id)}">
                <div class="pm34-card-top">
                  <div>
                    <div class="pm34-name">${escapeHtml(pm.name || "PM")}</div>
                    <div class="pm34-meta">${hint}</div>
                  </div>
                  ${pill}
                </div>
                <div class="pm34-actions">
                  <button class="pm34-btn pm34-btn-primary pm34-do-complete" type="button" ${can("complete") ? "" : "disabled"}>${can("complete") ? "Complete PM" : "View Only"}</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }).join("");

    applyRoleUi();
  }

  function toast(msg) {
    // Use existing toast if present, else minimal
    if (typeof window.showToast === "function") { window.showToast(msg); return; }
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.bottom = "86px";
    el.style.background = "rgba(0,0,0,0.85)";
    el.style.color = "#fff";
    el.style.padding = "10px 12px";
    el.style.borderRadius = "12px";
    el.style.fontWeight = "800";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Initialize UI
  document.addEventListener("DOMContentLoaded", () => {
    currentRole = loadRole();
    applyRoleUi();
  });

  // Immediate apply (in case script runs after DOM is ready)
  applyRoleUi();
})();
