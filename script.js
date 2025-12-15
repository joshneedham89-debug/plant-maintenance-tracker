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

let pendingMaintenancePhotos = [];

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

/* Complete Maintenance */
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

/* Phase 3 – Photos */
const addMaintenancePhotosBtn = document.getElementById("addMaintenancePhotosBtn");
const pendingPhotoThumbs = document.getElementById("pendingPhotoThumbs");

const photoViewer = document.getElementById("photoViewer");
const photoViewerImg = document.getElementById("photoViewerImg");
const closePhotoViewerBtn = document.getElementById("closePhotoViewer");

/* 🔒 FIX: force photo viewer CLOSED on app load (MOBILE REQUIRED) */
if (photoViewer) {
  photoViewer.classList.add("hidden");
  photoViewerImg.src = "";
  photoViewer.setAttribute("aria-hidden", "true");
}

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
   PHOTO VIEWER (SAFE)
--------------------------------------------------- */
function openPhotoViewer(src) {
  if (!src || typeof src !== "string") return;
  photoViewerImg.src = src;
  photoViewer.classList.remove("hidden");
  photoViewer.setAttribute("aria-hidden", "false");
}

function closePhotoViewer() {
  photoViewerImg.src = "";
  photoViewer.classList.add("hidden");
  photoViewer.setAttribute("aria-hidden", "true");
}

closePhotoViewerBtn?.addEventListener("click", closePhotoViewer);
photoViewer?.addEventListener("click", (e) => {
  if (e.target === photoViewer) closePhotoViewer();
});

document.addEventListener("click", (e) => {
  const img = e.target.closest("img[data-viewer-src]");
  if (!img) return;
  openPhotoViewer(img.dataset.viewerSrc);
});

/* ---------------------------------------------------
   INIT
--------------------------------------------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;
  categories = PRELOADED_CATEGORIES || [];

  const storedInv = JSON.parse(localStorage.getItem(INVENTORY_KEY));
  inventory = storedInv?.length ? storedInv : (PRELOADED_INVENTORY || []);

  if (currentTonsInput) currentTonsInput.value = currentTons;

  buildCategoryDropdown();
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
function showScreen(screenId) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(screenId)?.classList.add("active");

  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === screenId);
  });
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

/* ---------------------------------------------------
   DASHBOARD
--------------------------------------------------- */
function calculateStatus(p) {
  const daysSince = (Date.now() - new Date(p.date)) / 86400000;
  const tonsSince = currentTons - (p.lastTons || 0);
  let status = "ok";
  if (daysSince > p.days || tonsSince > p.tonInterval) status = "overdue";
  else if (p.days - daysSince < 5 || p.tonInterval - tonsSince < 500) status = "due";
  return { status, daysSince, tonsSince };
}

function renderDashboard() {
  let ok = 0, due = 0, over = 0;
  let todayCount = 0, monthCount = 0;

  const today = new Date().toISOString().split("T")[0];
  const [year, month] = today.split("-");

  parts.forEach(p => {
    const st = calculateStatus(p);
    if (st.status === "ok") ok++;
    else if (st.status === "due") due++;
    else over++;

    p.history?.forEach(h => {
      if (h.date === today) todayCount++;
      if (h.date?.startsWith(`${year}-${month}`)) monthCount++;
    });
  });

  okCountEl.textContent = ok;
  dueCountEl.textContent = due;
  overCountEl.textContent = over;
  tonsRunEl.textContent = currentTons;
  completedTodayEl.textContent = todayCount;
  completedMonthEl.textContent = monthCount;
}

/* ---------------------------------------------------
   RENDER PARTS (with photos)
--------------------------------------------------- */
function renderParts() {
  partsList.innerHTML = "";
  const selected = filterCategory.value;
  const query = searchPartsInput.value.toLowerCase();

  parts.forEach((p, idx) => {
    if (
      (selected !== "ALL" && p.category !== selected) ||
      !`${p.name} ${p.category} ${p.section}`.toLowerCase().includes(query)
    ) return;

    const st = calculateStatus(p);

    const historyHtml = (p.history || []).slice().reverse().slice(0, 2).map(h => {
      const thumbs = h.photos?.length
        ? `<div class="photo-thumbs">
            ${h.photos.map(src =>
              `<img src="${src}" data-viewer-src="${src}">`
            ).join("")}
           </div>`
        : "";
      return `<div class="part-meta">• ${h.date} – ${h.tons} tons</div>${thumbs}`;
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
        <button class="complete-btn" data-idx="${idx}">Complete</button>
        <div class="part-history">${historyHtml}</div>
      </div>
    `;
    partsList.appendChild(card);
  });
}

/* ---------------------------------------------------
   COMPLETE MAINTENANCE
--------------------------------------------------- */
partsList.addEventListener("click", e => {
  const main = e.target.closest(".part-main");
  if (main) {
    document.querySelector(`.part-details[data-details="${main.dataset.idx}"]`)
      ?.classList.toggle("expanded");
  }

  if (e.target.classList.contains("complete-btn")) {
    completingPartIndex = Number(e.target.dataset.idx);
    openCompletePanel();
  }
});

function openCompletePanel() {
  compDate.value = new Date().toISOString().split("T")[0];
  compTons.value = currentTons;
  compNotes.value = "";
  pendingMaintenancePhotos = [];
  pendingPhotoThumbs.innerHTML = "";
  completePanelOverlay.classList.remove("hidden");
}

closeCompletePanelBtn?.addEventListener("click", () => {
  pendingMaintenancePhotos = [];
  completePanelOverlay.classList.add("hidden");
});

/* ---------------------------------------------------
   ADD PHOTOS (SAFE FOR MOBILE)
--------------------------------------------------- */
addMaintenancePhotosBtn?.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;

  input.onchange = async () => {
    for (const file of input.files) {
      if (file.size > 1.2 * 1024 * 1024) {
        showToast("Photo too large", "error");
        continue;
      }
      const reader = new FileReader();
      const base64 = await new Promise(r => {
        reader.onload = e => r(e.target.result);
        reader.readAsDataURL(file);
      });
      pendingMaintenancePhotos.push(base64);

      const img = document.createElement("img");
      img.src = base64;
      img.dataset.viewerSrc = base64;
      pendingPhotoThumbs.appendChild(img);
    }
  };

  input.click();
});

/* ---------------------------------------------------
   SAVE MAINTENANCE
--------------------------------------------------- */
saveCompletionBtn?.addEventListener("click", () => {
  const p = parts[completingPartIndex];
  if (!p) return;

  const entry = {
    date: compDate.value,
    tons: Number(compTons.value),
    notes: compNotes.value,
    photos: pendingMaintenancePhotos.slice()
  };

  p.history = p.history || [];
  p.history.push(entry);
  p.date = entry.date;
  p.lastTons = entry.tons;

  saveState();
  renderParts();
  renderDashboard();
  completePanelOverlay.classList.add("hidden");
  showToast("Maintenance saved");
});

/* ---------------------------------------------------
   CATEGORY
--------------------------------------------------- */
function buildCategoryDropdown() {
  filterCategory.innerHTML = `<option value="ALL">All Categories</option>`;
  categories.forEach(c => {
    filterCategory.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

filterCategory.addEventListener("change", renderParts);
searchPartsInput.addEventListener("input", renderParts);

/* ---------------------------------------------------
   INVENTORY (UNCHANGED CORE)
--------------------------------------------------- */
function buildCompleteInventorySelect() {
  compInvSelect.innerHTML = `<option value="">Select inventory</option>`;
  inventory.forEach((item, idx) => {
    compInvSelect.innerHTML += `<option value="${idx}">
      ${item.part} (Qty: ${item.qty})
    </option>`;
  });
}

function renderInventory() {
  if (!inventoryList) return;
  inventoryList.innerHTML = "";
  inventory.forEach(item => {
    const div = document.createElement("div");
    div.className = "part-card";
    div.innerHTML = `
      <div class="part-name">${item.part}</div>
      <div class="part-meta">${item.category} — ${item.location}</div>
      <div class="part-meta">Qty: ${item.qty}</div>
    `;
    inventoryList.appendChild(div);
  });
}
