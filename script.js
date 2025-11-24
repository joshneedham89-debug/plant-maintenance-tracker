// ----------------------------
// OFFLINE PLANT MAINTENANCE TRACKER (FIXED VERSION)
// ----------------------------

const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const CATS_KEY = "pm_categories";
const THEME_KEY = "pm_theme";

let parts = [];
let categories = [];
let currentTons = 0;
let activeCategory = "ALL";
let editingIndex = null;

// DOM refs
const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");

const totalPartsEl = document.getElementById("totalParts");
const nextDueEl = document.getElementById("nextDue");
const tonsRunEl = document.getElementById("tonsRun");

const currentTonsInput = document.getElementById("currentTons");
const updateTonsBtn = document.getElementById("updateTonsBtn");

const addPartBtn = document.getElementById("addPartBtn");
const viewPartsBtn = document.getElementById("viewPartsBtn");
const partsList = document.getElementById("partsList");

const categoryFilter = document.getElementById("categoryFilter");
const addCategoryBtn = document.getElementById("addCategoryBtn");

const exportBtn = document.getElementById("exportBtn");
const resetBtn = document.getElementById("resetBtn");

const partModal = document.getElementById("partModal");
const modalTitle = document.getElementById("modalTitle");
const partCategory = document.getElementById("partCategory");
const partName = document.getElementById("partName");
const partSection = document.getElementById("partSection");
const partDate = document.getElementById("partDate");
const partDays = document.getElementById("partDays");
const partLastTons = document.getElementById("partLastTons");
const partTonInterval = document.getElementById("partTonInterval");
const partNotes = document.getElementById("partNotes");
const moreToggle = document.getElementById("moreToggle");
const moreOptions = document.getElementById("moreOptions");

const savePartBtn = document.getElementById("savePartBtn");
const cancelPartBtn = document.getElementById("cancelPartBtn");

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const themeToggle = document.getElementById("themeToggle");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");

// ----------------------------
// LOAD STATE
// ----------------------------
function loadState() {
  try {
    parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  } catch {
    parts = [];
  }

  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;
  currentTonsInput.value = currentTons;
  tonsRunEl.textContent = currentTons;

  try {
    categories = JSON.parse(localStorage.getItem(CATS_KEY));
  } catch {
    categories = [];
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    categories = [
      "General Plant",
      "Electrical",
      "Conveyor",
      "Mixer",
      "Drum",
      "Safety"
    ];
  }

  const theme = localStorage.getItem(THEME_KEY);
  if (theme === "light") {
    document.body.classList.add("light-mode");
    themeToggle.checked = true;
  }

  populateCategoryDropdowns();
  renderAll();
}

// ----------------------------
// SAVE STATE
// ----------------------------
function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, String(currentTons));
  localStorage.setItem(CATS_KEY, JSON.stringify(categories));
}

// ----------------------------
// CATEGORY DROPDOWNS
// ----------------------------
function populateCategoryDropdowns() {
  categoryFilter.innerHTML = "";

  let all = document.createElement("option");
  all.value = "ALL";
  all.textContent = "All";
  categoryFilter.appendChild(all);

  categories.forEach(cat => {
    let opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  if (!activeCategory || !categories.includes(activeCategory)) {
    activeCategory = "ALL";
  }
  categoryFilter.value = activeCategory;

  // modal dropdown
  partCategory.innerHTML = "";
  categories.forEach(cat => {
    let opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    partCategory.appendChild(opt);
  });
}

// ----------------------------
// UTILITIES
// ----------------------------
function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  let d = new Date(dateStr + "T00:00:00");
  return Math.floor((Date.now() - d) / 86400000);
}

function calcStatus(part) {
  let days = daysSince(part.date);
  let interval = Number(part.days) || 0;

  let tonsSince = currentTons - (Number(part.lastTons) || 0);
  let tonInt = Number(part.tonInterval) || 0;

  let daysLeft = interval ? interval - days : Infinity;
  let tonsLeft = tonInt ? tonInt - tonsSince : Infinity;

  let status = "ok";

  if (daysLeft < 0 || tonsLeft < 0) {
    status = "overdue";
  } else {
    let warningDays = interval ? Math.max(3, Math.round(interval * 0.2)) : 0;
    let warningTons = tonInt ? Math.max(100, Math.round(tonInt * 0.2)) : 0;

    if ((interval && daysLeft <= warningDays) || (tonInt && tonsLeft <= warningTons)) {
      status = "due";
    }
  }

  return { status, days, tonsSince, daysLeft };
}

// ----------------------------
// RENDER PARTS
// ----------------------------
function renderParts() {
  partsList.innerHTML = "";

  let ok = 0, due = 0, over = 0;

  let filtered = parts.filter(p =>
    activeCategory === "ALL" ? true : p.category === activeCategory
  );

  filtered.forEach((p, index) => {
    let st = calcStatus(p);

    if (st.status === "ok") ok++;
    else if (st.status === "due") due++;
    else over++;

    let card = document.createElement("div");
    card.className = "part-card";

    let left = document.createElement("div");
    left.className = "part-left";
    left.innerHTML = `
      <div class="part-name">${p.name}</div>
      <div class="part-meta">${p.category} — ${p.section}</div>
      <div class="part-meta">Last: ${p.date}</div>
      <div class="part-meta">Days since: ${st.days}</div>
      <div class="part-meta">Tons since: ${st.tonsSince}</div>
      <div class="part-meta">${p.notes || ""}</div>
    `;

    let actions = document.createElement("div");
    actions.className = "part-actions";

    let editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => openEditPart(index);

    let delBtn = document.createElement("button");
    delBtn.textContent = "Del";
    delBtn.onclick = () => deletePart(index);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    card.appendChild(left);
    card.appendChild(actions);
    partsList.appendChild(card);
  });

  okCountEl.textContent = `🟢 OK: ${ok}`;
  dueCountEl.textContent = `🟡 Due: ${due}`;
  overCountEl.textContent = `🔴 Overdue: ${over}`;
}

// ----------------------------
// SUMMARY
// ----------------------------
function computeNextDue() {
  if (!parts.length) return null;

  let soon = null;

  parts.forEach(p => {
    let st = calcStatus(p);
    if (!isFinite(st.daysLeft)) return;

    if (soon === null || st.daysLeft < soon.daysLeft) {
      soon = { name: p.name, daysLeft: st.daysLeft };
    }
  });

  return soon;
}

function renderSummary() {
  totalPartsEl.textContent = parts.length;
  tonsRunEl.textContent = currentTons;

  let next = computeNextDue();

  if (!next) nextDueEl.textContent = "—";
  else nextDueEl.textContent = `${next.name} (in ${next.daysLeft} days)`;
}

// ----------------------------
// ADD / EDIT PART
// ----------------------------
function openAddPart() {
  editingIndex = null;

  modalTitle.textContent = "Add Part";
  partCategory.value = categories.includes(activeCategory)
    ? activeCategory
    : categories[0];

  partName.value = "";
  partSection.value = "";
  partDate.value = new Date().toISOString().slice(0, 10);
  partDays.value = "30";
  partLastTons.value = currentTons;
  partTonInterval.value = "10000";
  partNotes.value = "";

  moreOptions.style.display = "none";

  partModal.style.display = "flex";
}

function openEditPart(i) {
  editingIndex = i;
  const p = parts[i];

  modalTitle.textContent = "Edit Part";

  partCategory.value = p.category;
  partName.value = p.name;
  partSection.value = p.section;
  partDate.value = p.date;
  partDays.value = p.days;
  partLastTons.value = p.lastTons;
  partTonInterval.value = p.tonInterval;
  partNotes.value = p.notes;

  moreOptions.style.display = "block";

  partModal.style.display = "flex";
}

function closePartModal() {
  partModal.style.display = "none";
}

function savePart() {
  let p = {
    category: partCategory.value,
    name: partName.value,
    section: partSection.value,
    date: partDate.value,
    days: Number(partDays.value),
    lastTons: Number(partLastTons.value),
    tonInterval: Number(partTonInterval.value),
    notes: partNotes.value
  };

  if (!p.name.trim()) {
    alert("Enter part name");
    return;
  }

  if (editingIndex === null) parts.unshift(p);
  else parts[editingIndex] = p;

  saveState();
  closePartModal();
  renderAll();
}

function deletePart(i) {
  if (!confirm("Delete part?")) return;
  parts.splice(i, 1);
  saveState();
  renderAll();
}

// ----------------------------
// CATEGORY
// ----------------------------
function addCategory() {
  let name = prompt("New category name:");
  if (!name) return;

  name = name.trim();
  if (!categories.includes(name)) {
    categories.push(name);
    saveState();
    populateCategoryDropdowns();
  }
}

// ----------------------------
// TONS UPDATE
// ----------------------------
function updateTons() {
  let v = Number(currentTonsInput.value);

  if (isNaN(v)) {
    alert("Enter a valid number");
    return;
  }

  currentTons = v;
  saveState();
  renderAll();
}

// ----------------------------
// EXPORT / RESET
// ----------------------------
function exportData() {
  let blob = new Blob(
    [JSON.stringify({ parts, currentTons, categories }, null, 2)],
    { type: "application/json" }
  );

  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "pm_export.json";
  a.click();
  URL.revokeObjectURL(url);
}

function resetAll() {
  if (!confirm("Reset ALL data?")) return;

  parts = [];
  currentTons = 0;
  categories = ["General Plant", "Electrical", "Conveyor", "Mixer", "Drum", "Safety"];
  activeCategory = "ALL";

  currentTonsInput.value = "";
  saveState();
  populateCategoryDropdowns();
  renderAll();
}

// ----------------------------
// SETTINGS
// ----------------------------
function openSettings(){ settingsModal.style.display="flex"; }
function closeSettings(){ settingsModal.style.display="none"; }

function toggleTheme(e){
  if (e.target.checked){
    document.body.classList.add("light-mode");
    localStorage.setItem(THEME_KEY,"light");
  } else {
    document.body.classList.remove("light-mode");
    localStorage.setItem(THEME_KEY,"dark");
  }
}

// ----------------------------
// EVENTS
// ----------------------------
updateTonsBtn.addEventListener("click", updateTons);

addPartBtn.addEventListener("click", openAddPart);
viewPartsBtn.addEventListener("click", renderParts);

categoryFilter.addEventListener("change", e => {
  activeCategory = e.target.value;
  renderAll();
});

addCategoryBtn.addEventListener("click", addCategory);

exportBtn.addEventListener("click", exportData);
resetBtn.addEventListener("click", resetAll);

savePartBtn.addEventListener("click", savePart);
cancelPartBtn.addEventListener("click", closePartModal);

moreToggle.addEventListener("click", () => {
  moreOptions.style.display =
    moreOptions.style.display === "none" ? "block" : "none";
});

settingsBtn.addEventListener("click", openSettings);
closeSettingsBtn.addEventListener("click", closeSettings);
themeToggle.addEventListener("change", toggleTheme);

window.addEventListener("click", e => {
  if (e.target === partModal) closePartModal();
  if (e.target === settingsModal) closeSettings();
});

// ----------------------------
// INIT
// ----------------------------
loadState();
