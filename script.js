/* ================= STORAGE ================= */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";

/* ================= STATE ================= */
let parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
let currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;
let inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || PRELOADED_INVENTORY.slice();
let categories = PRELOADED_CATEGORIES;

let completingPartIndex = null;
let completionPhotos = [];

/* ================= ELEMENTS ================= */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

/* Dashboard */
const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const tonsRunEl = document.getElementById("tonsRun");
const currentTonsInput = document.getElementById("currentTonsInput");
const updateTonsBtn = document.getElementById("updateTonsBtn");

/* Maintenance */
const partsList = document.getElementById("partsList");
const addPartBtn = document.getElementById("addPartBtn");
const searchPartsInput = document.getElementById("searchPartsInput");
const filterCategory = document.getElementById("filterCategory");

/* Inventory */
const inventoryList = document.getElementById("inventoryList");
const addInventoryBtn = document.getElementById("addInventoryBtn");
const searchInventoryInput = document.getElementById("searchInventoryInput");

/* AC */
const acCalcBtn = document.getElementById("acCalcBtn");
const ac_residual = document.getElementById("ac_residual");
const ac_rapPct = document.getElementById("ac_rapPct");
const ac_target = document.getElementById("ac_target");
const ac_tph = document.getElementById("ac_tph");
const ac_totalTons = document.getElementById("ac_totalTons");
const ac_pumpRate = document.getElementById("ac_pumpRate");
const ac_totalAc = document.getElementById("ac_totalAc");

/* Complete Maintenance */
const completePanelOverlay = document.getElementById("completePanelOverlay");
const closeCompletePanel = document.getElementById("closeCompletePanel");
const saveCompletionBtn = document.getElementById("saveCompletionBtn");
const compDate = document.getElementById("compDate");
const compTons = document.getElementById("compTons");
const compNotes = document.getElementById("compNotes");
const compPhotoInput = document.getElementById("compPhotoInput");
const photoPreview = document.getElementById("photoPreview");
const photoViewer = document.getElementById("photoViewer");
const photoViewerImg = document.getElementById("photoViewerImg");

/* Toast */
const toast = document.getElementById("toastContainer");

/* ================= HELPERS ================= */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, currentTons);
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

/* ================= NAV ================= */
function showScreen(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  navButtons.forEach(btn =>
    btn.classList.toggle("active", btn.dataset.screen === id)
  );

  if (id === "dashboardScreen") renderDashboard();
  if (id === "maintenanceScreen") renderParts();
  if (id === "inventoryScreen") renderInventory();
}

navButtons.forEach(btn =>
  btn.addEventListener("click", () => showScreen(btn.dataset.screen))
);

/* ================= DASHBOARD ================= */
updateTonsBtn.addEventListener("click", () => {
  currentTons = Number(currentTonsInput.value);
  saveState();
  renderDashboard();
  showToast("Tons updated");
});

function calculateStatus(p) {
  const daysSince = (Date.now() - new Date(p.date)) / 86400000;
  const tonsSince = currentTons - p.lastTons;
  if (daysSince > p.days || tonsSince > p.tonInterval) return "overdue";
  if (p.days - daysSince < 5 || p.tonInterval - tonsSince < 500) return "due";
  return "ok";
}

function renderDashboard() {
  let ok = 0, due = 0, over = 0;
  parts.forEach(p => {
    const s = calculateStatus(p);
    if (s === "ok") ok++;
    if (s === "due") due++;
    if (s === "overdue") over++;
  });
  okCountEl.textContent = ok;
  dueCountEl.textContent = due;
  overCountEl.textContent = over;
  tonsRunEl.textContent = currentTons;
}

/* ================= MAINTENANCE ================= */
filterCategory.innerHTML = `<option value="ALL">All</option>`;
categories.forEach(c =>
  filterCategory.innerHTML += `<option value="${c}">${c}</option>`
);

filterCategory.addEventListener("change", renderParts);
searchPartsInput.addEventListener("input", renderParts);

function renderParts() {
  partsList.innerHTML = "";
  const q = searchPartsInput.value.toLowerCase();
  const cat = filterCategory.value;

  parts.forEach((p, i) => {
    if (cat !== "ALL" && p.category !== cat) return;
    if (q && !p.name.toLowerCase().includes(q)) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${p.name}</strong><br>
      ${p.category} — ${p.section}<br>
      <button class="primary-btn full">Complete</button>
    `;
    card.querySelector("button").onclick = () => openComplete(i);
    partsList.appendChild(card);
  });
}

/* ================= INVENTORY ================= */
function renderInventory() {
  inventoryList.innerHTML = "";
  const q = searchInventoryInput.value.toLowerCase();

  inventory.forEach(item => {
    if (q && !item.part.toLowerCase().includes(q)) return;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${item.part}</strong><br>
      ${item.category} — ${item.location}<br>
      Qty: ${item.qty}
    `;
    inventoryList.appendChild(card);
  });
}

searchInventoryInput.addEventListener("input", renderInventory);

/* ================= ADD PART (TEMP PROMPT VERSION) ================= */
addPartBtn.addEventListener("click", () => {
  const name = prompt("Part name?");
  if (!name) return;

  parts.push({
    name,
    category: categories[0],
    section: "General",
    days: 30,
    tonInterval: 5000,
    date: new Date().toISOString().split("T")[0],
    lastTons: currentTons,
    history: []
  });

  saveState();
  renderParts();
  renderDashboard();
  showToast("Part added");
});

/* ================= ADD INVENTORY (TEMP PROMPT VERSION) ================= */
addInventoryBtn.addEventListener("click", () => {
  const name = prompt("Inventory item name?");
  if (!name) return;

  inventory.push({
    part: name,
    category: categories[0],
    location: "Stock",
    qty: 1,
    notes: ""
  });

  saveState();
  renderInventory();
  showToast("Inventory added");
});

/* ================= COMPLETE + PHOTOS ================= */
function openComplete(idx) {
  completingPartIndex = idx;
  compDate.value = new Date().toISOString().split("T")[0];
  compTons.value = currentTons;
  compNotes.value = "";
  completionPhotos = [];
  photoPreview.innerHTML = "";
  completePanelOverlay.classList.remove("hidden");
}

closeCompletePanel.addEventListener("click", () => {
  completePanelOverlay.classList.add("hidden");
});

function compressImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const r = new FileReader();
    r.onload = e => img.src = e.target.result;
    img.onload = () => {
      const c = document.createElement("canvas");
      const s = Math.min(1, 900 / img.width);
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.7));
    };
    r.readAsDataURL(file);
  });
}

compPhotoInput.addEventListener("change", async () => {
  for (const file of compPhotoInput.files) {
    const src = await compressImage(file);
    completionPhotos.push({ type: "local", src });
    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => {
      photoViewerImg.src = src;
      photoViewer.classList.remove("hidden");
    };
    photoPreview.appendChild(img);
  }
});

photoViewer.addEventListener("click", () => {
  photoViewer.classList.add("hidden");
});

saveCompletionBtn.addEventListener("click", () => {
  const p = parts[completingPartIndex];
  if (!p.history) p.history = [];

  p.history.push({
    date: compDate.value,
    tons: Number(compTons.value),
    notes: compNotes.value,
    photos: completionPhotos.slice()
  });

  p.date = compDate.value;
  p.lastTons = Number(compTons.value);

  saveState();
  completePanelOverlay.classList.add("hidden");
  renderParts();
  renderDashboard();
  showToast("Maintenance saved");
});

/* ================= AC CALCULATOR (FIXED) ================= */
acCalcBtn.addEventListener("click", () => {
  const R = Number(ac_residual.value) / 100;
  const RAP = Number(ac_rapPct.value) / 100;
  const T = Number(ac_target.value) / 100;
  const TPH = Number(ac_tph.value);
  const total = Number(ac_totalTons.value);

  if (isNaN(R) || isNaN(RAP) || isNaN(T)) {
    showToast("Enter valid AC values");
    return;
  }

  const pump = TPH * (T - (RAP * R));
  const needed = total * (T - (RAP * R));

  ac_pumpRate.textContent = pump.toFixed(3);
  ac_totalAc.textContent = needed.toFixed(2);
});

/* ================= INIT ================= */
currentTonsInput.value = currentTons;
renderDashboard();
renderParts();
renderInventory();
