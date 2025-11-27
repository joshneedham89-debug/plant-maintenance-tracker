/* ============================================================
   STORAGE KEYS
============================================================ */
const PARTS_KEY = "pm_parts_list";
const TONS_KEY = "pm_current_tons";
const CATS_KEY = "pm_categories";
const THEME_KEY = "pm_theme";

/* ============================================================
   APP STATE
============================================================ */
let parts = [];
let categories = [];
let currentTons = 0;
let editingIndex = null;
let activeScreen = "home";

/* ============================================================
   DOM ELEMENTS
============================================================ */

// Screens
const screenHome = document.getElementById("screen-home");
const screenMaintenance = document.getElementById("screen-maintenance");
const screenInventory = document.getElementById("screen-inventory");
const screenSettings = document.getElementById("screen-settings");
const screenAbout = document.getElementById("screen-about");

// Bottom nav buttons
const navHome = document.getElementById("nav-home");
const navMaint = document.getElementById("nav-maint");
const navInv = document.getElementById("nav-inventory");
const navSet = document.getElementById("nav-settings");
const navAbout = document.getElementById("nav-about");

// Maintenance UI
const partsList = document.getElementById("partsList");
const categoryFilter = document.getElementById("categoryFilter");
const addPartBtn = document.getElementById("addPartBtn");

// Tons UI
const currentTonsInput = document.getElementById("currentTonsInput");
const updateTonsBtn = document.getElementById("updateTonsBtn");
const resetTonsBtn = document.getElementById("resetTonsBtn");

// Summary
const totalPartsEl = document.getElementById("totalParts");
const tonsRunEl = document.getElementById("tonsRun");

// Modal
const partModal = document.getElementById("partModal");
const modalTitle = document.getElementById("modalTitle");

const modalCategory = document.getElementById("modalCategory");
const modalName = document.getElementById("modalName");
const modalSection = document.getElementById("modalSection");
const modalDate = document.getElementById("modalDate");
const modalDays = document.getElementById("modalDays");
const modalLastTons = document.getElementById("modalLastTons");
const modalTonInterval = document.getElementById("modalTonInterval");
const modalNotes = document.getElementById("modalNotes");

const savePartBtn = document.getElementById("savePartBtn");
const cancelPartBtn = document.getElementById("cancelPartBtn");

// Settings
const themeToggle = document.getElementById("themeToggle");

/* ============================================================
   LOAD & SAVE STATE
============================================================ */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  categories = JSON.parse(localStorage.getItem(CATS_KEY)) || [
    "General",
    "Slat Conveyor",
    "Dryer",
    "Baghouse",
    "Screens",
    "Drum",
    "Cold Feed",
  ];

  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;
  currentTonsInput.value = currentTons;

  // Theme
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === "light") {
    document.body.classList.add("light-mode");
    themeToggle.checked = true;
  }

  populateCategoryDropdowns();
  renderParts();
  renderSummary();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(CATS_KEY, JSON.stringify(categories));
  localStorage.setItem(TONS_KEY, String(currentTons));
}

/* ============================================================
   NAVIGATION
============================================================ */
function showScreen(name) {
  activeScreen = name;

  // Hide all screens
  screenHome.classList.remove("active");
  screenMaintenance.classList.remove("active");
  screenInventory.classList.remove("active");
  screenSettings.classList.remove("active");
  screenAbout.classList.remove("active");

  // Remove active state on buttons
  navHome.classList.remove("active");
  navMaint.classList.remove("active");
  navInv.classList.remove("active");
  navSet.classList.remove("active");
  navAbout.classList.remove("active");

  // Show selected
  if (name === "home") {
    screenHome.classList.add("active");
    navHome.classList.add("active");
  }
  if (name === "maintenance") {
    screenMaintenance.classList.add("active");
    navMaint.classList.add("active");
  }
  if (name === "inventory") {
    screenInventory.classList.add("active");
    navInv.classList.add("active");
  }
  if (name === "settings") {
    screenSettings.classList.add("active");
    navSet.classList.add("active");
  }
  if (name === "about") {
    screenAbout.classList.add("active");
    navAbout.classList.add("active");
  }

  renderSummary();
}

/* ============================================================
   CATEGORY DROPDOWN
============================================================ */
function populateCategoryDropdowns() {
  categoryFilter.innerHTML = `<option value="ALL">All Categories</option>`;

  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  modalCategory.innerHTML = "";
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    modalCategory.appendChild(opt);
  });
}

/* ============================================================
   PARTS LIST
============================================================ */
function renderParts() {
  partsList.innerHTML = "";
  const filter = categoryFilter.value;

  const filtered =
    filter === "ALL" ? parts : parts.filter((p) => p.category === filter);

  filtered.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "part-card";

    card.innerHTML = `
      <div class="part-name">${p.name}</div>
      <div class="part-meta">${p.category} • ${p.section}</div>
      <div class="part-meta">Last Service: ${p.date}</div>
      <div class="part-meta">Tons Since: ${currentTons - p.lastTons}</div>
      <div class="part-meta">${p.notes || ""}</div>
      <br>
      <button class="secondary-btn" onclick="openEditPart(${index})">Edit</button>
      <button class="secondary-btn red" onclick="deletePart(${index})">Delete</button>
    `;

    partsList.appendChild(card);
  });
}

/* ============================================================
   SUMMARY AREA
============================================================ */
function renderSummary() {
  totalPartsEl.textContent = parts.length;
  tonsRunEl.textContent = currentTons;
}

/* ============================================================
   TONS UPDATE
============================================================ */
updateTonsBtn.addEventListener("click", () => {
  currentTons = Number(currentTonsInput.value || 0);
  saveState();
  renderSummary();
  renderParts();
});

resetTonsBtn.addEventListener("click", () => {
  if (confirm("Reset tons to 0?")) {
    currentTons = 0;
    currentTonsInput.value = 0;
    saveState();
    renderSummary();
    renderParts();
  }
});

/* ============================================================
   PART MODAL
============================================================ */
function openAddPart() {
  editingIndex = null;
  modalTitle.textContent = "Add Part";

  modalCategory.value = categories[0];
  modalName.value = "";
  modalSection.value = "";
  modalDate.value = new Date().toISOString().slice(0, 10);
  modalDays.value = 30;
  modalLastTons.value = currentTons;
  modalTonInterval.value = 10000;
  modalNotes.value = "";

  partModal.style.display = "flex";
}

function openEditPart(i) {
  editingIndex = i;
  const p = parts[i];

  modalTitle.textContent = "Edit Part";

  modalCategory.value = p.category;
  modalName.value = p.name;
  modalSection.value = p.section;
  modalDate.value = p.date;
  modalDays.value = p.days;
  modalLastTons.value = p.lastTons;
  modalTonInterval.value = p.tonInterval;
  modalNotes.value = p.notes;

  partModal.style.display = "flex";
}

cancelPartBtn.addEventListener("click", () => {
  partModal.style.display = "none";
});

/* ============================================================
   SAVE PART
============================================================ */
savePartBtn.addEventListener("click", () => {
  const item = {
    category: modalCategory.value,
    name: modalName.value.trim(),
    section: modalSection.value.trim(),
    date: modalDate.value,
    days: Number(modalDays.value),
    lastTons: Number(modalLastTons.value),
    tonInterval: Number(modalTonInterval.value),
    notes: modalNotes.value.trim(),
  };

  if (!item.name) {
    alert("Part name required.");
    return;
  }

  if (editingIndex === null) parts.unshift(item);
  else parts[editingIndex] = item;

  saveState();
  partModal.style.display = "none";
  renderParts();
});

/* ============================================================
   DELETE PART
============================================================ */
function deletePart(i) {
  if (confirm("Delete this part?")) {
    parts.splice(i, 1);
    saveState();
    renderParts();
  }
}

/* ============================================================
   THEME
============================================================ */
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.add("light-mode");
    localStorage.setItem(THEME_KEY, "light");
  } else {
    document.body.classList.remove("light-mode");
    localStorage.setItem(THEME_KEY, "dark");
  }
});

/* ============================================================
   INIT
============================================================ */
loadState();
showScreen("home");
