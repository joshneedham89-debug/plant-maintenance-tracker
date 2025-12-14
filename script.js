/* ---------------------------------------------------
   STORAGE KEYS
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";

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
let completionUsedItems = [];

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

/* AC */
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

/* Panels */
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

/* Complete Panel */
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
   INIT
--------------------------------------------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  categories = Array.isArray(PRELOADED_CATEGORIES) ? PRELOADED_CATEGORIES : [];
  const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY));
  inventory = storedInventory?.length ? storedInventory : (PRELOADED_INVENTORY || []);

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

loadState();

/* ---------------------------------------------------
   SCREEN SWITCHING
--------------------------------------------------- */
function showScreen(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.screen === id));
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

/* ---------------------------------------------------
   DASHBOARD
--------------------------------------------------- */
function renderDashboard() {
  let ok = 0, due = 0, over = 0;
  let todayCt = 0, monthCt = 0;
  const today = new Date().toISOString().split("T")[0];
  const [y, m] = today.split("-");

  parts.forEach(p => {
    const st = calculateStatus(p);
    if (st.status === "ok") ok++;
    else if (st.status === "due") due++;
    else over++;

    (p.history || []).forEach(h => {
      if (h.date === today) todayCt++;
      const [hy, hm] = (h.date || "").split("-");
      if (hy === y && hm === m) monthCt++;
    });
  });

  okCountEl.textContent = ok;
  dueCountEl.textContent = due;
  overCountEl.textContent = over;
  tonsRunEl.textContent = currentTons;
  completedTodayEl.textContent = todayCt;
  completedMonthEl.textContent = monthCt;
}

/* ---------------------------------------------------
   STATUS
--------------------------------------------------- */
function calculateStatus(p) {
  const daysSince = (Date.now() - new Date(p.date)) / 86400000;
  const tonsSince = currentTons - (p.lastTons || 0);
  let status = "ok";
  if (daysSince > p.days || tonsSince > p.tonInterval) status = "overdue";
  else if (p.days - daysSince < 5 || p.tonInterval - tonsSince < 500) status = "due";
  return { status, daysSince, tonsSince };
}

/* ---------------------------------------------------
   RENDER PARTS (PHASE 3B PHOTO THUMBNAILS)
--------------------------------------------------- */
function renderParts() {
  partsList.innerHTML = "";
  const selected = filterCategory.value || "ALL";
  const query = searchPartsInput.value.toLowerCase();

  parts.forEach((p, idx) => {
    if (
      (selected !== "ALL" && p.category !== selected) ||
      !`${p.name} ${p.category} ${p.section}`.toLowerCase().includes(query)
    ) return;

    const st = calculateStatus(p);

    const historyHtml = (p.history || []).slice().reverse().slice(0, 2).map(h => {
      const photos = Array.isArray(h.photos) && h.photos.length
        ? `<div class="photo-thumbs">
            ${h.photos.map(ph => `<img src="${ph}" class="thumb">`).join("")}
           </div>`
        : "";
      return `<div class="part-meta">• ${h.date} – ${h.tons} tons${photos}</div>`;
    }).join("") || `<div class="part-meta">No history</div>`;

    const card = document.createElement("div");
    card.className = `part-card status-${st.status}`;
    card.innerHTML = `
      <div class="part-main" data-idx="${idx}">
        <div>
          <div class="part-name">${p.name}</div>
          <div class="part-meta">${p.category} — ${p.section}</div>
        </div>
        <div class="expand-icon">▼</div>
      </div>
      <div class="part-details" data-details="${idx}">
        <div class="part-actions">
          <button class="complete-btn" data-idx="${idx}">Complete</button>
        </div>
        <div class="part-history"><b>History:</b>${historyHtml}</div>
      </div>`;
    partsList.appendChild(card);
  });
}

/* ---------------------------------------------------
   PHASE 3A – PHOTO UPLOAD (UNCHANGED)
--------------------------------------------------- */
const ENABLE_PHASE_3_PHOTOS = true;
if (ENABLE_PHASE_3_PHOTOS) {
  let pendingPhotos = [];
  document.getElementById("addMaintenancePhotosBtn")?.addEventListener("click", async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async () => {
      for (const f of input.files) {
        const r = new FileReader();
        const b64 = await new Promise(res => {
          r.onload = e => res(e.target.result);
          r.readAsDataURL(f);
        });
        pendingPhotos.push(b64);
      }
      showToast(`${pendingPhotos.length} photo(s) ready`);
    };
    input.click();
  });

  saveCompletionBtn?.addEventListener("click", () => {
    const p = parts[completingPartIndex];
    if (p && pendingPhotos.length) {
      p.history[p.history.length - 1].photos = [...pendingPhotos];
      saveState();
    }
    pendingPhotos = [];
  });
}

/* ---------------------------------------------------
   PHASE 3B – FULL SCREEN VIEWER
--------------------------------------------------- */
const viewer = document.getElementById("photoViewer");
const viewerImg = document.getElementById("photoViewerImg");
const closeViewer = document.getElementById("closePhotoViewer");

document.addEventListener("click", e => {
  if (e.target.classList.contains("thumb")) {
    viewerImg.src = e.target.src;
    viewer.classList.remove("hidden");
  }
});

closeViewer?.addEventListener("click", () => {
  viewer.classList.add("hidden");
  viewerImg.src = "";
});
