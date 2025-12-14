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
const partsList = document.getElementById("partsList");
const filterCategory = document.getElementById("filterCategory");
const searchPartsInput = document.getElementById("searchPartsInput");
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
  categories = PRELOADED_CATEGORIES || [];
  inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || PRELOADED_INVENTORY || [];
  buildCategoryDropdown();
  renderParts();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, String(currentTons));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

loadState();

/* ---------------------------------------------------
   CATEGORY DROPDOWN
--------------------------------------------------- */
function buildCategoryDropdown() {
  filterCategory.innerHTML = `<option value="ALL">All Categories</option>`;
  categories.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    filterCategory.appendChild(opt);
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
  return { status };
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

    const st = calculateStatus(p);

    const historyHtml = (p.history || []).slice().reverse().slice(0, 2).map(h => {
      const photos = h.photos?.length
        ? `<div class="photo-thumbs">${h.photos.map(ph => `<img src="${ph}" class="thumb">`).join("")}</div>`
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
        <div class="part-history"><b>History:</b>${historyHtml}</div>
      </div>`;
    partsList.appendChild(card);
  });
}

/* ---------------------------------------------------
   EXPAND / COLLAPSE
--------------------------------------------------- */
partsList.addEventListener("click", e => {
  const main = e.target.closest(".part-main");
  if (main) {
    document.querySelector(`.part-details[data-details="${main.dataset.idx}"]`)
      ?.classList.toggle("expanded");
  }
});

/* ---------------------------------------------------
   PHASE 3A PHOTO UPLOAD (UNCHANGED)
--------------------------------------------------- */
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
