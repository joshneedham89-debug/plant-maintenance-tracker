/* ---------------------------------------------------
   CATEGORY LIST (GOLD BASELINE – UNCHANGED)
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
  "Parts",
  "Electrical",
  "Pumps",
  "Controls",
  "Other"
];

/* ---------------------------------------------------
   PRELOADED INVENTORY
   GOLD BASELINE – FULL PLANT INVENTORY (Option A)
--------------------------------------------------- */

const PRELOADED_INVENTORY = [

  /* ===================== MOTORS ===================== */
  {
    category: "Motors",
    part: "Drum Motor – 200 HP",
    location: "Drum",
    qty: 1,
    notes: "1780 RPM, Frame 444/5T, Astec"
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
    location: "Virgin Bins",
    qty: 1,
    notes: "1765 RPM, Frame 213T"
  },
  {
    category: "Motors",
    part: "Recycle Screen Deck Motor – 5 HP",
    location: "Recycle Screen Deck",
    qty: 1,
    notes: "1760 RPM, Frame 184T"
  },

  /* ===================== GEARBOXES ===================== */
  {
    category: "Gearboxes",
    part: "Drum Planetary Gearbox",
    location: "Drum",
    qty: 0,
    notes: "43.78 Ratio, 1750 RPM"
  },
  {
    category: "Gearboxes",
    part: "Incline Dust Auger Gearbox",
    location: "Baghouse",
    qty: 1,
    notes: "14:1 Ratio, 1974 RPM, PN 352065"
  },

  /* ===================== BELTS ===================== */
  {
    category: "Belts",
    part: "3VX630 Belt",
    location: "Multiple Drives",
    qty: 9,
    notes: ""
  },
  {
    category: "Belts",
    part: "3VX530 Belt",
    location: "Incline Dust Auger",
    qty: 7,
    notes: ""
  },
  {
    category: "Belts",
    part: "5VX950 Belt",
    location: "Drag / Traverse",
    qty: 8,
    notes: ""
  },
  {
    category: "Belts",
    part: "8VX1120 Belt",
    location: "Exhaust Fan",
    qty: 10,
    notes: ""
  },

  /* ===================== DRUM ===================== */
  {
    category: "Drum",
    part: "Virgin Incline to Drum Belt",
    location: "Drum",
    qty: 2,
    notes: "22\" x 2-ply x 24\" wide"
  },

  /* ===================== BAGHOUSE ===================== */
  {
    category: "Baghouse",
    part: "Baghouse Filter Bags",
    location: "Baghouse",
    qty: 120,
    notes: "4 5/8\" Diameter x 120 1/2\" Long"
  },
  {
    category: "Baghouse",
    part: "Baghouse Dust Auger Motor",
    location: "Baghouse",
    qty: 2,
    notes: "15 HP, 1765 RPM, Frame 254/6T"
  },

  /* ===================== SILOS / DRAG ===================== */
  {
    category: "Silos / Drag",
    part: "Drag Slat Chain Assembly",
    location: "Drag Slat",
    qty: 1,
    notes: "Complete spare assembly"
  },
  {
    category: "Silos / Drag",
    part: "Traverse Drive Assembly",
    location: "Traverse",
    qty: 1,
    notes: "Complete spare assembly"
  },

  /* ===================== TANK FARM ===================== */
  {
    category: "Tank Farm",
    part: "AC Meter Pump",
    location: "Tank Farm",
    qty: 1,
    notes: "Upper shaft on pump"
  },

  /* ===================== PARTS ===================== */
  {
    category: "Parts",
    part: "Screen Deck Panels – Virgin",
    location: "Virgin Screen Deck",
    qty: 3,
    notes: "46.5\" x 48\" – 1\" Holes"
  },
  {
    category: "Parts",
    part: "Screen Deck Panels – Recycle",
    location: "Recycle Screen Deck",
    qty: 2,
    notes: "46.5\" x 48\" – 1.25\" Holes"
  },
  {
    category: "Parts",
    part: "Astec Tach Sensors",
    location: "Maintenance Shop",
    qty: 2,
    notes: "Astec PN 077576"
  }

];
