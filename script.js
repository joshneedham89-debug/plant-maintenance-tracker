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
let completingPartIndex = null;
let completionUsedItems = [];
let pendingMaintenancePhotos = [];

/* ---------------------------------------------------
   ELEMENT REFERENCES
--------------------------------------------------- */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");
const partsList = document.getElementById("partsList");
const filterCategory = document.getElementById("filterCategory");
const searchPartsInput = document.getElementById("searchPartsInput");
const toastContainer = document.getElementById("toastContainer");

/* ---------------------------------------------------
   TOAST
--------------------------------------------------- */
function showToast(msg) {
  if (!toastContainer) return;
  toastContainer.textContent = msg;
  toastContainer.classList.add("show");
  setTimeout(() => toastContainer.classList.remove("show"), 2500);
}

/* ---------------------------------------------------
   INIT
--------------------------------------------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;
  inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || PRELOADED_INVENTORY;
  categories = PRELOADED_CATEGORIES;

  buildCategoryDropdown();
  renderParts();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, currentTons);
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

loadState();

/* ---------------------------------------------------
   CATEGORY FILTER
--------------------------------------------------- */
function buildCategoryDropdown() {
  filterCategory.innerHTML = `<option value="ALL">All Categories</option>`;
  categories.forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    filterCategory.appendChild(o);
  });
}

filterCategory.addEventListener("change", renderParts);
searchPartsInput.addEventListener("input", renderParts);

/* ---------------------------------------------------
   STATUS
--------------------------------------------------- */
function calculateStatus(p) {
  const daysSince = (Date.now() - new Date(p.date)) / 86400000;
  const tonsSince = currentTons - (p.lastTons || 0);
  let status = "ok";
  if (daysSince > p.days || tonsSince > p.tonInterval) status = "overdue";
  else if (p.days - daysSince < 5 || p.tonInterval - tonsSince < 500) status = "due";
  return status;
}

/* ---------------------------------------------------
   RENDER PARTS (PHASE 3B)
--------------------------------------------------- */
function renderParts() {
  partsList.innerHTML = "";
  const sel = filterCategory.value;
  const q = searchPartsInput.value.toLowerCase();

  parts.forEach((p, idx) => {
    if ((sel !== "ALL" && p.category !== sel) ||
        !`${p.name} ${p.category} ${p.section}`.toLowerCase().includes(q)) return;

    const status = calculateStatus(p);

    const historyHtml = (p.history || []).slice().reverse().slice(0, 2).map(h => {
      const photos = h.photos?.length
        ? `<div class="photo-thumbs">${h.photos.map(ph => `<img src="${ph}" class="thumb">`).join("")}</div>`
        : "";
      return `<div class="part-meta">• ${h.date} – ${h.tons} tons${photos}</div>`;
    }).join("") || `<div class="part-meta">No history</div>`;

    const card = document.createElement("div");
    card.className = `part-card status-${status}`;
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
      </div>`;
    partsList.appendChild(card);
  });
}

/* ---------------------------------------------------
   EXPAND + COMPLETE
--------------------------------------------------- */
partsList.addEventListener("click", e => {
  const main = e.target.closest(".part-main");
  if (main) {
    document.querySelector(`[data-details="${main.dataset.idx}"]`)
      ?.classList.toggle("expanded");
  }

  if (e.target.classList.contains("complete-btn")) {
    completingPartIndex = Number(e.target.dataset.idx);
    openCompletePanel();
  }
});

/* ---------------------------------------------------
   COMPLETE MAINTENANCE
--------------------------------------------------- */
function openCompletePanel() {
  const p = parts[completingPartIndex];
  if (!p) return;

  p.history = p.history || [];
  p.history.push({
    date: new Date().toISOString().split("T")[0],
    tons: currentTons,
    photos: pendingMaintenancePhotos.slice()
  });

  p.date = new Date().toISOString().split("T")[0];
  p.lastTons = currentTons;

  pendingMaintenancePhotos = [];
  saveState();
  renderParts();
  showToast("Maintenance completed");
}

/* ---------------------------------------------------
   PHASE 3A PHOTO UPLOAD
--------------------------------------------------- */
document.getElementById("addMaintenancePhotosBtn")?.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.onchange = async () => {
    for (const f of input.files) {
      const r = new FileReader();
      r.onload = e => pendingMaintenancePhotos.push(e.target.result);
      r.readAsDataURL(f);
    }
    showToast("Photos added");
  };
  input.click();
});

/* ---------------------------------------------------
   PHASE 3B PHOTO VIEWER
--------------------------------------------------- */
const viewer = document.getElementById("photoViewer");
const viewerImg = document.getElementById("photoViewerImg");

document.addEventListener("click", e => {
  if (e.target.classList.contains("thumb")) {
    viewerImg.src = e.target.src;
    viewer.classList.remove("hidden");
  }
});

document.getElementById("closePhotoViewer")?.addEventListener("click", () => {
  viewer.classList.add("hidden");
  viewerImg.src = "";
});
