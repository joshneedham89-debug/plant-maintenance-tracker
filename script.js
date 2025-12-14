/* ---------------------------------------------------
   STORAGE KEYS
--------------------------------------------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";

/* ---------------------------------------------------
   STATE
--------------------------------------------------- */
let parts = [];
let currentTons = 0;
let categories = PRELOADED_CATEGORIES;
let inventory = PRELOADED_INVENTORY;

let completingPartIndex = null;
let pendingMaintenancePhotos = [];

/* ---------------------------------------------------
   ELEMENTS
--------------------------------------------------- */
const partsList = document.getElementById("partsList");
const filterCategory = document.getElementById("filterCategory");
const searchPartsInput = document.getElementById("searchPartsInput");

const completePanelOverlay = document.getElementById("completePanelOverlay");
const saveCompletionBtn = document.getElementById("saveCompletionBtn");
const cancelCompletionBtn = document.getElementById("cancelCompletionBtn");

/* ---------------------------------------------------
   INIT
--------------------------------------------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;
  buildCategoryDropdown();
  renderParts();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, currentTons);
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
  if (daysSince > p.days || tonsSince > p.tonInterval) return "overdue";
  if (p.days - daysSince < 5 || p.tonInterval - tonsSince < 500) return "due";
  return "ok";
}

/* ---------------------------------------------------
   RENDER PARTS
--------------------------------------------------- */
function renderParts() {
  partsList.innerHTML = "";
  const q = searchPartsInput.value.toLowerCase();

  parts.forEach((p, idx) => {
    if (!`${p.name} ${p.category} ${p.section}`.toLowerCase().includes(q)) return;

    const history = (p.history || []).slice().reverse().map(h => {
      const thumbs = h.photos?.length
        ? `<div class="photo-thumbs">${h.photos.map(ph => `<img src="${ph}" class="thumb">`).join("")}</div>`
        : "";
      return `<div class="part-meta">• ${h.date}${thumbs}</div>`;
    }).join("");

    const card = document.createElement("div");
    card.className = `part-card status-${calculateStatus(p)}`;
    card.innerHTML = `
      <div class="part-main">
        <div class="part-name">${p.name}</div>
        <button class="complete-btn" data-idx="${idx}">Complete</button>
      </div>
      <div class="part-history">${history}</div>
    `;
    partsList.appendChild(card);
  });
}

/* ---------------------------------------------------
   COMPLETE MAINTENANCE
--------------------------------------------------- */
partsList.addEventListener("click", e => {
  if (e.target.classList.contains("complete-btn")) {
    completingPartIndex = Number(e.target.dataset.idx);
    completePanelOverlay.classList.remove("hidden");
  }
});

saveCompletionBtn.addEventListener("click", () => {
  const p = parts[completingPartIndex];
  if (!p) return;

  p.history = p.history || [];
  p.history.push({
    date: new Date().toISOString().split("T")[0],
    photos: pendingMaintenancePhotos.slice()
  });

  p.date = new Date().toISOString().split("T")[0];
  p.lastTons = currentTons;

  pendingMaintenancePhotos = [];
  saveState();
  renderParts();
  completePanelOverlay.classList.add("hidden");
});

cancelCompletionBtn.addEventListener("click", () => {
  pendingMaintenancePhotos = [];
  completePanelOverlay.classList.add("hidden");
});

/* ---------------------------------------------------
   PHOTO UPLOAD (PHASE 3A)
--------------------------------------------------- */
document.getElementById("addMaintenancePhotosBtn").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.onchange = () => {
    for (const f of input.files) {
      const r = new FileReader();
      r.onload = e => pendingMaintenancePhotos.push(e.target.result);
      r.readAsDataURL(f);
    }
  };
  input.click();
});

/* ---------------------------------------------------
   PHOTO VIEWER (PHASE 3B)
--------------------------------------------------- */
const viewer = document.getElementById("photoViewer");
const viewerImg = document.getElementById("photoViewerImg");

document.addEventListener("click", e => {
  if (e.target.classList.contains("thumb")) {
    viewerImg.src = e.target.src;
    viewer.classList.remove("hidden");
  }
});

document.getElementById("closePhotoViewer").addEventListener("click", () => {
  viewer.classList.add("hidden");
  viewerImg.src = "";
});
