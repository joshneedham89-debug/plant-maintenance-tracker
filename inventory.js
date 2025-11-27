/* ============================================================
   INVENTORY DATA (Offline Reference List)
   - These items do NOT affect maintenance tracking
   - They ONLY show in the Inventory screen
============================================================ */

const inventoryData = [
  {
    category: "Cold Feed",
    parts: [
      { name: "Cold Feed Bin 1 Belt", section: "Cold Feed" },
      { name: "Cold Feed Bin 2 Belt", section: "Cold Feed" },
      { name: "Cold Feed Drive Motor", section: "Cold Feed" }
    ]
  },
  {
    category: "Dryer",
    parts: [
      { name: "Dryer Drum Chain", section: "Dryer" },
      { name: "Dryer Drive Motor", section: "Drive Station" },
      { name: "Burner Nozzle", section: "Burner Assembly" }
    ]
  },
  {
    category: "Baghouse",
    parts: [
      { name: "Baghouse Bags", section: "Baghouse" },
      { name: "Baghouse Fan Belt", section: "Baghouse Fan" },
      { name: "Baghouse Screw Auger", section: "Dust System" }
    ]
  },
  {
    category: "Slat Conveyor",
    parts: [
      { name: "Slat Chain", section: "Main Conveyor" },
      { name: "Slat Floor Plates", section: "Main Conveyor" },
      { name: "Slat Bearings", section: "Main Conveyor" }
    ]
  },
  {
    category: "Screens",
    parts: [
      { name: "Screen Mesh 3/4", section: "Vibrating Screen" },
      { name: "Screen Mesh 1/2", section: "Vibrating Screen" },
      { name: "Screen Bearings", section: "Screen Drive" }
    ]
  },
  {
    category: "Drum",
    parts: [
      { name: "Drum Flights", section: "Drum" },
      { name: "Drum Trunnion Rollers", section: "Support Frame" },
      { name: "Drum Ring Gear", section: "Drive" }
    ]
  },
  {
    category: "General Plant",
    parts: [
      { name: "Plant Air Filter", section: "Compressor" },
      { name: "Oil Filter", section: "Hydraulic" },
      { name: "Grease Tubes", section: "Maintenance" }
    ]
  }
];

/* ============================================================
   RENDER INVENTORY SCREEN
============================================================ */

function renderInventory() {
  const list = document.getElementById("inventoryList");
  list.innerHTML = "";

  inventoryData.forEach(group => {
    // Category Header
    const header = document.createElement("h3");
    header.textContent = group.category;
    header.style.marginTop = "20px";
    list.appendChild(header);

    // List each item
    group.parts.forEach(item => {
      const div = document.createElement("div");
      div.className = "inventory-item";
      div.innerHTML = `
        <strong>${item.name}</strong><br>
        <span style="color: var(--muted); font-size: 13px;">
          ${item.section}
        </span>
      `;
      list.appendChild(div);
    });
  });
}

// Initialize inventory when needed
document.addEventListener("DOMContentLoaded", renderInventory);
