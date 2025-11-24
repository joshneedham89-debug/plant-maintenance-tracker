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
