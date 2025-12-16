/* ---------------------------------------------------
   STORAGE KEYS
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";

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

/* ===== Phase 3.2: Problems ===== */
let problems = [];
let problemPhotos = []; // array of dataURL strings
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

/* ===== Phase 3: Photo UI references ===== */
const compAddPhotoBtn = document.getElementById("compAddPhotoBtn");
const compPhotoInput = document.getElementById("compPhotoInput");
const compPhotoPreview = document.getElementById("compPhotoPreview");
/* ===== End Phase 3 ===== */

/* ===== Phase 3.1: Lightbox refs ===== */
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
/* ===== End Phase 3.1 ===== */

/* ===== Phase 3.2: Problem Panel refs ===== */
const openProblemPanelBtn = document.getElementById("openProblemPanelBtn");
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
/* ===== End Phase 3.2 ===== */

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
   Phase 3.1: LIGHTBOX
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

  // everything else that was already inside loadState stays here
}

  // categories + default inventory come from inventory.js
  categories = Array.isArray(PRELOADED_CATEGORIES) ? PRELOADED_CATEGORIES : [];

  const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY));
  inventory = storedInventory?.length ? storedInventory : (PRELOADED_INVENTORY?.slice?.() || []);

  /* ===== Phase 3.2: load problems ===== */
  problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];
  /* ===== End Phase 3.2 ===== */

  if (currentTonsInput) currentTonsInput.value = "";

  buildCategoryDropdown();
  buildInventoryCategoryDropdown();
  buildInventoryNameDatalist();
  buildCompleteInventorySelect();

  /* ===== Phase 3.2: build problem category dropdown ===== */
  buildProblemCategoryDropdown();
  /* ===== End Phase 3.2 ===== */

  renderDashboard();
  renderParts();
  renderInventory();
}

function saveState() {
  try {
    localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
    localStorage.setItem(TONS_KEY, String(currentTons));
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));

    /* ===== Phase 3.2: save problems ===== */
    localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
    /* ===== End Phase 3.2 ===== */

    return true;
  } catch (err) {
    console.warn("Save failed:", err);
    showToast("Storage full — try fewer photos (or export + reset)", "error");
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
  if (screenId === "maintenanceScreen") renderParts();
  if (screenId === "inventoryScreen") renderInventory();
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

/* ---------------------------------------------------
   TONS
--------------------------------------------------- */
updateTonsBtn?.addEventListener("click", () => {
  const add = Number(currentTonsInput?.value);
  if (!Number.isFinite(add) || add <= 0) {
    showToast("Enter tons to add", "error");
    return;
  }

  currentTons = Number(currentTons) + add;

  if (currentTonsInput) currentTonsInput.value = "";
  if (!saveState()) return;

  renderDashboard();
  showToast(`Added ${add} tons`);
});

resetTonsBtn?.addEventListener("click", () => {
  currentTons = 0;
  if (currentTonsInput) currentTonsInput.value = "";
  if (!saveState()) return;
  renderDashboard();
  showToast("Tons reset to 0");
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

  /* ===== Phase 3.2: open problems count ===== */
  if (openProblemsCountEl) {
    const openCount = (problems || []).filter(p => (p.status || "Open") === "Open").length;
    openProblemsCountEl.textContent = openCount;
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
      .map(h => {
        const photoCount = Array.isArray(h.photos) ? h.photos.length : 0;
        const photoStrip = photoCount
          ? `<div class="history-photo-strip">
              ${h.photos.slice(0, 6).map(src => `<img src="${src}" alt="photo">`).join("")}
              ${photoCount > 6 ? `<span class="history-photo-more">+${photoCount - 6}</span>` : ""}
            </div>`
          : "";
        return `
          <div class="part-meta">• ${h.date} – ${h.tons} tons${photoCount ? ` – 📷 ${photoCount}` : ""}</div>
          ${photoStrip}
        `;
      })
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

/* Expand/collapse + part actions + photo lightbox */
partsList?.addEventListener("click", (e) => {
  // Phase 3.1: history thumbnail -> lightbox
  const historyImg = e.target?.tagName === "IMG" ? e.target.closest(".history-photo-strip img") : null;
  if (historyImg && historyImg.src) {
    openLightbox(historyImg.src);
    return;
  }

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

  /* ===== Phase 3: reset photos each time panel opens ===== */
  completionPhotos = [];
  if (compPhotoPreview) compPhotoPreview.innerHTML = "";
  if (compPhotoInput) compPhotoInput.value = "";
  /* ===== End Phase 3 ===== */

  const today = new Date().toISOString().split("T")[0];
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

closeCompletePanelBtn?.addEventListener("click", closeCompletePanel);
completePanelOverlay?.addEventListener("click", (e) => {
  if (e.target === completePanelOverlay) closeCompletePanel();
});

function buildCompleteInventorySelect() {
  if (!compInvSelect) return;
  compInvSelect.innerHTML = `<option value="">Select inventory item</option>`;
  inventory.forEach((item, idx) => {
    compInvSelect.innerHTML += `<option value="${idx}">
      ${item.part} (Qty: ${item.qty})
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

/* ---------------------------------------------------
   PHOTO UTIL (resize/compress for localStorage safety)
--------------------------------------------------- */
function fileToCompressedDataURL(file, maxDim = 1280, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith("image/")) return resolve("");

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        let w = img.width || 0;
        let h = img.height || 0;

        if (!w || !h) return resolve(dataUrl);

        const scale = Math.min(1, maxDim / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);

        // JPEG is much smaller than PNG for photos
        const out = canvas.toDataURL("image/jpeg", quality);
        resolve(out);
      };
      img.onerror = () => resolve(dataUrl); // fallback
      img.src = dataUrl;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

/* ===== Phase 3: Photo handlers (button-based, optional) ===== */
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

compPhotoInput?.addEventListener("change", async () => {
  const files = Array.from(compPhotoInput.files || []);
  if (!files.length) return; // user cancelled picker -> Phase 2 behavior

  const MAX_ADD = 8;
  const toAdd = files.slice(0, MAX_ADD).filter(f => f.type?.startsWith("image/"));

  const urls = (await Promise.all(toAdd.map(f => fileToCompressedDataURL(f)))).filter(Boolean);
  completionPhotos.push(...urls);

  renderCompletionPhotoPreview();
  showToast(`Added ${urls.length} photo${urls.length !== 1 ? "s" : ""}`);

  compPhotoInput.value = "";
});

// Phase 3.1: tap preview thumb to open lightbox (remove button still works)
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
  if (img && img.src) {
    openLightbox(img.src);
  }
});
/* ===== End Phase 3 ===== */

saveCompletionBtn?.addEventListener("click", () => {
  const p = parts[completingPartIndex];
  if (!p) return;

  const date = compDate.value;
  const tons = Number(compTons.value);
  const notes = (compNotes.value || "").trim();

  if (!date || isNaN(tons)) return showToast("Enter date + tons", "error");

  // backups (so we can roll back if storage is full)
  const prevDate = p.date;
  const prevLastTons = p.lastTons;
  const prevHistoryLen = Array.isArray(p.history) ? p.history.length : 0;
  const prevInvQty = completionUsedItems.map(u => ({
    invIndex: u.invIndex,
    qty: inventory[u.invIndex]?.qty
  }));

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

  if (!saveState()) {
    // roll back
    p.date = prevDate;
    p.lastTons = prevLastTons;
    if (Array.isArray(p.history)) p.history = p.history.slice(0, prevHistoryLen);

    prevInvQty.forEach(b => {
      if (!inventory[b.invIndex]) return;
      inventory[b.invIndex].qty = b.qty;
    });

    return; // toast already shown by saveState()
  }

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
  const data = { parts, currentTons, inventory, problems };
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
   Phase 3.2: REPORT A PROBLEM (Home + slide panel)
=================================================== */

function buildProblemCategoryDropdown() {
  if (!probCategory) return;
  probCategory.innerHTML = "";
  (categories || []).forEach(c => {
    probCategory.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function openProblemPanel() {
  // reset form each open
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

probPhotoInput?.addEventListener("change", async () => {
  const files = Array.from(probPhotoInput.files || []);
  if (!files.length) return;

  const MAX_ADD = 8;
  const toAdd = files.slice(0, MAX_ADD).filter(f => f.type?.startsWith("image/"));

  const urls = (await Promise.all(toAdd.map(f => fileToCompressedDataURL(f)))).filter(Boolean);
  problemPhotos.push(...urls);

  renderProblemPhotoPreview();
  showToast(`Added ${urls.length} photo${urls.length !== 1 ? "s" : ""}`);

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
  e.stopPropagation();

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

  if (!saveState()) {
    problems.shift(); // roll back
    return;
  }

  renderDashboard();

  showToast("Problem saved");
  closeProblemPanel();
});
