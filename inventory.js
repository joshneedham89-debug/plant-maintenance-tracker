/* ---------------------------------------------------
   CATEGORY LIST (your full set)
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
  "Other"
];

/* ---------------------------------------------------
   INVENTORY LIST
   (You can expand this with real plant parts later)
--------------------------------------------------- */

const PRELOADED_INVENTORY = [
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
    part: "10 HP Motor",
    location: "Mixer",
    qty: 1,
    notes: "Rebuilt, spare"
  },
  {
    category: "Flights",
    part: "Dryer Flight Set",
    location: "Dryer",
    qty: 1,
    notes: "Full set for drum"
  },
  {
    category: "Tank Farm",
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
  }
];
