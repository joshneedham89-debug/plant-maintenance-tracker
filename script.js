// Plant Maintenance Tracker – Option C
// Tons System + Categories + Spare Parts + Preloaded Data + Cleaner UI

const PARTS_KEY = "pm_parts_data";
const TONS_KEY = "pm_current_tons";
const CATS_KEY = "pm_categories";
const THEME_KEY = "pm_theme_mode";

// Runtime state
let parts = [];
let categories = [];
let currentTons = 0;
let activeCategory = "ALL";
let editingIndex = null;

// DOM references
const okCountEl = document.getElementById("okCount");
const dueCountEl = document.getElementById("dueCount");
const overCountEl = document.getElementById("overCount");

const currentTonsDisplay = document.getElementById("currentTonsDisplay");
const addTonsBtn = document.getElementById("addTonsBtn");

const totalPartsEl = document.getElementById("totalParts");
const nextDueEl = document.getElementById("nextDue");
const tonsRunEl = document.getElementById("tonsRun");

const partsList = document.getElementById("partsList");
const categoryFilter = document.getElementById("categoryFilter");

const addPartBtn = document.getElementById("addPartBtn");
const viewPartsBtn = document.getElementById("viewPartsBtn");
const addCategoryBtn = document.getElementById("addCategoryBtn");

const exportBtn = document.getElementById("exportBtn");
const resetBtn = document.getElementById("resetBtn");

// Modals
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
const spareParts = document.getElementById("spareParts");

const savePartBtn = document.getElementById("savePartBtn");
const cancelPartBtn = document.getElementById("cancelPartBtn");

const moreToggle = document.getElementById("moreToggle");
const moreOptions = document.getElementById("moreOptions");

// Settings modal
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const themeToggle = document.getElementById("themeToggle");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");

// ---------------------------
// LOAD & SAVE
// ---------------------------
function loadState() {
    // Preloaded categories from data.js
    categories = [...PRELOADED_CATEGORIES];

    // Preloaded parts loaded from data.js
    parts = [...PRELOADED_PARTS];

    // Load tons
    currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

    // Load theme
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === "light") {
        document.body.classList.add("light-mode");
        themeToggle.checked = true;
    }

    currentTonsDisplay.textContent = currentTons.toLocaleString();
    populateCategoryDropdowns();
    renderAll();
}

function saveState() {
    localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
    localStorage.setItem(TONS_KEY, String(currentTons));
}
// ---------------------------
// CATEGORY DROPDOWNS
// ---------------------------
function populateCategoryDropdowns() {
    categoryFilter.innerHTML = "";

    const allOpt = document.createElement("option");
    allOpt.value = "ALL";
    allOpt.textContent = "All";
    categoryFilter.appendChild(allOpt);

    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        categoryFilter.appendChild(opt);
    });

    if (!activeCategory) activeCategory = "ALL";
    categoryFilter.value = activeCategory;

    // Modal dropdown
    partCategory.innerHTML = "";
    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        partCategory.appendChild(opt);
    });
}

// ---------------------------
// STATUS CALCULATION
// ---------------------------
function daysSince(dateStr) {
    if (!dateStr) return Infinity;
    const d = new Date(dateStr + "T00:00:00");
    const now = new Date();
    return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function calcStatus(part) {
    const days = daysSince(part.date);
    const intervalDays = Number(part.days) || 0;

    const tonsSince = Number(currentTons) - Number(part.lastTons || 0);
    const tonInterval = Number(part.tonInterval) || 0;

    const daysLeft = intervalDays ? intervalDays - days : Infinity;
    const tonsLeft = tonInterval ? tonInterval - tonsSince : Infinity;

    let status = "ok";

    if (daysLeft < 0 || tonsLeft < 0) {
        status = "overdue";
    } else {
        const daysThresh = intervalDays ? Math.max(3, Math.round(intervalDays * 0.2)) : 0;
        const tonsThresh = tonInterval ? Math.max(100, Math.round(tonInterval * 0.2)) : 0;

        if ((intervalDays && daysLeft <= daysThresh) ||
            (tonInterval && tonsLeft <= tonsThresh)) {
            status = "due";
        }
    }

    return { status, days, daysLeft, tonsSince, tonsLeft };
}

// ---------------------------
// RENDER PARTS LIST
// ---------------------------
function renderParts() {
    partsList.innerHTML = "";
    let ok = 0, due = 0, over = 0;

    const filtered = parts.filter(p =>
        activeCategory === "ALL" ? true : p.category === activeCategory
    );

    filtered.forEach((p, index) => {
        const st = calcStatus(p);

        if (st.status === "ok") ok++;
        else if (st.status === "due") due++;
        else over++;

        const card = document.createElement("div");
        card.className = "part-card";

        const left = document.createElement("div");
        left.className = "part-left";

        // Next due text
        let nextText = "n/a";
        if (st.status === "overdue") nextText = "OVERDUE";
        else if (st.daysLeft !== Infinity) nextText = st.daysLeft + " days left";

        left.innerHTML = `
            <div class="part-name">${p.name}</div>
            <div class="part-meta">${p.category} · ${p.section}</div>
            <div class="part-meta">Last: ${p.date || "-"} (${isFinite(st.days) ? st.days : "-"} days ago)</div>
            <div class="part-meta">Next: ${nextText}</div>
            <div class="part-meta">Tons since: ${isFinite(st.tonsSince) ? st.tonsSince : "-"}
                ${p.tonInterval ? " / " + p.tonInterval + " interval" : ""}
            </div>
            <div class="part-meta">${p.notes || ""}</div>
            <div class="part-meta"><strong>Spare Parts:</strong> ${p.spareParts || ""}</div>
        `;

        const actions = document.createElement("div");
        actions.className = "part-actions";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => openEditPart(index);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Del";
        delBtn.onclick = () => deletePart(index);

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        // Color strip
        card.style.borderLeft =
            st.status === "ok" ? "6px solid #00C853" :
            st.status === "due" ? "6px solid #FFD600" :
            "6px solid #FF5252";

        card.appendChild(left);
        card.appendChild(actions);
        partsList.appendChild(card);
    });

    okCountEl.textContent = "🟢 OK: " + ok;
    dueCountEl.textContent = "🟡 Due: " + due;
    overCountEl.textContent = "🔴 Overdue: " + over;
}

// ---------------------------
// SUMMARY UPDATE
// ---------------------------
function computeNextDue() {
    if (!parts.length) return null;
    let best = null;

    parts.forEach(p => {
        const st = calcStatus(p);
        const score = st.daysLeft;

        if (!isFinite(score)) return;
        if (best === null || score < best.score) {
            best = { name: p.name, score };
        }
    });

    return best;
}

function renderSummary() {
    totalPartsEl.textContent = parts.length;
    tonsRunEl.textContent = currentTons.toLocaleString();

    const n = computeNextDue();
    if (!n) nextDueEl.textContent = "—";
    else if (n.score < 0) nextDueEl.textContent = `${n.name} (OVERDUE)`;
    else nextDueEl.textContent = `${n.name} (in ${n.score} days)`;
}

function renderAll() {
    renderParts();
    renderSummary();
}
// ---------------------------
// ADD / EDIT PART
// ---------------------------
function openAddPart() {
    editingIndex = null;
    modalTitle.textContent = "Add Part";

    // Default category
    partCategory.value = activeCategory !== "ALL" ? activeCategory : categories[0];

    partName.value = "";
    partSection.value = "";
    partDate.value = new Date().toISOString().slice(0, 10);
    partDays.value = "30";
    partLastTons.value = String(currentTons);
    partTonInterval.value = "10000";
    partNotes.value = "";
    spareParts.value = "";

    moreOptions.style.display = "none";
    partModal.style.display = "flex";
}

function openEditPart(index) {
    editingIndex = index;
    const p = parts[index];

    modalTitle.textContent = "Edit Part";

    partCategory.value = p.category;
    partName.value = p.name;
    partSection.value = p.section;
    partDate.value = p.date;
    partDays.value = p.days;
    partLastTons.value = p.lastTons;
    partTonInterval.value = p.tonInterval;
    partNotes.value = p.notes || "";
    spareParts.value = p.spareParts || "";

    moreOptions.style.display = "block";
    partModal.style.display = "flex";
}

function closePartModal() {
    partModal.style.display = "none";
}

function savePart() {
    const part = {
        category: partCategory.value,
        name: partName.value.trim(),
        section: partSection.value.trim(),
        date: partDate.value,
        days: Number(partDays.value),
        lastTons: Number(partLastTons.value),
        tonInterval: Number(partTonInterval.value),
        notes: partNotes.value.trim(),
        spareParts: spareParts.value.trim()
    };

    if (!part.name) {
        alert("Please enter a part name");
        return;
    }

    if (editingIndex === null) parts.unshift(part);
    else parts[editingIndex] = part;

    saveState();
    closePartModal();
    renderAll();
}

function deletePart(index) {
    if (!confirm("Delete this part?")) return;
    parts.splice(index, 1);
    saveState();
    renderAll();
}

// ---------------------------
// ADD CATEGORY
// ---------------------------
function addCategory() {
    const name = prompt("New category name:");
    if (!name) return;

    const trimmed = name.trim();
    if (!trimmed) return;

    if (!categories.includes(trimmed)) {
        categories.push(trimmed);
        saveState();
        populateCategoryDropdowns();
    }
}

// ---------------------------
// TONS SYSTEM
// ---------------------------
const currentTonsInput = document.getElementById("currentTonsInput");
const addTonsInput = document.getElementById("addTonsInput");

currentTonsInput.value = currentTons;

currentTonsInput.addEventListener("change", () => {
    currentTons = Number(currentTonsInput.value) || 0;
    saveState();
    renderAll();
});

addTonsBtn.addEventListener("click", () => {
    const addValue = Number(addTonsInput.value) || 0;
    currentTons += addValue;
    currentTonsInput.value = currentTons;
    saveState();
    renderAll();
});

// ---------------------------
// EXPORT / RESET
// ---------------------------
function exportData() {
    const data = { parts, currentTons, categories };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "plant_maintenance_export.json";
    a.click();
}

function resetAll() {
    if (!confirm("Reset ALL data?")) return;

    parts = [...PRELOADED_PARTS];
    categories = [...PRELOADED_CATEGORIES];
    currentTons = 0;

    saveState();
    renderAll();
}

// ---------------------------
// SETTINGS
// ---------------------------
function openSettings() {
    settingsModal.style.display = "flex";
}

function closeSettings() {
    settingsModal.style.display = "none";
}

function toggleTheme(e) {
    const checked = e.target.checked;
    if (checked) {
        document.body.classList.add("light-mode");
        localStorage.setItem(THEME_KEY, "light");
    } else {
        document.body.classList.remove("light-mode");
        localStorage.setItem(THEME_KEY, "dark");
    }
}

// ---------------------------
// EVENT LISTENERS
// ---------------------------
addPartBtn.addEventListener("click", openAddPart);
viewPartsBtn.addEventListener("click", renderAll);
addCategoryBtn.addEventListener("click", addCategory);

exportBtn.addEventListener("click", exportData);
resetBtn.addEventListener("click", resetAll);

savePartBtn.addEventListener("click", savePart);
cancelPartBtn.addEventListener("click", closePartModal);

moreToggle.addEventListener("click", () => {
    moreOptions.style.display =
        (moreOptions.style.display === "none" || !moreOptions.style.display)
            ? "block"
            : "none";
});

settingsBtn.addEventListener("click", openSettings);
closeSettingsBtn.addEventListener("click", closeSettings);
themeToggle.addEventListener("change", toggleTheme);

window.addEventListener("click", (e) => {
    if (e.target === partModal) closePartModal();
    if (e.target === settingsModal) closeSettings();
});

// ---------------------------
// INITIALIZE
// ---------------------------
loadState();
