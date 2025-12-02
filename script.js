/* ============================================================
   Plant Maintenance Tracker - PRO Edition (pm_v9)
   Main Application Logic
============================================================ */

/* ---------- LOCAL STORAGE KEYS ---------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const THEME_KEY = "pm_theme";
const CATEGORIES_KEY = "pm_categories";

/* ---------- DATA ---------- */
let parts = [];
let currentTons = 0;
let categories = [];
let editingIndex = null;

/* ---------- DOM ELEMENTS ---------- */

// Screens
const screens = {
  dashboard: document.getElementById("screen-dashboard"),
  maintenance: document.getElementById("screen-maintenance"),
  inventory: document.getElementById("screen-inventory"),
  ac: document.getElementById("screen-ac"),
  settings: document.getElementById("screen-settings"),
};

// Navigation
const navButtons = document.querySelectorAll(".bottom-nav button");

// Dashboard fields
const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const totalPartsEl = document.getElementById("totalParts");
const tonsRunEl = document.getElementById("tonsRun");
const nextDueEl = document.getElementById("nextDue");

// Maintenance
const partsList = document.getElementById("partsList");
const addPartBtn = document.getElementById("addPartBtn");
const categoryFilter = document.getElementById("categoryFilter");

// Inventory
const inventoryFilter = document.getElementById("inventoryFilter");

// Settings
const themeToggle = document.getElementById("themeToggle");
const resetAppBtn = document.getElementById("resetAppBtn");
const resetTonsBtn = document.getElementById("resetTonsBtn");

// Modal
const partModal = document.createElement("div");
partModal.classList.add("modal");
document.body.appendChild(partModal);

/* ============================================================
   LOAD INITIAL STATE
============================================================ */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;
  categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [
    "Cold Feed",
    "Conveyor",
    "Dryer",
    "Baghouse",
    "Slat Conveyor",
    "Tank Farm",
    "Dust System",
    "Mixer",
    "Screens",
    "Controls",
    "Asphalt System",
    "Pumps",
    "Virgin – Other"
  ];

  if (localStorage.getItem(THEME_KEY) === "light") {
    document.body.classList.add("light");
    themeToggle.checked = true;
  }

  populateCategoryDropdowns();
  renderAll();
}

/* ============================================================
   SAVE STATE
============================================================ */
function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, currentTons);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

/* ============================================================
   CATEGORY DROPDOWNS
============================================================ */
function populateCategoryDropdowns() {
  categoryFilter.innerHTML = `<option value="ALL">All Categories</option>`;
  inventoryFilter.innerHTML = `<option value="ALL">All Categories</option>`;

  categories.forEach(cat => {
    categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
    inventoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

/* ============================================================
   STATUS CALCULATION
============================================================ */
function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return Math.floor((now - d) / 86400000);
}

function calcStatus(part) {
  const days = daysSince(part.date);
  const tonsSince = currentTons - Number(part.lastTons || 0);

  const daysLeft = part.days ? part.days - days : Infinity;
  const tonsLeft = part.tonInterval ? part.tonInterval - tonsSince : Infinity;

  let status = "ok";

  if (daysLeft < 0 || tonsLeft < 0) {
    status = "over";
  } else {
    const daysWarn = part.days ? Math.ceil(part.days * 0.2) : 0;
    const tonsWarn = part.tonInterval ? Math.ceil(part.tonInterval * 0.2) : 0;

    if ((part.days && daysLeft <= daysWarn) ||
        (part.tonInterval && tonsLeft <= tonsWarn)) {
      status = "due";
    }
  }

  return { status, days, daysLeft, tonsSince, tonsLeft };
}

/* ============================================================
   RENDER MAINTENANCE PARTS LIST
============================================================ */
function renderParts() {
  partsList.innerHTML = "";
  let ok = 0, due = 0, over = 0;

  let filtered = categoryFilter.value === "ALL"
    ? parts
    : parts.filter(p => p.category === categoryFilter.value);

  filtered.forEach((p, index) => {
    const st = calcStatus(p);

    if (st.status === "ok") ok++;
    if (st.status === "due") due++;
    if (st.status === "over") over++;

    const card = document.createElement("div");
    card.className = `part-card part-${st.status}`;

    card.innerHTML = `
      <div class="part-header">
        <div class="part-title">${p.name}</div>
        <div class="part-category">${p.category}</div>
      </div>

      <div class="part-meta">Section: ${p.section || "-"}</div>
      <div class="part-meta">Last Maint: ${p.date} (${st.days} days ago)</div>
      <div class="part-meta">Next: ${
        st.status === "over" ? "OVERDUE" :
        st.daysLeft !== Infinity ? `${st.daysLeft} days` : "N/A"
      }</div>
      <div class="part-meta">Tons since: ${st.tonsSince} / ${p.tonInterval}</div>
      <div class="part-meta">${p.notes || ""}</div>

      <div class="part-actions">
        <button onclick="openEditPart(${index})">Edit</button>
        <button onclick="deletePart(${index})">Delete</button>
      </div>
    `;

    partsList.appendChild(card);
  });

  okCountEl.textContent = ok;
  dueCountEl.textContent = due;
  overCountEl.textContent = over;
}

/* ============================================================
   RENDER DASHBOARD
============================================================ */
function computeNextDue() {
  let soonest = null;

  parts.forEach(p => {
    const st = calcStatus(p);
    if (st.daysLeft < Infinity && st.daysLeft >= 0) {
      if (!soonest || st.daysLeft < soonest.daysLeft) {
        soonest = { name: p.name, daysLeft: st.daysLeft };
      }
    }
  });

  return soonest;
}

function renderDashboard() {
  totalPartsEl.textContent = parts.length;
  tonsRunEl.textContent = currentTons;

  const nd = computeNextDue();
  nextDueEl.textContent = nd ? `${nd.name} (${nd.daysLeft} days)` : "—";
}

/* ============================================================
   RENDER ALL
============================================================ */
function renderAll() {
  renderParts();
  renderDashboard();
}

/* ============================================================
   MODAL: ADD / EDIT PART
============================================================ */
function openPartModal(edit = false, index = null) {
  editingIndex = edit ? index : null;

  let p = edit ? parts[index] : {
    name: "",
    category: categories[0],
    section: "",
    date: new Date().toISOString().slice(0, 10),
    days: 30,
    lastTons: currentTons,
    tonInterval: 10000,
    notes: ""
  };

  partModal.innerHTML = `
    <div class="modal-content">
      <h2>${edit ? "Edit Part" : "Add Part"}</h2>

      <select id="pm_cat">
        ${categories.map(c => `<option ${c === p.category ? "selected" : ""}>${c}</option>`).join("")}
      </select>

      <input id="pm_name" placeholder="Part Name" value="${p.name}">
      <input id="pm_section" placeholder="Section" value="${p.section}">
      <input id="pm_date" type="date" value="${p.date}">
      <input id="pm_days" type="number" placeholder="Interval (days)" value="${p.days}">
      <input id="pm_tons" type="number" placeholder="Last Tons" value="${p.lastTons}">
      <input id="pm_tonInt" type="number" placeholder="Ton Interval" value="${p.tonInterval}">
      <textarea id="pm_notes" placeholder="Notes">${p.notes}</textarea>

      <div class="modal-buttons">
        <button class="secondary-btn" onclick="closeModal()">Cancel</button>
        <button class="primary-btn" onclick="savePart()">Save</button>
      </div>
    </div>
  `;

  partModal.classList.add("active");
}

function closeModal() {
  partModal.classList.remove("active");
}

function openEditPart(index) {
  openPartModal(true, index);
}

/* ============================================================
   SAVE PART
============================================================ */
function savePart() {
  const updated = {
    name: document.getElementById("pm_name").value,
    category: document.getElementById("pm_cat").value,
    section: document.getElementById("pm_section").value,
    date: document.getElementById("pm_date").value,
    days: Number(document.getElementById("pm_days").value),
    lastTons: Number(document.getElementById("pm_tons").value),
    tonInterval: Number(document.getElementById("pm_tonInt").value),
    notes: document.getElementById("pm_notes").value
  };

  if (editingIndex !== null) parts[editingIndex] = updated;
  else parts.push(updated);

  saveState();
  closeModal();
  renderAll();
}

/* ============================================================
   DELETE PART
============================================================ */
function deletePart(index) {
  if (!confirm("Delete this part?")) return;
  parts.splice(index, 1);
  saveState();
  renderAll();
}

/* ============================================================
   NAVIGATION
============================================================ */
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");

    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    Object.keys(screens).forEach(s => screens[s].classList.remove("active"));
    screens[tab].classList.add("active");
  });
});

/* ============================================================
   SETTINGS
============================================================ */
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.add("light");
    localStorage.setItem(THEME_KEY, "light");
  } else {
    document.body.classList.remove("light");
    localStorage.setItem(THEME_KEY, "dark");
  }
});

resetTonsBtn.addEventListener("click", () => {
  if (!confirm("Reset tons to 0?")) return;
  currentTons = 0;
  saveState();
  renderDashboard();
});

resetAppBtn.addEventListener("click", () => {
  if (!confirm("Reset ALL data?")) return;
  localStorage.clear();
  location.reload();
});

/* ============================================================
   EVENT LISTENERS
============================================================ */
addPartBtn.addEventListener("click", () => openPartModal());
categoryFilter.addEventListener("change", renderParts);
inventoryFilter.addEventListener("change", () => loadInventory(inventoryFilter.value));

/* ============================================================
   INIT
============================================================ */
loadState();
