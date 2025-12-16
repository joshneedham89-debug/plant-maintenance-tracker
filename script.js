/* =====================================================
   PHASE 3.2 GOLD – STABILIZED SCRIPT
   Purpose:
   - Re-sync DOM IDs
   - Restore all buttons
   - Restore AC Calculator
   - No feature or storage changes
===================================================== */

/* ---------------- STORAGE KEYS ---------------- */
const PARTS_KEY = "pm_parts";
const TONS_KEY = "pm_tons";
const INVENTORY_KEY = "pm_inventory";
const PROBLEMS_KEY = "pm_problems";

/* ---------------- GLOBAL STATE ---------------- */
let parts = [];
let inventory = [];
let problems = [];
let categories = [];
let currentTons = 0;

/* ---------------- SAFE QUERY HELPER ---------------- */
const $ = (id) => document.getElementById(id);

/* ---------------- LOAD STATE ---------------- */
function loadState() {
  parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || [];
  problems = JSON.parse(localStorage.getItem(PROBLEMS_KEY)) || [];
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;

  categories = Array.isArray(PRELOADED_CATEGORIES)
    ? PRELOADED_CATEGORIES
    : [];

  $("currentTonsInput") && ($("currentTonsInput").value = currentTons);

  renderDashboard();
  renderProblems();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
  localStorage.setItem(TONS_KEY, String(currentTons));
}

/* ---------------- NAV ---------------- */
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $(btn.dataset.screen)?.classList.add("active");
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

/* ---------------- DASHBOARD ---------------- */
function renderDashboard() {
  $("tonsRun") && ($("tonsRun").textContent = currentTons);

  const openCount = problems.filter(p => p.status === "Open").length;
  $("openProblemsCount") && ($("openProblemsCount").textContent = openCount);
}

/* ---------------- TONS ---------------- */
$("updateTonsBtn")?.addEventListener("click", () => {
  currentTons = Number($("currentTonsInput").value) || 0;
  saveState();
  renderDashboard();
});

$("resetTonsBtn")?.addEventListener("click", () => {
  currentTons = 0;
  $("currentTonsInput").value = 0;
  saveState();
  renderDashboard();
});

/* ---------------- PROBLEMS ---------------- */
function renderProblems() {
  const list = $("problemsList");
  if (!list) return;

  if (!problems.length) {
    list.innerHTML = `<div class="part-meta">No problems reported.</div>`;
    return;
  }

  list.innerHTML = problems.map(p => `
    <div class="problem-card">
      <div class="problem-title">${p.title}</div>
      <div class="problem-sub">${p.category} — ${p.location}</div>
      <span class="status-pill status-${p.status.replace(" ", "").toLowerCase()}">${p.status}</span>
    </div>
  `).join("");
}

/* ---------------- REPORT PROBLEM PANEL ---------------- */
function openProblemPanel() {
  $("problemPanelOverlay")?.classList.remove("hidden");
  $("problemPanel")?.classList.add("show");
}

function closeProblemPanel() {
  $("problemPanel")?.classList.remove("show");
  setTimeout(() => $("problemPanelOverlay")?.classList.add("hidden"), 250);
}

$("openProblemPanelBtn")?.addEventListener("click", openProblemPanel);
$("openProblemPanelBtn2")?.addEventListener("click", openProblemPanel);
$("closeProblemPanel")?.addEventListener("click", closeProblemPanel);

$("saveProblemBtn")?.addEventListener("click", () => {
  const title = $("probTitle")?.value.trim();
  const category = $("probCategory")?.value;
  const location = $("probLocation")?.value.trim();

  if (!title || !category || !location) {
    alert("Fill Title, Category, Location");
    return;
  }

  problems.unshift({
    id: "p_" + Date.now(),
    title,
    category,
    location,
    status: "Open",
    createdAt: new Date().toISOString()
  });

  saveState();
  renderProblems();
  renderDashboard();
  closeProblemPanel();
});

/* ---------------- AC CALCULATOR ---------------- */
$("acCalcBtn")?.addEventListener("click", () => {
  const R = Number($("ac_residual").value) / 100;
  const RAP = Number($("ac_rapPct").value) / 100;
  const TGT = Number($("ac_target").value) / 100;
  const TPH = Number($("ac_tph").value);
  const TOTAL = Number($("ac_totalTons").value);

  const pump = TPH * (TGT - (RAP * R));
  const totalAc = TOTAL * (TGT - (RAP * R));

  $("ac_pumpRate").textContent = pump.toFixed(2);
  $("ac_totalAc").textContent = totalAc.toFixed(2);
});

/* ---------------- INIT ---------------- */
loadState();
