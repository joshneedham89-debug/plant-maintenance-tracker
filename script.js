/* ---------------------------------------------------
   STORAGE KEYS (GOLD - DO NOT CHANGE)
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";
const PROBLEMS_KEY = "pm_problems";
const PMS_KEY = "pm_pms";

/* Phase 3.4 (Additive): Roles + Admin PIN (local only) */
const ROLE_KEY = "pm_role";
const ROLE_CFG_KEY = "pm_role_cfg";
const ADMIN_PIN_KEY = "pm_admin_pin";

/* ---------------------------------------------------
   GLOBAL STATE
--------------------------------------------------- */
let parts = [];
let currentTons = 0;

let categories = [];
let inventory = [];

/* Photos */
let partPhotos = [];
let problemPhotos = [];
let pmCompletionPhotos = [];
let pmChecklistState = []; // Phase 3.4

/* Problems */
let problems = [];
let currentProblemFilter = "ALL";
let viewingProblemId = null;

/* PMs */
let pms = [];
let currentPmFilter = "ALL";
let editingPmId = null;
let completingPmId = null;
/* Phase 3.4: Role enforcement state */
let currentRole = "Maintenance";
let adminAuthed = false;
let roleCfg = { allowRoleChange: true };

function normalizeRole(r) {
  const v = String(r || "").trim();
  if (["Admin","Supervisor","Maintenance","Ground"].includes(v)) return v;
  return "Maintenance";
}

function loadRoleState() {
  currentRole = normalizeRole(localStorage.getItem(ROLE_KEY) || "Maintenance");
  try {
    roleCfg = JSON.parse(localStorage.getItem(ROLE_CFG_KEY)) || { allowRoleChange: true };
  } catch (e) {
    roleCfg = { allowRoleChange: true };
  }
}

function saveRoleState() {
  localStorage.setItem(ROLE_KEY, currentRole);
  localStorage.setItem(ROLE_CFG_KEY, JSON.stringify(roleCfg || { allowRoleChange: true }));
}

function isAdminRole() { return currentRole === "Admin"; }

function canPm(action) {
  // PM Role Matrix (locked)
  // action: viewTab, view, complete, checklist, photos, manage
  if (action === "viewTab") return true;
  if (action === "view") return true;
  if (["complete","checklist","photos"].includes(action)) return currentRole !== "Ground";
  if (action === "manage") return isAdminRole() && adminAuthed;
  return false;
}

function getStoredAdminPin() {
  return String(localStorage.getItem(ADMIN_PIN_KEY) || "");
}

function setStoredAdminPin(pin) {
  localStorage.setItem(ADMIN_PIN_KEY, String(pin));
}

function isValidPin(pin) {
  const p = String(pin || "").trim();
  return /^[0-9]{4,8}$/.test(p);
}

/* ---------------------------------------------------
   ELEMENT REFERENCES
--------------------------------------------------- */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

/* Dashboard */
const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const pmDueTodayCountEl = document.getElementById("pmDueTodayCount");
const openProblemsCountEl = document.getElementById("openProblemsCount");

/* Tons */
const currentTonsInput = document.getElementById("currentTonsInput");
const updateTonsBtn = document.getElementById("updateTonsBtn");
const exportMaintenanceBtn = document.getElementById("exportMaintenanceBtn");

/* Nav */
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const screenId = btn.dataset.screen;
    showScreen(screenId);
  });
});

/* Maintenance */
const searchPartsInput = document.getElementById("searchPartsInput");
const filterCategory = document.getElementById("filterCategory");
const addPartBtn = document.getElementById("addPartBtn");
const partsListEl = document.getElementById("partsList");

/* Inventory */
const searchInventory = document.getElementById("searchInventory");
const inventoryListEl = document.getElementById("inventoryList");

/* AC Calc */
const ac_oilRate = document.getElementById("ac_oilRate");
const ac_pumpRate = document.getElementById("ac_pumpRate");
const ac_totalAc = document.getElementById("ac_totalAc");
const ac_calcBtn = document.getElementById("ac_calcBtn");

/* Settings */
const exportBtn = document.getElementById("exportBtn");
const exportPmComplianceBtn = document.getElementById("exportPmComplianceBtn");
const resetAllBtn = document.getElementById("resetAllBtn");

/* Phase 3.4: Roles / Admin PIN UI */
const roleSelect = document.getElementById("roleSelect");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const adminPanel = document.getElementById("adminPanel");
const allowRoleChangeChk = document.getElementById("allowRoleChangeChk");
const adminPinNew = document.getElementById("adminPinNew");
const adminPinConfirm = document.getElementById("adminPinConfirm");
const saveAdminPinBtn = document.getElementById("saveAdminPinBtn");

const adminPinOverlay = document.getElementById("adminPinOverlay");
const adminPinPanel = document.getElementById("adminPinPanel");
const closeAdminPinBtn = document.getElementById("closeAdminPin");
const adminPinInput = document.getElementById("adminPinInput");
const adminPinMsg = document.getElementById("adminPinMsg");
const submitAdminPinBtn = document.getElementById("submitAdminPinBtn");

/* Phase 3.4: PM checklist + visibility */
const pmChecklistDef = document.getElementById("pmChecklistDef");
const pmVisAdmin = document.getElementById("pmVisAdmin");
const pmVisSupervisor = document.getElementById("pmVisSupervisor");
const pmVisMaintenance = document.getElementById("pmVisMaintenance");
const pmVisGround = document.getElementById("pmVisGround");
const pmDefLocked = document.getElementById("pmDefLocked");

const pmChecklistWrap = document.getElementById("pmChecklistWrap");
const pmChecklistList = document.getElementById("pmChecklistList");
const pmChecklistHint = document.getElementById("pmChecklistHint");

const pmDueTodayText = document.getElementById("pmDueTodayText");

/* Panels: Parts */
const partPanelOverlay = document.getElementById("partPanelOverlay");
const addPartPanel = document.getElementById("addPartPanel");
const partPanelTitle = document.getElementById("partPanelTitle");
const closePartPanelBtn = document.getElementById("closePartPanel");
const savePartBtn = document.getElementById("savePartBtn");
const newPartName = document.getElementById("newPartName");
const newPartCategory = document.getElementById("newPartCategory");
const newPartSection = document.getElementById("newPartSection");
const newPartMinQty = document.getElementById("newPartMinQty");
const newPartQty = document.getElementById("newPartQty");
const newPartNotes = document.getElementById("newPartNotes");
const addPhotoBtn = document.getElementById("addPhotoBtn");
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");

/* Panels: Problems */
const problemPanelOverlay = document.getElementById("problemPanelOverlay");
const problemPanel = document.getElementById("problemPanel");
const problemPanelTitle = document.getElementById("problemPanelTitle");
const closeProblemPanelBtn = document.getElementById("closeProblemPanel");
const saveProblemBtn = document.getElementById("saveProblemBtn");
const deleteProblemBtn = document.getElementById("deleteProblemBtn");
const openProblemPanelBtn = document.getElementById("openProblemPanelBtn");
const openProblemPanelBtn2 = document.getElementById("openProblemPanelBtn2");
const problemTitle = document.getElementById("problemTitle");
const problemArea = document.getElementById("problemArea");
const problemStatus = document.getElementById("problemStatus");
const problemNotes = document.getElementById("problemNotes");
const probAddPhotoBtn = document.getElementById("probAddPhotoBtn");
const probPhotoInput = document.getElementById("probPhotoInput");
const probPhotoPreview = document.getElementById("probPhotoPreview");
const problemsListEl = document.getElementById("problemsList");
const probFilterBtns = document.querySelectorAll(".prob-filter");

/* Panels: PMs */
const openPmPanelBtn = document.getElementById("openPmPanelBtn");
const pmsListEl = document.getElementById("pmsList");
const pmFilterBtns = document.querySelectorAll(".pm-filter");

const pmPanelOverlay = document.getElementById("pmPanelOverlay");
const pmPanel = document.getElementById("pmPanel");
const pmPanelTitle = document.getElementById("pmPanelTitle");
const closePmPanelBtn = document.getElementById("closePmPanel");
const savePmBtn = document.getElementById("savePmBtn");
const pmName = document.getElementById("pmName");
const pmArea = document.getElementById("pmArea");
const pmFrequency = document.getElementById("pmFrequency");

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

const pmGalleryOverlay = document.getElementById("pmGalleryOverlay");
const pmGalleryPanel = document.getElementById("pmGalleryPanel");
const pmGalleryTitle = document.getElementById("pmGalleryTitle");
const closePmGalleryBtn = document.getElementById("closePmGallery");
const pmGalleryMeta = document.getElementById("pmGalleryMeta");
const pmGalleryGrid = document.getElementById("pmGalleryGrid");

/* Lightbox */
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxImg = document.getElementById("lightboxImg");

/* ---------------------------------------------------
   SCREEN NAV
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
    renderPmsList(); // safe: PM list now lives on PM tab
  }
  if (screenId === "pmScreen") {
    renderPmsList();
  }
  if (screenId === "inventoryScreen") renderInventory();
}

/* ---------------------------------------------------
   LOAD + SAVE
--------------------------------------------------- */
function loadState() {
  // Phase 3.4: load role state (defaults to Maintenance)
  loadRoleState();

  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  categories = Array.isArray(PRELOADED_CATEGORIES) ? PRELOADED_CATEGORIES : [];

  const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY));
  inventory = storedInventory?.length ? storedInventory : (PRELOADED_INVENTORY?.slice?.() || []);

  problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];
  pms = JSON.parse(localStorage.getItem(PMS_KEY)) || [];

  if (currentTonsInput) currentTonsInput.value = currentTons;

  buildCategoryDropdown();
  buildInventoryPartDatalist();
  buildProblemAreaDropdown();
  buildPmAreaDropdown();

  renderDashboard();
  renderParts();
  renderProblemsList();
  renderPmsList();
  renderInventory();
}

function saveState() {
  try {
    localStorage.setItem(PARTS_KEY, JSON.stringify(parts || []));
    localStorage.setItem(TONS_KEY, String(Number(currentTons || 0)));
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory || []));
    localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems || []));
    localStorage.setItem(PMS_KEY, JSON.stringify(pms || []));
    return true;
  } catch (err) {
    console.error("saveState failed (quota?)", err);
    showToast("Save failed: storage full. Use fewer photos or export + reset.", "error");
    return false;
  }
}

loadState();

/* Phase 3.4: Apply role UI without changing Gold behavior */
function applyRoleUI() {
  if (roleSelect) roleSelect.value = currentRole;

  const allow = !!(roleCfg && roleCfg.allowRoleChange);
  if (allowRoleChangeChk) allowRoleChangeChk.checked = allow;

  // Lock role switching when Admin disables it (unless Admin is unlocked)
  if (roleSelect) {
    const locked = !allow && !(isAdminRole() && adminAuthed);
    roleSelect.disabled = locked;
    roleSelect.classList.toggle("disabled", locked);
  }

  // PM manage controls
  if (openPmPanelBtn) openPmPanelBtn.classList.toggle("hidden", !canPm("manage"));

  // Admin controls panel
  const showAdmin = isAdminRole() && adminAuthed;
  if (adminPanel) adminPanel.classList.toggle("hidden", !showAdmin);
  if (adminLogoutBtn) adminLogoutBtn.classList.toggle("hidden", !showAdmin);
}

function openAdminPinPrompt(msg) {
  if (adminPinMsg) adminPinMsg.textContent = msg || "";
  if (adminPinInput) adminPinInput.value = "";
  adminPinOverlay?.classList.remove("hidden");
  setTimeout(() => adminPinPanel?.classList.add("show"), 10);
}

function closeAdminPinPrompt() {
  adminPinPanel?.classList.remove("show");
  setTimeout(() => adminPinOverlay?.classList.add("hidden"), 250);
  if (adminPinInput) adminPinInput.value = "";
  if (adminPinMsg) adminPinMsg.textContent = "";
}

applyRoleUI();

// Phase 3.4: PM tab default filter = Due Today (does not affect Gold screens)
currentPmFilter = "DUE";

/* ---------------------------------------------------
   DASHBOARD
--------------------------------------------------- */
function renderDashboard() {
  const ok = (parts || []).filter(p => !isDue(p)).length;
  const due = (parts || []).filter(p => isDue(p)).length;
  const over = (parts || []).filter(p => isOverdue(p)).length;

  if (okCountEl) okCountEl.textContent = String(ok);
  if (dueCountEl) dueCountEl.textContent = String(due);
  if (overCountEl) overCountEl.textContent = String(over);

  const openProblems = (problems || []).filter(p => (p.status || "Open") !== "Resolved").length;
  if (openProblemsCountEl) openProblemsCountEl.textContent = String(openProblems);

  const pmDueToday = (pms || []).filter(isPmDue).length;
  if (pmDueTodayCountEl) pmDueTodayCountEl.textContent = String(pmDueToday);
}

/* ---------------------------------------------------
   TONS
--------------------------------------------------- */
updateTonsBtn?.addEventListener("click", () => {
  const val = Number(currentTonsInput?.value || 0);
  if (!Number.isFinite(val) || val <= 0) return showToast("Enter a valid tons amount", "error");
  currentTons += val;
  if (!saveState()) return;
  renderDashboard();
  showToast("Tons updated");
});

exportMaintenanceBtn?.addEventListener("click", () => {
  exportMaintenanceCSV();
});

/* ---------------------------------------------------
   PARTS
--------------------------------------------------- */
function buildCategoryDropdown() {
  if (!newPartCategory || !filterCategory) return;

  newPartCategory.innerHTML = categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  filterCategory.innerHTML = `<option value="ALL">All</option>` + categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function buildInventoryPartDatalist() {
  const dl = document.getElementById("inventoryPartNames");
  if (!dl) return;
  const names = (inventory || []).map(i => i.name).filter(Boolean);
  dl.innerHTML = names.map(n => `<option value="${escapeHtml(n)}"></option>`).join("");
}

searchPartsInput?.addEventListener("input", () => renderParts());
filterCategory?.addEventListener("change", () => renderParts());

addPartBtn?.addEventListener("click", () => openPartPanel(false));

function renderParts() {
  if (!partsListEl) return;

  const q = (searchPartsInput?.value || "").trim().toLowerCase();
  const cat = filterCategory?.value || "ALL";

  const filtered = (parts || []).filter(p => {
    const matchQ = !q || [p.name, p.category, p.section].some(x => String(x || "").toLowerCase().includes(q));
    const matchCat = cat === "ALL" || p.category === cat;
    return matchQ && matchCat;
  });

  if (!filtered.length) {
    partsListEl.innerHTML = `<div class="part-meta">No parts found.</div>`;
    return;
  }

  partsListEl.innerHTML = filtered.map(p => {
    const due = isDue(p);
    const over = isOverdue(p);
    const pill = over ? `<span class="pm-pill pm-due">OVER</span>` : due ? `<span class="pm-pill pm-due">DUE</span>` : `<span class="pm-pill pm-done">OK</span>`;
    const photoTotal = Array.isArray(p.photos) ? p.photos.length : 0;

    return `
      <div class="pm-card" data-partid="${p.id}">
        <div class="pm-card-top">
          <div>
            <div class="pm-title">${escapeHtml(p.name || "Part")}</div>
            <div class="pm-sub">${escapeHtml(p.category || "")} — ${escapeHtml(p.section || "")}</div>
            <div class="pm-sub">Min: ${escapeHtml(p.minQty)} • Qty: ${escapeHtml(p.qty)}${photoTotal ? ` • 📷 ${photoTotal}` : ""}</div>
          </div>
          ${pill}
        </div>

        <div class="pm-actions">
          <button class="part-edit-btn" data-partid="${p.id}">Edit</button>
          <button class="part-photo-btn" data-partid="${p.id}">Photos</button>
          <button class="part-delete-btn" data-partid="${p.id}">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

/* Part panel open/save/close */
function openPartPanel(isEdit, id) {
  partPhotos = [];
  if (photoPreview) photoPreview.innerHTML = "";
  if (photoInput) photoInput.value = "";

  if (isEdit) {
    const item = (parts || []).find(x => x.id === id);
    if (!item) return;
    partPanelTitle.textContent = "Edit Part";
    newPartName.value = item.name || "";
    newPartCategory.value = item.category || categories[0] || "";
    newPartSection.value = item.section || "";
    newPartMinQty.value = item.minQty || 0;
    newPartQty.value = item.qty || 0;
    newPartNotes.value = item.notes || "";
    partPhotos = Array.isArray(item.photos) ? item.photos.slice() : [];
    renderPhotoPreview(photoPreview, partPhotos);
    partPanelOverlay.dataset.editingId = id;
  } else {
    partPanelTitle.textContent = "Add New Part";
    newPartName.value = "";
    newPartCategory.value = categories[0] || "";
    newPartSection.value = "";
    newPartMinQty.value = "";
    newPartQty.value = "";
    newPartNotes.value = "";
    partPanelOverlay.dataset.editingId = "";
  }

  partPanelOverlay?.classList.remove("hidden");
  setTimeout(() => addPartPanel?.classList.add("show"), 10);
}

function closePartPanel() {
  addPartPanel?.classList.remove("show");
  setTimeout(() => partPanelOverlay?.classList.add("hidden"), 250);
}

closePartPanelBtn?.addEventListener("click", closePartPanel);
partPanelOverlay?.addEventListener("click", (e) => { if (e.target === partPanelOverlay) closePartPanel(); });

addPhotoBtn?.addEventListener("click", () => photoInput?.click());

photoInput?.addEventListener("change", async () => {
  const files = Array.from(photoInput.files || []);
  const newPhotos = await filesToBase64(files, 4);
  partPhotos = (partPhotos || []).concat(newPhotos).slice(0, 4);
  renderPhotoPreview(photoPreview, partPhotos);
});

savePartBtn?.addEventListener("click", () => {
  const id = partPanelOverlay.dataset.editingId;
  const name = (newPartName.value || "").trim();
  const category = newPartCategory.value;
  const section = (newPartSection.value || "").trim();
  const minQty = Number(newPartMinQty.value || 0);
  const qty = Number(newPartQty.value || 0);
  const notes = (newPartNotes.value || "").trim();

  if (!name) return showToast("Enter part name", "error");

  const obj = { id: id || ("part_" + Date.now()), name, category, section, minQty, qty, notes, photos: partPhotos || [] };

  if (id) {
    const idx = parts.findIndex(x => x.id === id);
    if (idx >= 0) parts[idx] = obj;
  } else {
    parts.unshift(obj);
  }

  if (!saveState()) return;
  renderParts();
  renderDashboard();
  closePartPanel();
  showToast(id ? "Part updated" : "Part added");
});

/* Parts card click */
partsListEl?.addEventListener("click", (e) => {
  const id = e.target?.dataset?.partid || e.target.closest("[data-partid]")?.dataset?.partid;
  if (!id) return;

  if (e.target.classList.contains("part-edit-btn")) return openPartPanel(true, id);

  if (e.target.classList.contains("part-delete-btn")) {
    if (!confirm("Delete this part?")) return;
    parts = parts.filter(p => p.id !== id);
    if (!saveState()) return;
    renderParts();
    renderDashboard();
    return showToast("Part deleted");
  }

  if (e.target.classList.contains("part-photo-btn")) {
    const item = parts.find(x => x.id === id);
    if (!item) return;
    openLightboxGallery(item.photos || []);
  }
});

/* ---------------------------------------------------
   PROBLEMS
--------------------------------------------------- */
function buildProblemAreaDropdown() {
  if (!problemArea) return;
  const areas = ["Cold Feed","RAP","Drum","Drag","Silos","Scales","Other"];
  problemArea.innerHTML = areas.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join("");
}

probFilterBtns?.forEach(btn => {
  btn.addEventListener("click", () => {
    currentProblemFilter = btn.dataset.filter || "ALL";
    probFilterBtns.forEach(b => b.classList.toggle("active", b === btn));
    renderProblemsList();
  });
});

openProblemPanelBtn?.addEventListener("click", () => openProblemPanel(false));
openProblemPanelBtn2?.addEventListener("click", () => openProblemPanel(false));

function openProblemPanel(isEdit, id) {
  viewingProblemId = isEdit ? id : null;
  problemPhotos = [];
  if (probPhotoPreview) probPhotoPreview.innerHTML = "";
  if (probPhotoInput) probPhotoInput.value = "";

  if (isEdit) {
    const item = problems.find(x => x.id === id);
    if (!item) return;
    problemPanelTitle.textContent = "Edit Problem";
    problemTitle.value = item.title || "";
    problemArea.value = item.area || "Cold Feed";
    problemStatus.value = item.status || "Open";
    problemNotes.value = item.notes || "";
    problemPhotos = Array.isArray(item.photos) ? item.photos.slice() : [];
    renderPhotoPreview(probPhotoPreview, problemPhotos);
    deleteProblemBtn?.classList.remove("hidden");
  } else {
    problemPanelTitle.textContent = "Report Problem";
    problemTitle.value = "";
    problemArea.value = "Cold Feed";
    problemStatus.value = "Open";
    problemNotes.value = "";
    deleteProblemBtn?.classList.add("hidden");
  }

  problemPanelOverlay?.classList.remove("hidden");
  setTimeout(() => problemPanel?.classList.add("show"), 10);
}

function closeProblemPanel() {
  problemPanel?.classList.remove("show");
  setTimeout(() => problemPanelOverlay?.classList.add("hidden"), 250);
}

closeProblemPanelBtn?.addEventListener("click", closeProblemPanel);
problemPanelOverlay?.addEventListener("click", (e) => { if (e.target === problemPanelOverlay) closeProblemPanel(); });

probAddPhotoBtn?.addEventListener("click", () => probPhotoInput?.click());
probPhotoInput?.addEventListener("change", async () => {
  const files = Array.from(probPhotoInput.files || []);
  const newPhotos = await filesToBase64(files, 4);
  problemPhotos = (problemPhotos || []).concat(newPhotos).slice(0, 4);
  renderPhotoPreview(probPhotoPreview, problemPhotos);
});

saveProblemBtn?.addEventListener("click", () => {
  const title = (problemTitle?.value || "").trim();
  if (!title) return showToast("Enter title", "error");

  const obj = {
    id: viewingProblemId || ("prob_" + Date.now()),
    createdAt: new Date().toISOString(),
    title,
    area: problemArea?.value || "Cold Feed",
    status: problemStatus?.value || "Open",
    notes: (problemNotes?.value || "").trim(),
    photos: problemPhotos || []
  };

  if (viewingProblemId) {
    const idx = problems.findIndex(x => x.id === viewingProblemId);
    if (idx >= 0) problems[idx] = obj;
  } else {
    problems.unshift(obj);
  }

  if (!saveState()) return;
  renderProblemsList();
  renderDashboard();
  closeProblemPanel();
  showToast("Problem saved");
});

deleteProblemBtn?.addEventListener("click", () => {
  if (!viewingProblemId) return;
  if (!confirm("Delete this problem?")) return;
  problems = problems.filter(p => p.id !== viewingProblemId);
  if (!saveState()) return;
  renderProblemsList();
  renderDashboard();
  closeProblemPanel();
  showToast("Problem deleted");
});

function renderProblemsList() {
  if (!problemsListEl) return;

  const list = (problems || []).filter(p => {
    if (currentProblemFilter === "ALL") return true;
    return (p.status || "Open") === currentProblemFilter;
  });

  if (!list.length) {
    problemsListEl.innerHTML = `<div class="part-meta">No problems found.</div>`;
    return;
  }

  problemsListEl.innerHTML = list.map(p => {
    const photoTotal = Array.isArray(p.photos) ? p.photos.length : 0;
    return `
      <div class="pm-card" data-probid="${p.id}">
        <div class="pm-card-top">
          <div>
            <div class="pm-title">${escapeHtml(p.title || "Problem")}</div>
            <div class="pm-sub">${escapeHtml(p.area || "")} — ${escapeHtml(p.status || "Open")}</div>
            <div class="pm-sub">${escapeHtml(p.notes || "")}${photoTotal ? ` • 📷 ${photoTotal}` : ""}</div>
          </div>
        </div>

        <div class="pm-actions">
          <button class="prob-edit-btn" data-probid="${p.id}">View/Edit</button>
        </div>
      </div>
    `;
  }).join("");
}

problemsListEl?.addEventListener("click", (e) => {
  const id = e.target?.dataset?.probid || e.target.closest("[data-probid]")?.dataset?.probid;
  if (!id) return;
  if (e.target.classList.contains("prob-edit-btn")) return openProblemPanel(true, id);
});

/* ---------------------------------------------------
   PMs (Phase 3.4 Enhanced)
--------------------------------------------------- */
function buildPmAreaDropdown() {
  if (!pmArea) return;
  const areas = ["Cold Feed","RAP","Drum","Drag","Silos","Scales"];
  pmArea.innerHTML = areas.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join("");
}

openPmPanelBtn?.addEventListener("click", () => openPmPanel(false));

function openPmPanel(isEdit, id) {
  // Phase 3.4: Admin-only manage PM definitions
  if (!canPm("manage")) {
    showToast("Admin only", "error");
    return;
  }

  editingPmId = isEdit ? id : null;
  if (pmPanelTitle) pmPanelTitle.textContent = isEdit ? "Edit PM" : "Add PM";
  buildPmAreaDropdown();

  const setVisDefaults = (vis) => {
    const v = vis || {};
    if (pmVisAdmin) pmVisAdmin.checked = v.Admin !== false;
    if (pmVisSupervisor) pmVisSupervisor.checked = v.Supervisor !== false;
    if (pmVisMaintenance) pmVisMaintenance.checked = v.Maintenance !== false;
    if (pmVisGround) pmVisGround.checked = v.Ground !== false;
  };

  if (isEdit) {
    const item = (pms || []).find(x => x.id === id);
    if (item) {
      if (pmName) pmName.value = item.name || "";
      if (pmArea) pmArea.value = item.area || "Cold Feed";
      if (pmFrequency) pmFrequency.value = item.frequency || "Daily";

      // Checklist (optional, backward compatible)
      const list = Array.isArray(item.checklist) ? item.checklist : [];
      if (pmChecklistDef) pmChecklistDef.value = list.join("\n");

      // Visibility (default visible)
      setVisDefaults(item.visibility);

      // Lock
      if (pmDefLocked) pmDefLocked.checked = !!item.locked;
    }
  } else {
    if (pmName) pmName.value = "";
    if (pmArea) pmArea.value = "Cold Feed";
    if (pmFrequency) pmFrequency.value = "Daily";
    if (pmChecklistDef) pmChecklistDef.value = "";
    setVisDefaults({ Admin:true, Supervisor:true, Maintenance:true, Ground:true });
    if (pmDefLocked) pmDefLocked.checked = false;
  }

  pmPanelOverlay?.classList.remove("hidden");
  setTimeout(() => pmPanel?.classList.add("show"), 10);
}

function closePmPanel() {
  pmPanel?.classList.remove("show");
  setTimeout(() => pmPanelOverlay?.classList.add("hidden"), 250);
}

closePmPanelBtn?.addEventListener("click", closePmPanel);
pmPanelOverlay?.addEventListener("click", (e) => { if (e.target === pmPanelOverlay) closePmPanel(); });

savePmBtn?.addEventListener("click", () => {
  if (!canPm("manage")) { showToast("Admin only", "error"); return; }

  const name = (pmName?.value || "").trim();
  const area = pmArea?.value || "Cold Feed";
  const frequency = pmFrequency?.value || "Daily";
  if (!name) return showToast("Enter PM name", "error");

  const checklist = String(pmChecklistDef?.value || "")
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);

  const visibility = {
    Admin: pmVisAdmin ? !!pmVisAdmin.checked : true,
    Supervisor: pmVisSupervisor ? !!pmVisSupervisor.checked : true,
    Maintenance: pmVisMaintenance ? !!pmVisMaintenance.checked : true,
    Ground: pmVisGround ? !!pmVisGround.checked : true
  };

  const locked = pmDefLocked ? !!pmDefLocked.checked : false;

  if (editingPmId) {
    const idx = (pms || []).findIndex(x => x.id === editingPmId);
    if (idx >= 0) {
      pms[idx] = { ...pms[idx], name, area, frequency, checklist, visibility, locked };
    }
  } else {
    pms.unshift({
      id: "pm_" + Date.now(),
      createdAt: new Date().toISOString(),
      name,
      area,
      frequency,
      checklist,
      visibility,
      locked,
      history: []
    });
  }

  if (!saveState()) return;

  renderPmsList();
  renderDashboard();
  closePmPanel();
  showToast(editingPmId ? "PM updated" : "PM added");
});

pmFilterBtns?.forEach(btn => {
  btn.addEventListener("click", () => {
    currentPmFilter = btn.dataset.pmfilter || "DUE";
    renderPmsList();
  });
});

function renderPmsList() {
  if (!pmsListEl) return;

  pmFilterBtns?.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.pmfilter === currentPmFilter);
  });

  const role = normalizeRole(currentRole);

  // Visibility filter per role (default visible)
  const visibleForRole = (pm) => {
    const v = pm?.visibility;
    if (!v) return true;
    if (role === "Admin") return v.Admin !== false;
    if (role === "Supervisor") return v.Supervisor !== false;
    if (role === "Maintenance") return v.Maintenance !== false;
    if (role === "Ground") return v.Ground !== false;
    return true;
  };

  const allVisible = (pms || []).filter(visibleForRole);

  const dueTodayCount = allVisible.filter(isPmDue).length;
  if (pmDueTodayText) pmDueTodayText.textContent = String(dueTodayCount);

  const filtered = allVisible.filter(pm => {
    if (currentPmFilter === "ALL") return true;
    const due = isPmDue(pm);
    if (currentPmFilter === "DUE") return due;
    if (currentPmFilter === "DONE") return !due;
    return true;
  });

  if (!filtered.length) {
    pmsListEl.innerHTML = `<div class="part-meta">No PMs in this filter.</div>`;
    return;
  }

  const AREAS = ["Cold Feed","RAP","Drum","Drag","Silos","Scales"];
  const grouped = {};
  AREAS.forEach(a => grouped[a] = []);
  filtered.forEach(pm => {
    const a = AREAS.includes(pm.area) ? pm.area : "Cold Feed";
    grouped[a].push(pm);
  });

  const canManage = canPm("manage");
  const canComplete = canPm("complete");

  pmsListEl.innerHTML = AREAS.map(area => {
    const list = grouped[area] || [];
    if (!list.length) return "";
    return `
      <div class="pm-area-group">
        <div class="pm-area-title">${escapeHtml(area)}</div>
        ${list.map(pm => {
          const last = getPmLastDate(pm);
          const due = isPmDue(pm);
          const pill = due ? `<span class="pm-pill pm-due">DUE</span>` : `<span class="pm-pill pm-done">DONE</span>`;
          const historyCount = Array.isArray(pm.history) ? pm.history.length : 0;
          const photoTotal = countPmPhotoTotal(pm);
          const hasChecklist = Array.isArray(pm.checklist) && pm.checklist.length > 0;
          const checklistTag = hasChecklist ? ` • ☑️ ${pm.checklist.length}` : "";

          return `
            <div class="pm-card" data-pmid="${pm.id}">
              <div class="pm-card-top">
                <div>
                  <div class="pm-title">${escapeHtml(pm.name || "PM")}</div>
                  <div class="pm-sub">${escapeHtml(pm.area || "")} — ${escapeHtml(pm.frequency || "")}</div>
                  <div class="pm-sub">${last ? `Last: ${escapeHtml(last)}` : ""}${historyCount ? ` • ${historyCount} logs` : ""}${photoTotal ? ` • 📷 ${photoTotal}` : ""}${checklistTag}</div>
                </div>
                ${pill}
              </div>

              <div class="pm-actions">
                <button class="pm-complete-btn ${!canComplete ? "disabled" : ""}" data-pmid="${pm.id}" ${!canComplete ? "disabled" : ""}>Complete</button>
                <button class="pm-edit-btn ${!canManage ? "hidden" : ""}" data-pmid="${pm.id}">Edit</button>
                <button class="pm-gallery-btn" data-pmid="${pm.id}">Gallery</button>
                <button class="pm-delete-btn ${!canManage ? "hidden" : ""}" data-pmid="${pm.id}">Delete</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }).join("");
}

pmsListEl?.addEventListener("click", (e) => {
  const target = e.target;
  const id = target?.dataset?.pmid || target?.closest?.("[data-pmid]")?.dataset?.pmid;
  if (!id) return;

  if (target.classList.contains("pm-edit-btn")) {
    if (!canPm("manage")) return showToast("Admin only", "error");
    return openPmPanel(true, id);
  }

  if (target.classList.contains("pm-delete-btn")) {
    if (!canPm("manage")) return showToast("Admin only", "error");
    if (!confirm("Delete this PM?")) return;
    pms = (pms || []).filter(x => x.id !== id);
    if (!saveState()) return;
    renderPmsList();
    renderDashboard();
    return showToast("PM deleted");
  }

  if (target.classList.contains("pm-complete-btn")) {
    if (!canPm("complete")) return showToast("Not allowed", "error");
    return openPmComplete(id);
  }

  if (target.classList.contains("pm-gallery-btn")) return openPmGallery(id);
});

function openPmComplete(id) {
  completingPmId = id;
  pmCompletionPhotos = [];
  if (pmPhotoPreview) pmPhotoPreview.innerHTML = "";
  if (pmPhotoInput) pmPhotoInput.value = "";

  const pm = (pms || []).find(x => x.id === id);
  if (!pm) return;

  // Role enforcement
  if (!canPm("complete")) {
    showToast("Ground role is view-only for PMs", "error");
    return;
  }

  if (pmCompleteTitle) pmCompleteTitle.textContent = `Complete PM: ${pm.name || ""}`;
  if (pmCompDate) pmCompDate.value = new Date().toISOString().split("T")[0];
  if (pmCompNotes) pmCompNotes.value = "";

  // Checklist (optional, but if present must be fully checked)
  const checklist = Array.isArray(pm.checklist) ? pm.checklist : [];
  pmChecklistState = [];
  if (pmChecklistWrap && pmChecklistList) {
    if (checklist.length) {
      pmChecklistWrap.classList.remove("hidden");
      pmChecklistList.innerHTML = checklist.map((item, idx) => {
        const disabled = !canPm("checklist");
        return `
          <label class="check-row ${disabled ? "disabled" : ""}">
            <input type="checkbox" class="pm-check" data-idx="${idx}" ${disabled ? "disabled" : ""}>
            <span>${escapeHtml(item)}</span>
          </label>
        `;
      }).join("");
      pmChecklistState = new Array(checklist.length).fill(false);
      if (pmChecklistHint) pmChecklistHint.textContent = "Check all items to enable completion.";
    } else {
      pmChecklistWrap.classList.add("hidden");
      pmChecklistList.innerHTML = "";
      if (pmChecklistHint) pmChecklistHint.textContent = "";
    }
  }

  // Photos permission
  const photosAllowed = canPm("photos");
  if (pmAddPhotoBtn) {
    pmAddPhotoBtn.disabled = !photosAllowed;
    pmAddPhotoBtn.classList.toggle("hidden", !photosAllowed);
  }

  // Completion button disabled until checklist done (when checklist exists)
  if (savePmCompletionBtn) {
    const needsChecklist = checklist.length > 0;
    savePmCompletionBtn.disabled = needsChecklist;
    savePmCompletionBtn.classList.toggle("disabled", savePmCompletionBtn.disabled);
  }

  pmCompleteOverlay?.classList.remove("hidden");
  setTimeout(() => pmCompletePanel?.classList.add("show"), 10);
}

function closePmComplete() {
  pmCompletePanel?.classList.remove("show");
  setTimeout(() => pmCompleteOverlay?.classList.add("hidden"), 250);
}

closePmCompleteBtn?.addEventListener("click", closePmComplete);
pmCompleteOverlay?.addEventListener("click", (e) => { if (e.target === pmCompleteOverlay) closePmComplete(); });

pmChecklistList?.addEventListener("change", (e) => {
  const t = e.target;
  if (!(t instanceof HTMLInputElement)) return;
  if (!t.classList.contains("pm-check")) return;
  const idx = Number(t.dataset.idx);
_toggleChecklist(idx, !!t.checked);
});

function _toggleChecklist(idx, checked){
  if (Number.isNaN(idx)) return;
  pmChecklistState[idx] = !!checked;

  const allDone = pmChecklistState.length ? pmChecklistState.every(Boolean) : true;
  if (savePmCompletionBtn) {
    savePmCompletionBtn.disabled = !allDone;
    savePmCompletionBtn.classList.toggle("disabled", savePmCompletionBtn.disabled);
  }
}

pmAddPhotoBtn?.addEventListener("click", () => {
  if (!canPm("photos")) return;
  pmPhotoInput?.click();
});

pmPhotoInput?.addEventListener("change", async () => {
  if (!canPm("photos")) return;
  const files = Array.from(pmPhotoInput.files || []);
  const newPhotos = await filesToBase64(files, 4);
  pmCompletionPhotos = (pmCompletionPhotos || []).concat(newPhotos).slice(0, 4);
  renderPhotoPreview(pmPhotoPreview, pmCompletionPhotos);
});

savePmCompletionBtn?.addEventListener("click", () => {
  if (!completingPmId) return;

  // Role enforcement
  if (!canPm("complete")) { showToast("Not allowed", "error"); return; }

  const pm = (pms || []).find(x => x.id === completingPmId);
  if (!pm) return;

  const date = pmCompDate?.value || getTodayStr();
  const notes = (pmCompNotes?.value || "").trim();

  const checklist = Array.isArray(pm.checklist) ? pm.checklist : [];
  const needsChecklist = checklist.length > 0;

  if (needsChecklist) {
    const allDone = pmChecklistState.length ? pmChecklistState.every(Boolean) : false;
    if (!allDone) { showToast("Complete all checklist items first", "error"); return; }
  }

  const entry = {
    date,
    notes,
    photos: pmCompletionPhotos || []
  };

  if (needsChecklist) entry.checklistResults = pmChecklistState.slice();

  pm.history = Array.isArray(pm.history) ? pm.history : [];
  pm.history.unshift(entry);

  if (!saveState()) return;

  renderPmsList();
  renderDashboard();
  closePmComplete();
  showToast("PM completed");
});

function openPmGallery(id) {
  const pm = (pms || []).find(x => x.id === id);
  if (!pm) return;
  const photos = getPmAllPhotos(pm);
  if (pmGalleryTitle) pmGalleryTitle.textContent = `PM Photos: ${pm.name || ""}`;
  if (pmGalleryMeta) pmGalleryMeta.textContent = photos.length ? `${photos.length} photo(s)` : "No photos yet.";
  if (pmGalleryGrid) pmGalleryGrid.innerHTML = photos.map(src => `<img src="${src}" alt="PM photo">`).join("");

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
  if (e.target.tagName !== "IMG") return;
  openLightbox(e.target.src);
});

/* ---------------------------------------------------
   INVENTORY
--------------------------------------------------- */
searchInventory?.addEventListener("input", () => renderInventory());

function renderInventory() {
  if (!inventoryListEl) return;
  const q = (searchInventory?.value || "").trim().toLowerCase();
  const list = (inventory || []).filter(i => !q || String(i.name || "").toLowerCase().includes(q));

  if (!list.length) {
    inventoryListEl.innerHTML = `<div class="part-meta">No inventory items found.</div>`;
    return;
  }

  inventoryListEl.innerHTML = list.map(i => `
    <div class="pm-card">
      <div class="pm-card-top">
        <div>
          <div class="pm-title">${escapeHtml(i.name || "Item")}</div>
          <div class="pm-sub">${escapeHtml(i.category || "")} — ${escapeHtml(i.section || "")}</div>
          <div class="pm-sub">Min: ${escapeHtml(i.minQty)} • Qty: ${escapeHtml(i.qty)}</div>
        </div>
      </div>
    </div>
  `).join("");
}

/* ---------------------------------------------------
   SETTINGS
--------------------------------------------------- */
/* ===================================================
   Phase 3.4: Role / Admin PIN behavior (Additive)
=================================================== */
closeAdminPinBtn?.addEventListener("click", closeAdminPinPrompt);
adminPinOverlay?.addEventListener("click", (e) => { if (e.target === adminPinOverlay) closeAdminPinPrompt(); });

adminLoginBtn?.addEventListener("click", () => {
  if (!isAdminRole()) {
    showToast("Set role to Admin on this device first", "error");
    return;
  }
  const hasPin = !!getStoredAdminPin();
  openAdminPinPrompt(hasPin ? "Enter Admin PIN" : "No PIN set. Enter a new PIN to set it.");
});

submitAdminPinBtn?.addEventListener("click", () => {
  if (!isAdminRole()) return;
  const entered = String(adminPinInput?.value || "").trim();
  const stored = getStoredAdminPin();

  if (!stored) {
    if (!isValidPin(entered)) {
      if (adminPinMsg) adminPinMsg.textContent = "PIN must be 4–8 digits";
      return;
    }
    setStoredAdminPin(entered);
    adminAuthed = true;
    closeAdminPinPrompt();
    applyRoleUI();
    renderPmsList();
    showToast("Admin unlocked (PIN set)");
    return;
  }

  if (entered === stored) {
    adminAuthed = true;
    closeAdminPinPrompt();
    applyRoleUI();
    renderPmsList();
    showToast("Admin unlocked");
  } else {
    if (adminPinMsg) adminPinMsg.textContent = "Incorrect PIN";
    showToast("Incorrect PIN", "error");
  }
});

adminLogoutBtn?.addEventListener("click", () => {
  adminAuthed = false;
  applyRoleUI();
  renderPmsList();
  showToast("Admin locked");
});

roleSelect?.addEventListener("change", () => {
  const next = normalizeRole(roleSelect.value);
  const allow = !!(roleCfg && roleCfg.allowRoleChange);
  if (!allow && !(isAdminRole() && adminAuthed)) {
    roleSelect.value = currentRole;
    showToast("Role change locked by Admin", "error");
    return;
  }
  currentRole = next;
  saveRoleState();
  applyRoleUI();
  renderDashboard();
  renderPmsList();
});

allowRoleChangeChk?.addEventListener("change", () => {
  if (!(isAdminRole() && adminAuthed)) {
    allowRoleChangeChk.checked = !!(roleCfg && roleCfg.allowRoleChange);
    showToast("Admin only", "error");
    return;
  }
  roleCfg = roleCfg || {};
  roleCfg.allowRoleChange = !!allowRoleChangeChk.checked;
  saveRoleState();
  applyRoleUI();
  showToast("Role setting updated");
});

saveAdminPinBtn?.addEventListener("click", () => {
  if (!(isAdminRole() && adminAuthed)) {
    showToast("Admin only", "error");
    return;
  }
  const p1 = String(adminPinNew?.value || "").trim();
  const p2 = String(adminPinConfirm?.value || "").trim();
  if (!isValidPin(p1)) { showToast("PIN must be 4–8 digits", "error"); return; }
  if (p1 !== p2) { showToast("PINs do not match", "error"); return; }
  setStoredAdminPin(p1);
  if (adminPinNew) adminPinNew.value = "";
  if (adminPinConfirm) adminPinConfirm.value = "";
  showToast("Admin PIN saved");
});

exportBtn?.addEventListener("click", () => exportAllData());
exportPmComplianceBtn?.addEventListener("click", () => exportPmComplianceCSV());

resetAllBtn?.addEventListener("click", () => {
  if (!confirm("Reset ALL app data? This cannot be undone.")) return;
  localStorage.clear();
  location.reload();
});

/* ---------------------------------------------------
   AC CALC
--------------------------------------------------- */
ac_calcBtn?.addEventListener("click", () => {
  const oilRate = Number(ac_oilRate?.value || 0);
  const pumpRate = Number(ac_pumpRate?.value || 0);
  if (!Number.isFinite(oilRate) || !Number.isFinite(pumpRate) || oilRate <= 0 || pumpRate <= 0) {
    return showToast("Enter valid rates", "error");
  }
  const total = (oilRate / pumpRate) * 60;
  if (ac_totalAc) ac_totalAc.textContent = String(Math.round(total * 100) / 100);
});

/* ---------------------------------------------------
   LIGHTBOX
--------------------------------------------------- */
function openLightbox(src) {
  if (!lightboxImg || !lightboxOverlay) return;
  lightboxImg.src = src;
  lightboxOverlay.classList.remove("hidden");
}
lightboxOverlay?.addEventListener("click", () => {
  lightboxOverlay.classList.add("hidden");
  if (lightboxImg) lightboxImg.src = "";
});

function openLightboxGallery(photos) {
  const list = Array.isArray(photos) ? photos : [];
  if (!list.length) return showToast("No photos", "error");
  openLightbox(list[0]);
}

/* ---------------------------------------------------
   HELPERS
--------------------------------------------------- */
function isDue(part) {
  const qty = Number(part.qty || 0);
  const min = Number(part.minQty || 0);
  return qty <= min;
}
function isOverdue(part) {
  const qty = Number(part.qty || 0);
  return qty <= 0;
}

function isPmDue(pm) {
  const last = getPmLastDate(pm);
  const freq = pm.frequency || "Daily";
  if (!last) return true;

  const lastDate = new Date(last);
  const today = new Date(getTodayStr());
  const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

  if (freq === "Daily") return diffDays >= 1;
  if (freq === "Weekly") return diffDays >= 7;
  return true;
}

function getPmLastDate(pm) {
  const h = Array.isArray(pm.history) ? pm.history : [];
  return h.length ? h[0].date : "";
}

function countPmPhotoTotal(pm) {
  const h = Array.isArray(pm.history) ? pm.history : [];
  return h.reduce((sum, e) => sum + ((e.photos && e.photos.length) || 0), 0);
}

function getPmAllPhotos(pm) {
  const h = Array.isArray(pm.history) ? pm.history : [];
  const out = [];
  h.forEach(e => {
    (e.photos || []).forEach(p => out.push(p));
  });
  return out;
}

async function filesToBase64(files, max = 4) {
  const sliced = files.slice(0, max);
  const reads = sliced.map(f => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(f);
  }));
  const res = await Promise.all(reads);
  return res.filter(Boolean);
}

function renderPhotoPreview(el, photos) {
  if (!el) return;
  const list = Array.isArray(photos) ? photos : [];
  el.innerHTML = list.map(src => `<img src="${src}" alt="photo">`).join("");
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function exportAllData() {
  const data = {
    parts,
    currentTons,
    inventory,
    problems,
    pms,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, "plant-maintenance-export.json");
  showToast("Exported");
}

function exportMaintenanceCSV() {
  const rows = [["date","type","title","notes"]];
  (problems || []).forEach(p => {
    rows.push([p.createdAt || "", "problem", p.title || "", p.notes || ""]);
  });
  const csv = rows.map(r => r.map(x => `"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  downloadBlob(blob, "maintenance-log.csv");
  showToast("CSV exported");
}

function exportPmComplianceCSV() {
  const rows = [["pm_name","area","frequency","completed_date","notes","checklist_results_count","photos_count"]];
  (pms || []).forEach(pm => {
    const h = Array.isArray(pm.history) ? pm.history : [];
    h.forEach(e => {
      const cr = Array.isArray(e.checklistResults) ? e.checklistResults.filter(Boolean).length : "";
      const photos = Array.isArray(e.photos) ? e.photos.length : 0;
      rows.push([pm.name || "", pm.area || "", pm.frequency || "", e.date || "", e.notes || "", cr, photos]);
    });
  });
  const csv = rows.map(r => r.map(x => `"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  downloadBlob(blob, "pm-compliance.csv");
  showToast("PM CSV exported");
}

function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 250);
}

function showToast(msg, type) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 200);
  }, 1800);
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
       }
