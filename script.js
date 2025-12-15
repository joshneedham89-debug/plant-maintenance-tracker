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
let problemPhotosDraft = [];
/* ===== End Phase 3.2 ===== */

/* ===== Phase 3.1/3.2: Lightbox gallery state ===== */
let lightboxImages = [];
let lightboxIndex = 0;
let touchStartX = null;
/* ===== End Lightbox ===== */

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

/* ===== Phase 3.2: Dashboard Open Problems count ===== */
const openProblemsCountEl = document.getElementById("openProblemsCount");
const maintProblemBadge = document.getElementById("maintProblemBadge");
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

/* ===== Phase 3.2: Problem UI refs ===== */
const probTitle = document.getElementById("probTitle");
const probDesc = document.getElementById("probDesc");
const probSeverity = document.getElementById("probSeverity");
const probStatus = document.getElementById("probStatus");
const probAddPhotoBtn = document.getElementById("probAddPhotoBtn");
const probPhotoInput = document.getElementById("probPhotoInput");
const probPhotoPreview = document.getElementById("probPhotoPreview");
const probSubmitBtn = document.getElementById("probSubmitBtn");
const problemsList = document.getElementById("problemsList");
const probFilter = document.getElementById("probFilter");
/* ===== End Phase 3.2 ===== */

/* ===== Lightbox refs ===== */
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxCounter = document.getElementById("lightboxCounter");
/* ===== End Lightbox refs ===== */

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
   LIGHTBOX (Phase 3.1/3.2 gallery)
--------------------------------------------------- */
function updateLightboxUI() {
  if (!lightboxImg || !lightboxCounter) return;

  const total = lightboxImages.length || 1;
  const idx = Math.min(Math.max(lightboxIndex, 0), total - 1);
  lightboxIndex = idx;

  lightboxImg.src = lightboxImages[idx] || "";
  lightboxCounter.textContent = `${idx + 1} / ${total}`;

  // hide arrows if only 1
  const showNav = total > 1;
  lightboxPrev?.classList.toggle("hidden", !showNav);
  lightboxNext?.classList.toggle("hidden", !showNav);
}

function openLightbox(imagesOrSrc, startIndex = 0) {
  if (!lightboxOverlay || !lightboxImg) return;

  if (Array.isArray(imagesOrSrc)) lightboxImages = imagesOrSrc.slice();
  else lightboxImages = [String(imagesOrSrc || "")];

  lightboxIndex = Number.isFinite(startIndex) ? startIndex : 0;

  lightboxOverlay.classList.remove("hidden");
  lightboxOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  updateLightboxUI();
}

function closeLightbox() {
  if (!lightboxOverlay || !lightboxImg) return;
  lightboxOverlay.classList.add("hidden");
  lightboxOverlay.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  document.body.style.overflow = "";
  lightboxImages = [];
  lightboxIndex = 0;
  touchStartX = null;
}

function lightboxGo(delta) {
  if (!lightboxImages.length) return;
  const total = lightboxImages.length;
  lightboxIndex = (lightboxIndex + delta + total) % total;
  updateLightboxUI();
}

lightboxClose?.addEventListener("click", closeLightbox);

lightboxPrev?.addEventListener("click", (e) => {
  e.stopPropagation();
  lightboxGo(-1);
});

lightboxNext?.addEventListener("click", (e) => {
  e.stopPropagation();
  lightboxGo(1);
});

lightboxOverlay?.addEventListener("click", (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});

/* Swipe support */
lightboxOverlay?.addEventListener("touchstart", (e) => {
  if (!e.touches || !e.touches.length) return;
  touchStartX = e.touches[0].clientX;
}, { passive: true });

lightboxOverlay?.addEventListener("touchend", (e) => {
  if (touchStartX === null) return;
  const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : null;
  if (endX === null) return;

  const dx = endX - touchStartX;
  touchStartX = null;

  if (Math.abs(dx) < 40) return;
  if (dx < 0) lightboxGo(1);
  else lightboxGo(-1);
}, { passive: true });

/* Keyboard arrows */
document.addEventListener("keydown", (e) => {
  const open = lightboxOverlay && !lightboxOverlay.classList.contains("hidden");
  if (!open) return;

  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") lightboxGo(-1);
  if (e.key === "ArrowRight") lightboxGo(1);
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

  /* Phase 3.2: problems */
  problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];

  if (currentTonsInput) currentTonsInput.value = currentTons;

  buildCategoryDropdown();
  buildInventoryCategoryDropdown();
  buildInventoryNameDatalist();
  buildCompleteInventorySelect();

  renderDashboard();
  renderParts();
  renderInventory();
  renderProblems();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, String(currentTons));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));

  /* Phase 3.2 */
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
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
  if (screenId === "maintenanceScreen") { renderParts(); renderProblems(); }
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
function getOpenProblemsCount() {
  return (problems || []).filter(p => (p.status || "Open") === "Open").length;
}

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

  // Phase 3.2
  const openProblems = getOpenProblemsCount();
  if (openProblemsCountEl) openProblemsCountEl.textContent = openProblems;

  if (maintProblemBadge) {
    if (openProblems > 0) {
      maintProblemBadge.textContent = openProblems;
      maintProblemBadge.classList.remove("hidden");
    } else {
      maintProblemBadge.classList.add("hidden");
    }
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
      .map((h, hi) => {
        const photos = Array.isArray(h.photos) ? h.photos : [];
        const photoCount = photos.length;

        const photoStrip = photoCount
          ? `<div class="history-photo-strip">
              ${photos.slice(0, 6).map((src, pidx) =>
                `<img src="${src}" alt="photo" data-gallery="history" data-part="${idx}" data-hindex="${(p.history || []).length - 1 - hi}" data-pindex="${pidx}">`
              ).join("")}
              ${photoCount > 6 ? `<span class="history-photo-more">+${photoCount - 6}</span>` : ""}
            </div>`
          : "";

        const viewAllBtn = photoCount
          ? `<button class="view-all-photos-btn" data-view-all="1" data-part="${idx}" data-hindex="${(p.history || []).length - 1 - hi}">
              View all photos (${photoCount})
            </button>`
          : "";

        return `
          <div class="part-meta">• ${h.date} – ${h.tons} tons${photoCount ? ` – 📷 ${photoCount}` : ""}</div>
          ${photoStrip}
          ${viewAllBtn}
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
  // View all photos
  const viewAll = e.target.closest("[data-view-all]");
  if (viewAll) {
    const partIdx = Number(viewAll.dataset.part);
    const hIdx = Number(viewAll.dataset.hindex);
    const entry = parts?.[partIdx]?.history?.[hIdx];
    const photos = Array.isArray(entry?.photos) ? entry.photos : [];
    if (photos.length) openLightbox(photos, 0);
    return;
  }

  // Click on history thumbnail
  const historyImg = e.target?.tagName === "IMG" ? e.target : null;
  if (historyImg && historyImg.dataset && historyImg.dataset.gallery === "history") {
    const partIdx = Number(historyImg.dataset.part);
    const hIdx = Number(historyImg.dataset.hindex);
    const pIdx = Number(historyImg.dataset.pindex);
    const entry = parts?.[partIdx]?.history?.[hIdx];
    const photos = Array.isArray(entry?.photos) ? entry.photos : [];
    if (photos.length) openLightbox(photos, pIdx || 0);
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

  /* Phase 3: reset photos each time panel opens */
  completionPhotos = [];
  if (compPhotoPreview) compPhotoPreview.innerHTML = "";
  if (compPhotoInput) compPhotoInput.value = "";

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
          <img src="${src}" alt="Maintenance Photo ${idx + 1}" data-gallery="completion" data-pindex="${idx}">
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
  if (!files.length) return; // user cancelled picker -> Phase 2 behavior

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
  if (img && img.dataset && img.dataset.gallery === "completion") {
    const pIdx = Number(img.dataset.pindex) || 0;
    openLightbox(completionPhotos, pIdx);
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

  saveState();
  renderParts();
  renderInventory();
  renderDashboard();

  showToast("Maintenance logged");
  closeCompletePanel();
});

/* ---------------------------------------------------
   Phase 3.2: REPORT A PROBLEM
--------------------------------------------------- */
function genId() {
  return "p_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36);
}

function renderProblemPhotoPreview() {
  if (!probPhotoPreview) return;

  if (!problemPhotosDraft.length) {
    probPhotoPreview.innerHTML = "";
    return;
  }

  probPhotoPreview.innerHTML = `
    <div class="photo-preview-grid">
      ${problemPhotosDraft.map((src, idx) => `
        <div class="photo-thumb">
          <img src="${src}" alt="Problem Photo ${idx + 1}" data-gallery="problemDraft" data-pindex="${idx}">
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
      problemPhotosDraft.push(String(reader.result || ""));
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

probPhotoPreview?.addEventListener("click", (e) => {
  const btn = e.target.closest(".photo-remove");
  if (btn) {
    const idx = Number(btn.dataset.idx);
    if (!Number.isFinite(idx)) return;
    problemPhotosDraft.splice(idx, 1);
    renderProblemPhotoPreview();
    showToast("Photo removed");
    return;
  }

  const img = e.target?.tagName === "IMG" ? e.target : null;
  if (img && img.dataset && img.dataset.gallery === "problemDraft") {
    const pIdx = Number(img.dataset.pindex) || 0;
    openLightbox(problemPhotosDraft, pIdx);
  }
});

probSubmitBtn?.addEventListener("click", () => {
  const title = (probTitle?.value || "").trim();
  const description = (probDesc?.value || "").trim();
  const severity = probSeverity?.value || "Medium";
  const status = probStatus?.value || "Open";

  if (!title) return showToast("Add a title", "error");

  const now = new Date().toISOString();
  problems.unshift({
    id: genId(),
    title,
    description,
    severity,
    status,
    createdAt: now,
    updatedAt: now,
    photos: problemPhotosDraft.slice()
  });

  // reset form
  if (probTitle) probTitle.value = "";
  if (probDesc) probDesc.value = "";
  if (probSeverity) probSeverity.value = "Medium";
  if (probStatus) probStatus.value = "Open";
  problemPhotosDraft = [];
  renderProblemPhotoPreview();

  saveState();
  renderProblems();
  renderDashboard();
  showToast("Problem submitted");
});

probFilter?.addEventListener("change", renderProblems);

function severityClass(sev) {
  const s = (sev || "").toLowerCase();
  if (s.includes("high")) return "high";
  if (s.includes("low")) return "low";
  return "medium";
}

function renderProblems() {
  if (!problemsList) return;

  const filter = probFilter?.value || "ALL";
  const list = (problems || []).filter(p => filter === "ALL" ? true : (p.status || "Open") === filter);

  problemsList.innerHTML = "";

  if (!list.length) {
    problemsList.innerHTML = `<div class="part-meta">No problems found.</div>`;
    return;
  }

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "problem-card";

    const sevCls = severityClass(p.severity);
    const photos = Array.isArray(p.photos) ? p.photos : [];

    const photoStrip = photos.length
      ? `<div class="history-photo-strip">
          ${photos.slice(0, 6).map((src, idx) =>
            `<img src="${src}" alt="photo" data-gallery="problem" data-probid="${p.id}" data-pindex="${idx}">`
          ).join("")}
          ${photos.length > 6 ? `<span class="history-photo-more">+${photos.length - 6}</span>` : ""}
        </div>`
      : "";

    card.innerHTML = `
      <div class="problem-top">
        <div>
          <div class="problem-title">${p.title}</div>
          <div class="problem-meta">${p.description ? p.description : ""}</div>
          <div class="problem-meta">Created: ${(p.createdAt || "").replace("T"," ").slice(0,16)}</div>
        </div>
        <div class="problem-pill ${sevCls}">${p.severity || "Medium"}</div>
      </div>

      <div class="problem-meta">Status: <b>${p.status || "Open"}</b>${photos.length ? ` • 📷 ${photos.length}` : ""}</div>
      ${photoStrip}
      ${photos.length ? `<button class="view-all-photos-btn" data-prob-viewall="${p.id}">View all photos (${photos.length})</button>` : ""}

      <div class="problem-actions">
        <label class="part-meta" style="margin:0;">Update Status:</label>
        <select data-prob-status="${p.id}">
          <option ${p.status==="Open"?"selected":""}>Open</option>
          <option ${p.status==="In Progress"?"selected":""}>In Progress</option>
          <option ${p.status==="Resolved"?"selected":""}>Resolved</option>
        </select>

        <button class="danger-btn" style="padding:10px 12px;" data-prob-delete="${p.id}">Delete</button>
      </div>
    `;

    problemsList.appendChild(card);
  });
}

problemsList?.addEventListener("change", (e) => {
  const sel = e.target.closest("[data-prob-status]");
  if (!sel) return;

  const id = sel.dataset.probStatus;
  const val = e.target.value;

  const p = problems.find(x => x.id === id);
  if (!p) return;

  p.status = val;
  p.updatedAt = new Date().toISOString();

  saveState();
  renderProblems();
  renderDashboard();
  showToast("Status updated");
});

problemsList?.addEventListener("click", (e) => {
  // delete
  const del = e.target.closest("[data-prob-delete]");
  if (del) {
    const id = del.dataset.probDelete;
    if (!confirm("Delete this problem?")) return;
    problems = problems.filter(p => p.id !== id);
    saveState();
    renderProblems();
    renderDashboard();
    showToast("Problem deleted");
    return;
  }

  // view all
  const viewAll = e.target.closest("[data-prob-viewall]");
  if (viewAll) {
    const id = viewAll.dataset.probViewall;
    const p = problems.find(x => x.id === id);
    const photos = Array.isArray(p?.photos) ? p.photos : [];
    if (photos.length) openLightbox(photos, 0);
    return;
  }

  // click thumbnail
  const img = e.target?.tagName === "IMG" ? e.target : null;
  if (img && img.dataset && img.dataset.gallery === "problem") {
    const id = img.dataset.probid;
    const idx = Number(img.dataset.pindex) || 0;
    const p = problems.find(x => x.id === id);
    const photos = Array.isArray(p?.photos) ? p.photos : [];
    if (photos.length) openLightbox(photos, idx);
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
