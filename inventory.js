/* ============================================================
   INVENTORY MASTER DATA
   This is used for:
   - Inventory screen list
   - Category dropdowns
   - Add Part modal autofill
============================================================ */

const INVENTORY_DATA = [
    /* -------------------------
       MAIN PLANT CATEGORIES
    ------------------------- */
    { category: "Cold Feed", name: "Cold Feed Belt" },
    { category: "Cold Feed", name: "Cold Feed Gearbox" },
    { category: "Cold Feed", name: "Cold Feed Motor" },

    { category: "Conveyor", name: "Conveyor Belt" },
    { category: "Conveyor", name: "Conveyor Bearing" },
    { category: "Conveyor", name: "Conveyor Idler" },

    { category: "Dryer", name: "Dryer Flights" },
    { category: "Dryer", name: "Dryer Drum Roller" },
    { category: "Dryer", name: "Dryer Burner Nozzle" },

    { category: "Baghouse", name: "Baghouse Bags" },
    { category: "Baghouse", name: "Baghouse Cages" },
    { category: "Baghouse", name: "Baghouse Airlock" },

    { category: "Electrical", name: "Motor Starter" },
    { category: "Electrical", name: "Breaker" },
    { category: "Electrical", name: "Limit Switch" },

    { category: "Slat Conveyor", name: "Slat Chain" },
    { category: "Slat Conveyor", name: "Slat Floor Plate" },
    { category: "Slat Conveyor", name: "Slat Bearings" },

    { category: "Tank Farm", name: "Asphalt Pump" },
    { category: "Tank Farm", name: "Tank Valve" },
    { category: "Tank Farm", name: "Expansion Joint" },

    { category: "Dust System", name: "Dust Screw" },
    { category: "Dust System", name: "Dust Auger Motor" },
    { category: "Dust System", name: "Dust Return Pipe" },

    { category: "Mixer", name: "Mixer Paddles" },
    { category: "Mixer", name: "Mixer Liners" },
    { category: "Mixer", name: "Mixer Bearings" },

    { category: "Screens", name: "Screen Cloth" },
    { category: "Screens", name: "Screen Bearings" },

    { category: "Controls", name: "PLC Module" },
    { category: "Controls", name: "Temperature Sensor" },
    { category: "Controls", name: "VFD" },

    { category: "Asphalt System", name: "AC Pump" },
    { category: "Asphalt System", name: "AC Valve" },
    { category: "Asphalt System", name: "Heat Trace Wire" },

    { category: "Pumps", name: "Oil Pump" },
    { category: "Pumps", name: "Fuel Pump" },
    { category: "Pumps", name: "Hydraulic Pump" },

    { category: "Virgin – Other", name: "Misc Bolt Set" },
    { category: "Virgin – Other", name: "Spare Wear Plate" },

    /* -------------------------
       RECYCLING & SECONDARY
    ------------------------- */
    { category: "Drag Conveyor", name: "Drag Chain" },
    { category: "Drag Conveyor", name: "Drag Sprocket" },

    { category: "Collar", name: "Collar Liner" },
    { category: "Collar", name: "Collar Mount Bolts" },

    { category: "Recycle Conveyor", name: "Recycle Belt" },
    { category: "Recycle Conveyor", name: "Recycle Tail Pulley" },

    { category: "Bin System", name: "Bin Vibrator" },
    { category: "Bin System", name: "Bin Gate Cylinder" },

    { category: "Flights", name: "Dryer Flight Kit" },

    { category: "Bearings", name: "Pillow Block" },
    { category: "Bearings", name: "Tapered Roller Bearing" },

    { category: "Reducers", name: "Gear Reducer" },
    { category: "Reducers", name: "Reducer Oil Seal" },

    { category: "Motors", name: "15 HP Motor" },
    { category: "Motors", name: "40 HP Motor" },

    /* -------------------------
       GENERAL
    ------------------------- */
    { category: "Other", name: "Universal Coupling" },
    { category: "Other", name: "Hydraulic Hose" },
    { category: "Other", name: "Weld-On Bracket" }
];
