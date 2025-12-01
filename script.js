/* =======================================================
   Plant Maintenance Tracker v9
   Navigation • Parts • Inventory • Tons • Settings
======================================================= */

/* -------- Local Storage Keys -------- */
const LS_PARTS = "pm_parts_v9";
const LS_INVENTORY = "pm_inventory_v9";
const LS_TONS = "pm_tons_v9";
const LS_THEME = "pm_theme_v9";

/* -------- App State -------- */
let parts = JSON.parse(localStorage.getItem(LS_PARTS) || "[]");
let inventory = JSON.parse(localStorage.getItem(LS_INVENTORY) || "[]");
let currentTons = Number(localStorage.getItem(LS_TONS) || 0);

/* =======================================================
   NAVIGATION
======================================================= */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.screen;

    screens.forEach(s => s.classList.remove("active"));
    navButtons.forEach(b => b.classList.remove("active"));

    document.getElementById(`screen-${target}`).classList.add("active");
    btn.classList.add("active");

    renderAll();
  });
});

/* =======================================================
   TONS TRACKER
======================================================= */
document.getElementById("setTonsBtn").addEventListener("click", () => {
  const val = Number(document.getElementById("tonsInput").value);
  if (!isNaN(val)) {
    currentTons = val;
    saveState();
    renderDashboard();
  }
});

document.getElementById("addTonsBtn").addEventListener("click", () => {
  currentTons += 100;
  saveState();
  renderDashboard();
});

/* =======================================================
   PARTS SYSTEM
======================================================= */
document.getElementById("addPartBtn").addEventListener("click", () => {
  const name = prompt("Part Name:");
  if (!name) return;

  const interval = Number(prompt("Maintenance Interval (days):", "30"));
  const date = prompt("Last Maintenance Date (YYYY-MM-DD):");
  const notes = prompt("Notes:");

  parts.push({
    name,
    interval: interval || 0,
    date: date || "",
    notes: notes || "",
    tonsAtMaintenance: currentTons
  });

  saveState();
  renderParts();
});

function renderParts() {
  const container = document.getElementById("partsList");
  container.innerHTML = "";

  if (parts.length === 0) {
    container.innerHTML = "<p>No parts added yet.</p>";
    return;
  }

  parts.forEach((p, i) => {
    const item = document.createElement("div");
    item.className = "list-item";

    const daysSince = p.date ? Math.floor((Date.now() - new Date(p.date)) / 86400000) : "—";
    const tonsSince = currentTons - (p.tonsAtMaintenance || 0);

    item.innerHTML = `
      <h3>${p.name}</h3>
      <small>Last: ${p.date || "—"} • ${daysSince} days ago</small><br>
      <small>Tons since: ${tonsSince}</small><br>
      <small>Notes: ${p.notes || "—"}</small>
      <br><br>
      <button onclick="deletePart(${i})" class="danger">Delete</button>
    `;

    container.appendChild(item);
  });
}

function deletePart(i) {
  if (confirm("Delete this part?")) {
    parts.splice(i, 1);
    saveState();
    renderParts();
  }
}

/* =======================================================
   INVENTORY SYSTEM
======================================================= */
document.getElementById("addInvBtn").addEventListener("click", () => {
  const name = prompt("Inventory Item:");
  if (!name) return;

  const qty = Number(prompt("Quantity:", "1"));

  inventory.push({
    name,
    qty: qty || 0
  });

  saveState();
  renderInventory();
});

function renderInventory() {
  const container = document.getElementById("inventoryList");
  container.innerHTML = "";

  if (inventory.length === 0) {
    container.innerHTML = "<p>No inventory yet.</p>";
    return;
  }

  inventory.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "list-item";

    div.innerHTML = `
      <h3>${item.name}</h3>
      <small>Qty: ${item.qty}</small>
      <br><br>
      <button onclick="deleteInv(${i})" class="danger">Delete</button>
    `;

    container.appendChild(div);
  });
}

function deleteInv(i) {
  if (confirm("Delete this inventory item?")) {
    inventory.splice(i, 1);
    saveState();
    renderInventory();
  }
}

/* =======================================================
   DASHBOARD
======================================================= */
function renderDashboard() {
  document.getElementById("dashTotalParts").textContent = parts.length;
  document.getElementById("dashTons").textContent = currentTons;

  if (parts.length === 0) {
    document.getElementById("dashNextDue").textContent = "—";
    return;
  }

  const next = parts.reduce((soonest, p) => {
    const date = p.date ? new Date(p.date) : null;
    return (!soonest && date) || (date && date < new Date(soonest.date)) ? p : soonest;
  }, null);

  document.getElementById("dashNextDue").textContent =
    next && next.date ? next.name + " (" + next.date + ")" : "—";
}

/* =======================================================
   THEME SWITCH
======================================================= */
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.add("light");
    localStorage.setItem(LS_THEME, "light");
  } else {
    document.body.classList.remove("light");
    localStorage.setItem(LS_THEME, "dark");
  }
});

/* =======================================================
   RESET ALL DATA
======================================================= */
document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset ALL data?")) return;

  parts = [];
  inventory = [];
  currentTons = 0;

  saveState();
  renderAll();
});

/* =======================================================
   SAVE + RENDER
======================================================= */
function saveState() {
  localStorage.setItem(LS_PARTS, JSON.stringify(parts));
  localStorage.setItem(LS_INVENTORY, JSON.stringify(inventory));
  localStorage.setItem(LS_TONS, currentTons);
}

function renderAll() {
  renderDashboard();
  renderParts();
  renderInventory();
}

/* =======================================================
   INIT APP
======================================================= */
(function init() {
  // Load theme
  const savedTheme = localStorage.getItem(LS_THEME);
  if (savedTheme === "light") {
    document.body.classList.add("light");
    themeToggle.checked = true;
  }

  renderAll();
})();
