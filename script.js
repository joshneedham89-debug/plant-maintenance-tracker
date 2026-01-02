/* ---------------------------------------------------
   STORAGE KEYS (GOLD - DO NOT CHANGE)
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";
const PROBLEMS_KEY = "pm_problems";
const PMS_KEY = "pm_pms";

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

let problems = [];
let completions = [];
let pms = [];

let currentRole = "Maintenance";
let roleCfg = { allowRoleChange: true };
let adminAuthed = false;

function normalizeRole(r) {
  const v = String(r || "").trim();
  if (["Admin","Supervisor","Maintenance","Ground"].includes(v)) return v;
  return "Maintenance";
}

function loadRoleState() {
  currentRole = normalizeRole(localStorage.getItem(ROLE_KEY) || "Maintenance");
  try {
    roleCfg = JSON.parse(localStorage.getItem(ROLE_CFG_KEY)) || { allowRoleChange: true };
  } catch { roleCfg = { allowRoleChange: true }; }
}

function saveRoleState() {
  localStorage.setItem(ROLE_KEY, currentRole);
  localStorage.setItem(ROLE_CFG_KEY, JSON.stringify(roleCfg || { allowRoleChange: true }));
}

function isAdminRole() { return currentRole === "Admin"; }

function canPm(action) {
  // action: "view" | "complete" | "checklist" | "photos" | "edit" | "delete"
  if (action === "view") return true;
  if (["complete","checklist","photos"].includes(action)) return currentRole !== "Ground";
  if (["edit","delete"].includes(action)) return isAdminRole() && adminAuthed;
  return false;
}

let editingPartIndex = null;
let editingInventoryIndex = null;

let editingProblemId = null;
let viewingProblemId = null;
let problemPhotosTemp = [];

let currentProblemFilter = "Open";

let editingPmId = null;
let completingPmId = null;
let pmCompletionPhotos = [];
let currentPmFilter = "ALL";

/* ---------------------------------------------------
   ELEMENTS
--------------------------------------------------- */
const tonsDisplay = document.getElementById("tonsDisplay");
const tonsInput = document.getElementById("tonsInput");
const addTonsBtn = document.getElementById("addTonsBtn");

const openProblemPanelBtn = document.getElementById("openProblemPanelBtn");
const dashboardReportProblemBtn = document.getElementById("dashboardReportProblemBtn");
const problemPanelOverlay = document.getElementById("problemPanelOverlay");
const problemPanel = document.getElementById("problemPanel");
const closeProblemPanelBtn = document.getElementById("closeProblemPanel");
const problemTitle = document.getElementById("problemTitle");
const problemCategory = document.getElementById("problemCategory");
const problemDesc = document.getElementById("problemDesc");
const saveProblemBtn = document.getElementById("saveProblemBtn");

const problemAddPhotoBtn = document.getElementById("problemAddPhotoBtn");
const problemPhotoInput = document.getElementById("problemPhotoInput");
const problemPhotoPreview = document.getElementById("problemPhotoPreview");

const problemsList = document.getElementById("problemsList");
const probFilterBtns = document.querySelectorAll(".prob-filter");

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

const pmDueCountEl = document.getElementById("pmDueCount");

const pmChecklistDef = document.getElementById("pmChecklistDef");
const pmVisAdmin = document.getElementById("pmVisAdmin");
const pmVisSupervisor = document.getElementById("pmVisSupervisor");
const pmVisMaintenance = document.getElementById("pmVisMaintenance");
const pmVisGround = document.getElementById("pmVisGround");
const pmDefLocked = document.getElementById("pmDefLocked");

const pmChecklistWrap = document.getElementById("pmChecklistWrap");
const pmChecklistList = document.getElementById("pmChecklistList");
const pmChecklistHint = document.getElementById("pmChecklistHint");

let pmChecklistState = [];

const savePmCompletionBtn = document.getElementById("savePmCompletionBtn");

const pmGalleryOverlay = document.getElementById("pmGalleryOverlay");
const pmGalleryPanel = document.getElementById("pmGalleryPanel");
const pmGalleryTitle = document.getElementById("pmGalleryTitle");
const closePmGalleryBtn = document.getElementById("closePmGallery");
const pmGalleryGrid = document.getElementById("pmGalleryGrid");

/* Settings */
const exportBtn = document.getElementById("exportBtn");
const exportPmComplianceBtn = document.getElementById("exportPmComplianceBtn");
const resetAllBtn = document.getElementById("resetAllBtn");

/* Roles / Admin */
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

/* Add/Edit Part Panel */
const partPanelOverlay = document.getElementById("partPanelOverlay");
const addPartPanel = document.getElementById("addPartPanel");
const closePartPanelBtn = document.getElementById("closePartPanel");
const partPanelTitle = document.getElementById("partPanelTitle");

const newPartName = document.getElementById("newPartName");
const newPartCategory = document.getElementById("newPartCategory");
const newPartQty = document.getElementById("newPartQty");
const newPartNotes = document.getElementById("newPartNotes");
const savePartBtn = document.getElementById("savePartBtn");

const addPhotoBtn = document.getElementById("addPhotoBtn");
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");

/* Complete Panel */
const completeOverlay = document.getElementById("completeOverlay");
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

/* AC Calc */
const acTons = document.getElementById("acTons");
const acPercent = document.getElementById("acPercent");
const acCalcBtn = document.getElementById("acCalcBtn");
const acResult = document.getElementById("acResult");

/* Bottom nav */
const navButtons = document.querySelectorAll(".nav-btn");
const screens = document.querySelectorAll(".screen");

const openProblemsCount = document.getElementById("openProblemsCount");
const pmDueTodayCount = document.getElementById("pmDueTodayCount");
const navJumpBtns = document.querySelectorAll(".nav-jump");

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

function showToast(msg, type="ok") {
  // simple toast
  const t = document.createElement("div");
  t.className = "toast " + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 250);
  }, 2200);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function compressImage(dataUrl, maxW=1280, quality=0.72) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      const w = Math.min(maxW, img.width);
      const h = Math.round(w / ratio);

      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/* ---------------------------------------------------
   INIT / SAVE (quota-safe)
--------------------------------------------------- */
function loadState() {
  loadRoleState();

  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  // PRELOADED_INVENTORY is provided by inventory.js
  const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || [];
  inventory = storedInventory?.length ? storedInventory : (PRELOADED_INVENTORY?.slice?.() || []);

  problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];
  pms = JSON.parse(localStorage.getItem(PMS_KEY)) || [];

  if (tonsInput) tonsInput.value = "";

  buildProblemCategoryDropdown();
  buildPmAreaDropdown();
  buildCompleteInventorySelect();

  renderDashboard();
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
   ROLES / ADMIN UI
--------------------------------------------------- */
function applyRoleUI() {
  if (roleSelect) roleSelect.value = currentRole;

  const allow = !!(roleCfg && roleCfg.allowRoleChange);
  if (allowRoleChangeChk) allowRoleChangeChk.checked = allow;

  // Role select can be locked for non-admin
  if (roleSelect) {
    const locked = !allow && !(isAdminRole() && adminAuthed);
    roleSelect.disabled = locked;
    roleSelect.classList.toggle("disabled", locked);
  }

  // PM Add button (Admin only)
  openPmPanelBtn?.classList.toggle("hidden", !canPm("edit"));

  // Admin panel visibility
  const showAdminStuff = isAdminRole() && adminAuthed;
  adminPanel?.classList.toggle("hidden", !showAdminStuff);
  adminLogoutBtn?.classList.toggle("hidden", !showAdminStuff);
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

closeAdminPinBtn?.addEventListener("click", closeAdminPinPrompt);
adminPinOverlay?.addEventListener("click", (e) => { if (e.target === adminPinOverlay) closeAdminPinPrompt(); });

adminLoginBtn?.addEventListener("click", () => {
  if (!isAdminRole()) {
    showToast("Set role to Admin on this device first", "error");
    return;
  }
  const hasPin = !!getStoredAdminPin();
  openAdminPinPrompt(hasPin ? "Enter your Admin PIN to unlock controls" : "No PIN set yet. Enter a new PIN, then tap Unlock.");
});

submitAdminPinBtn?.addEventListener("click", () => {
  if (!isAdminRole()) return;
  const entered = String(adminPinInput?.value || "").trim();
  const stored = getStoredAdminPin();

  if (!stored) {
    // First-time PIN set
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

loadState();
applyRoleUI();

/* ---------------------------------------------------
   SCREEN SWITCHING
--------------------------------------------------- */
function showScreen(screenId) {
  screens.forEach(s => s.classList.toggle("active", s.id === screenId));
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.screen === screenId));
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

navJumpBtns?.forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

/* ---------------------------------------------------
   DASHBOARD
--------------------------------------------------- */
function renderDashboard() {
  if (tonsDisplay) tonsDisplay.textContent = String(currentTons || 0);

  const openCount = (problems || []).filter(p => (p.status || "Open") !== "Resolved").length;
  if (openProblemsCount) openProblemsCount.textContent = String(openCount);

  const dueCount = (pms || []).filter(pm => {
    const vis = pm.visibility || pm.vis || null;
    const visibleForRole = !vis || vis[currentRole] !== false;
    return visibleForRole && isPmDue(pm);
  }).length;

  if (pmDueTodayCount) pmDueTodayCount.textContent = String(dueCount);
}

addTonsBtn?.addEventListener("click", () => {
  const add = Number(tonsInput?.value || 0);
  if (!add || add <= 0) return showToast("Enter tons", "error");
  currentTons += add;
  if (!saveState()) return;
  tonsInput.value = "";
  renderDashboard();
  showToast("Tons updated");
});

/* ---------------------------------------------------
   PROBLEMS
--------------------------------------------------- */
function buildProblemCategoryDropdown() {
  if (!problemCategory) return;
  const cats = [
    "Cold Feed", "RAP", "Drum", "Drag", "Silos", "Scales", "Electrical", "Air", "Hydraulic", "Other"
  ];
  problemCategory.innerHTML = "";
  cats.forEach(c => problemCategory.innerHTML += `<option value="${c}">${c}</option>`);
}

function openProblemPanel() {
  problemTitle.value = "";
  problemDesc.value = "";
  problemPhotosTemp = [];
  if (problemPhotoPreview) problemPhotoPreview.innerHTML = "";
  if (problemPhotoInput) problemPhotoInput.value = "";

  problemPanelOverlay?.classList.remove("hidden");
  setTimeout(() => problemPanel?.classList.add("show"), 10);
}

function closeProblemPanel() {
  problemPanel?.classList.remove("show");
  setTimeout(() => problemPanelOverlay?.classList.add("hidden"), 250);
}

openProblemPanelBtn?.addEventListener("click", openProblemPanel);
dashboardReportProblemBtn?.addEventListener("click", openProblemPanel);
closeProblemPanelBtn?.addEventListener("click", closeProblemPanel);
problemPanelOverlay?.addEventListener("click", (e) => { if (e.target === problemPanelOverlay) closeProblemPanel(); });

problemAddPhotoBtn?.addEventListener("click", () => problemPhotoInput?.click());
problemPhotoInput?.addEventListener("change", async () => {
  const files = Array.from(problemPhotoInput.files || []);
  if (!files.length) return;

  const MAX_TOTAL = 4;
  const remaining = Math.max(0, MAX_TOTAL - problemPhotosTemp.length);
  const toAdd = files.slice(0, remaining);
  if (!toAdd.length) { showToast("Max 4 photos", "error"); problemPhotoInput.value = ""; return; }

  for (const file of toAdd) {
    if (!file.type.startsWith("image/")) continue;
    const base64 = await readFileAsDataURL(file);
    const compressed = await compressImage(base64);
    problemPhotosTemp.push(compressed);
  }

  problemPhotoInput.value = "";
  renderProblemPhotoPreview();
});

function renderProblemPhotoPreview() {
  if (!problemPhotoPreview) return;
  if (!problemPhotosTemp.length) { problemPhotoPreview.innerHTML = ""; return; }

  problemPhotoPreview.innerHTML = `
    <div class="photo-preview-grid">
      ${problemPhotosTemp.map((src, idx) => `
        <div class="photo-thumb">
          <img src="${src}" alt="Problem Photo ${idx + 1}">
          <button class="photo-remove" data-idx="${idx}" title="Remove">✖</button>
        </div>
      `).join("")}
    </div>
  `;
}

problemPhotoPreview?.addEventListener("click", (e) => {
  const btn = e.target.closest(".photo-remove");
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  if (!Number.isFinite(idx)) return;
  problemPhotosTemp.splice(idx, 1);
  renderProblemPhotoPreview();
});

saveProblemBtn?.addEventListener("click", () => {
  const title = (problemTitle?.value || "").trim();
  const category = problemCategory?.value || "Other";
  const desc = (problemDesc?.value || "").trim();
  if (!title) return showToast("Enter a title", "error");

  problems.unshift({
    id: "prob_" + Date.now(),
    createdAt: new Date().toISOString(),
    title,
    category,
    desc,
    status: "Open",
    photos: problemPhotosTemp.slice()
  });

  if (!saveState()) return;
  renderProblemsList();
  renderDashboard();
  closeProblemPanel();
  showToast("Problem saved");
});

probFilterBtns?.forEach(btn => {
  btn.addEventListener("click", () => {
    currentProblemFilter = btn.dataset.filter || "Open";
    renderProblemsList();
  });
});

function renderProblemsList() {
  if (!problemsList) return;

  probFilterBtns.forEach(b => b.classList.toggle("active", b.dataset.filter === currentProblemFilter));

  const filtered = (problems || []).filter(p => (p.status || "Open") === currentProblemFilter);
  if (!filtered.length) {
    problemsList.innerHTML = `<div class="part-meta">No ${escapeHtml(currentProblemFilter)} problems.</div>`;
    return;
  }

  problemsList.innerHTML = filtered.map(p => {
    const pill = p.status === "Resolved" ? "ok" : (p.status === "In Progress" ? "warn" : "bad");
    return `
      <div class="pm-row" data-probid="${p.id}">
        <div class="pm-main">
          <div class="pm-top">
            <div class="pm-name">${escapeHtml(p.title)}</div>
            <span class="pill ${pill}">${escapeHtml(p.status || "Open")}</span>
          </div>
          <div class="pm-meta">
            <span>${escapeHtml(p.category || "Other")}</span>
            <span>•</span>
            <span>${escapeHtml((p.createdAt || "").slice(0,10) || "")}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

problemsList?.addEventListener("click", (e) => {
  const id = e.target.closest("[data-probid]")?.dataset?.probid;
  if (!id) return;
  openProblemDetail(id);
});

function openProblemDetail(id) {
  viewingProblemId = id;
  const p = (problems || []).find(x => x.id === id);
  if (!p) return;

  if (problemDetailTitle) problemDetailTitle.textContent = p.title || "Problem";
  if (problemDetailMeta) problemDetailMeta.textContent = `${p.category || "Other"} • ${(p.createdAt || "").slice(0,10)}`;

  const pillClass = p.status === "Resolved" ? "ok" : (p.status === "In Progress" ? "warn" : "bad");
  if (problemDetailStatus) {
    problemDetailStatus.className = `pill ${pillClass}`;
    problemDetailStatus.textContent = p.status || "Open";
  }

  if (problemDetailPhotos) {
    const photos = Array.isArray(p.photos) ? p.photos : [];
    problemDetailPhotos.innerHTML = photos.length
      ? photos.map((src) => `<img src="${src}" alt="Problem photo">`).join("")
      : `<div class="part-meta">No photos.</div>`;
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

resolveLogBtn?.addEventListener("click", () => {
  if (!viewingProblemId) return;
  const p = (problems || []).find(x => x.id === viewingProblemId);
  if (!p) return;

  p.status = "Resolved";
  if (!saveState()) return;

  renderDashboard();
  renderProblemsList();
  closeProblemDetail();
  showToast("Problem resolved");
});

/* ===================================================
   PMs (Due Today + Checklist + Roles)
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
  if (!canPm("edit")) {
    showToast("Admin only", "error");
    return;
  }

  editingPmId = isEdit ? id : null;
  if (pmPanelTitle) pmPanelTitle.textContent = isEdit ? "Edit PM" : "Add PM";
  buildPmAreaDropdown();

  if (isEdit) {
    const item = (pms || []).find(x => x.id === id);
    if (item) {
      if (item.locked) {
        showToast("This PM is locked by Admin", "error");
        return;
      }
      if (pmName) pmName.value = item.name || "";
      if (pmArea) pmArea.value = item.area || "Cold Feed";
      if (pmFrequency) pmFrequency.value = item.frequency || "Daily";

      const list = Array.isArray(item.checklist) ? item.checklist : [];
      if (pmChecklistDef) pmChecklistDef.value = list.join("\n");

      const vis = item.visibility || {};
      if (pmVisAdmin) pmVisAdmin.checked = vis.Admin !== false;
      if (pmVisSupervisor) pmVisSupervisor.checked = vis.Supervisor !== false;
      if (pmVisMaintenance) pmVisMaintenance.checked = vis.Maintenance !== false;
      if (pmVisGround) pmVisGround.checked = vis.Ground !== false;

      if (pmDefLocked) pmDefLocked.checked = !!item.locked;
    }
  } else {
    if (pmName) pmName.value = "";
    if (pmArea) pmArea.value = "Cold Feed";
    if (pmFrequency) pmFrequency.value = "Daily";
    if (pmChecklistDef) pmChecklistDef.value = "";
    if (pmVisAdmin) pmVisAdmin.checked = true;
    if (pmVisSupervisor) pmVisSupervisor.checked = true;
    if (pmVisMaintenance) pmVisMaintenance.checked = true;
    if (pmVisGround) pmVisGround.checked = true;
    if (pmDefLocked) pmDefLocked.checked = false;
  }

  pmPanelOverlay?.classList.remove("hidden");
  setTimeout(() => pmPanel?.classList.add("show"), 10);
}

function closePmPanel() {
  pmPanel?.classList.remove("show");
  setTimeout(() => pmPanelOverlay?.classList.add("hidden"), 250);
  editingPmId = null;
}

openPmPanelBtn?.addEventListener("click", () => openPmPanel(false));

closePmPanelBtn?.addEventListener("click", closePmPanel);
pmPanelOverlay?.addEventListener("click", (e) => { if (e.target === pmPanelOverlay) closePmPanel(); });

savePmBtn?.addEventListener("click", () => {
  if (!canPm("edit")) { showToast("Admin only", "error"); return; }

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
      if (pms[idx].locked) { showToast("This PM is locked", "error"); return; }
      pms[idx] = { ...pms[idx], name, area, frequency, checklist, visibility, locked };
    }
  } else {
    pms.unshift({
      id: "pm_" + Date.now(),
      createdAt: new Date().toISOString(),
      name, area, frequency,
      checklist,
      visibility,
      locked,
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
    // Role-based PM visibility (default: visible to all)
    const vis = pm.visibility || pm.vis || null;
    const visibleForRole = !vis || vis[currentRole] !== false;
    if (!visibleForRole) return false;
    if (currentPmFilter === "ALL") return true;
    const due = isPmDue(pm);
    if (currentPmFilter === "DUE") return due;
    if (currentPmFilter === "DONE") return !due;
    return true;
  });

  const dueCount = filtered.filter(isPmDue).length;
  if (pmDueCountEl) pmDueCountEl.textContent = `${dueCount} PM${dueCount === 1 ? "" : "s"} due today`;

  if (!filtered.length) {
    pmsListEl.innerHTML = `<div class="part-meta">No PMs yet.</div>`;
    return;
  }

  pmsListEl.innerHTML = (() => {
    // Group by area
    const byArea = {};
    filtered.forEach(pm => {
      const a = pm.area || "Other";
      if (!byArea[a]) byArea[a] = [];
      byArea[a].push(pm);
    });

    const areasOrder = ["Cold Feed","RAP","Drum","Drag","Silos","Scales","Other"];
    const areas = Object.keys(byArea).sort((a,b) => areasOrder.indexOf(a) - areasOrder.indexOf(b));

    return areas.map(area => {
      const items = (byArea[area] || []).map(pm => {
        const last = getPmLastDate(pm);
        const due = isPmDue(pm);
        const pill = due ? `<span class="pill warn">Due Today</span>` : `<span class="pill ok">Completed</span>`;
        const count = Array.isArray(pm.history) ? pm.history.length : 0;

        const canEdit = canPm("edit") && !pm.locked;
        const canDelete = canPm("delete");
        const canComplete = canPm("complete");
        const showComplete = canComplete;
        const showEdit = canEdit;
        const showDelete = canDelete;
        const showGallery = true;

        return `
      <div class="pm-row" data-pmid="${pm.id}">
        <div class="pm-main">
          <div class="pm-top">
            <div class="pm-name">${escapeHtml(pm.name || "PM")}</div>
            ${pill}
          </div>
          <div class="pm-meta">
            <span>${escapeHtml(pm.frequency || "Daily")}</span>
            <span>•</span>
            <span>Last: ${last ? escapeHtml(last) : "—"}</span>
            <span>•</span>
            <span>History: ${count}</span>
          </div>
        </div>

        <div class="pm-actions">
          ${showComplete ? `<button class="pm-complete-btn" data-pmid="${pm.id}">Complete</button>` : `<button class="pm-complete-btn" data-pmid="${pm.id}" disabled title="Not allowed for this role">Complete</button>`}
          ${showEdit ? `<button class="pm-edit-btn" data-pmid="${pm.id}">Edit</button>` : ``}
          ${showGallery ? `<button class="pm-gallery-btn" data-pmid="${pm.id}">Gallery</button>` : ``}
          ${showDelete ? `<button class="pm-delete-btn" data-pmid="${pm.id}">Delete</button>` : ``}
        </div>
      </div>
    `;
      }).join("");

      return `
        <div class="pm-group">
          <div class="pm-group-title">${escapeHtml(area)}</div>
          ${items}
        </div>
      `;
    }).join("");
  })();
}

pmsListEl?.addEventListener("click", (e) => {
  const id = e.target?.dataset?.pmid || e.target.closest("[data-pmid]")?.dataset?.pmid;
  if (!id) return;

  if (e.target.classList.contains("pm-edit-btn")) return openPmPanel(true, id);

  if (e.target.classList.contains("pm-delete-btn")) {
    if (!canPm("delete")) { showToast("Admin only", "error"); return; }
    const item = (pms || []).find(x => x.id === id);
    if (item?.locked) { showToast("This PM is locked", "error"); return; }
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

  if (!canPm("complete")) { showToast("PM completion is disabled for Ground role", "error"); return; }

  if (pmCompleteTitle) pmCompleteTitle.textContent = `Complete PM — ${pm.name || ""}`;
  if (pmCompDate) pmCompDate.value = getTodayStr();
  if (pmCompNotes) pmCompNotes.value = "";

  // Checklist UI (required when checklist exists, unless Ground)
  pmChecklistState = [];
  const list = Array.isArray(pm.checklist) ? pm.checklist : [];
  if (pmChecklistWrap && pmChecklistList) {
    if (list.length) {
      pmChecklistWrap.classList.remove("hidden");
      pmChecklistList.innerHTML = list.map((item, idx) => {
        const disabled = !canPm("checklist");
        return `
          <label class="check-row ${disabled ? "disabled" : ""}">
            <input type="checkbox" class="pm-check" data-idx="${idx}" ${disabled ? "disabled" : ""}>
            <span>${escapeHtml(item)}</span>
          </label>
        `;
      }).join("");
      pmChecklistState = new Array(list.length).fill(false);
      if (pmChecklistHint) {
        pmChecklistHint.textContent = canPm("checklist") ? "Check all items to enable Complete PM." : "Ground role is view-only.";
      }
    } else {
      pmChecklistWrap.classList.add("hidden");
      pmChecklistList.innerHTML = "";
      if (pmChecklistHint) pmChecklistHint.textContent = "";
    }
  }

  // Photos disabled for Ground
  const photosAllowed = canPm("photos");
  pmAddPhotoBtn?.classList.toggle("hidden", !photosAllowed);
  if (pmAddPhotoBtn) pmAddPhotoBtn.disabled = !photosAllowed;

  // Enforce checklist completion (only when checklist exists)
  if (savePmCompletionBtn) {
    const needsChecklist = list.length && canPm("checklist");
    savePmCompletionBtn.disabled = needsChecklist;
    savePmCompletionBtn.classList.toggle("disabled", savePmCompletionBtn.disabled);
  }

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

  const MAX_TOTAL = 4;
  const remaining = Math.max(0, MAX_TOTAL - pmCompletionPhotos.length);
  const toAdd = files.slice(0, remaining);
  if (!toAdd.length) { showToast("Max 4 photos per PM completion", "error"); pmPhotoInput.value = ""; return; }

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

pmChecklistList?.addEventListener("change", (e) => {
  const cb = e.target.closest(".pm-check");
  if (!cb) return;
  const idx = Number(cb.dataset.idx);
  if (!Number.isFinite(idx)) return;
  pmChecklistState[idx] = !!cb.checked;

  if (savePmCompletionBtn) {
    const allChecked = pmChecklistState.length ? pmChecklistState.every(Boolean) : true;
    savePmCompletionBtn.disabled = !allChecked;
    savePmCompletionBtn.classList.toggle("disabled", savePmCompletionBtn.disabled);
  }
});

pmPhotoPreview?.addEventListener("click", (e) => {
  const btn = e.target.closest(".photo-remove");
  if (btn) {
    const idx = Number(btn.dataset.idx);
    if (!Number.isFinite(idx)) return;
    pmCompletionPhotos.splice(idx, 1);
    renderPmPhotoPreview();
  }
});

savePmCompletionBtn?.addEventListener("click", () => {
  if (!completingPmId) return;
  const pm = (pms || []).find(x => x.id === completingPmId);
  if (!pm) return;

  if (!canPm("complete")) {
    showToast("PM completion not allowed for this role", "error");
    return;
  }

  const date = pmCompDate?.value || getTodayStr();
  const notes = (pmCompNotes?.value || "").trim();
  if (!date) return showToast("Pick a date", "error");

  const checklist = Array.isArray(pm.checklist) ? pm.checklist : [];
  const needsChecklist = checklist.length && canPm("checklist");
  if (needsChecklist) {
    const allChecked = pmChecklistState.length ? pmChecklistState.every(Boolean) : false;
    if (!allChecked) {
      showToast("Complete the checklist first", "error");
      return;
    }
  }

  const entry = {
    date,
    notes,
    photos: pmCompletionPhotos.slice(),
    checklistResults: needsChecklist ? pmChecklistState.slice() : []
  };

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
  if (pmGalleryTitle) pmGalleryTitle.textContent = `PM Gallery — ${pm.name || ""}`;

  if (pmGalleryGrid) {
    pmGalleryGrid.innerHTML = photos.length
      ? photos.map(p => `<img src="${p.src}" data-date="${escapeHtml(p.date)}" alt="PM Photo">`).join("")
      : `<div class="part-meta">No photos saved for this PM yet.</div>`;
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

/* LIGHTBOX */
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxMeta = document.getElementById("lightboxMeta");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(src, meta="") {
  if (!lightboxOverlay || !lightboxImg) return;
  lightboxImg.src = src;
  if (lightboxMeta) lightboxMeta.textContent = meta;
  lightboxOverlay.classList.remove("hidden");
}

function closeLightbox() {
  lightboxOverlay?.classList.add("hidden");
  if (lightboxImg) lightboxImg.src = "";
  if (lightboxMeta) lightboxMeta.textContent = "";
}

pmGalleryGrid?.addEventListener("click", (e) => {
  const img = e.target.closest("img");
  if (!img) return;
  openLightbox(img.src, img.dataset.date ? `Date: ${img.dataset.date}` : "");
});

problemDetailPhotos?.addEventListener("click", (e) => {
  const img = e.target.closest("img");
  if (!img) return;
  openLightbox(img.src, "");
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxOverlay?.addEventListener("click", (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightboxOverlay && !lightboxOverlay.classList.contains("hidden")) closeLightbox();
});

/* ---------------------------------------------------
   EXPORT / RESET
--------------------------------------------------- */
exportBtn?.addEventListener("click", () => {
  const data = {
    parts,
    currentTons,
    inventory,
    problems,
    pms
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `plant-maintenance-export-${getTodayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Exported");
});

exportPmComplianceBtn?.addEventListener("click", () => {
  // CSV: PM name, area, frequency, last completed date
  const rows = [["PM Name","Area","Frequency","Last Completed","Total History Entries","Total Photos"]];
  (pms || []).forEach(pm => {
    const last = getPmLastDate(pm);
    rows.push([
      pm.name || "",
      pm.area || "",
      pm.frequency || "",
      last || "",
      String(Array.isArray(pm.history) ? pm.history.length : 0),
      String(countPmPhotoTotal(pm))
    ]);
  });

  const csv = rows.map(r => r.map(x => `"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pm-compliance-${getTodayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("PM compliance exported");
});

resetAllBtn?.addEventListener("click", () => {
  if (!confirm("Reset entire app? This clears all data on this device.")) return;
  localStorage.removeItem(PARTS_KEY);
  localStorage.removeItem(TONS_KEY);
  localStorage.removeItem(INVENTORY_KEY);
  localStorage.removeItem(PROBLEMS_KEY);
  localStorage.removeItem(PMS_KEY);

  // Phase 3.4 keys (safe to remove on full reset)
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(ROLE_CFG_KEY);
  localStorage.removeItem(ADMIN_PIN_KEY);

  showToast("Reset complete");
  location.reload();
});

/* ---------------------------------------------------
   SERVICE WORKER (GOLD - unchanged behavior)
--------------------------------------------------- */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(console.error);
                                     }
