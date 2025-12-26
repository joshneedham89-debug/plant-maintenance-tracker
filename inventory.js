/* ---------------------------------------------------
   CATEGORY LIST
   GOLD BASELINE – FINAL
--------------------------------------------------- */
const PRELOADED_CATEGORIES = [
  "Virgin Side",
  "Recycle Side",
  "Drum",
  "Baghouse",
  "Silos / Drag",
  "Tank Farm",
  "Motors",
  "Gearboxes",
  "Belts",
  "Electrical",
  "Screens",
  "Pumps",
  "Parts",
  "Controls",
  "Other"
];

/* ---------------------------------------------------
   PRELOADED INVENTORY
   GOLD BASELINE – FULL PLANT INVENTORY (FINAL)
   Option A – One item per spare, specs in notes
--------------------------------------------------- */
const PRELOADED_INVENTORY = [

  /* ===================== MOTORS ===================== */
  {
    category: "Motors",
    part: "Drum Motor – 200 HP",
    location: "Drum",
    qty: 1,
    notes: "1780 RPM, Frame 444/5T"
  },
  {
    category: "Motors",
    part: "Exhaust Fan Motor – 125 HP",
    location: "Baghouse",
    qty: 2,
    notes: "1780 RPM, Frame 404/5T"
  },
  {
    category: "Motors",
    part: "Hot Oil Booster Blower Motor – 40 HP",
    location: "Tank Farm",
    qty: 1,
    notes: "1765 RPM"
  },
  {
    category: "Motors",
    part: "Hot Oil Burner Blower Motor – 20 HP",
    location: "Tank Farm",
    qty: 1,
    notes: "1765 RPM"
  },
  {
    category: "Motors",
    part: "AC Meter Pump Motor – 10 HP",
    location: "Tank Farm",
    qty: 1,
    notes: "1760 RPM"
  },
  {
    category: "Motors",
    part: "Blue Smoke Fan Motor – 15 HP",
    location: "Drum",
    qty: 1,
    notes: "1765 RPM"
  },
  {
    category: "Motors",
    part: "Drag Slat Motor – 75 HP",
    location: "Silos / Drag",
    qty: 1,
    notes: "1785 RPM, Frame 365T"
  },
  {
    category: "Motors",
    part: "Traverse Motor – 25 HP",
    location: "Silos / Drag",
    qty: 2,
    notes: "1775 RPM, Frame 284T"
  },
  {
    category: "Motors",
    part: "Virgin Feeder Bin Motor – 7.5 HP",
    location: "Virgin Side",
    qty: 2,
    notes: "1765 RPM, Frame 213T"
  },
  {
    category: "Motors",
    part: "Recycle Feeder Bin Motor – 7.5 HP",
    location: "Recycle Side",
    qty: 2,
    notes: "1765 RPM, Frame 213T"
  },
  {
    category: "Motors",
    part: "Recycle Screen Deck Motor – 5 HP",
    location: "Recycle Side",
    qty: 1,
    notes: "1760 RPM"
  },

  /* ===================== GEARBOXES ===================== */
  {
    category: "Gearboxes",
    part: "Drum Planetary Gearbox",
    location: "Drum",
    qty: 0,
    notes: "43.78 Ratio"
  },
  {
    category: "Gearboxes",
    part: "Incline Dust Auger Gearbox",
    location: "Baghouse",
    qty: 1,
    notes: "14:1 Ratio"
  },
  {
    category: "Gearboxes",
    part: "Traverse Drive Gearbox",
    location: "Silos / Drag",
    qty: 1,
    notes: "TXZ Series"
  },
  {
    category: "Gearboxes",
    part: "Recycle Feeder Gearbox",
    location: "Recycle Side",
    qty: 1,
    notes: "Dodge Unit"
  },

  /* ===================== BELTS ===================== */
  {
    category: "Belts",
    part: "B51 Belt",
    location: "Various Drives",
    qty: 6,
    notes: ""
  },
  {
    category: "Belts",
    part: "B52 Belt",
    location: "Various Drives",
    qty: 6,
    notes: ""
  },
  {
    category: "Belts",
    part: "B62 Belt",
    location: "Various Drives",
    qty: 4,
    notes: ""
  },
  {
    category: "Belts",
    part: "B90 Belt",
    location: "Various Drives",
    qty: 4,
    notes: ""
  },
  {
    category: "Belts",
    part: "2BX90 Belt",
    location: "Various Drives",
    qty: 6,
    notes: ""
  },
  {
    category: "Belts",
    part: "2BX92 Belt",
    location: "Various Drives",
    qty: 4,
    notes: ""
  },
  {
    category: "Belts",
    part: "3VX450 Belt",
    location: "Various Drives",
    qty: 6,
    notes: ""
  },
  {
    category: "Belts",
    part: "3VX530 Belt",
    location: "Various Drives",
    qty: 7,
    notes: ""
  },
  {
    category: "Belts",
    part: "3VX630 Belt",
    location: "Various Drives",
    qty: 9,
    notes: ""
  },
  {
    category: "Belts",
    part: "3VX750 Belt",
    location: "Various Drives",
    qty: 6,
    notes: ""
  },
  {
    category: "Belts",
    part: "3VX800 Belt",
    location: "Various Drives",
    qty: 6,
    notes: ""
  },
  {
    category: "Belts",
    part: "3VX900 Belt",
    location: "Various Drives",
    qty: 6,
    notes: ""
  },
  {
    category: "Belts",
    part: "3VX1060 Belt",
    location: "Various Drives",
    qty: 4,
    notes: ""
  },
  {
    category: "Belts",
    part: "5VX800 Belt",
    location: "Various Drives",
    qty: 6,
    notes: ""
  },
  {
    category: "Belts",
    part: "5VX950 Belt",
    location: "Various Drives",
    qty: 8,
    notes: ""
  },

  /* ===================== DRUM / CONVEYOR BELTS ===================== */
  {
    category: "Drum",
    part: "Virgin Feeder Belt",
    location: "Virgin Side",
    qty: 2,
    notes: "22\" x 2-ply x 24\""
  },
  {
    category: "Drum",
    part: "Recycle Feeder Belt",
    location: "Recycle Side",
    qty: 2,
    notes: "34\" x 36\""
  },

  /* ===================== BAGHOUSE ===================== */
  {
    category: "Baghouse",
    part: "Baghouse Filter Bags",
    location: "Baghouse",
    qty: 120,
    notes: "4 5/8\" Dia x 120 1/2\" Long"
  },
  {
    category: "Baghouse",
    part: "Baghouse Dust Auger Motor",
    location: "Baghouse",
    qty: 2,
    notes: "15 HP"
  },

  /* ===================== SCREENS ===================== */
  {
    category: "Screens",
    part: "Virgin Screen Deck Panels – Top",
    location: "Virgin Side",
    qty: 3,
    notes: "46.5\" x 48\" – 1\" holes"
  },
  {
    category: "Screens",
    part: "Virgin Screen Deck Panels – Bottom",
    location: "Virgin Side",
    qty: 2,
    notes: "Slot style"
  },
  {
    category: "Screens",
    part: "Recycle Screen Deck Panels",
    location: "Recycle Side",
    qty: 2,
    notes: "1.25\" holes"
  },

  /* ===================== TANK FARM ===================== */
  {
    category: "Tank Farm",
    part: "AC Meter Pump",
    location: "Tank Farm",
    qty: 1,
    notes: "Complete spare"
  },

  /* ===================== ELECTRICAL ===================== */
  {
    category: "Electrical",
    part: "Astec Tach Sensors",
    location: "Maintenance Shop",
    qty: 2,
    notes: "Astec PN variants"
  },

  /* ===================== PARTS ===================== */
  {
    category: "Parts",
    part: "Drag Slat Chain Assembly",
    location: "Silos / Drag",
    qty: 1,
    notes: "Complete spare"
  },
  {
    category: "Parts",
    part: "Traverse Drive Assembly",
    location: "Silos / Drag",
    qty: 1,
    notes: "Complete spare"
  }

];
