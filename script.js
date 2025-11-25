// Basic UI shell: tab navigation + theme toggle.
// Maintenance + Inventory logic will plug into this later.

const TAB_IDS = ['dashboard', 'maintenance', 'inventory', 'settings'];

// DOM refs
let navButtons;
let themeToggleBtn;
let themeToggleCheckbox;

function setActiveTab(tabId) {
  // Tabs
  TAB_IDS.forEach(id => {
    const sec = document.getElementById('tab-' + id);
    if (sec) sec.classList.toggle('active', id === tabId);
  });

  // Bottom nav buttons
  if (navButtons) {
    navButtons.forEach(btn => {
      const t = btn.getAttribute('data-tab');
      btn.classList.toggle('active', t === tabId);
    });
  }
}

function applyTheme(mode) {
  const body = document.body;
  if (mode === 'light') {
    body.classList.add('light-mode');
    if (themeToggleCheckbox) themeToggleCheckbox.checked = true;
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
  } else {
    body.classList.remove('light-mode');
    if (themeToggleCheckbox) themeToggleCheckbox.checked = false;
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
  }
  localStorage.setItem('pm_theme', mode);
}

function initTheme() {
  const saved = localStorage.getItem('pm_theme');
  const mode = saved === 'light' ? 'light' : 'dark';
  applyTheme(mode);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const now = document.body.classList.contains('light-mode') ? 'dark' : 'light';
      applyTheme(now);
    });
  }

  if (themeToggleCheckbox) {
    themeToggleCheckbox.addEventListener('change', (e) => {
      applyTheme(e.target.checked ? 'light' : 'dark');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Grabs
  navButtons = Array.from(document.querySelectorAll('.nav-btn'));
  themeToggleBtn = document.getElementById('themeToggleBtn');
  themeToggleCheckbox = document.getElementById('themeToggleCheckbox');

  // Nav button events
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab') || 'dashboard';
      setActiveTab(tab);
    });
  });

  // Default tab
  setActiveTab('dashboard');

  // Theme
  initTheme();

  // Placeholder: we’ll wire these up later
  const addPartBtn = document.getElementById('addPartBtn');
  if (addPartBtn) {
    addPartBtn.addEventListener('click', () => {
      alert('Add Part form will go here in the next step.');
    });
  }

  const addInvBtn = document.getElementById('addInventoryItemBtn');
  if (addInvBtn) {
    addInvBtn.addEventListener('click', () => {
      alert('Add Inventory Item form will go here in the next step.');
    });
  }
});
