/* ============================================================
   inventory.js
   Helper module for loading default inventory or future imports
   Currently minimal by design — clean, safe, no overwrites.
============================================================ */

/**
 * Default inventory template if needed.
 * Keeping empty so it NEVER overwrites user data.
 * 
 * If later you want automatic import from spreadsheet,
 * we will populate this safely and merge instead of overwrite.
 */
const DEFAULT_INVENTORY = [];

/**
 * Merges defaults ONLY if inventory is empty.
 * This prevents accidental wiping of real user data.
 */
function initializeInventoryIfNeeded() {
  try {
    const stored = JSON.parse(localStorage.getItem("pm_inventory_v9") || "[]");

    if (stored.length === 0 && DEFAULT_INVENTORY.length > 0) {
      localStorage.setItem("pm_inventory_v9", JSON.stringify(DEFAULT_INVENTORY));
      console.log("Inventory initialized from default list.");
    }
  } catch (err) {
    console.warn("Inventory initialization error:", err);
  }
}

// Run immediately on load
initializeInventoryIfNeeded();
