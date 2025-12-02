/* ============================================================
   Inventory System - pm_v9
   Loads inventory data & provides filtering + search
============================================================ */

/* ---------- STORAGE KEYS ---------- */
const INV_KEY = "pm_inventory";

/* ---------- DOM ---------- */
const inventoryList = document.getElementById("inventoryList");
const inventoryFilter = document.getElementById("inventoryFilter");
const inventorySearch = document.getElementById("inventorySearch");

/* ---------- DATA ---------- */
let inventory = [];

/* ============================================================
   LOAD INVENTORY (LOCAL JSON STORE)
============================================================ */
function loadInventoryData() {
  // Try load from localStorage
  const saved = localStorage.getItem(INV_KEY);
  if (saved) {
    inventory = JSON.parse(saved);
    renderInventory();
    return;
  }

  // If nothing saved yet, load embedded default inventory
  if (typeof PRELOADED_INVENTORY !== "undefined") {
    inventory = PRELOADED_INVENTORY;
    localStorage.setItem(INV_KEY, JSON.stringify(inventory));
    renderInventory();
    return;
  }

  // Fallback: empty
  inventory = [];
  renderInventory();
}

/* ============================================================
   FILTER + SEARCH
============================================================ */
function getInventoryFiltered() {
  let data = [...inventory];

  // Filter by category
  if (inventoryFilter.value !== "ALL") {
    data = data.filter(item => item.category === inventoryFilter.value);
  }

  // Apply search
  const q = inventorySearch.value.trim().toLowerCase();
  if (q.length > 0) {
    data = data.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.part.toLowerCase().includes(q) ||
      item.notes.toLowerCase().includes(q)
    );
  }

  return data;
}

/* ============================================================
   RENDER INVENTORY LIST
============================================================ */
function renderInventory() {
  inventoryList.innerHTML = "";

  const filtered = getInventoryFiltered();

  if (filtered.length === 0) {
    inventoryList.innerHTML = `<div class="empty-msg">No inventory found</div>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "inventory-card";

    card.innerHTML = `
      <div class="inv-top">
        <div class="inv-name">${item.part}</div>
        <div class="inv-cat">${item.category}</div>
      </div>

      <div class="inv-meta">Location: ${item.location || "—"}</div>
      <div class="inv-meta">Qty: ${item.qty || "0"}</div>
      <div class="inv-meta">Notes: ${item.notes || "—"}</div>
    `;

    inventoryList.appendChild(card);
  });
}

/* ============================================================
   EVENTS
============================================================ */
inventoryFilter.addEventListener("change", renderInventory);
inventorySearch.addEventListener("input", renderInventory);

/* ============================================================
   INIT
============================================================ */
loadInventoryData();
