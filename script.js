/* ----------------------------------------------------------
   GLOBAL STORAGE KEYS
---------------------------------------------------------- */
const STORAGE_KEYS = {
  PARTS: "pm_parts",
  INVENTORY: "pm_inventory",
  TONS: "pm_tons",
  THEME: "pm_theme"
};

/* ----------------------------------------------------------
   APP STATE
---------------------------------------------------------- */
let parts = [];
let inventory = [];
let totalTons = 0;
let currentTheme = "dark";

/* ----------------------------------------------------------
   PAGE SWITCHING
---------------------------------------------------------- */
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

function showPage(pageName) {
  pages.forEach(p => p.classList.remove("visible"));
  document.getElementById(`page-${pageName}`).classList.add("visible");

  navButtons.forEach(b =>
    b.classList.toggle("active", b.dataset.page === pageName)
  );

  saveState();
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    showPage(btn.dataset.page);
  });
});

/* ----------------------------------------------------------
   THEME SYSTEM
---------------------------------------------------------- */
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeToggleSettings = document.getElementById("toggleTheme");

function applyTheme() {
  if (currentTheme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }
}

themeToggleBtn.addEventListener("click", toggleTheme);
if (themeToggleSettings) {
  themeToggleSettings.addEventListener("click", toggleTheme);
}

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme();
  saveState();
}

/* ----------------------------------------------------------
   LOCAL STORAGE LOAD/SAVE
---------------------------------------------------------- */
function loadState() {
  try {
    parts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTS)) || [];
  } catch {
    parts = [];
  }

  try {
    inventory = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY)) || [];
  } catch {
    inventory = [];
  }

  totalTons = Number(localStorage.getItem(STORAGE_KEYS.TONS)) || 0;

  currentTheme = localStorage.getItem(STORAGE_KEYS.THEME) || "dark";
  applyTheme();
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(parts));
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  localStorage.setItem(STORAGE_KEYS.TONS, String(totalTons));
  localStorage.setItem(STORAGE_KEYS.THEME, currentTheme);
}

/* ----------------------------------------------------------
   UTILITY HELPERS
---------------------------------------------------------- */
function daysBetween(dateStr) {
  if (!dateStr) return Infinity;
  const day = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - day) / (1000 * 60 * 60 * 24));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ----------------------------------------------------------
   DASHBOARD ENGINE
---------------------------------------------------------- */
const dashTotalParts = document.getElementById("dashTotalParts");
const dashNextDue = document.getElementById("dashNextDue");
const dashTons = document.getElementById("dashTons");
const dashInventory = document.getElementById("dashInventory");
const addTonsBtn = document.getElementById("addTonsBtn");

addTonsBtn.addEventListener("click", () => {
  const added = Number(prompt("Add tons:", "0"));
  if (!isNaN(added) && added > 0) {
    totalTons += added;
    saveState();
    renderDashboard();
    renderMaintenanceList();
  }
});

function computeNextDue() {
  let soonest = null;

  parts.forEach(p => {
    let daysSince = daysBetween(p.lastDate);
    let daysLeft = p.intervalDays ? p.intervalDays - daysSince : Infinity;

    const tonsSince = totalTons - (p.lastTons || 0);
    const tonsLeft = p.intervalTons ? p.intervalTons - tonsSince : Infinity;

    const nextDue = Math.min(daysLeft, tonsLeft);

    if (!soonest || nextDue < soonest.value) {
      soonest = { name: p.name, value: nextDue };
    }
  });

  return soonest;
}

function renderDashboard() {
  dashTotalParts.textContent = parts.length;
  dashTons.textContent = totalTons;
  dashInventory.textContent = inventory.length;

  const next = computeNextDue();
  if (!next || next.value === Infinity) {
    dashNextDue.textContent = "—";
  } else if (next.value < 0) {
    dashNextDue.textContent = `${next.name} (OVERDUE)`;
  } else {
    dashNextDue.textContent = `${next.name} (${next.value} left)`;
  }
}

/* ----------------------------------------------------------
   CATEGORY SETUP
---------------------------------------------------------- */
const maintCategoryFilter = document.getElementById("maintCategoryFilter");
const invCategoryFilter = document.getElementById("invCategoryFilter");

const baseCategories = [
  "General Plant",
  "Dryer",
  "Slat Conveyor",
  "Baghouse",
  "Electrical",
  "Drum",
  "Cold Feed",
  "Screen Deck",
  "Pugmill",
  "Asphalt Tank"
];

function loadCategories() {
  // Maintenance categories
  maintCategoryFilter.innerHTML = `<option value="ALL">ALL</option>`;
  baseCategories.forEach(cat => {
    let opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    maintCategoryFilter.appendChild(opt);
  });

  // Inventory categories
  invCategoryFilter.innerHTML = `<option value="ALL">ALL</option>`;
  baseCategories.forEach(cat => {
    let opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    invCategoryFilter.appendChild(opt);
  });
}

/* ----------------------------------------------------------
   INITIALIZATION
---------------------------------------------------------- */
loadState();
loadCategories();
renderDashboard();
/* ----------------------------------------------------------
   MAINTENANCE ENGINE
---------------------------------------------------------- */
const maintList = document.getElementById("maintList");
const addMaintBtn = document.getElementById("addMaintBtn");

const maintModal = document.getElementById("maintModal");
const maintName = document.getElementById("maintName");
const maintCategory = document.getElementById("maintCategory");
const maintSection = document.getElementById("maintSection");

const maintLastDate = document.getElementById("maintLastDate");
const maintIntervalDays = document.getElementById("maintIntervalDays");

const maintLastTons = document.getElementById("maintLastTons");
const maintIntervalTons = document.getElementById("maintIntervalTons");
const maintNotes = document.getElementById("maintNotes");

let editingMaintId = null;

// Show modal
addMaintBtn.addEventListener("click", () => openMaintModal(null));

function openMaintModal(id) {
  editingMaintId = id;

  // Fill dropdown
  maintCategory.innerHTML = "";
  baseCategories.forEach(cat => {
    let opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    maintCategory.appendChild(opt);
  });

  if (!id) {
    // Add new
    maintName.value = "";
    maintSection.value = "";
    maintLastDate.value = new Date().toISOString().slice(0, 10);
    maintIntervalDays.value = 30;
    maintLastTons.value = totalTons;
    maintIntervalTons.value = 5000;
    maintNotes.value = "";
  } else {
    const p = parts.find(x => x.id === id);
    maintName.value = p.name;
    maintCategory.value = p.category;
    maintSection.value = p.section;
    maintLastDate.value = p.lastDate;
    maintIntervalDays.value = p.intervalDays;
    maintLastTons.value = p.lastTons;
    maintIntervalTons.value = p.intervalTons;
    maintNotes.value = p.notes;
  }

  maintModal.classList.add("show");
}

// Save modal
document.getElementById("saveMaintBtn").addEventListener("click", () => {
  const data = {
    id: editingMaintId || uid(),
    name: maintName.value.trim(),
    category: maintCategory.value,
    section: maintSection.value.trim(),
    lastDate: maintLastDate.value,
    intervalDays: Number(maintIntervalDays.value),
    lastTons: Number(maintLastTons.value),
    intervalTons: Number(maintIntervalTons.value),
    notes: maintNotes.value.trim()
  };

  if (!data.name) {
    alert("Name required");
    return;
  }

  if (!editingMaintId) {
    parts.push(data);
  } else {
    const i = parts.findIndex(x => x.id === editingMaintId);
    parts[i] = data;
  }

  saveState();
  renderMaintenanceList();
  renderDashboard();
  maintModal.classList.remove("show");
});

document.getElementById("closeMaintBtn").addEventListener("click", () => {
  maintModal.classList.remove("show");
});

/* ----------------------------------------------------------
   STATUS CALCULATOR
---------------------------------------------------------- */
function computeMaintStatus(p) {
  const daysAgo = daysBetween(p.lastDate);
  const daysLeft = p.intervalDays ? p.intervalDays - daysAgo : Infinity;

  const tonsSince = totalTons - p.lastTons;
  const tonsLeft = p.intervalTons ? p.intervalTons - tonsSince : Infinity;

  let status = "ok";

  if (daysLeft < 0 || tonsLeft < 0) status = "overdue";
  else if (daysLeft <= 3 || tonsLeft <= 100) status = "due";

  return {
    status,
    daysAgo,
    daysLeft,
    tonsSince,
    tonsLeft
  };
}

/* ----------------------------------------------------------
   RENDER MAINTENANCE LIST
---------------------------------------------------------- */
maintCategoryFilter.addEventListener("change", renderMaintenanceList);

function renderMaintenanceList() {
  const filter = maintCategoryFilter.value;
  maintList.innerHTML = "";

  let okCount = 0,
    dueCount = 0,
    overCount = 0;

  parts
    .filter(p => filter === "ALL" || p.category === filter)
    .forEach(p => {
      const st = computeMaintStatus(p);

      if (st.status === "ok") okCount++;
      if (st.status === "due") dueCount++;
      if (st.status === "overdue") overCount++;

      const div = document.createElement("div");
      div.className = `maint-card status-${st.status}`;

      div.innerHTML = `
        <div class="maint-main">
          <div class="maint-name">${p.name}</div>
          <div class="maint-meta">${p.category} • ${p.section || "No section"}</div>

          <div class="maint-sub">
            Last: ${p.lastDate} (${st.daysAgo} days ago)
          </div>

          <div class="maint-sub">
            Next: ${
              st.daysLeft === Infinity
                ? "-"
                : st.daysLeft < 0
                ? "OVERDUE"
                : st.daysLeft + " days"
            }
          </div>

          <div class="maint-sub">
            Tons since: ${st.tonsSince} / ${p.intervalTons}
          </div>

          <div class="maint-sub notes">${p.notes || ""}</div>
        </div>

        <div class="maint-actions">
          <button class="btn small edit">Edit</button>
          <button class="btn small delete">Del</button>
        </div>
      `;

      // Edit
      div.querySelector(".edit").addEventListener("click", () => {
        openMaintModal(p.id);
      });

      // Delete
      div.querySelector(".delete").addEventListener("click", () => {
        if (confirm("Delete this part?")) {
          parts = parts.filter(x => x.id !== p.id);
          saveState();
          renderMaintenanceList();
          renderDashboard();
        }
      });

      maintList.appendChild(div);
    });

  // Update counters on maintenance page
  document.getElementById("maint-ok").textContent = okCount;
  document.getElementById("maint-due").textContent = dueCount;
  document.getElementById("maint-over").textContent = overCount;
}

/* ----------------------------------------------------------
   INVENTORY ENGINE
---------------------------------------------------------- */
const inventoryList = document.getElementById("inventoryList");
const addInvBtn = document.getElementById("addInvBtn");

const invModal = document.getElementById("invModal");
const invName = document.getElementById("invName");
const invCategory = document.getElementById("invCategory");
const invQty = document.getElementById("invQty");
const invNotes = document.getElementById("invNotes");

let editingInvId = null;

// Add Inventory
addInvBtn.addEventListener("click", () => openInvModal(null));

function openInvModal(id) {
  editingInvId = id;

  invCategory.innerHTML = "";
  baseCategories.forEach(cat => {
    let opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    invCategory.appendChild(opt);
  });

  if (!id) {
    invName.value = "";
    invCategory.value = baseCategories[0];
    invQty.value = 1;
    invNotes.value = "";
  } else {
    const i = inventory.find(x => x.id === id);
    invName.value = i.name;
    invCategory.value = i.category;
    invQty.value = i.qty;
    invNotes.value = i.notes;
  }

  invModal.classList.add("show");
}

// Save Inventory
document.getElementById("saveInvBtn").addEventListener("click", () => {
  const data = {
    id: editingInvId || uid(),
    name: invName.value.trim(),
    category: invCategory.value,
    qty: Number(invQty.value),
    notes: invNotes.value.trim()
  };

  if (!data.name) return alert("Name required");

  if (!editingInvId) inventory.push(data);
  else {
    const idx = inventory.findIndex(x => x.id === editingInvId);
    inventory[idx] = data;
  }

  saveState();
  renderInventory();
  renderDashboard();

  invModal.classList.remove("show");
});

document.getElementById("closeInvBtn").addEventListener("click", () => {
  invModal.classList.remove("show");
});

// Render Inventory
function renderInventory() {
  const filter = invCategoryFilter.value;
  inventoryList.innerHTML = "";

  inventory
    .filter(x => filter === "ALL" || x.category === filter)
    .forEach(item => {
      const div = document.createElement("div");
      div.className = "inv-card";

      div.innerHTML = `
        <div class="inv-main">
          <div class="inv-name">${item.name}</div>
          <div class="inv-meta">${item.category}</div>
          <div class="inv-sub">Qty: ${item.qty}</div>
          <div class="inv-sub notes">${item.notes || ""}</div>
        </div>

        <div class="inv-actions">
          <button class="btn small edit">Edit</button>
          <button class="btn small delete">Del</button>
        </div>
      `;

      div.querySelector(".edit").addEventListener("click", () => {
        openInvModal(item.id);
      });

      div.querySelector(".delete").addEventListener("click", () => {
        if (confirm("Delete item?")) {
          inventory = inventory.filter(x => x.id !== item.id);
          saveState();
          renderInventory();
          renderDashboard();
        }
      });

      inventoryList.appendChild(div);
    });
}

/* ----------------------------------------------------------
   RESET + EXPORT
---------------------------------------------------------- */
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Reset ALL data?")) {
    parts = [];
    inventory = [];
    totalTons = 0;
    saveState();
    renderDashboard();
    renderMaintenanceList();
    renderInventory();
  }
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const data = {
    parts,
    inventory,
    tons: totalTons
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plant-maintenance-export.json";
  a.click();
  URL.revokeObjectURL(url);
});

/* ----------------------------------------------------------
   INITIAL RENDER
---------------------------------------------------------- */
renderMaintenanceList();
renderInventory();
renderDashboard();

console.log("App Loaded Successfully");
