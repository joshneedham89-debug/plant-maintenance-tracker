/* ---------------------------------------------------
   CATEGORY LIST (your full set)
   + Added: Belts, Gearboxes, Parts
--------------------------------------------------- */
const PRELOADED_CATEGORIES = [
  "Cold Feed",
  "Conveyor",
  "Dryer",
  "Baghouse",
  "Electrical",
  "Slat Conveyor",
  "Tank Farm",
  "Dust System",
  "Mixer",
  "Screens",
  "Controls",
  "Asphalt System",
  "Pumps",
  "Virgin – Other",
  "Drag Conveyor",
  "Collar",
  "Recycle Conveyor",
  "Bin System",
  "Flights",
  "Bearings",
  "Reducers",
  "Motors",
  "Other",

  // ✅ Added for your master spare tabs
  "Belts",
  "Gearboxes",
  "Parts"
];

/* ---------------------------------------------------
   INVENTORY LIST (MERGED MASTER)
   - Includes: Plant-area tabs + Motors/Gearboxes/Belts/Parts tabs
   - Deduped + normalized
   - Vendor/price/status stored in notes (Phase 3.2 safe)
--------------------------------------------------- */
const PRELOADED_INVENTORY = [
  /* ---------------------------
     KEEP ORIGINAL BASE ITEMS
  ----------------------------*/
  {
    category: "Conveyor",
    part: "Tail Pulley",
    location: "Cold Feed",
    qty: 2,
    notes: "OEM new"
  },
  {
    category: "Dryer",
    part: "Burner Nozzle",
    location: "Burner House",
    qty: 1,
    notes: ""
  },
  {
    category: "Bearings",
    part: "Pillow Block Bearing",
    location: "Slat Conveyor",
    qty: 4,
    notes: "Standard replacement"
  },
  {
    category: "Electrical",
    part: "Limit Switch",
    location: "Drag Conveyor",
    qty: 6,
    notes: "For emergency stop circuit"
  },
  {
    category: "Motors",
    part: "Motor – 10 HP",
    location: "Motor Spares",
    qty: 1,
    notes: "Rebuilt spare (from original list)"
  },
  {
    category: "Flights",
    part: "Dryer Flight Set",
    location: "Dryer",
    qty: 1,
    notes: "Full set for drum"
  },
  {
    category: "Pumps",
    part: "AC Pump Seal Kit",
    location: "Asphalt Tank 1",
    qty: 3,
    notes: ""
  },
  {
    category: "Bin System",
    part: "Bin Vibrator",
    location: "Cold Feed Bin #2",
    qty: 1,
    notes: ""
  },
  {
    category: "Controls",
    part: "HMI Touchscreen",
    location: "Control House",
    qty: 1,
    notes: "Spare"
  },
  {
    category: "Other",
    part: "General Hardware Assortment",
    location: "Maintenance Shop",
    qty: 1,
    notes: "Nuts, bolts, fasteners"
  },

  /* ---------------------------
     PARTS (MASTER + PLANT)
  ----------------------------*/
  {
    category: "Parts",
    part: "Tach Astec PN 077575",
    location: "Virgin Incline to Drum",
    qty: 0,
    notes: "Astec · $255.03 · Status: Ordered"
  },
  {
    category: "Parts",
    part: "Tach Astec PN 077576",
    location: "Plant Wide",
    qty: 2,
    notes: "Used: Virgin bins / Recycle bin / Incline to drum / AC meter · Astec · $229.12 · Status: Ordered"
  },
  {
    category: "Belts",
    part: 'Virgin Feeder Bin Belt – 22" × 2-ply × 24" wide',
    location: "Virgin Bins 1–8",
    qty: 2,
    notes: "Davis Industrial · $1,574.75"
  },
  {
    category: "Parts",
    part: 'Baghouse Filter Bags – 4 5/8" Dia × 120 1/2" Long',
    location: "Baghouse",
    qty: 120,
    notes: "900 total bags · $21.60/bag · Vendor: Albarrie"
  },

  // Silos/Drag pneumatics
  {
    category: "Parts",
    part: "Clam Cylinder",
    location: "Silos",
    qty: 2,
    notes: "PN 081812 · Cylinder Air MIP 1.5×29 · 1-3/4R"
  },
  {
    category: "Parts",
    part: "Batcher Cylinder",
    location: "Silos",
    qty: 2,
    notes: "PN 045403 · Cylinder Air MIP 1×16 · 1-3/8R"
  },

  /* ---------------------------
     SCREENS / DECK ITEMS
  ----------------------------*/
  {
    category: "Screens",
    part: 'Top Deck Screen – 46.5" × 48"',
    location: "Virgin Screen Deck",
    qty: 3,
    notes: '7/8" × 1" holes (3 pcs)'
  },
  {
    category: "Screens",
    part: 'Bottom Deck Screen – 46.5" × 48"',
    location: "Virgin Screen Deck",
    qty: 3,
    notes: '1" × 4" slots (3 pcs)'
  },
  {
    category: "Screens",
    part: 'Recycle Screen Deck Screen – 46.5" × 48"',
    location: "Recycle Screen Deck",
    qty: 2,
    notes: '1.25" × 1.25" holes (2 pcs)'
  },

  /* ---------------------------
     MOTORS (MASTER SPARES)
  ----------------------------*/
  {
    category: "Motors",
    part: "Motor – 0.75 HP",
    location: "Motor Spares",
    qty: 1,
    notes: "3450 RPM · Frame 53C · Use: Hot Oil Burner Blower"
  },
  {
    category: "Motors",
    part: "Motor – 3 HP",
    location: "Motor Spares",
    qty: 1,
    notes: "1755 RPM · Frame 182TC · Use: Virgin Feeder Bins"
  },
  {
    category: "Motors",
    part: "Motor – 5 HP",
    location: "Motor Spares",
    qty: 1,
    notes: "1750 RPM · Frame 184T · Use: Incline belt to crusher / RAP SD · ESR (Toshiba) · $369.14 · Received"
  },
  {
    category: "Motors",
    part: "Motor – 7.5 HP (1755 RPM)",
    location: "Motor Spares",
    qty: 1,
    notes: "1755 RPM · Frame 213/5T · Use: RAP main gathering / RAP incline / Virgin SD"
  },
  {
    category: "Motors",
    part: "Motor – 7.5 HP (3500 RPM)",
    location: "Motor Spares",
    qty: 1,
    notes: "3500 RPM · Frame 213T · Use: Hot Oil Booster Pump · ESR (Toshiba) · $480.02 · Received"
  },
  {
    category: "Motors",
    part: "Motor – 10 HP",
    location: "Motor Spares",
    qty: 1,
    notes: "1760 RPM · Frame 215TC · Use: RAP Feeder Bin"
  },
  {
    category: "Motors",
    part: "Motor – 15 HP",
    location: "Motor Spares",
    qty: 2,
    notes: "1760 RPM · Frame 254T · Use: Virgin incline to drum / Baghouse dust auger"
  },
  {
    category: "Motors",
    part: "Motor – 20 HP",
    location: "Motor Spares",
    qty: 1,
    notes: "1770 RPM · Frame 256T · Use: Virgin main gathering / Blue Smoke · ESR (Toshiba) · $973.43 · Received"
  },
  {
    category: "Motors",
    part: "Motor – 25 HP",
    location: "Motor Spares",
    qty: 2,
    notes: "1775 RPM · Frame 284T · Use: Traverse 1 & 3"
  },
  {
    category: "Motors",
    part: "Motor – 75 HP",
    location: "Motor Spares",
    qty: 1,
    notes: "1775 RPM · Frame 365T · Use: Drag Slat"
  },
  {
    category: "Motors",
    part: "Motor – 125 HP",
    location: "Motor Spares",
    qty: 2,
    notes: "1780 RPM · Frame 404/5T · Use: Exhaust Fan"
  },
  {
    category: "Motors",
    part: "Motor – 200 HP",
    location: "Motor Spares",
    qty: 1,
    notes: "1780 RPM · Frame 444/5T · Use: Drum Motor · Astec · $11,244.73 · Received"
  },

  /* ---------------------------
     GEARBOXES (MASTER SPARES)
  ----------------------------*/
  {
    category: "Gearboxes",
    part: "Gearbox – Dodge PN 352065",
    location: "Gearbox Spares",
    qty: 1,
    notes: "1974 RPM · 14:1 · Use: Incline Dust Auger · Motion · $2,162.34 · Received"
  },
  {
    category: "Gearboxes",
    part: "Gearbox – Planetgear PN TZA00433",
    location: "Gearbox Spares",
    qty: 0,
    notes: "1750 RPM · 43.78 ratio · Use: Drum · Astec · $7,006.38 · On hand = 0"
  },
  {
    category: "Gearboxes",
    part: "Gearbox – Dodge PN TXK025",
    location: "Gearbox Spares",
    qty: 0,
    notes: "Use: Traverse 1/3 · Ratio not listed · On hand = 0"
  },

  /* ---------------------------
     BELTS (MASTER SPARES)
  ----------------------------*/
  // Screen deck / misc belts
  {
    category: "Belts",
    part: "Belt – B51",
    location: "Belt Spares",
    qty: 0,
    notes: "Virgin Screen Deck"
  },
  {
    category: "Belts",
    part: "Belt – B52",
    location: "Belt Spares",
    qty: 4,
    notes: "RAP Screen Deck"
  },
  { category: "Belts", part: "Belt – B62", location: "Belt Spares", qty: 14, notes: "" },
  { category: "Belts", part: "Belt – B90", location: "Belt Spares", qty: 12, notes: "" },
  {
    category: "Belts",
    part: "Belt – BX62",
    location: "Belt Spares",
    qty: 4,
    notes: "Old Recycle Screen Deck"
  },
  { category: "Belts", part: "Belt – 2BX90", location: "Belt Spares", qty: 10, notes: "" },
  { category: "Belts", part: "Belt – 2BX82", location: "Belt Spares", qty: 6, notes: "" },
  { category: "Belts", part: "Belt – C112", location: "Belt Spares", qty: 8, notes: "" },

  // V-belts
  {
    category: "Belts",
    part: "Belt – 3VX450",
    location: "Belt Spares",
    qty: 14,
    notes: "Recycle Feeder Bin"
  },
  {
    category: "Belts",
    part: "Belt – 3VX530",
    location: "Belt Spares",
    qty: 7,
    notes: "Incline Dust Auger"
  },
  {
    category: "Belts",
    part: "Belt – 3VX630",
    location: "Belt Spares",
    qty: 9,
    notes: "RAP gathering · RAP incline · RAP to drum · Baghouse dust auger"
  },
  { category: "Belts", part: "Belt – 3VX670", location: "Belt Spares", qty: 5, notes: "" },
  {
    category: "Belts",
    part: "Belt – 3VX750",
    location: "Belt Spares",
    qty: 4,
    notes: "Virgin Incline to Drum"
  },
  {
    category: "Belts",
    part: "Belt – 3VX800",
    location: "Belt Spares",
    qty: 3,
    notes: "Virgin Main Gathering"
  },
  { category: "Belts", part: "Belt – 3VX900", location: "Belt Spares", qty: 8, notes: "" },
  {
    category: "Belts",
    part: "Belt – 3VX1060",
    location: "Belt Spares",
    qty: 19,
    notes: "Virgin Feeder Bins"
  },

  // 5VX / 8VX
  { category: "Belts", part: "Belt – 5VX800", location: "Belt Spares", qty: 9, notes: "" },
  {
    category: "Belts",
    part: "Belt – 5VX950",
    location: "Belt Spares",
    qty: 8,
    notes: "Drag Slat / Traverse"
  },
  {
    category: "Belts",
    part: "Belt – 8VX1120",
    location: "Belt Spares",
    qty: 10,
    notes: "Exhaust Fan"
  },

  // Specialty conveyor belts
  {
    category: "Belts",
    part: 'Belt – 34" × 6" × 36"',
    location: "Belt Spares",
    qty: 0,
    notes: "RAP feeder punched for 140 lacings (critical)"
  }
];
