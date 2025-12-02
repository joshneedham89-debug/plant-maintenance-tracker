/* ============================================================
   GLOBAL STORAGE KEYS
============================================================ */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const START_TONS_KEY = "pm_start_tons";
const THEME_KEY = "pm_theme";

/* ============================================================
   GLOBAL STATE
============================================================ */
let parts = [];
let currentTons = 0;
let startingTons = 0;

let editingIndex = null;

/* ============================================================
   DOM ELEMENTS
============================================================ */
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-btn");

const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");
const totalPartsEl = document.getElementById("totalParts");
const nextDueEl = document.getElementById("nextDue");

const currentTonsInput = document.getElementById("currentTonsInput");
const updateTonsBtn = document.getElementById("updateTonsBtn");

const partsList = document.getElementById("partsList");
const categoryFilter = document.getElementById("categoryFilter");

const addPartBtn = document.getElementById("addPartBtn");

const inventorySearch = document.getElementById("inventorySearch");
const inventoryCategoryFilter = document.getElementById("inventoryCategoryFilter");
const inventoryList = document.getElementById("inventoryList");

const acPercent = document.getElementById("acPercent");
const acTons = document.getElementById("acTons");
const acCalcBtn = document.getElementById("acCalcBtn");
const acResult = document.getElementById("acResult");

const settingsButton = document.getElementById("settingsButton");
const resetTonsBtn = document.getElementById("resetTonsBtn");
const setStartingTons = document.getElementById("setStartingTons");
const applyStartingTons = document.getElementById("applyStartingTons");
const themeSelector = document.getElementById("themeSelector");

/* Modal Elements */
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
const savePartBtn = document.getElementById("savePartBtn");
const cancelPartBtn = document.getElementById("cancelPartBtn");

/* ============================================================
   LOAD STATE
============================================================ */
function loadState() {
    parts = JSON.parse(localStorage.getItem(PARTS_KEY) || "[]");
    currentTons = Number(localStorage.getItem(TONS_KEY) || 0);
    startingTons = Number(localStorage.getItem(START_TONS_KEY) || 0);

    const theme = localStorage.getItem(THEME_KEY) || "dark";
    if (theme === "light") document.body.classList.add("light");
    themeSelector.value = theme;

    currentTonsInput.value = currentTons;
}
loadState();

/* ============================================================
   SAVE STATE
============================================================ */
function saveState() {
    localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
    localStorage.setItem(TONS_KEY, currentTons);
    localStorage.setItem(START_TONS_KEY, startingTons);
}

/* ============================================================
   NAVIGATION
============================================================ */
navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const screen = btn.dataset.screen;

        screens.forEach(s => s.classList.remove("active"));
        document.getElementById(screen).classList.add("active");

        navButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

/* ============================================================
   DASHBOARD STATUS
============================================================ */
function daysSince(dateStr) {
    if (!dateStr) return Infinity;
    const d = new Date(dateStr + "T00:00:00");
    const now = new Date();
    return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function partStatus(part) {
    const d = daysSince(part.date);
    const t = currentTons - part.lastTons;

    const daysLeft = (part.days || Infinity) - d;
    const tonsLeft = (part.tonInterval || Infinity) - t;

    let status = "ok";
    if (daysLeft <= 0 || tonsLeft <= 0) status = "overdue";
    else if (daysLeft <= 5 || tonsLeft <= 1000) status = "due";

    return { status, daysLeft, tonsLeft, days: d, tonsSince: t };
}

/* ============================================================
   RENDER PARTS
============================================================ */
function renderParts() {
    const filterVal = categoryFilter.value;

    partsList.innerHTML = "";

    let ok = 0, due = 0, over = 0;

    const filtered = parts.filter(p =>
        filterVal === "ALL" ? true : p.category === filterVal
    );

    filtered.forEach((p, index) => {
        const st = partStatus(p);

        if (st.status === "ok") ok++;
        else if (st.status === "due") due++;
        else over++;

        const card = document.createElement("div");
        card.className = "part-card";

        card.innerHTML = `
            <div class="part-header">
                <span>${p.name}</span>
                <span class="status-dot">${
                    st.status === "ok" ? "🟢" :
                    st.status === "due" ? "🟡" :
                    "🔴"
                }</span>
            </div>
            <p><strong>${p.category}</strong> — ${p.section}</p>
            <p>Last: ${p.date} (${st.days} days ago)</p>
            <p>Tons: ${st.tonsSince} / ${p.tonInterval}</p>
            <button onclick="editPart(${index})" class="primary-btn">Edit</button>
            <button onclick="deletePart(${index})" class="secondary-btn">Delete</button>
        `;

        partsList.appendChild(card);
    });

    okCountEl.textContent = ok;
    dueCountEl.textContent = due;
    overCountEl.textContent = over;
    totalPartsEl.textContent = parts.length;

    // Next due
    let soonest = null;
    parts.forEach(p => {
        const st = partStatus(p);
        if (!isFinite(st.daysLeft)) return;
        if (soonest === null || st.daysLeft < soonest.daysLeft) {
            soonest = { name: p.name, daysLeft: st.daysLeft };
        }
    });
    nextDueEl.textContent = soonest ? `${soonest.name} (${soonest.daysLeft} days)` : "—";
}

/* ============================================================
   ADD / EDIT PARTS
============================================================ */
addPartBtn.addEventListener("click", () => openPartModal(null));

function openPartModal(index) {
    editingIndex = index;

    if (index === null) {
        modalTitle.textContent = "Add Part";
        partCategory.value = "";
        partName.value = "";
        partSection.value = "";
        partDate.value = "";
        partDays.value = "";
        partLastTons.value = currentTons;
        partTonInterval.value = "";
        partNotes.value = "";
    } else {
        modalTitle.textContent = "Edit Part";
        const p = parts[index];
        partCategory.value = p.category;
        partName.value = p.name;
        partSection.value = p.section;
        partDate.value = p.date;
        partDays.value = p.days;
        partLastTons.value = p.lastTons;
        partTonInterval.value = p.tonInterval;
        partNotes.value = p.notes;
    }

    partModal.style.display = "flex";
}

cancelPartBtn.addEventListener("click", () => {
    partModal.style.display = "none";
});

savePartBtn.addEventListener("click", () => {
    const obj = {
        category: partCategory.value,
        name: partName.value,
        section: partSection.value,
        date: partDate.value,
        days: Number(partDays.value || 0),
        lastTons: Number(partLastTons.value || 0),
        tonInterval: Number(partTonInterval.value || 0),
        notes: partNotes.value || ""
    };

    if (editingIndex === null) parts.push(obj);
    else parts[editingIndex] = obj;

    saveState();
    partModal.style.display = "none";
    renderParts();
});

function editPart(index) {
    openPartModal(index);
}

function deletePart(index) {
    if (!confirm("Delete this part?")) return;
    parts.splice(index, 1);
    saveState();
    renderParts();
}

/* ============================================================
   INVENTORY
============================================================ */
function renderInventory() {
    const search = inventorySearch.value.toLowerCase();
    const cat = inventoryCategoryFilter.value;

    inventoryList.innerHTML = "";

    INVENTORY_DATA.forEach(item => {
        const matchSearch =
            item.name.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search);

        const matchCat =
            cat === "ALL" ? true : item.category === cat;

        if (!matchSearch || !matchCat) return;

        const div = document.createElement("div");
        div.className = "inventory-item";

        div.innerHTML = `
            <strong>${item.name}</strong><br>
            <small>${item.category}</small><br>
            <button class="primary-btn" onclick="addInventoryToMaintenance('${item.category}','${item.name}')">
                Add to Maintenance
            </button>
        `;

        inventoryList.appendChild(div);
    });
}

function addInventoryToMaintenance(cat, name) {
    openPartModal(null);
    partCategory.value = cat;
    partName.value = name;
}

/* ============================================================
   AC CALCULATOR
============================================================ */
acCalcBtn.addEventListener("click", () => {
    const pct = Number(acPercent.value);
    const tons = Number(acTons.value);

    if (!pct || !tons) {
        acResult.innerHTML = "<p>Please enter valid values.</p>";
        return;
    }

    const gallons = (pct / 100) * tons * 2;
    acResult.innerHTML = `<h3>${gallons.toFixed(2)} gallons needed</h3>`;
});

/* ============================================================
   SETTINGS
============================================================ */
resetTonsBtn.addEventListener("click", () => {
    if (!confirm("Reset tons to 0?")) return;
    currentTons = 0;
    startingTons = 0;
    saveState();
    currentTonsInput.value = 0;
    renderParts();
});

applyStartingTons.addEventListener("click", () => {
    startingTons = Number(setStartingTons.value || 0);
    currentTons = startingTons;
    saveState();
    currentTonsInput.value = currentTons;
    renderParts();
});

themeSelector.addEventListener("change", () => {
    const v = themeSelector.value;
    if (v === "dark") document.body.classList.remove("light");
    else document.body.classList.add("light");
    localStorage.setItem(THEME_KEY, v);
});

/* ============================================================
   TONS UPDATE
============================================================ */
updateTonsBtn.addEventListener("click", () => {
    currentTons = Number(currentTonsInput.value || 0);
    saveState();
    renderParts();
});

/* ============================================================
   INITIALIZE DROPDOWNS
============================================================ */
function populateCategoryDropdowns() {
    const catSet = new Set();
    INVENTORY_DATA.forEach(i => catSet.add(i.category));

    categoryFilter.innerHTML = `<option value="ALL">All</option>`;
    partCategory.innerHTML = "";
    inventoryCategoryFilter.innerHTML = `<option value="ALL">All</option>`;

    catSet.forEach(c => {
        categoryFilter.innerHTML += `<option value="${c}">${c}</option>`;
        partCategory.innerHTML += `<option value="${c}">${c}</option>`;
        inventoryCategoryFilter.innerHTML += `<option value="${c}">${c}</option>`;
    });
}
populateCategoryDropdowns();

/* ============================================================
   INVENTORY LISTENERS
============================================================ */
inventorySearch.addEventListener("input", renderInventory);
inventoryCategoryFilter.addEventListener("change", renderInventory);

/* ============================================================
   CLOSE MODAL ON BACKGROUND CLICK
============================================================ */
window.addEventListener("click", e => {
    if (e.target === partModal) {
        partModal.style.display = "none";
    }
});

/* ============================================================
   INITIAL RENDER
============================================================ */
renderParts();
renderInventory();
