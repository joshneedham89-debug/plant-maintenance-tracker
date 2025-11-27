/* -------------------------------------------
   Plant Maintenance Tracker – ZIP v4
   FULL WORKING SCRIPT.JS (PART 1)
--------------------------------------------*/

/* Local Storage Keys */
const KEY_TONS = "pm_tons";
const KEY_MAINT = "pm_maintenance";
const KEY_INVENT = "pm_inventory";

/* Global State */
let tonsRun = Number(localStorage.getItem(KEY_TONS)) || 0;
let maintenanceList = JSON.parse(localStorage.getItem(KEY_MAINT) || "[]");
let inventoryList = JSON.parse(localStorage.getItem(KEY_INVENT) || "[]");

/* DOM short-hands */
const $ = (id) => document.getElementById(id);

/* NAVIGATION */
document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const page = btn.dataset.page;
        document.querySelectorAll(".page").forEach(pg => pg.classList.remove("active"));
        $(page).classList.add("active");

        renderAll();
    });
});

/* THEME SWITCH */
const themeToggle = $("themeToggle");
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
});

/* --------------------------
   DASHBOARD RENDER FUNCTIONS
---------------------------*/
function renderDashboard() {
    $("tonsRun").textContent = tonsRun;
    $("maintenanceCount").textContent = maintenanceList.length;
    $("inventoryCount").textContent = inventoryList.length;

    const overdue = maintenanceList.filter(m => checkOverdue(m)).length;
    $("overdueCount").textContent = overdue;

    const next = computeNextDue();
    $("nextDue").textContent = next || "No maintenance items yet.";
}

function checkOverdue(item) {
    if (!item.lastDate || !item.intervalDays) return false;
    const last = new Date(item.lastDate);
    const now = new Date();
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    return diffDays > item.intervalDays;
}

function computeNextDue() {
    let soonest = null;
    maintenanceList.forEach(item => {
        if (!item.lastDate || !item.intervalDays) return;
        const last = new Date(item.lastDate);
        const now = new Date();
        const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        const remaining = item.intervalDays - diff;

        if (remaining >= 0) {
            if (soonest === null || remaining < soonest.days) {
                soonest = { name: item.name, days: remaining };
            }
        }
    });

    return soonest ? `${soonest.name} (in ${soonest.days} days)` : null;
}

/* -------------------------------------------
   MAINTENANCE FUNCTIONS
--------------------------------------------*/

/* Render Maintenance List */
function renderMaintenance() {
    const listDiv = $("maintenanceList");
    listDiv.innerHTML = "";

    maintenanceList.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "item-card";

        card.innerHTML = `
            <p class="item-title">${item.name}</p>
            <p class="item-sub">
                Last: ${item.lastDate || "—"}<br>
                Every: ${item.intervalDays || "—"} days
            </p>
            <button class="delete-btn" onclick="deleteMaintenance(${index})">Delete</button>
        `;

        listDiv.appendChild(card);
    });
}

/* Add Maintenance */
$("addMaintenanceBtn").addEventListener("click", () => {
    const name = prompt("Part name:");
    if (!name) return;

    const interval = prompt("Interval days:");
    const days = Number(interval) || 0;

    const today = new Date().toISOString().slice(0, 10);

    maintenanceList.push({
        name,
        lastDate: today,
        intervalDays: days
    });

    saveAll();
    renderAll();
});

/* Delete Maintenance */
function deleteMaintenance(i) {
    maintenanceList.splice(i, 1);
    saveAll();
    renderAll();
}

/* -------------------------------------------
   INVENTORY FUNCTIONS
--------------------------------------------*/

function renderInventory() {
    const list = $("inventoryList");
    list.innerHTML = "";

    inventoryList.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "item-card";

        card.innerHTML = `
            <p class="item-title">${item.name}</p>
            <p class="item-sub">Qty: ${item.qty}</p>
            <button class="delete-btn" onclick="deleteInventory(${index})">Delete</button>
        `;

        list.appendChild(card);
    });
}

$("addInventoryBtn").addEventListener("click", () => {
    const name = prompt("Item name:");
    if (!name) return;

    const qty = Number(prompt("Quantity:")) || 0;

    inventoryList.push({
        name,
        qty
    });

    saveAll();
    renderInventory();
});

function deleteInventory(i) {
    inventoryList.splice(i, 1);
    saveAll();
    renderInventory();
}

/* -------------------------------------------
   TONS SYSTEM
--------------------------------------------*/

$("resetTonsBtn").addEventListener("click", () => {
    if (confirm("Reset tons to 0?")) {
        tonsRun = 0;
        saveAll();
        renderAll();
    }
});

$("applyTonsBtn").addEventListener("click", () => {
    const v = Number($("setTonsValue").value);
    if (!isNaN(v)) {
        tonsRun = v;
        saveAll();
        renderAll();
    }
});

/* -------------------------------------------
   SAVE + RENDER ALL
--------------------------------------------*/

function saveAll() {
    localStorage.setItem(KEY_TONS, tonsRun);
    localStorage.setItem(KEY_MAINT, JSON.stringify(maintenanceList));
    localStorage.setItem(KEY_INVENT, JSON.stringify(inventoryList));
}

function renderAll() {
    renderDashboard();
    renderMaintenance();
    renderInventory();
}

renderAll();
