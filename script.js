
// Plant Maintenance Tracker - dropdown + dashboard + PWA
const PARTS_KEY = 'pm_parts_final_parts';
const TONS_KEY  = 'pm_parts_final_tons';
const CATS_KEY  = 'pm_parts_final_cats';
const THEME_KEY = 'pm_parts_theme';

const presetCategories = [
  'Cold Feed / Aggregate Handling',
  'Dryer Drum',
  'Baghouse / Dust Collection',
  'Hot Elevator / Screening',
  'Mixer / Pugmill',
  'Slat Conveyor',
  'Asphalt Tank / Pump',
  'Control System / Electrical',
  'General Plant'
];

let parts = [];
let currentTons = 0;
let categories = [];
let activeCategory = 'ALL';
let editingIndex = null;

// DOM refs
const okCountEl = document.getElementById('okCount');
const dueCountEl = document.getElementById('dueCount');
const overCountEl = document.getElementById('overCount');
const totalPartsEl = document.getElementById('totalParts');
const nextDueEl = document.getElementById('nextDue');
const tonsRunEl = document.getElementById('tonsRun');

const currentTonsInput = document.getElementById('currentTons');
const updateTonsBtn = document.getElementById('updateTonsBtn');
const addTonsBtn = document.getElementById('addTonsBtn');
const addTonsModal = document.getElementById('addTonsModal');
const addTonsAmount = document.getElementById('addTonsAmount');
const confirmAddTonsBtn = document.getElementById('confirmAddTonsBtn');
const cancelAddTonsBtn = document.getElementById('cancelAddTonsBtn');


const partsList = document.getElementById('partsList');
const categoryFilter = document.getElementById('categoryFilter');
const addCategoryBtn = document.getElementById('addCategoryBtn');

const addPartBtn = document.getElementById('addPartBtn');
const viewPartsBtn = document.getElementById('viewPartsBtn');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');

const partModal = document.getElementById('partModal');
const modalTitle = document.getElementById('modalTitle');
const partCategory = document.getElementById('partCategory');
const partName = document.getElementById('partName');
const partSection = document.getElementById('partSection');
const partDate = document.getElementById('partDate');
const partDays = document.getElementById('partDays');
const partLastTons = document.getElementById('partLastTons');
const partTonInterval = document.getElementById('partTonInterval');
const partNotes = document.getElementById('partNotes');
const savePartBtn = document.getElementById('savePartBtn');
const cancelPartBtn = document.getElementById('cancelPartBtn');
const moreToggle = document.getElementById('moreToggle');
const moreOptions = document.getElementById('moreOptions');

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const themeToggle = document.getElementById('themeToggle');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');

function loadState() {
  try {
    parts = JSON.parse(localStorage.getItem(PARTS_KEY)) || [];
  } catch {
    parts = [];
  }
  currentTons = Number(localStorage.getItem(TONS_KEY)) || 0;
  try {
    categories = JSON.parse(localStorage.getItem(CATS_KEY));
  } catch {
    categories = null;
  }
  if (!Array.isArray(categories) || categories.length === 0) {
    categories = presetCategories.slice();
  }

  const theme = localStorage.getItem(THEME_KEY);
  if (theme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.checked = true;
  }

  currentTonsInput.value = currentTons || '';

  populateCategoryDropdowns();
  renderAll();
}

function saveState() {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
  localStorage.setItem(TONS_KEY, String(currentTons));
  localStorage.setItem(CATS_KEY, JSON.stringify(categories));
}

function populateCategoryDropdowns() {
  // filter dropdown
  categoryFilter.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = 'ALL';
  allOpt.textContent = 'All';
  categoryFilter.appendChild(allOpt);

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  if (!activeCategory) activeCategory = 'ALL';
  categoryFilter.value = activeCategory;

  // modal category dropdown
  partCategory.innerHTML = '';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    partCategory.appendChild(opt);
  });
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr + 'T00:00:00');
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

  let status = 'ok';
  if (daysLeft < 0 || tonsLeft < 0) {
    status = 'overdue';
  } else {
    const daysThresh = intervalDays ? Math.max(3, Math.round(intervalDays * 0.2)) : 0;
    const tonsThresh = tonInterval ? Math.max(100, Math.round(tonInterval * 0.2)) : 0;
    if ((intervalDays && daysLeft <= daysThresh) ||
        (tonInterval && tonsLeft <= tonsThresh)) {
      status = 'due';
    }
  }

  return { status, days, daysLeft, tonsSince, tonsLeft };
}

function renderParts() {
  partsList.innerHTML = '';
  let ok = 0, due = 0, over = 0;

  const filtered = parts.filter(p => activeCategory === 'ALL' ? true : p.category === activeCategory);

  filtered.forEach((p, index) => {
    const st = calcStatus(p);
    if (st.status === 'ok') ok++;
    else if (st.status === 'due') due++;
    else over++;

    const card = document.createElement('div');
    card.className = 'part-card';

    const left = document.createElement('div');
    left.className = 'part-left';

    let nextText = 'n/a';
    if (st.status === 'overdue') {
      nextText = 'OVERDUE';
    } else if (st.daysLeft !== Infinity) {
      nextText = st.daysLeft + ' days left';
    }

    left.innerHTML =
      '<div class="part-name">' + (p.name || '') + '</div>' +
      '<div class="part-meta">' + (p.category || '') + ' · ' + (p.section || '') + '</div>' +
      '<div class="part-meta">Last: ' + (p.date || '-') + ' (' + (isFinite(st.days) ? st.days : '-') + ' days ago)</div>' +
      '<div class="part-meta">Next: ' + nextText + '</div>' +
      '<div class="part-meta">Tons since: ' + (isFinite(st.tonsSince) ? st.tonsSince : '-') +
      (p.tonInterval ? (' / ' + p.tonInterval + ' interval') : '') + '</div>' +
      '<div class="part-meta">' + (p.notes || '') + '</div>';

    const actions = document.createElement('div');
    actions.className = 'part-actions';
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => openEditPart(index);
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Del';
    delBtn.onclick = () => deletePart(index);
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    // Color strip
    const strip = document.createElement('div');
    if (st.status === 'ok') strip.style.borderLeft = '6px solid #00C853';
    else if (st.status === 'due') strip.style.borderLeft = '6px solid #FFD600';
    else strip.style.borderLeft = '6px solid #FF5252';
    strip.style.paddingLeft = '10px';

    card.appendChild(left);
    card.appendChild(actions);
    card.style.display = 'flex';
    card.style.justifyContent = 'space-between';
    card.style.alignItems = 'center';
    card.insertBefore(strip, left);

    partsList.appendChild(card);
  });

  okCountEl.textContent = '🟢 OK: ' + ok;
  dueCountEl.textContent = '🟡 Due: ' + due;
  overCountEl.textContent = '🔴 Overdue: ' + over;
}

function computeNextDue() {
  if (!parts.length) return null;
  let best = null;
  parts.forEach(p => {
    const st = calcStatus(p);
    let score = st.daysLeft;
    if (!isFinite(score)) return;
    if (best === null || score < best.score) {
      best = { name: p.name, score };
    }
  });
  return best;
}

function renderSummary() {
  totalPartsEl.textContent = parts.length;
  tonsRunEl.textContent = currentTons || 0;
  const n = computeNextDue();
  if (!n) nextDueEl.textContent = '—';
  else if (n.score < 0) nextDueEl.textContent = n.name + ' (OVERDUE)';
  else nextDueEl.textContent = n.name + ' (in ' + n.score + ' days)';
}

function renderAll() {
  renderParts();
  renderSummary();
}

function openAddPart() {
  editingIndex = null;
  modalTitle.textContent = 'Add Part';
  // default category = active filter or first
  if (activeCategory !== 'ALL' && categories.includes(activeCategory)) {
    partCategory.value = activeCategory;
  } else {
    partCategory.value = categories[0] || '';
  }
  partName.value = '';
  partSection.value = '';
  const today = new Date();
  partDate.value = today.toISOString().slice(0, 10);
  partDays.value = '30';
  partLastTons.value = String(currentTons || 0);
  partTonInterval.value = '10000';
  partNotes.value = '';
  moreOptions.style.display = 'none';
  partModal.style.display = 'flex';
}

function openEditPart(index) {
  editingIndex = index;
  const p = parts[index];
  modalTitle.textContent = 'Edit Part';
  partCategory.value = p.category || (categories[0] || '');
  partName.value = p.name || '';
  partSection.value = p.section || '';
  partDate.value = p.date || '';
  partDays.value = p.days || '';
  partLastTons.value = p.lastTons || '';
  partTonInterval.value = p.tonInterval || '';
  partNotes.value = p.notes || '';
  moreOptions.style.display = 'block';
  partModal.style.display = 'flex';
}

function closePartModal() {
  partModal.style.display = 'none';
}

function savePart() {
  const part = {
    category: partCategory.value || 'General Plant',
    name: partName.value.trim(),
    section: partSection.value.trim(),
    date: partDate.value,
    days: Number(partDays.value) || 0,
    lastTons: Number(partLastTons.value) || 0,
    tonInterval: Number(partTonInterval.value) || 0,
    notes: partNotes.value.trim()
  };
  if (!part.name) {
    alert('Please enter a part name');
    return;
  }
  if (editingIndex === null) {
    parts.unshift(part);
  } else {
    parts[editingIndex] = part;
  }
  saveState();
  closePartModal();
  renderAll();
}

function deletePart(index) {
  if (!confirm('Delete this part?')) return;
  parts.splice(index, 1);
  saveState();
  renderAll();
}

function addCategory() {
  const name = prompt('New category name:');
  if (!name) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  if (!categories.includes(trimmed)) {
    categories.push(trimmed);
    saveState();
    populateCategoryDropdowns();
  }
}


function openAddTonsModal() {
  addTonsAmount.value = '';
  addTonsModal.style.display = 'flex';
}
function closeAddTonsModal() {
  addTonsModal.style.display = 'none';
}
function confirmAddTons() {
  const amount = Number(addTonsAmount.value);
  if (isNaN(amount) || amount === 0) {
    alert('Enter a valid tons amount');
    return;
  }
  currentTons = (Number(currentTons) || 0) + amount;
  currentTonsInput.value = currentTons;
  saveState();
  renderAll();
  closeAddTonsModal();
}

function updateTons() {
  const v = Number(currentTonsInput.value);
  if (isNaN(v)) return;
  currentTons = v;
  saveState();
  renderAll();
}

function exportData() {
  const data = { parts, currentTons, categories };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plant_maintenance_export.json';
  a.click();
  URL.revokeObjectURL(url);
}

function resetAll() {
  if (!confirm('Reset ALL data?')) return;
  parts = [];
  currentTons = 0;
  categories = presetCategories.slice();
  activeCategory = 'ALL';
  currentTonsInput.value = '';
  saveState();
  populateCategoryDropdowns();
  renderAll();
}

// Settings / theme
function openSettings() {
  settingsModal.style.display = 'flex';
}
function closeSettings() {
  settingsModal.style.display = 'none';
}
function toggleTheme(e) {
  const checked = e.target.checked;
  if (checked) {
    document.body.classList.add('light-mode');
    localStorage.setItem(THEME_KEY, 'light');
  } else {
    document.body.classList.remove('light-mode');
    localStorage.setItem(THEME_KEY, 'dark');
  }
}

// Events
updateTonsBtn.addEventListener('click', updateTons);
addTonsBtn.addEventListener('click', openAddTonsModal);
confirmAddTonsBtn.addEventListener('click', confirmAddTons);
cancelAddTonsBtn.addEventListener('click', closeAddTonsModal);
addPartBtn.addEventListener('click', openAddPart);
viewPartsBtn.addEventListener('click', renderAll);
categoryFilter.addEventListener('change', (e) => {
  activeCategory = e.target.value || 'ALL';
  renderAll();
});
addCategoryBtn.addEventListener('click', addCategory);
exportBtn.addEventListener('click', exportData);
resetBtn.addEventListener('click', resetAll);
savePartBtn.addEventListener('click', savePart);
cancelPartBtn.addEventListener('click', closePartModal);
moreToggle.addEventListener('click', () => {
  moreOptions.style.display = (moreOptions.style.display === 'none' || !moreOptions.style.display)
    ? 'block' : 'none';
});
settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
themeToggle.addEventListener('change', toggleTheme);

window.addEventListener('click', (e) => {
  if (e.target === partModal) closePartModal();
  if (e.target === settingsModal) closeSettings();
  if (e.target === addTonsModal) closeAddTonsModal();
});

// init
loadState();
