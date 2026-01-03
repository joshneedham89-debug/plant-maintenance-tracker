/* ---------------------------------------------------
   STORAGE KEYS
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";
const PROBLEMS_KEY = "pm_problems";
const PMS_KEY = "pm_pms";

/* ---------------------------------------------------
   PHASE 3.4 (Additive): Roles + Admin PIN (single system)
   - ONE role key: pm_role
   - ONE admin pin key: pm_admin_pin
   - Optional perms key: pm_role_perms
--------------------------------------------------- */
const ROLE_KEY = "pm_role";
const ADMIN_PIN_KEY = "pm_admin_pin";
const ADMIN_UNLOCKED_KEY = "pm_admin_unlocked";
const PERMS_KEY = "pm_role_perms"; // stores per-role permissions configured by Admin

let currentRole = "Maintenance";
let adminUnlocked = false;

const DEFAULT_ROLE_PERMS = {
  Supervisor: { pmView: true, pmComplete: true, pmPhotos: true },
  Maintenance: { pmView: true, pmComplete: true, pmPhotos: true },
  Ground: { pmView: true, pmComplete: false, pmPhotos: false }
};
let rolePerms = null;

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

/* Phase 3.4 (Additive): PM checklist runtime */
let pmChecklistState = [];
let pmChecklistItems = [];

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
let navButtons = document.querySelectorAll(".nav-btn");

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

/* Phase 3.4 (Additive): Roles/Admin elements (existing Settings screen) */
const roleSelect = document.getElementById("roleSelect");
const adminStatusPill = document.getElementById("adminStatusPill");
const unlockAdminBtn = document.getElementById("unlockAdminBtn");
const lockAdminBtn = document.getElementById("lockAdminBtn");
const adminOnlyPerms = document.getElementById("adminOnlyPerms");
const permSupPmComplete = document.getElementById("permSupPmComplete");
const permSupPmPhotos = document.getElementById("permSupPmPhotos");
const permMaintPmComplete = document.getElementById("permMaintPmComplete");
const permMaintPmPhotos = document.getElementById("permMaintPmPhotos");
const permGroundPmView = document.getElementById("permGroundPmView");
const savePermsBtn = document.getElementById("savePermsBtn");

/* Phase 3.4 (Additive): Admin PIN modal elements */
const adminPinOverlay = document.getElementById("adminPinOverlay");
const adminPinPanel = document.getElementById("adminPinPanel");
const adminPinTitle = document.getElementById("adminPinTitle");
const adminPinMsg = document.getElementById("adminPinMsg");
const adminPinInput = document.getElementById("adminPinInput");
const submitAdminPinBtn = document.getElementById("submitAdminPinBtn");
const closeAdminPinBtn = document.getElementById("closeAdminPin");

/* Phase 3.4 (Additive): PM Tab elements */
const openPmPanelBtnPmTab = document.getElementById("openPmPanelBtnPmTab");
const pmsListPmTab = document.getElementById("pmsListPmTab");
const pmFilterBtnsPmTab = document.querySelectorAll("#pmScreen .pm-filter");

/* Phase 3.4 (Additive): PM checklist elements (Complete PM panel) */
const pmChecklistWrap = document.getElementById("pmChecklistWrap");
const pmChecklistList = document.getElementById("pmChecklistList");
const pmChecklistNote = document.getElementById("pmChecklistNote");

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
const compInventorySelect = document.getElementById("compInventorySelect");
const compQty = document.getElementById("compQty");
const addUsedItemBtn = document.getElementById("addUsedItemBtn");
const usedItemsList = document.getElementById("usedItemsList");

const addPhotoBtn = document.getElementById("addPhotoBtn");
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");

const saveCompletionBtn = document.getElementById("saveCompletionBtn");

/* Problems */
const openProblemPanelBtn = document.getElementById("openProblemPanelBtn");
const openProblemPanelBtn2 = document.getElementById("openProblemPanelBtn2");
const problemPanelOverlay = document.getElementById("problemPanelOverlay");
const problemPanel = document.getElementById("problemPanel");
const closeProblemPanelBtn = document.getElementById("closeProblemPanel");

const probTitle = document.getElementById("probTitle");
const probCategory = document.getElementById("probCategory");
const probSeverity = document.getElementById("probSeverity");
const probNotes = document.getElementById("probNotes");
const probAddPhotoBtn = document.getElementById("probAddPhotoBtn");
const probPhotoInput = document.getElementById("probPhotoInput");
const probPhotoPreview = document.getElementById("probPhotoPreview");
const saveProblemBtn = document.getElementById("saveProblemBtn");

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
const pmChecklistText = document.getElementById("pmChecklistText");
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

/* Lightbox */
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

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

/* ===================================================
   PHASE 3.4 (Additive): Roles + Admin PIN helpers
=================================================== */
function loadRolePerms() {
  try {
    const raw = localStorage.getItem(PERMS_KEY);
    rolePerms = raw ? JSON.parse(raw) : null;
  } catch {
    rolePerms = null;
  }
}

function getEffectivePerms(role) {
  const base = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMS));
  if (rolePerms && typeof rolePerms === "object") {
    ["Supervisor", "Maintenance", "Ground"].forEach(r => {
      if (rolePerms[r] && typeof rolePerms[r] === "object") base[r] = { ...base[r], ...rolePerms[r] };
    });
  }
  if (!base[role]) return { pmView: true, pmComplete: true, pmPhotos: true }; // Admin default
  return base[role];
}

function loadRoleState() {
  const stored = localStorage.getItem(ROLE_KEY) || "Maintenance";
  currentRole = ["Admin", "Supervisor", "Maintenance", "Ground"].includes(stored) ? stored : "Maintenance";
  adminUnlocked = localStorage.getItem(ADMIN_UNLOCKED_KEY) === "1";
  loadRolePerms();
}

function setRole(role) {
  currentRole = role;
  localStorage.setItem(ROLE_KEY, currentRole);
  if (currentRole !== "Admin") {
    adminUnlocked = false;
    localStorage.removeItem(ADMIN_UNLOCKED_KEY);
  }
  applyRoleUI();
  renderPmsList();
}

function isAdminActive() {
  return currentRole === "Admin" && adminUnlocked === true;
}

function can(action) {
  if (
    action === "pm:edit_definition" ||
    action === "pm:delete_definition" ||
    action === "settings:reset_app" ||
    action === "settings:manage_perms"
  ) {
    return isAdminActive();
  }
  if (action === "settings:export" || action === "settings:export_pm_compliance") {
    return currentRole === "Supervisor" || isAdminActive();
  }
  if (action === "pm:view") {
    if (currentRole === "Ground") return !!getEffectivePerms("Ground").pmView;
    return true;
  }
  if (action === "pm:complete" || action === "pm:checklist_interact") {
    if (currentRole === "Ground") return !!getEffectivePerms("Ground").pmComplete;
    return !!getEffectivePerms(currentRole).pmComplete;
  }
  if (action === "pm:add_photos") {
    if (currentRole === "Ground") return !!getEffectivePerms("Ground").pmPhotos;
    return !!getEffectivePerms(currentRole).pmPhotos;
  }
  return true;
}

function ensureGroundPermControls() {
  // HTML may not include these yet; we inject them additively into adminOnlyPerms
  if (!adminOnlyPerms) return;

  if (!document.getElementById("permGroundPmComplete")) {
    const row = document.createElement("label");
    row.className = "perm-row";
    row.innerHTML = '<input type="checkbox" id="permGroundPmComplete"> Ground can complete PMs';
    adminOnlyPerms.appendChild(row);
  }
  if (!document.getElementById("permGroundPmPhotos")) {
    const row = document.createElement("label");
    row.className = "perm-row";
    row.innerHTML = '<input type="checkbox" id="permGroundPmPhotos"> Ground can add PM photos';
    adminOnlyPerms.appendChild(row);
  }
}

function applyRoleUI() {
  if (roleSelect) roleSelect.value = currentRole;

  if (adminStatusPill) {
    adminStatusPill.textContent = isAdminActive() ? "Admin: Unlocked" : "Admin: Locked";
  }

  if (unlockAdminBtn) unlockAdminBtn.classList.toggle("hidden", currentRole !== "Admin" || isAdminActive());
  if (lockAdminBtn) lockAdminBtn.classList.toggle("hidden", !isAdminActive());
  if (adminOnlyPerms) adminOnlyPerms.classList.toggle("hidden", !isAdminActive());

  if (isAdminActive()) ensureGroundPermControls();

  // Disable buttons by permission
  exportBtn?.classList.toggle("btn-disabled", !can("settings:export"));
  exportPmComplianceBtn?.classList.toggle("btn-disabled", !can("settings:export_pm_compliance"));
  resetAllBtn?.classList.toggle("btn-disabled", !can("settings:reset_app"));

  const canEditPm = can("pm:edit_definition");
  openPmPanelBtn?.classList.toggle("hidden", !canEditPm);
  openPmPanelBtnPmTab?.classList.toggle("hidden", !canEditPm);
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

      const out = canvas.toDataURL("image/jpeg", quality);
      resolve(out);
    };
    img.src = base64;
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* ---------------------------------------------------
   LIGHTBOX
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
   PRELOADED INVENTORY/CATEGORIES (from inventory.js)
--------------------------------------------------- */
const PRELOADED_INVENTORY = window.preloadedInventory || [];
const PRELOADED_CATEGORIES = window.preloadedCategories || [];

/* ---------------------------------------------------
   INIT / SAVE (quota-safe)
--------------------------------------------------- */
function loadState() {
  // Phase 3.4: load role/admin state first
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
  buildInventoryCategoryDropdown();
  buildInventoryNameDatalist();
  buildCompleteInventorySelect();
  buildProblemCategoryDropdown();
  buildPmAreaDropdown();

  applyRoleUI();
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

  if (screenId === "pmScreen") {
    renderPmsList();
  }

  if (screenId === "settingsScreen") {
    applyRoleUI();
  }

  if (screenId === "inventoryScreen") renderInventory();
}

/* ---------------------------------------------------
   NAV WIRING
--------------------------------------------------- */
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
function getStatus(part) {
  const days = Number(part.daysInterval) || 0;
  const tons = Number(part.tonsInterval) || 0;

  const lastDate = part.lastDate ? new Date(part.lastDate) : null;
  const lastTons = Number(part.lastTons) || 0;

  let dueByDays = false;
  let dueByTons = false;

  if (days && lastDate) {
    const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    dueByDays = diffDays >= days;
  }

  if (tons && lastTons) {
    const diffTons = currentTons - lastTons;
    dueByTons = diffTons >= tons;
  }

  if (dueByDays || dueByTons) return "OVERDUE";

  let dueSoonDays = false;
  let dueSoonTons = false;

  if (days && lastDate) {
    const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    dueSoonDays = diffDays >= Math.max(0, days - 3);
  }

  if (tons && lastTons) {
    const diffTons = currentTons - lastTons;
    dueSoonTons = diffTons >= Math.max(0, tons - 200);
  }

  if (dueSoonDays || dueSoonTons) return "DUE";
  return "OK";
}

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isPmDue(pm) {
  const freq = pm.frequency || "Daily";
  const last = getPmLastDate(pm);
  const today = getTodayStr();
  if (!last) return true;

  if (freq === "Daily") return last !== today;

  if (freq === "Weekly") {
    const lastDate = new Date(last);
    const now = new Date(today);
    const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  }

  return true;
}

function getPmLastDate(pm) {
  const h = Array.isArray(pm.history) ? pm.history : [];
  if (!h.length) return "";
  const last = h[h.length - 1];
  return last?.date || "";
}

function renderDashboard() {
  let ok = 0,
    due = 0,
    over = 0;
  (parts || []).forEach(p => {
    const st = getStatus(p);
    if (st === "OK") ok++;
    else if (st === "DUE") due++;
    else over++;
  });

  if (okCountEl) okCountEl.textContent = ok;
  if (dueCountEl) dueCountEl.textContent = due;
  if (overCountEl) overCountEl.textContent = over;
  if (tonsRunEl) tonsRunEl.textContent = currentTons;

  const today = getTodayStr();
  let completedToday = 0;
  let completedThisMonth = 0;

  (parts || []).forEach(p => {
    const h = Array.isArray(p.history) ? p.history : [];
    h.forEach(entry => {
      if (entry.date === today) completedToday++;
      if (getMonthKey(entry.date) === getMonthKey(today)) completedThisMonth++;
    });
  });

  if (completedTodayEl) completedTodayEl.textContent = completedToday;
  if (completedMonthEl) completedMonthEl.textContent = completedThisMonth;

  const openProblems = (problems || []).filter(pr => (pr.status || "Open") !== "Resolved").length;
  if (openProblemsCountEl) openProblemsCountEl.textContent = openProblems;

  const pmDueToday = (pms || []).filter(pm => isPmDue(pm)).length;
  if (pmDueTodayCountEl) pmDueTodayCountEl.textContent = pmDueToday;
}

/* ---------------------------------------------------
   CATEGORY DROPDOWN
--------------------------------------------------- */
function buildCategoryDropdown() {
  if (!filterCategory || !newPartCategory) return;

  const options = (categories || []).map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

  filterCategory.innerHTML = `<option value="ALL">All Categories</option>${options}`;
  newPartCategory.innerHTML = `<option value="">Select Category</option>${options}`;
}

function buildInventoryCategoryDropdown() {
  if (!invCategory) return;
  invCategory.innerHTML = (categories || []).map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function buildInventoryNameDatalist() {
  if (!inventoryNameList) return;
  const names = [...new Set((inventory || []).map(x => x.name).filter(Boolean))];
  inventoryNameList.innerHTML = names.map(n => `<option value="${escapeHtml(n)}"></option>`).join("");
}

/* ---------------------------------------------------
   COMPLETE INVENTORY SELECT
--------------------------------------------------- */
function buildCompleteInventorySelect() {
  if (!compInventorySelect) return;
  compInventorySelect.innerHTML =
    `<option value="">Select item</option>` +
    (inventory || [])
      .map((inv, idx) => {
        const label = `${inv.name || "Item"} (${inv.qty ?? 0}) — ${inv.location || ""}`;
        return `<option value="${idx}">${escapeHtml(label)}</option>`;
      })
      .join("");
}

/* ---------------------------------------------------
   PROBLEM CATEGORY DROPDOWN
--------------------------------------------------- */
function buildProblemCategoryDropdown() {
  if (!probCategory) return;
  probCategory.innerHTML = (categories || []).map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

/* ---------------------------------------------------
   PM AREA DROPDOWN
--------------------------------------------------- */
function buildPmAreaDropdown() {
  if (!pmArea) return;
  const areas = [
    "Cold Feed",
    "RAP",
    "Drum",
    "Drag",
    "Silos",
    "Scales",
    "Baghouse",
    "Tank Farm",
    "Plant General"
  ];
  pmArea.innerHTML = areas.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join("");
}

/* ---------------------------------------------------
   PARTS: PANEL OPEN/CLOSE
--------------------------------------------------- */
function openPartPanel(isEdit = false, partIndex = null) {
  editingPartIndex = isEdit ? partIndex : null;
  if (partPanelTitle) partPanelTitle.textContent = isEdit ? "Edit Maintenance Item" : "Add Maintenance Item";

  if (!isEdit) {
    if (newPartName) newPartName.value = "";
    if (newPartCategory) newPartCategory.value = "";
    if (newPartSection) newPartSection.value = "";
    if (newPartDays) newPartDays.value = "";
    if (newPartTons) newPartTons.value = "";
  } else {
    const p = parts[partIndex];
    if (newPartName) newPartName.value = p.name || "";
    if (newPartCategory) newPartCategory.value = p.category || "";
    if (newPartSection) newPartSection.value = p.section || "";
    if (newPartDays) newPartDays.value = p.daysInterval || "";
    if (newPartTons) newPartTons.value = p.tonsInterval || "";
  }

  partPanelOverlay?.classList.remove("hidden");
  setTimeout(() => addPartPanel?.classList.add("show"), 10);
}

function closePartPanel() {
  addPartPanel?.classList.remove("show");
  setTimeout(() => partPanelOverlay?.classList.add("hidden"), 250);
}

addPartBtn?.addEventListener("click", () => openPartPanel(false));
closePartPanelBtn?.addEventListener("click", closePartPanel);
partPanelOverlay?.addEventListener("click", (e) => {
  if (e.target === partPanelOverlay) closePartPanel();
});

savePartBtn?.addEventListener("click", () => {
  const name = (newPartName?.value || "").trim();
  const category = (newPartCategory?.value || "").trim();
  const section = (newPartSection?.value || "").trim();
  const daysInterval = Number(newPartDays?.value || 0) || 0;
  const tonsInterval = Number(newPartTons?.value || 0) || 0;

  if (!name || !category) return showToast("Name + Category required", "error");

  const item = {
    id: crypto.randomUUID(),
    name,
    category,
    section,
    daysInterval,
    tonsInterval,
    lastDate: "",
    lastTons: 0,
    history: []
  };

  if (editingPartIndex !== null) {
    const existing = parts[editingPartIndex];
    parts[editingPartIndex] = {
      ...existing,
      name,
      category,
      section,
      daysInterval,
      tonsInterval
    };
  } else {
    parts.push(item);
  }

  if (!saveState()) return;
  buildCategoryDropdown();
  renderParts();
  renderDashboard();
  closePartPanel();
  showToast(editingPartIndex !== null ? "Updated" : "Added");
});

/* ---------------------------------------------------
   PARTS LIST RENDER + ACTIONS
--------------------------------------------------- */
filterCategory?.addEventListener("change", renderParts);
searchPartsInput?.addEventListener("input", renderParts);

function renderParts() {
  if (!partsList) return;

  const q = (searchPartsInput?.value || "").trim().toLowerCase();
  const cat = filterCategory?.value || "ALL";

  const filtered = (parts || []).filter(p => {
    const matchesCat = cat === "ALL" || p.category === cat;
    const hay = `${p.name || ""} ${p.category || ""} ${p.section || ""}`.toLowerCase();
    const matchesSearch = !q || hay.includes(q);
    return matchesCat && matchesSearch;
  });

  if (!filtered.length) {
    partsList.innerHTML = `<div class="part-meta">No parts found.</div>`;
    return;
  }

  partsList.innerHTML = filtered
    .map(p => {
      const idx = parts.indexOf(p);
      const status = getStatus(p);
      const badge = status === "OK" ? "✅ OK" : status === "DUE" ? "⚠️ DUE" : "⛔ OVERDUE";
      return `
      <div class="pm-card">
        <div class="pm-card-top">
          <div>
            <div class="pm-title">${escapeHtml(p.name || "Part")}</div>
            <div class="pm-sub">${escapeHtml(p.category || "")} — ${escapeHtml(p.section || "")}</div>
            <div class="pm-sub">Last: ${escapeHtml(p.lastDate || "—")} • Tons: ${escapeHtml(String(p.lastTons || "—"))}</div>
          </div>
          <span class="pm-pill ${status === "OVERDUE" ? "pm-due" : "pm-done"}">${escapeHtml(badge)}</span>
        </div>

        <div class="pm-actions">
          <button class="part-complete-btn" data-idx="${idx}">Complete</button>
          <button class="part-edit-btn" data-idx="${idx}">Edit</button>
          <button class="part-history-btn" data-idx="${idx}">History</button>
          <button class="part-delete-btn" data-idx="${idx}">Delete</button>
        </div>
      </div>
    `;
    })
    .join("");
}

partsList?.addEventListener("click", (e) => {
  const idx = Number(e.target?.dataset?.idx);
  if (!Number.isFinite(idx)) return;

  if (e.target.classList.contains("part-edit-btn")) return openPartPanel(true, idx);

  if (e.target.classList.contains("part-delete-btn")) {
    if (!confirm("Delete this item?")) return;
    parts.splice(idx, 1);
    if (!saveState()) return;
    renderParts();
    renderDashboard();
    return showToast("Deleted");
  }

  if (e.target.classList.contains("part-complete-btn")) return openCompletePanel(idx);

  if (e.target.classList.contains("part-history-btn")) return openPartHistory(idx);
});

/* ---------------------------------------------------
   COMPLETE MAINTENANCE PANEL
--------------------------------------------------- */
function openCompletePanel(partIdx) {
  completingPartIndex = partIdx;
  completionUsedItems = [];
  completionPhotos = [];

  if (photoPreview) photoPreview.innerHTML = "";
  if (photoInput) photoInput.value = "";
  if (usedItemsList) usedItemsList.innerHTML = "";

  const today = getTodayStr();
  if (compDate) compDate.value = today;
  if (compTons) compTons.value = currentTons;

  buildCompleteInventorySelect();

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

addUsedItemBtn?.addEventListener("click", () => {
  const invIndex = Number(compInventorySelect?.value);
  const qty = Number(compQty?.value || 0) || 0;
  if (!Number.isFinite(invIndex) || invIndex < 0) return showToast("Select an item", "error");
  if (!qty || qty <= 0) return showToast("Qty must be > 0", "error");

  completionUsedItems.push({ invIndex, qty });
  renderUsedItemsList();
  if (compQty) compQty.value = "";
});

function renderUsedItemsList() {
  if (!usedItemsList) return;

  if (!completionUsedItems.length) {
    usedItemsList.innerHTML = `<div class="part-meta">No parts used.</div>`;
    return;
  }

  usedItemsList.innerHTML = completionUsedItems
    .map((u, i) => {
      const inv = inventory[u.invIndex];
      return `
      <div class="used-item">
        <div>${escapeHtml(inv?.name || "Item")} — Qty: ${u.qty}</div>
        <button class="remove-used" data-i="${i}">Remove</button>
      </div>
    `;
    })
    .join("");
}

usedItemsList?.addEventListener("click", (e) => {
  const i = Number(e.target?.dataset?.i);
  if (!Number.isFinite(i)) return;
  completionUsedItems.splice(i, 1);
  renderUsedItemsList();
});

addPhotoBtn?.addEventListener("click", () => photoInput?.click());

photoInput?.addEventListener("change", async () => {
  const files = Array.from(photoInput.files || []);
  if (!files.length) return;

  const MAX_ADD = 4;
  const toAdd = files.slice(0, MAX_ADD);

  for (const file of toAdd) {
    if (!file.type.startsWith("image/")) continue;
    try {
      const raw = await readFileAsDataURL(file);
      const compressed = await compressImage(raw);
      completionPhotos.push(compressed);
    } catch (e) {
      console.error(e);
    }
  }

  if (photoPreview) {
    photoPreview.innerHTML = completionPhotos
      .map(
        (src, i) => `
      <div class="photo-thumb">
        <img src="${src}" alt="Photo ${i + 1}">
        <button class="photo-remove" data-i="${i}">✖</button>
      </div>
    `
      )
      .join("");
  }

  photoInput.value = "";
});

photoPreview?.addEventListener("click", (e) => {
  const i = Number(e.target?.dataset?.i);
  if (Number.isFinite(i)) {
    completionPhotos.splice(i, 1);
    if (photoPreview) {
      photoPreview.innerHTML = completionPhotos
        .map(
          (src, idx) => `
        <div class="photo-thumb">
          <img src="${src}" alt="Photo ${idx + 1}">
          <button class="photo-remove" data-i="${idx}">✖</button>
        </div>
      `
        )
        .join("");
    }
    return;
  }

  if (e.target.tagName === "IMG") openLightbox(e.target.src);
});

saveCompletionBtn?.addEventListener("click", () => {
  if (completingPartIndex === null) return;

  const date = compDate?.value || getTodayStr();
  const tons = Number(compTons?.value || 0) || 0;

  const part = parts[completingPartIndex];
  if (!part) return;

  // consume inventory quantities
  completionUsedItems.forEach(u => {
    const inv = inventory[u.invIndex];
    if (!inv) return;
    inv.qty = Math.max(0, Number(inv.qty || 0) - u.qty);
  });

  const entry = {
    date,
    tons,
    used: completionUsedItems.map(u => ({
      name: inventory[u.invIndex]?.name || "",
      qty: u.qty
    })),
    photos: completionPhotos.slice()
  };

  if (!Array.isArray(part.history)) part.history = [];
  part.history.push(entry);

  part.lastDate = date;
  part.lastTons = tons;

  if (!saveState()) return;
  renderParts();
  renderInventory();
  renderDashboard();
  closeCompletePanel();
  showToast("Completed");
});

/* ---------------------------------------------------
   PART HISTORY (basic)
--------------------------------------------------- */
function openPartHistory(partIdx) {
  const p = parts[partIdx];
  if (!p) return;

  const h = Array.isArray(p.history) ? p.history : [];
  if (!h.length) return showToast("No history yet", "error");

  // Simple: show last entry photos in lightbox on tap (keeps Gold behavior minimal)
  const last = h[h.length - 1];
  if (Array.isArray(last.photos) && last.photos.length) openLightbox(last.photos[0]);
  else showToast("No photos in last entry");
}

/* ---------------------------------------------------
   INVENTORY PANEL
--------------------------------------------------- */
function openInventoryPanelFn(isEdit = false, idx = null) {
  editingInventoryIndex = isEdit ? idx : null;
  if (inventoryPanelTitle) inventoryPanelTitle.textContent = isEdit ? "Edit Inventory Item" : "Add Inventory Item";

  if (!isEdit) {
    if (invPartName) invPartName.value = "";
    if (invCategory) invCategory.value = categories?.[0] || "";
    if (invLocation) invLocation.value = "";
    if (invQty) invQty.value = "";
    if (invNotes) invNotes.value = "";
  } else {
    const it = inventory[idx];
    if (invPartName) invPartName.value = it.name || "";
    if (invCategory) invCategory.value = it.category || "";
    if (invLocation) invLocation.value = it.location || "";
    if (invQty) invQty.value = it.qty ?? 0;
    if (invNotes) invNotes.value = it.notes || "";
  }

  inventoryPanelOverlay?.classList.remove("hidden");
  setTimeout(() => inventoryPanel?.classList.add("show"), 10);
}

function closeInventoryPanel() {
  inventoryPanel?.classList.remove("show");
  setTimeout(() => inventoryPanelOverlay?.classList.add("hidden"), 250);
}

addInventoryBtn?.addEventListener("click", () => openInventoryPanelFn(false));
closeInventoryPanelBtn?.addEventListener("click", closeInventoryPanel);
inventoryPanelOverlay?.addEventListener("click", (e) => {
  if (e.target === inventoryPanelOverlay) closeInventoryPanel();
});

saveInventoryBtn?.addEventListener("click", () => {
  const name = (invPartName?.value || "").trim();
  const category = (invCategory?.value || "").trim();
  const location = (invLocation?.value || "").trim();
  const qty = Number(invQty?.value || 0) || 0;
  const notes = (invNotes?.value || "").trim();

  if (!name) return showToast("Name required", "error");

  const item = {
    id: crypto.randomUUID(),
    name,
    category,
    location,
    qty,
    notes
  };

  if (editingInventoryIndex !== null) inventory[editingInventoryIndex] = { ...inventory[editingInventoryIndex], ...item };
  else inventory.push(item);

  if (!saveState()) return;
  buildInventoryNameDatalist();
  buildCompleteInventorySelect();
  renderInventory();
  closeInventoryPanel();
  showToast(editingInventoryIndex !== null ? "Updated" : "Added");
});

/* Inventory list render */
searchInventoryInput?.addEventListener("input", renderInventory);

function renderInventory() {
  if (!inventoryList) return;

  const q = (searchInventoryInput?.value || "").trim().toLowerCase();
  const filtered = (inventory || []).filter(inv => {
    const hay = `${inv.name || ""} ${inv.category || ""} ${inv.location || ""}`.toLowerCase();
    return !q || hay.includes(q);
  });

  if (!filtered.length) {
    inventoryList.innerHTML = `<div class="part-meta">No inventory items found.</div>`;
    return;
  }

  inventoryList.innerHTML = filtered
    .map(inv => {
      const idx = inventory.indexOf(inv);
      return `
    <div class="pm-card">
      <div class="pm-card-top">
        <div>
          <div class="pm-title">${escapeHtml(inv.name || "Item")}</div>
          <div class="pm-sub">${escapeHtml(inv.category || "")} — ${escapeHtml(inv.location || "")}</div>
          <div class="pm-sub">Qty: ${escapeHtml(String(inv.qty ?? 0))}</div>
          ${inv.notes ? `<div class="pm-sub">${escapeHtml(inv.notes)}</div>` : ""}
        </div>
        <span class="pm-pill pm-done">📦</span>
      </div>

      <div class="pm-actions">
        <button class="inv-edit-btn" data-idx="${idx}">Edit</button>
        <button class="inv-delete-btn" data-idx="${idx}">Delete</button>
      </div>
    </div>
  `;
    })
    .join("");
}

inventoryList?.addEventListener("click", (e) => {
  const idx = Number(e.target?.dataset?.idx);
  if (!Number.isFinite(idx)) return;

  if (e.target.classList.contains("inv-edit-btn")) return openInventoryPanelFn(true, idx);

  if (e.target.classList.contains("inv-delete-btn")) {
    if (!confirm("Delete this inventory item?")) return;
    inventory.splice(idx, 1);
    if (!saveState()) return;
    buildInventoryNameDatalist();
    buildCompleteInventorySelect();
    renderInventory();
    return showToast("Deleted");
  }
});

/* ---------------------------------------------------
   PROBLEMS
--------------------------------------------------- */
function openProblemPanel() {
  problemPhotos = [];
  if (probPhotoPreview) probPhotoPreview.innerHTML = "";
  if (probPhotoInput) probPhotoInput.value = "";

  if (probTitle) probTitle.value = "";
  if (probCategory) probCategory.value = categories?.[0] || "";
  if (probSeverity) probSeverity.value = "Low";
  if (probNotes) probNotes.value = "";

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

probAddPhotoBtn?.addEventListener("click", () => probPhotoInput?.click());

probPhotoInput?.addEventListener("change", async () => {
  const files = Array.from(probPhotoInput.files || []);
  if (!files.length) return;

  const MAX_ADD = 4;
  const toAdd = files.slice(0, MAX_ADD);

  for (const file of toAdd) {
    if (!file.type.startsWith("image/")) continue;
    try {
      const raw = await readFileAsDataURL(file);
      const compressed = await compressImage(raw);
      problemPhotos.push(compressed);
    } catch (e) {
      console.error(e);
    }
  }

  if (probPhotoPreview) {
    probPhotoPreview.innerHTML = problemPhotos
      .map(
        (src, i) => `
      <div class="photo-thumb">
        <img src="${src}" alt="Problem photo ${i + 1}">
        <button class="photo-remove" data-i="${i}">✖</button>
      </div>
    `
      )
      .join("");
  }

  probPhotoInput.value = "";
});

probPhotoPreview?.addEventListener("click", (e) => {
  const i = Number(e.target?.dataset?.i);
  if (Number.isFinite(i)) {
    problemPhotos.splice(i, 1);
    if (probPhotoPreview) {
      probPhotoPreview.innerHTML = problemPhotos
        .map(
          (src, idx) => `
        <div class="photo-thumb">
          <img src="${src}" alt="Problem photo ${idx + 1}">
          <button class="photo-remove" data-i="${idx}">✖</button>
        </div>
      `
        )
        .join("");
    }
    return;
  }

  if (e.target.tagName === "IMG") openLightbox(e.target.src);
});

saveProblemBtn?.addEventListener("click", () => {
  const title = (probTitle?.value || "").trim();
  const category = (probCategory?.value || "").trim();
  const severity = (probSeverity?.value || "Low").trim();
  const notes = (probNotes?.value || "").trim();

  if (!title) return showToast("Title required", "error");

  const item = {
    id: crypto.randomUUID(),
    title,
    category,
    severity,
    notes,
    status: "Open",
    date: getTodayStr(),
    photos: problemPhotos.slice()
  };

  problems.unshift(item);
  if (!saveState()) return;

  renderProblemsList();
  renderDashboard();
  closeProblemPanel();
  showToast("Problem saved");
});

problemFilterBtns?.forEach(btn => {
  btn.addEventListener("click", () => {
    currentProblemFilter = btn.dataset.filter || "ALL";
    problemFilterBtns?.forEach(b => b.classList.toggle("active", b === btn));
    renderProblemsList();
  });
});

function renderProblemsList() {
  if (!problemsListEl) return;

  const filtered = (problems || []).filter(p => {
    if (currentProblemFilter === "ALL") return true;
    return (p.status || "Open") === currentProblemFilter;
  });

  if (!filtered.length) {
    problemsListEl.innerHTML = `<div class="part-meta">No problems.</div>`;
    return;
  }

  problemsListEl.innerHTML = filtered
    .map(p => {
      const status = p.status || "Open";
      const pillClass = status === "Resolved" ? "pm-done" : "pm-due";
      return `
      <div class="pm-card" data-probid="${p.id}">
        <div class="pm-card-top">
          <div>
            <div class="pm-title">${escapeHtml(p.title || "Problem")}</div>
            <div class="pm-sub">${escapeHtml(p.category || "")} • ${escapeHtml(p.severity || "")}</div>
            <div class="pm-sub">${escapeHtml(p.date || "")}</div>
          </div>
          <span class="pm-pill ${pillClass}">${escapeHtml(status)}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

function openProblemDetail(id) {
  viewingProblemId = id;
  const p = (problems || []).find(x => x.id === id);
  if (!p) return;

  if (problemDetailTitle) problemDetailTitle.textContent = p.title || "Problem";
  if (problemDetailMeta) problemDetailMeta.textContent = `${p.category || ""} • ${p.severity || ""} • ${p.date || ""}`;
  if (problemDetailStatus) problemDetailStatus.textContent = p.status || "Open";

  if (problemDetailPhotos) {
    const photos = Array.isArray(p.photos) ? p.photos : [];
    problemDetailPhotos.innerHTML = photos.length
      ? photos
          .map(
            (src, i) => `
        <div class="photo-thumb">
          <img src="${src}" alt="Problem photo ${i + 1}">
        </div>
      `
          )
          .join("")
      : `<div class="part-meta">No photos</div>`;
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
problemDetailOverlay?.addEventListener("click", (e) => {
  if (e.target === problemDetailOverlay) closeProblemDetail();
});

problemDetailPhotos?.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") openLightbox(e.target.src);
});

problemsListEl?.addEventListener("click", (e) => {
  const id = e.target.closest("[data-probid]")?.dataset?.probid;
  if (!id) return;
  openProblemDetail(id);
});

resolveLogBtn?.addEventListener("click", () => {
  if (!viewingProblemId) return;
  const p = problems.find(x => x.id === viewingProblemId);
  if (!p) return;
  p.status = "Resolved";
  if (!saveState()) return;
  renderProblemsList();
  renderDashboard();
  closeProblemDetail();
  showToast("Resolved");
});

deleteProblemBtn?.addEventListener("click", () => {
  if (!viewingProblemId) return;
  if (!confirm("Delete this problem?")) return;
  problems = problems.filter(x => x.id !== viewingProblemId);
  if (!saveState()) return;
  renderProblemsList();
  renderDashboard();
  closeProblemDetail();
  showToast("Deleted");
});

/* ---------------------------------------------------
   PMs: FILTERS
--------------------------------------------------- */
pmFilterBtns?.forEach(btn => {
  btn.addEventListener("click", () => {
    currentPmFilter = btn.dataset.pmfilter || "ALL";
    renderPmsList();
  });
});

pmFilterBtnsPmTab?.forEach(btn => {
  btn.addEventListener("click", () => {
    currentPmFilter = btn.dataset.pmfilter || "ALL";
    renderPmsList();
  });
});

/* ---------------------------------------------------
   PMs: ADD/EDIT PANEL
--------------------------------------------------- */
function openPmPanel(isEdit = false, id = null) {
  editingPmId = isEdit ? id : null;
  if (pmPanelTitle) pmPanelTitle.textContent = isEdit ? "Edit PM" : "Add PM";

  if (isEdit) {
    const item = (pms || []).find(x => x.id === id);
    if (item) {
      if (pmName) pmName.value = item.name || "";
      if (pmArea) pmArea.value = item.area || "Cold Feed";
      if (pmFrequency) pmFrequency.value = item.frequency || "Daily";
      if (pmChecklistText) pmChecklistText.value = Array.isArray(item.checklist) ? item.checklist.join("\n") : "";
    }
  } else {
    if (pmName) pmName.value = "";
    if (pmArea) pmArea.value = "Cold Feed";
    if (pmFrequency) pmFrequency.value = "Daily";
    if (pmChecklistText) pmChecklistText.value = "";
  }

  pmPanelOverlay?.classList.remove("hidden");
  setTimeout(() => pmPanel?.classList.add("show"), 10);
}

function closePmPanel() {
  pmPanel?.classList.remove("show");
  setTimeout(() => pmPanelOverlay?.classList.add("hidden"), 250);
}

openPmPanelBtn?.addEventListener("click", () => {
  if (!can("pm:edit_definition")) return showToast("Admin only", "error");
  openPmPanel(false);
});

openPmPanelBtnPmTab?.addEventListener("click", () => {
  if (!can("pm:edit_definition")) return showToast("Admin only", "error");
  openPmPanel(false);
});

closePmPanelBtn?.addEventListener("click", closePmPanel);
pmPanelOverlay?.addEventListener("click", (e) => {
  if (e.target === pmPanelOverlay) closePmPanel();
});

savePmBtn?.addEventListener("click", () => {
  if (!can("pm:edit_definition")) return showToast("Admin only", "error");

  const name = (pmName?.value || "").trim();
  const area = pmArea?.value || "Cold Feed";
  const frequency = pmFrequency?.value || "Daily";
  const checklistRaw = (pmChecklistText?.value || "").trim();
  const checklist = checklistRaw ? checklistRaw.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [];

  if (!name) return showToast("Name required", "error");

  if (editingPmId) {
    const idx = (pms || []).findIndex(x => x.id === editingPmId);
    if (idx < 0) return;

    pms[idx].name = name;
    pms[idx].area = area;
    pms[idx].frequency = frequency;
    pms[idx].checklist = checklist;

    if (!saveState()) return;
    renderPmsList();
    renderDashboard();
    closePmPanel();
    return showToast("PM updated");
  }

  const newItem = {
    id: crypto.randomUUID(),
    name,
    area,
    frequency,
    checklist,
    history: []
  };

  pms.push(newItem);
  if (!saveState()) return;
  renderPmsList();
  renderDashboard();
  closePmPanel();
  showToast("PM added");
});

function countPmPhotoTotal(pm) {
  const h = Array.isArray(pm.history) ? pm.history : [];
  return h.reduce((acc, entry) => acc + (Array.isArray(entry.photos) ? entry.photos.length : 0), 0);
}

function renderPmsList() {
  if (!pmsListEl && !pmsListPmTab) return;

  pmFilterBtns?.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.pmfilter === currentPmFilter);
  });
  pmFilterBtnsPmTab?.forEach(btn => {
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
    const emptyHtml = `<div class="part-meta">No PMs yet.${can("pm:edit_definition") ? ` Tap <b>+ Add PM</b>.` : ``}</div>`;
    if (pmsListEl) pmsListEl.innerHTML = emptyHtml;
    if (pmsListPmTab) pmsListPmTab.innerHTML = emptyHtml;
    return;
  }

  const listHtml = filtered
    .map(pm => {
      const last = getPmLastDate(pm);
      const canComplete = can("pm:complete");
      const canEdit = can("pm:edit_definition");
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
            <div class="pm-sub">${last ? `Last: ${escapeHtml(last)} • Logs: ${historyCount}` : ""}${photoTotal ? ` • 📷 ${photoTotal}` : ""}</div>
          </div>
          ${pill}
        </div>

        <div class="pm-actions">
          ${canComplete ? `<button class="pm-complete-btn" data-pmid="${pm.id}">Complete</button>` : ``}
          ${canEdit ? `<button class="pm-edit-btn" data-pmid="${pm.id}">Edit</button>` : ``}
          <button class="pm-gallery-btn" data-pmid="${pm.id}">Gallery</button>
          ${canEdit ? `<button class="pm-delete-btn" data-pmid="${pm.id}">Delete</button>` : ``}
        </div>
      </div>
    `;
    })
    .join("");

  if (pmsListEl) pmsListEl.innerHTML = listHtml;
  if (pmsListPmTab) pmsListPmTab.innerHTML = listHtml;
}

function handlePmListClick(e) {
  const id = e.target?.dataset?.pmid || e.target.closest("[data-pmid]")?.dataset?.pmid;
  if (!id) return;

  if (e.target.classList.contains("pm-edit-btn")) {
    if (!can("pm:edit_definition")) return showToast("Admin only", "error");
    return openPmPanel(true, id);
  }

  if (e.target.classList.contains("pm-delete-btn")) {
    if (!can("pm:delete_definition")) return showToast("Admin only", "error");
    if (!confirm("Delete this PM?")) return;
    pms = (pms || []).filter(x => x.id !== id);
    if (!saveState()) return;
    renderPmsList();
    renderDashboard();
    return showToast("PM deleted");
  }

  if (e.target.classList.contains("pm-complete-btn")) {
    if (!can("pm:complete")) return showToast("Read-only", "error");
    return openPmComplete(id);
  }

  if (e.target.classList.contains("pm-gallery-btn")) return openPmGallery(id);
}

pmsListEl?.addEventListener("click", handlePmListClick);
pmsListPmTab?.addEventListener("click", handlePmListClick);

/* ---------------------------------------------------
   PM COMPLETE PANEL (Checklist + Photos gated)
--------------------------------------------------- */
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

  // Phase 3.4: Checklist support (optional, backward compatible)
  pmChecklistItems = Array.isArray(pm.checklist) ? pm.checklist.slice() : [];
  pmChecklistState = pmChecklistItems.map(() => false);

  if (pmChecklistWrap && pmChecklistList && pmChecklistNote) {
    if (pmChecklistItems.length) {
      pmChecklistWrap.classList.remove("hidden");
      pmChecklistList.innerHTML = pmChecklistItems
        .map((item, idx) => {
          const disabled = !can("pm:checklist_interact") ? "disabled" : "";
          return `
          <div class="check-item">
            <input type="checkbox" data-ck="${idx}" ${disabled}>
            <label>${escapeHtml(item)}</label>
          </div>
        `;
        })
        .join("");

      pmChecklistNote.textContent = can("pm:checklist_interact") ? "All items must be checked to complete." : "Read-only.";

      savePmCompletionBtn?.classList.add("btn-disabled");
    } else {
      pmChecklistWrap.classList.add("hidden");
      pmChecklistList.innerHTML = "";
      pmChecklistNote.textContent = "";
      savePmCompletionBtn?.classList.remove("btn-disabled");
    }
  }

  // Gate photo button
  pmAddPhotoBtn?.classList.toggle("btn-disabled", !can("pm:add_photos"));

  pmCompleteOverlay?.classList.remove("hidden");
  setTimeout(() => pmCompletePanel?.classList.add("show"), 10);
}

pmChecklistList?.addEventListener("change", (e) => {
  const idx = Number(e.target?.dataset?.ck);
  if (Number.isNaN(idx)) return;
  if (!can("pm:checklist_interact")) {
    e.target.checked = false;
    return;
  }
  pmChecklistState[idx] = !!e.target.checked;

  const allChecked = pmChecklistState.length ? pmChecklistState.every(Boolean) : true;
  if (allChecked) savePmCompletionBtn?.classList.remove("btn-disabled");
  else savePmCompletionBtn?.classList.add("btn-disabled");
});

function closePmComplete() {
  pmCompletePanel?.classList.remove("show");
  setTimeout(() => pmCompleteOverlay?.classList.add("hidden"), 250);
  completingPmId = null;
}

closePmCompleteBtn?.addEventListener("click", closePmComplete);
pmCompleteOverlay?.addEventListener("click", (e) => {
  if (e.target === pmCompleteOverlay) closePmComplete();
});

pmAddPhotoBtn?.addEventListener("click", () => {
  if (!can("pm:add_photos")) return showToast("Read-only", "error");
  pmPhotoInput?.click();
});

pmPhotoInput?.addEventListener("change", async () => {
  if (!can("pm:add_photos")) {
    pmPhotoInput.value = "";
    return;
  }

  const files = Array.from(pmPhotoInput.files || []);
  if (!files.length) return;

  const MAX_ADD = 4;
  const toAdd = files.slice(0, MAX_ADD);

  for (const file of toAdd) {
    if (!file.type.startsWith("image/")) continue;
    try {
      const raw = await readFileAsDataURL(file);
      const compressed = await compressImage(raw);
      pmCompletionPhotos.push(compressed);
    } catch (e) {
      console.error(e);
    }
  }

  if (pmPhotoPreview) {
    pmPhotoPreview.innerHTML = pmCompletionPhotos
      .map(
        (src, i) => `
      <div class="photo-thumb">
        <img src="${src}" alt="PM photo ${i + 1}">
        <button class="photo-remove" data-i="${i}">✖</button>
      </div>
    `
      )
      .join("");
  }

  pmPhotoInput.value = "";
});

pmPhotoPreview?.addEventListener("click", (e) => {
  const i = Number(e.target?.dataset?.i);
  if (Number.isFinite(i)) {
    pmCompletionPhotos.splice(i, 1);
    if (pmPhotoPreview) {
      pmPhotoPreview.innerHTML = pmCompletionPhotos
        .map(
          (src, idx) => `
        <div class="photo-thumb">
          <img src="${src}" alt="PM photo ${idx + 1}">
          <button class="photo-remove" data-i="${idx}">✖</button>
        </div>
      `
        )
        .join("");
    }
    return;
  }

  if (e.target.tagName === "IMG") openLightbox(e.target.src);
});

savePmCompletionBtn?.addEventListener("click", () => {
  if (!completingPmId) return;
  const pm = (pms || []).find(x => x.id === completingPmId);
  if (!pm) return;
  if (!can("pm:complete")) return showToast("Read-only", "error");

  const date = pmCompDate?.value || getTodayStr();
  const notes = (pmCompNotes?.value || "").trim();
  if (!date) return showToast("Pick a date", "error");

  const checklist = Array.isArray(pm.checklist) ? pm.checklist : [];
  if (checklist.length) {
    const allChecked =
      Array.isArray(pmChecklistState) &&
      pmChecklistState.length === checklist.length &&
      pmChecklistState.every(Boolean);
    if (!allChecked) return showToast("Complete checklist first", "error");
  }

  const entry = { date, notes, photos: pmCompletionPhotos.slice() };

  const checklist2 = Array.isArray(pm.checklist) ? pm.checklist : [];
  if (checklist2.length) entry.checklistResults = pmChecklistState.slice();

  if (!Array.isArray(pm.history)) pm.history = [];
  pm.history.push(entry);

  if (!saveState()) return;

  renderPmsList();
  renderDashboard();
  showToast("PM logged");
  closePmComplete();
});

/* ---------------------------------------------------
   PM GALLERY
--------------------------------------------------- */
function openPmGallery(id) {
  const pm = (pms || []).find(x => x.id === id);
  if (!pm) return;

  if (pmGalleryTitle) pmGalleryTitle.textContent = pm.name || "PM Gallery";
  const h = Array.isArray(pm.history) ? pm.history : [];
  const photos = [];
  h.forEach(entry => {
    const arr = Array.isArray(entry.photos) ? entry.photos : [];
    arr.forEach(src => photos.push({ src, date: entry.date || "" }));
  });

  if (pmGalleryMeta) pmGalleryMeta.textContent = `${photos.length} photo(s)`;

  if (pmGalleryGrid) {
    pmGalleryGrid.innerHTML = photos.length
      ? photos
          .map(
            (p, i) => `
      <div class="photo-thumb">
        <img src="${p.src}" alt="PM photo ${i + 1}">
      </div>
    `
          )
          .join("")
      : `<div class="part-meta">No photos yet.</div>`;
  }

  pmGalleryOverlay?.classList.remove("hidden");
  setTimeout(() => pmGalleryPanel?.classList.add("show"), 10);
}

function closePmGallery() {
  pmGalleryPanel?.classList.remove("show");
  setTimeout(() => pmGalleryOverlay?.classList.add("hidden"), 250);
}

closePmGalleryBtn?.addEventListener("click", closePmGallery);
pmGalleryOverlay?.addEventListener("click", (e) => {
  if (e.target === pmGalleryOverlay) closePmGallery();
});

pmGalleryGrid?.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") openLightbox(e.target.src);
});

/* ---------------------------------------------------
   AC CALCULATOR
--------------------------------------------------- */
acCalcBtn?.addEventListener("click", () => {
  const residual = Number(ac_residual?.value || 0) || 0;
  const rapPct = Number(ac_rapPct?.value || 0) || 0;
  const target = Number(ac_target?.value || 0) || 0;
  const tph = Number(ac_tph?.value || 0) || 0;
  const totalTons = Number(ac_totalTons?.value || 0) || 0;

  if (!tph || !totalTons) return showToast("Enter TPH and Total Tons", "error");

  const mixAc = target - residual * (rapPct / 100);
  const totalAc = (mixAc / 100) * totalTons;
  const pumpRate = (totalAc / totalTons) * tph;

  if (ac_pumpRate) ac_pumpRate.textContent = pumpRate.toFixed(2);
  if (ac_totalAc) ac_totalAc.textContent = totalAc.toFixed(2);

  showToast("AC calculated");
});

/* ===================================================
   PHASE 3.4 (Additive): Settings Role + Admin PIN wiring
=================================================== */
let adminPinMode = "unlock"; // "unlock" | "set"

function openAdminPinModal() {
  if (!adminPinOverlay) return;
  const existingPin = localStorage.getItem(ADMIN_PIN_KEY);

  adminPinMode = existingPin ? "unlock" : "set";
  if (adminPinTitle) adminPinTitle.textContent = adminPinMode === "set" ? "Set Admin PIN" : "Unlock Admin";
  if (adminPinMsg)
    adminPinMsg.textContent =
      adminPinMode === "set" ? "No PIN set yet. Enter a new PIN to set it." : "Enter Admin PIN to unlock.";

  if (adminPinInput) adminPinInput.value = "";
  adminPinOverlay.classList.remove("hidden");
  setTimeout(() => adminPinPanel?.classList.add("show"), 10);
}

function closeAdminPinModal() {
  adminPinPanel?.classList.remove("show");
  setTimeout(() => adminPinOverlay?.classList.add("hidden"), 250);
}

function validatePin(pin) {
  return /^\d{4,8}$/.test(pin);
}

function lockAdmin() {
  adminUnlocked = false;
  localStorage.removeItem(ADMIN_UNLOCKED_KEY);
  applyRoleUI();
  showToast("Admin locked");
}

roleSelect?.addEventListener("change", () => setRole(roleSelect.value));

unlockAdminBtn?.addEventListener("click", () => {
  if (currentRole !== "Admin") return showToast("Set role to Admin first.", "error");
  if (isAdminActive()) return;
  openAdminPinModal();
});

lockAdminBtn?.addEventListener("click", lockAdmin);

closeAdminPinBtn?.addEventListener("click", closeAdminPinModal);
adminPinOverlay?.addEventListener("click", (e) => {
  if (e.target === adminPinOverlay) closeAdminPinModal();
});

submitAdminPinBtn?.addEventListener("click", () => {
  if (currentRole !== "Admin") return showToast("Set role to Admin first.", "error");

  const pin = (adminPinInput?.value || "").trim();
  if (!validatePin(pin)) return showToast("PIN must be 4–8 digits", "error");

  const existingPin = localStorage.getItem(ADMIN_PIN_KEY);

  if (!existingPin) {
    localStorage.setItem(ADMIN_PIN_KEY, pin);
    localStorage.setItem(ADMIN_UNLOCKED_KEY, "1");
    adminUnlocked = true;
    applyRoleUI();
    closeAdminPinModal();
    return showToast("Admin PIN set & unlocked");
  }

  if (pin !== existingPin) return showToast("Wrong PIN", "error");

  localStorage.setItem(ADMIN_UNLOCKED_KEY, "1");
  adminUnlocked = true;
  applyRoleUI();
  closeAdminPinModal();
  showToast("Admin unlocked");
});

function saveRolePermissions() {
  if (!can("settings:manage_perms")) return showToast("Admin only", "error");

  ensureGroundPermControls();
  const permGroundPmComplete = document.getElementById("permGroundPmComplete");
  const permGroundPmPhotos = document.getElementById("permGroundPmPhotos");

  const next = {
    Supervisor: {
      pmView: true,
      pmComplete: !!permSupPmComplete?.checked,
      pmPhotos: !!permSupPmPhotos?.checked
    },
    Maintenance: {
      pmView: true,
      pmComplete: !!permMaintPmComplete?.checked,
      pmPhotos: !!permMaintPmPhotos?.checked
    },
    Ground: {
      pmView: !!permGroundPmView?.checked,
      pmComplete: !!permGroundPmComplete?.checked,
      pmPhotos: !!permGroundPmPhotos?.checked
    }
  };

  localStorage.setItem(PERMS_KEY, JSON.stringify(next));
  loadRolePerms();
  applyRoleUI();
  renderPmsList();
  showToast("Permissions saved");
}

savePermsBtn?.addEventListener("click", saveRolePermissions);

/* ---------------------------------------------------
   EXPORT / RESET (permission gated)
--------------------------------------------------- */
exportBtn?.addEventListener("click", () => {
  if (!can("settings:export")) return showToast("Supervisor/Admin only", "error");

  const payload = {
    parts,
    currentTons,
    inventory,
    problems,
    pms,
    role: currentRole,
    perms: rolePerms
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `plant-maintenance-export-${getTodayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  showToast("Exported");
});

exportPmComplianceBtn?.addEventListener("click", () => {
  if (!can("settings:export_pm_compliance")) return showToast("Supervisor/Admin only", "error");

  const rows = [];
  rows.push(["PM Name", "Area", "Frequency", "Last Date", "Due?", "Log Count", "Photo Count"].join(","));

  (pms || []).forEach(pm => {
    const last = getPmLastDate(pm) || "";
    const due = isPmDue(pm) ? "DUE" : "DONE";
    const logs = Array.isArray(pm.history) ? pm.history.length : 0;
    const photos = countPmPhotoTotal(pm);
    rows.push(
      [pm.name || "", pm.area || "", pm.frequency || "", last, due, String(logs), String(photos)]
        .map(v => `"${String(v).replaceAll('"', '""')}"`)
        .join(",")
    );
  });

  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `pm-compliance-${getTodayStr()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  showToast("PM compliance exported");
});

resetAllBtn?.addEventListener("click", () => {
  if (!can("settings:reset_app")) return showToast("Admin only", "error");
  if (!confirm("Reset ALL data? This cannot be undone.")) return;

  localStorage.removeItem(PARTS_KEY);
  localStorage.removeItem(TONS_KEY);
  localStorage.removeItem(INVENTORY_KEY);
  localStorage.removeItem(PROBLEMS_KEY);
  localStorage.removeItem(PMS_KEY);

  // Keep role + perms + pin unless you want full wipe
  // localStorage.removeItem(ROLE_KEY);
  // localStorage.removeItem(PERMS_KEY);
  // localStorage.removeItem(ADMIN_PIN_KEY);
  // localStorage.removeItem(ADMIN_UNLOCKED_KEY);

  loadState();
  showToast("Reset complete");
});

/* ---------------------------------------------------
   BOOT
--------------------------------------------------- */
loadState();
showScreen("dashboardScreen");
