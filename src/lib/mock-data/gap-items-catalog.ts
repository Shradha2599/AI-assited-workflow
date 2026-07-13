import type { GapItem } from "@/components/data-display/gaps-drawer";

/**
 * Comprehensive gap-item catalog keyed by the drawer category name.
 * Items are real product types relevant to each category/subcategory,
 * with realistic competitor data and revenue estimates.
 */
const CATALOG: Record<string, GapItem[]> = {
  // ── Serveware ──────────────────────────────────────────────────────────────
  Serveware: [
    { id: "sw-1", name: "Ceramic Serving High Bowls",      lagPercent: 28,   lagSeverity: "high",        estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 102 },
    { id: "sw-2", name: "Sugar Bowl & Creamer Sets",        lagPercent: 18.2, lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 87  },
    { id: "sw-3", name: "Dip & Condiment Servers",          lagPercent: 9.8,  lagSeverity: "medium",      estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 64  },
    { id: "sw-4", name: "Cake Stands & Tiered Servers",     lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 79  },
    { id: "sw-5", name: "Glass Cake Domes",                 lagPercent: 25,   lagSeverity: "high",        estimatedRevenue: "$1.3M", competitor: "Amazon",    skuCount: 58  },
    { id: "sw-6", name: "Salad Bowl & Server Sets",         lagPercent: 21,   lagSeverity: "high",        estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 93  },
    { id: "sw-7", name: "Charcuterie & Cheese Boards",      lagPercent: 17,   lagSeverity: "medium-high", estimatedRevenue: "$1.6M", competitor: "Amazon",    skuCount: 118 },
    { id: "sw-8", name: "Gravy Boats & Sauce Pitchers",     lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 45  },
  ],

  // ── Glassware & Drinkware ──────────────────────────────────────────────────
  "Glassware & Drinkware": [
    { id: "gd-1", name: "Crystal Wine Glass Sets",          lagPercent: 32,   lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Amazon",    skuCount: 134 },
    { id: "gd-2", name: "Double-Wall Insulated Tumblers",   lagPercent: 27,   lagSeverity: "high",        estimatedRevenue: "$1.8M", competitor: "Amazon",    skuCount: 109 },
    { id: "gd-3", name: "Cocktail Shaker & Bar Sets",       lagPercent: 19,   lagSeverity: "medium-high", estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 88  },
    { id: "gd-4", name: "Highball & Rocks Glasses",         lagPercent: 15,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 72  },
    { id: "gd-5", name: "Champagne Flutes & Coupes",        lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$1.3M", competitor: "Amazon",    skuCount: 61  },
    { id: "gd-6", name: "Glass Pitchers & Carafes",         lagPercent: 11,   lagSeverity: "medium",      estimatedRevenue: "$0.8M", competitor: "Amazon",    skuCount: 54  },
    { id: "gd-7", name: "Beer Mugs & Steins",               lagPercent: 8,    lagSeverity: "medium",      estimatedRevenue: "$0.6M", competitor: "Amazon",    skuCount: 41  },
  ],

  // ── Dining & Entertaining ─────────────────────────────────────────────────
  "Dining & Entertaining": [
    { id: "de-1", name: "Fine China Dinner Sets (12-pc)",   lagPercent: 34,   lagSeverity: "high",        estimatedRevenue: "$2.8M", competitor: "Amazon",    skuCount: 156 },
    { id: "de-2", name: "Linen Napkin & Placemat Sets",     lagPercent: 26,   lagSeverity: "high",        estimatedRevenue: "$1.6M", competitor: "Amazon",    skuCount: 121 },
    { id: "de-3", name: "Centerpiece & Table Runners",      lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.3M", competitor: "Amazon",    skuCount: 97  },
    { id: "de-4", name: "Fondue & Hot Pot Sets",            lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 63  },
    { id: "de-5", name: "Electric Food Warmers",            lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 78  },
    { id: "de-6", name: "Buffet & Chafing Dishes",          lagPercent: 29,   lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Amazon",    skuCount: 142 },
    { id: "de-7", name: "Wooden Salad Serving Sets",        lagPercent: 10,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 49  },
  ],

  // ── Kitchen & Dining Deals ────────────────────────────────────────────────
  "Kitchen & Dining Deals": [
    { id: "kd-1", name: "Ceramic Non-Stick Cookware Sets",  lagPercent: 30,   lagSeverity: "high",        estimatedRevenue: "$2.4M", competitor: "Amazon",    skuCount: 148 },
    { id: "kd-2", name: "Knife Block Sets (7-pc)",          lagPercent: 24,   lagSeverity: "high",        estimatedRevenue: "$1.9M", competitor: "Amazon",    skuCount: 113 },
    { id: "kd-3", name: "Meal Prep Container Sets",         lagPercent: 16,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 86  },
    { id: "kd-4", name: "Electric Kettle & Coffee Bundle",  lagPercent: 21,   lagSeverity: "high",        estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 94  },
    { id: "kd-5", name: "Bamboo Cutting Board Sets",        lagPercent: 13,   lagSeverity: "medium",      estimatedRevenue: "$0.8M", competitor: "Amazon",    skuCount: 67  },
  ],

  // ── Countertop Storage ────────────────────────────────────────────────────
  "Countertop Storage": [
    { id: "cs-1", name: "Rotating Spice Rack Towers",       lagPercent: 27,   lagSeverity: "high",        estimatedRevenue: "$1.6M", competitor: "Amazon",    skuCount: 98  },
    { id: "cs-2", name: "Stackable Canister Sets",          lagPercent: 20,   lagSeverity: "high",        estimatedRevenue: "$1.3M", competitor: "Walmart",   skuCount: 82  },
    { id: "cs-3", name: "Bamboo Drawer Organizers",         lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 61  },
    { id: "cs-4", name: "Over-the-Sink Shelf Racks",        lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 73  },
    { id: "cs-5", name: "Knife Magnetic Strip Holders",     lagPercent: 9,    lagSeverity: "medium",      estimatedRevenue: "$0.6M", competitor: "Amazon",    skuCount: 44  },
    { id: "cs-6", name: "Acrylic Pantry Label Sets",        lagPercent: 7,    lagSeverity: "medium",      estimatedRevenue: "$0.4M", competitor: "Amazon",    skuCount: 36  },
  ],

  // ── Kitchen & Table Linens ────────────────────────────────────────────────
  "Kitchen & Table Linens": [
    { id: "tl-1", name: "Linen Tablecloths (60×120)",       lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 89  },
    { id: "tl-2", name: "Jacquard Table Runner Sets",       lagPercent: 17,   lagSeverity: "medium-high", estimatedRevenue: "$1.0M", competitor: "Amazon",    skuCount: 66  },
    { id: "tl-3", name: "Embroidered Cloth Napkins (12-pk)",lagPercent: 13,   lagSeverity: "medium",      estimatedRevenue: "$0.8M", competitor: "Amazon",    skuCount: 54  },
    { id: "tl-4", name: "Woven Placemat Collections",       lagPercent: 10,   lagSeverity: "medium",      estimatedRevenue: "$0.6M", competitor: "Amazon",    skuCount: 47  },
    { id: "tl-5", name: "Silicone Pot Holder & Oven Mitt Sets", lagPercent: 15, lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Walmart",  skuCount: 72  },
  ],

  // ── Cookware ──────────────────────────────────────────────────────────────
  "Cookware": [
    { id: "cw-1", name: "Enameled Cast Iron Dutch Ovens",   lagPercent: 36,   lagSeverity: "high",        estimatedRevenue: "$3.1M", competitor: "Amazon",    skuCount: 167 },
    { id: "cw-2", name: "Stainless Steel Sauté Pans",       lagPercent: 28,   lagSeverity: "high",        estimatedRevenue: "$2.2M", competitor: "Amazon",    skuCount: 134 },
    { id: "cw-3", name: "Non-Stick Frying Pan Sets (3-pc)", lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$1.8M", competitor: "Amazon",    skuCount: 108 },
    { id: "cw-4", name: "Woks & Stir-Fry Pans",            lagPercent: 16,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 79  },
    { id: "cw-5", name: "Pressure Cooker & Instant Pots",   lagPercent: 19,   lagSeverity: "medium-high", estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 92  },
    { id: "cw-6", name: "Griddle & Grill Pans",             lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 58  },
    { id: "cw-7", name: "Stock Pots & Pasta Inserts",       lagPercent: 8,    lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 44  },
  ],

  // ── Bakeware ──────────────────────────────────────────────────────────────
  "Bakeware": [
    { id: "bk-1", name: "Non-Stick Springform Pan Sets",    lagPercent: 24,   lagSeverity: "high",        estimatedRevenue: "$1.6M", competitor: "Amazon",    skuCount: 97  },
    { id: "bk-2", name: "Silicone Baking Mat Collections",  lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 74  },
    { id: "bk-3", name: "Stoneware Loaf & Bread Pans",      lagPercent: 15,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 61  },
    { id: "bk-4", name: "Bundt & Specialty Cake Pans",      lagPercent: 20,   lagSeverity: "high",        estimatedRevenue: "$1.3M", competitor: "Amazon",    skuCount: 82  },
    { id: "bk-5", name: "Cookie Sheet & Half Sheet Sets",   lagPercent: 11,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 53  },
    { id: "bk-6", name: "Cupcake & Muffin Tin Sets",        lagPercent: 9,    lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 39  },
  ],

  // ── Kitchen Appliances ────────────────────────────────────────────────────
  "Kitchen Appliances": [
    { id: "ka-1", name: "Air Fryer Ovens (6-10 Qt)",        lagPercent: 31,   lagSeverity: "high",        estimatedRevenue: "$2.9M", competitor: "Amazon",    skuCount: 178 },
    { id: "ka-2", name: "Espresso & Bean-to-Cup Machines",  lagPercent: 24,   lagSeverity: "high",        estimatedRevenue: "$2.3M", competitor: "Amazon",    skuCount: 142 },
    { id: "ka-3", name: "Stand Mixer Attachments & Kits",   lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 104 },
    { id: "ka-4", name: "Countertop Convection Ovens",      lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$1.9M", competitor: "Best Buy",  skuCount: 119 },
    { id: "ka-5", name: "High-Speed Blender Systems",       lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 87  },
    { id: "ka-6", name: "Electric Can Openers & Slicers",   lagPercent: 8,    lagSeverity: "medium",      estimatedRevenue: "$0.6M", competitor: "Amazon",    skuCount: 52  },
  ],

  // ── Lighting ──────────────────────────────────────────────────────────────
  "Lighting": [
    { id: "li-1", name: "Pendant Light Fixtures",           lagPercent: 33,   lagSeverity: "high",        estimatedRevenue: "$2.6M", competitor: "Amazon",    skuCount: 159 },
    { id: "li-2", name: "LED Dimmable Table Lamps",         lagPercent: 27,   lagSeverity: "high",        estimatedRevenue: "$2.0M", competitor: "Amazon",    skuCount: 128 },
    { id: "li-3", name: "Arc Floor Lamps",                  lagPercent: 19,   lagSeverity: "medium-high", estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 94  },
    { id: "li-4", name: "Wired Wall Sconces",               lagPercent: 24,   lagSeverity: "high",        estimatedRevenue: "$1.8M", competitor: "Amazon",    skuCount: 112 },
    { id: "li-5", name: "Smart Bulb Starter Kits",          lagPercent: 15,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 83  },
    { id: "li-6", name: "Outdoor String & Festoon Lights",  lagPercent: 21,   lagSeverity: "high",        estimatedRevenue: "$1.6M", competitor: "Amazon",    skuCount: 107 },
    { id: "li-7", name: "Flush Mount Ceiling Lights",       lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 68  },
    { id: "li-8", name: "Decorative Night Lights",          lagPercent: 8,    lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 47  },
  ],

  // ── Lighting subcategories ─────────────────────────────────────────────────
  "Ceiling Lights": [
    { id: "cl-1", name: "Flush Mount Ceiling Lights",       lagPercent: 29,   lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Amazon",    skuCount: 141 },
    { id: "cl-2", name: "Semi-Flush Mount Fixtures",        lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$1.6M", competitor: "Amazon",    skuCount: 108 },
    { id: "cl-3", name: "Chandelier & Pendant Kits",        lagPercent: 35,   lagSeverity: "high",        estimatedRevenue: "$2.7M", competitor: "Amazon",    skuCount: 173 },
    { id: "cl-4", name: "Recessed LED Downlights (6-pk)",   lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 86  },
    { id: "cl-5", name: "Ceiling Fan Light Combos",         lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 63  },
  ],
  "Table Lamps": [
    { id: "tla-1", name: "Ceramic Bedside Table Lamps",     lagPercent: 26,   lagSeverity: "high",        estimatedRevenue: "$1.9M", competitor: "Amazon",    skuCount: 124 },
    { id: "tla-2", name: "USB Charging Desk Lamps",         lagPercent: 19,   lagSeverity: "medium-high", estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 97  },
    { id: "tla-3", name: "Industrial Edison Bulb Lamps",    lagPercent: 23,   lagSeverity: "high",        estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 111 },
    { id: "tla-4", name: "Wireless Touch Control Lamps",    lagPercent: 17,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 78  },
    { id: "tla-5", name: "Buffet Lamps for Sideboards",     lagPercent: 11,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 54  },
  ],
  "Floor Lamps": [
    { id: "fl-1", name: "Arc Floor Lamps with Shade",       lagPercent: 20,   lagSeverity: "high",        estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 98  },
    { id: "fl-2", name: "Tripod Floor Lamp Sets",           lagPercent: 15,   lagSeverity: "medium-high", estimatedRevenue: "$1.0M", competitor: "Amazon",    skuCount: 74  },
    { id: "fl-3", name: "Torchiere Uplighter Lamps",        lagPercent: 11,   lagSeverity: "medium",      estimatedRevenue: "$0.8M", competitor: "Wayfair",   skuCount: 56  },
    { id: "fl-4", name: "LED Reading Floor Lamps",          lagPercent: 13,   lagSeverity: "medium",      estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 67  },
  ],
  "Wall Lights": [
    { id: "wl-1", name: "Plug-In Wall Sconces",             lagPercent: 24,   lagSeverity: "high",        estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 109 },
    { id: "wl-2", name: "Hardwired Swing-Arm Lights",       lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 81  },
    { id: "wl-3", name: "Picture Light Bars",               lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 52  },
    { id: "wl-4", name: "Outdoor Wall Lanterns",            lagPercent: 16,   lagSeverity: "medium-high", estimatedRevenue: "$1.0M", competitor: "Amazon",    skuCount: 68  },
  ],
  "Smart Lighting": [
    { id: "sl-1", name: "Matter-Compatible Smart Bulb Kits",lagPercent: 17,   lagSeverity: "medium-high", estimatedRevenue: "$1.3M", competitor: "Amazon",    skuCount: 89  },
    { id: "sl-2", name: "Tunable White LED Strips (5m)",    lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 72  },
    { id: "sl-3", name: "Smart Dimmer Switch Kits",         lagPercent: 10,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 58  },
    { id: "sl-4", name: "Color-Changing Bias Lighting",     lagPercent: 8,    lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 44  },
  ],
  "Outdoor Lighting": [
    { id: "ol-1", name: "Solar Pathway Stake Lights (12-pk)",lagPercent: 22,  lagSeverity: "high",        estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 103 },
    { id: "ol-2", name: "Outdoor String & Bistro Lights",   lagPercent: 26,   lagSeverity: "high",        estimatedRevenue: "$1.8M", competitor: "Amazon",    skuCount: 127 },
    { id: "ol-3", name: "Motion-Sensor Flood Lights",       lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Home Depot",skuCount: 89  },
    { id: "ol-4", name: "Deck & Step Riser Lights",         lagPercent: 13,   lagSeverity: "medium",      estimatedRevenue: "$0.8M", competitor: "Amazon",    skuCount: 61  },
  ],

  // ── Furniture ─────────────────────────────────────────────────────────────
  "Furniture": [
    { id: "fu-1", name: "Upholstered Accent Chairs",        lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$2.2M", competitor: "Walmart",   skuCount: 138 },
    { id: "fu-2", name: "Solid Wood Bookcase Shelves",      lagPercent: 16,   lagSeverity: "medium-high", estimatedRevenue: "$1.5M", competitor: "Wayfair",   skuCount: 101 },
    { id: "fu-3", name: "Storage Ottoman Benches",          lagPercent: 19,   lagSeverity: "medium-high", estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 117 },
    { id: "fu-4", name: "Mid-Century Dining Table Sets",    lagPercent: 25,   lagSeverity: "high",        estimatedRevenue: "$2.8M", competitor: "Walmart",   skuCount: 162 },
    { id: "fu-5", name: "Convertible Sofa Beds",            lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$1.3M", competitor: "Wayfair",   skuCount: 84  },
    { id: "fu-6", name: "Lift-Top Coffee Tables",           lagPercent: 10,   lagSeverity: "medium",      estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 63  },
    { id: "fu-7", name: "TV Console & Media Units",         lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.6M", competitor: "Walmart",   skuCount: 108 },
  ],
  "Living Room": [
    { id: "lr-1", name: "Sectional Sofas",                  lagPercent: 23,   lagSeverity: "high",        estimatedRevenue: "$2.4M", competitor: "Walmart",   skuCount: 147 },
    { id: "lr-2", name: "Velvet Accent Chairs",             lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.6M", competitor: "Wayfair",   skuCount: 112 },
    { id: "lr-3", name: "Nesting & Accent Tables",          lagPercent: 13,   lagSeverity: "medium",      estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 73  },
    { id: "lr-4", name: "TV Media Console Units",           lagPercent: 17,   lagSeverity: "medium-high", estimatedRevenue: "$1.4M", competitor: "Walmart",   skuCount: 96  },
    { id: "lr-5", name: "Decorative Throw Pillow Sets",     lagPercent: 10,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 57  },
  ],
  "Bedroom": [
    { id: "bd-1", name: "Platform Bed Frames (Queen/King)", lagPercent: 21,   lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Wayfair",   skuCount: 131 },
    { id: "bd-2", name: "Nightstand & Bedside Tables",      lagPercent: 15,   lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Wayfair",   skuCount: 88  },
    { id: "bd-3", name: "6-Drawer Dresser Sets",            lagPercent: 19,   lagSeverity: "medium-high", estimatedRevenue: "$1.6M", competitor: "Walmart",   skuCount: 107 },
    { id: "bd-4", name: "Upholstered Headboards",           lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 74  },
  ],
  "Dining Furniture": [
    { id: "df-1", name: "Round Pedestal Dining Tables",     lagPercent: 20,   lagSeverity: "high",        estimatedRevenue: "$1.9M", competitor: "Amazon",    skuCount: 119 },
    { id: "df-2", name: "Upholstered Dining Chair Sets (4)",lagPercent: 16,   lagSeverity: "medium-high", estimatedRevenue: "$1.4M", competitor: "Walmart",   skuCount: 94  },
    { id: "df-3", name: "Counter-Height Bar Stools",        lagPercent: 13,   lagSeverity: "medium",      estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 68  },
    { id: "df-4", name: "Extendable Dining Tables",         lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.6M", competitor: "Wayfair",   skuCount: 102 },
  ],
  "Office Furniture": [
    { id: "of-1", name: "Adjustable Standing Desk Frames",  lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 97  },
    { id: "of-2", name: "Ergonomic Task Chairs",            lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 79  },
    { id: "of-3", name: "Home Office L-Shaped Desks",       lagPercent: 10,   lagSeverity: "medium",      estimatedRevenue: "$0.8M", competitor: "Walmart",   skuCount: 58  },
    { id: "of-4", name: "Floating Wall Desk Shelves",       lagPercent: 8,    lagSeverity: "medium",      estimatedRevenue: "$0.6M", competitor: "Amazon",    skuCount: 43  },
  ],
  "Entryway": [
    { id: "ew-1", name: "Hall Tree & Coat Rack Sets",       lagPercent: 13,   lagSeverity: "medium",      estimatedRevenue: "$0.8M", competitor: "Amazon",    skuCount: 62  },
    { id: "ew-2", name: "Entryway Bench with Storage",      lagPercent: 10,   lagSeverity: "medium",      estimatedRevenue: "$0.6M", competitor: "Walmart",   skuCount: 49  },
    { id: "ew-3", name: "Narrow Console Tables",            lagPercent: 8,    lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 38  },
  ],

  // ── Outdoor Living & Garden ───────────────────────────────────────────────
  "Outdoor Living & Garden": [
    { id: "og-1", name: "4-Piece Patio Dining Sets",        lagPercent: 30,   lagSeverity: "high",        estimatedRevenue: "$3.2M", competitor: "Home Depot",skuCount: 187 },
    { id: "og-2", name: "Deep-Seat Sectional Lounge Sets",  lagPercent: 24,   lagSeverity: "high",        estimatedRevenue: "$2.5M", competitor: "Amazon",    skuCount: 148 },
    { id: "og-3", name: "Weatherproof Outdoor Rugs",        lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.6M", competitor: "Home Depot",skuCount: 112 },
    { id: "og-4", name: "Solar Pathway & Garden Lights",    lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$1.9M", competitor: "Amazon",    skuCount: 134 },
    { id: "og-5", name: "Raised Garden Bed Planters",       lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Home Depot",skuCount: 86  },
    { id: "og-6", name: "Outdoor Umbrella & Base Sets",     lagPercent: 19,   lagSeverity: "medium-high", estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 98  },
    { id: "og-7", name: "Portable Fire Pit Bowls",          lagPercent: 16,   lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Home Depot",skuCount: 77  },
  ],
  "Patio Furniture": [
    { id: "pf-1", name: "All-Weather Wicker Sofa Sets",     lagPercent: 28,   lagSeverity: "high",        estimatedRevenue: "$2.9M", competitor: "Home Depot",skuCount: 176 },
    { id: "pf-2", name: "Aluminium Bistro Table Sets",      lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Amazon",    skuCount: 138 },
    { id: "pf-3", name: "Teak Adirondack Chair Sets",       lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.5M", competitor: "Home Depot",skuCount: 107 },
    { id: "pf-4", name: "Outdoor Chaise Lounge Sets",       lagPercent: 15,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 84  },
    { id: "pf-5", name: "Hanging Egg Chair Swings",         lagPercent: 21,   lagSeverity: "high",        estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 118 },
  ],
  "Outdoor Decor": [
    { id: "od-1", name: "Garden Statues & Figurines",       lagPercent: 20,   lagSeverity: "high",        estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 112 },
    { id: "od-2", name: "Wind Chimes & Garden Spinners",    lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 78  },
    { id: "od-3", name: "Decorative Outdoor Lanterns",      lagPercent: 17,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 91  },
    { id: "od-4", name: "Waterproof Outdoor Throw Pillows", lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 64  },
  ],
  "Garden Tools": [
    { id: "gt-1", name: "Stainless Steel Tool Sets (6-pc)", lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$1.6M", competitor: "Home Depot",skuCount: 118 },
    { id: "gt-2", name: "Ergonomic Pruning Shears",         lagPercent: 15,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Home Depot",skuCount: 73  },
    { id: "gt-3", name: "Retractable Garden Hose Reels",    lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 87  },
    { id: "gt-4", name: "Soil & pH Testing Kits",           lagPercent: 10,   lagSeverity: "medium",      estimatedRevenue: "$0.6M", competitor: "Amazon",    skuCount: 52  },
  ],
  "Grills & Outdoor Cooking": [
    { id: "gc-1", name: "4-Burner Propane Gas Grills",      lagPercent: 29,   lagSeverity: "high",        estimatedRevenue: "$2.8M", competitor: "Home Depot",skuCount: 164 },
    { id: "gc-2", name: "Ceramic Kamado Smoker Grills",     lagPercent: 24,   lagSeverity: "high",        estimatedRevenue: "$2.2M", competitor: "Home Depot",skuCount: 138 },
    { id: "gc-3", name: "Flat-Top Griddle Stations",        lagPercent: 20,   lagSeverity: "high",        estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 112 },
    { id: "gc-4", name: "Portable Camp Stove Sets",         lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 74  },
    { id: "gc-5", name: "Pizza Oven Backyard Kits",         lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.3M", competitor: "Home Depot",skuCount: 91  },
  ],
  "Planters & Garden": [
    { id: "pg-1", name: "Self-Watering Raised Planters",    lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 87  },
    { id: "pg-2", name: "Ceramic Glazed Pot Sets (3-pc)",   lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 68  },
    { id: "pg-3", name: "Vertical Wall Planter Systems",    lagPercent: 11,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 54  },
    { id: "pg-4", name: "Hanging Basket Planters",          lagPercent: 8,    lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Lowe's",    skuCount: 41  },
  ],

  // ── Holiday & Festive Decor ───────────────────────────────────────────────
  "Holiday": [
    { id: "hd-1", name: "Pre-Lit Christmas Tree Kits (7-9ft)",lagPercent: 34, lagSeverity: "high",        estimatedRevenue: "$3.4M", competitor: "Amazon",    skuCount: 194 },
    { id: "hd-2", name: "Animated Halloween Yard Displays",  lagPercent: 28,  lagSeverity: "high",        estimatedRevenue: "$2.6M", competitor: "Amazon",    skuCount: 162 },
    { id: "hd-3", name: "Thanksgiving Harvest Table Decor",  lagPercent: 19,  lagSeverity: "medium-high", estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 117 },
    { id: "hd-4", name: "Easter Egg Decorating Kits",        lagPercent: 14,  lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 82  },
    { id: "hd-5", name: "Holiday Wreath & Garland Sets",     lagPercent: 22,  lagSeverity: "high",        estimatedRevenue: "$1.8M", competitor: "Amazon",    skuCount: 131 },
    { id: "hd-6", name: "Nutcracker Figurine Collections",   lagPercent: 17,  lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 96  },
  ],
  "Halloween": [
    { id: "hw-1", name: "Animatronic Skeleton Displays",     lagPercent: 30,   lagSeverity: "high",        estimatedRevenue: "$2.5M", competitor: "Amazon",    skuCount: 168 },
    { id: "hw-2", name: "Inflatable Yard Decoration Kits",   lagPercent: 25,   lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Amazon",    skuCount: 142 },
    { id: "hw-3", name: "Halloween String Lights & Lanterns",lagPercent: 20,   lagSeverity: "high",        estimatedRevenue: "$1.6M", competitor: "Amazon",    skuCount: 118 },
    { id: "hw-4", name: "Carving Pumpkin Stencil Kits",      lagPercent: 13,   lagSeverity: "medium",      estimatedRevenue: "$0.8M", competitor: "Amazon",    skuCount: 71  },
    { id: "hw-5", name: "Spider Web & Fog Machine Bundles",  lagPercent: 17,   lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 94  },
  ],
  "Christmas": [
    { id: "xm-1", name: "Prelit Flocked Christmas Trees",    lagPercent: 36,   lagSeverity: "high",        estimatedRevenue: "$3.6M", competitor: "Amazon",    skuCount: 204 },
    { id: "xm-2", name: "LED Christmas Light Strands (100ct)",lagPercent: 27,  lagSeverity: "high",        estimatedRevenue: "$2.3M", competitor: "Amazon",    skuCount: 159 },
    { id: "xm-3", name: "Nativity Scene Figurine Sets",      lagPercent: 20,   lagSeverity: "high",        estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 124 },
    { id: "xm-4", name: "Christmas Wreath & Garland Bundles",lagPercent: 23,   lagSeverity: "high",        estimatedRevenue: "$1.9M", competitor: "Amazon",    skuCount: 143 },
    { id: "xm-5", name: "Christmas Stocking & Tree Skirt Sets",lagPercent: 16, lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 98  },
    { id: "xm-6", name: "Advent Calendar Collections",       lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 76  },
  ],
  "Thanksgiving": [
    { id: "tg-1", name: "Harvest Tablescape Centerpieces",   lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 106 },
    { id: "tg-2", name: "Fall Wreath & Door Hanger Sets",    lagPercent: 17,   lagSeverity: "medium-high", estimatedRevenue: "$1.0M", competitor: "Amazon",    skuCount: 79  },
    { id: "tg-3", name: "Turkey & Pumpkin Décor Figurines",  lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 58  },
    { id: "tg-4", name: "Autumn Leaf Table Runner Sets",     lagPercent: 9,    lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 44  },
  ],
  "Easter": [
    { id: "es-1", name: "Easter Basket Filler Kits",         lagPercent: 16,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 78  },
    { id: "es-2", name: "Spring Floral Door Wreath Sets",    lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 59  },
    { id: "es-3", name: "Easter Egg Dyeing & Craft Kits",    lagPercent: 10,   lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 47  },
    { id: "es-4", name: "Pastel Easter Table Décor Sets",    lagPercent: 8,    lagSeverity: "medium",      estimatedRevenue: "$0.4M", competitor: "Amazon",    skuCount: 36  },
  ],

  // ── Party Supplies ────────────────────────────────────────────────────────
  "Party Supplies": [
    { id: "ps-1", name: "Biodegradable Party Plate Sets",    lagPercent: 26,   lagSeverity: "high",        estimatedRevenue: "$1.8M", competitor: "Amazon",    skuCount: 138 },
    { id: "ps-2", name: "Balloon Garland Arch Kits",         lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 114 },
    { id: "ps-3", name: "Party Tableware Sets (24-pc)",      lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 92  },
    { id: "ps-4", name: "Custom Banner & Signage Kits",      lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 71  },
    { id: "ps-5", name: "LED Balloon & Light-Up Decor",      lagPercent: 19,   lagSeverity: "medium-high", estimatedRevenue: "$1.3M", competitor: "Amazon",    skuCount: 104 },
    { id: "ps-6", name: "Photo Booth Prop Sets",             lagPercent: 11,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 56  },
  ],
  "Party Tableware": [
    { id: "pt-1", name: "Compostable Bamboo Plate Sets",     lagPercent: 20,   lagSeverity: "high",        estimatedRevenue: "$1.4M", competitor: "Amazon",    skuCount: 107 },
    { id: "pt-2", name: "Fancy Paper Cup & Napkin Bundles",  lagPercent: 15,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 76  },
    { id: "pt-3", name: "Reusable Acrylic Party Glasses",    lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 58  },
    { id: "pt-4", name: "Gold Cutlery Party Packs (100-pc)", lagPercent: 17,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 88  },
  ],
  "Party Decorations": [
    { id: "pd-1", name: "Balloon Arch & Garland Kits",       lagPercent: 23,   lagSeverity: "high",        estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 128 },
    { id: "pd-2", name: "Foil Balloon Number Sets",          lagPercent: 17,   lagSeverity: "medium-high", estimatedRevenue: "$1.0M", competitor: "Amazon",    skuCount: 84  },
    { id: "pd-3", name: "Hanging Paper Fan & Tassel Decor",  lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 62  },
    { id: "pd-4", name: "Glitter & Metallic Confetti Sets",  lagPercent: 9,    lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 46  },
  ],
  "Party Favors": [
    { id: "pf2-1", name: "Candy Bag & Thank-You Tag Kits",   lagPercent: 13,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 62  },
    { id: "pf2-2", name: "Mini Succulent Favor Sets",        lagPercent: 10,   lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 48  },
    { id: "pf2-3", name: "Personalized Keychain Favor Packs",lagPercent: 8,    lagSeverity: "medium",      estimatedRevenue: "$0.4M", competitor: "Amazon",    skuCount: 37  },
  ],
  "Baking & Serving": [
    { id: "bs-1", name: "Party Cake Decorating Kits",        lagPercent: 16,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 74  },
    { id: "bs-2", name: "Cupcake Stand & Dessert Tower Sets",lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 58  },
    { id: "bs-3", name: "Tiered Snack Tray & Server Sets",   lagPercent: 9,    lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 44  },
  ],

  // ── Rugs ─────────────────────────────────────────────────────────────────
  "Rugs": [
    { id: "rg-1", name: "Moroccan Wool Area Rugs (5x8)",     lagPercent: 24,   lagSeverity: "high",        estimatedRevenue: "$2.1M", competitor: "Wayfair",   skuCount: 143 },
    { id: "rg-2", name: "Indoor/Outdoor Polypropylene Rugs", lagPercent: 18,   lagSeverity: "medium-high", estimatedRevenue: "$1.5M", competitor: "Home Depot",skuCount: 112 },
    { id: "rg-3", name: "Hand-Woven Jute Natural Rugs",      lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Wayfair",   skuCount: 84  },
    { id: "rg-4", name: "Washable Non-Slip Runner Sets",     lagPercent: 20,   lagSeverity: "high",        estimatedRevenue: "$1.7M", competitor: "Amazon",    skuCount: 127 },
    { id: "rg-5", name: "Patterned Dhurrie Flat-Weave Rugs", lagPercent: 11,   lagSeverity: "medium",      estimatedRevenue: "$0.8M", competitor: "Wayfair",   skuCount: 67  },
    { id: "rg-6", name: "Cowhide & Faux-Fur Accent Rugs",   lagPercent: 15,   lagSeverity: "medium-high", estimatedRevenue: "$1.2M", competitor: "Amazon",    skuCount: 91  },
  ],
  "Area Rugs": [
    { id: "ar-1", name: "Persian-Style Area Rugs (8x10)",    lagPercent: 22,   lagSeverity: "high",        estimatedRevenue: "$1.9M", competitor: "Wayfair",   skuCount: 131 },
    { id: "ar-2", name: "Geometric Tribal Wool Rugs",        lagPercent: 16,   lagSeverity: "medium-high", estimatedRevenue: "$1.3M", competitor: "Wayfair",   skuCount: 98  },
    { id: "ar-3", name: "Shag & High-Pile Area Rugs",        lagPercent: 19,   lagSeverity: "medium-high", estimatedRevenue: "$1.5M", competitor: "Amazon",    skuCount: 117 },
    { id: "ar-4", name: "Low-Pile Tiled Pattern Rugs",       lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.9M", competitor: "Wayfair",   skuCount: 74  },
  ],
  "Runners": [
    { id: "rn-1", name: "Washable Kitchen Runner Sets",      lagPercent: 17,   lagSeverity: "medium-high", estimatedRevenue: "$1.0M", competitor: "Amazon",    skuCount: 82  },
    { id: "rn-2", name: "Hallway Runner Rugs (2x8 ft)",      lagPercent: 13,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Wayfair",   skuCount: 59  },
    { id: "rn-3", name: "Anti-Fatigue Kitchen Mat Sets",     lagPercent: 9,    lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 46  },
  ],
  "Outdoor Rugs": [
    { id: "or-1", name: "All-Weather Outdoor Flat-Weave Rugs",lagPercent: 18,  lagSeverity: "medium-high", estimatedRevenue: "$1.3M", competitor: "Home Depot",skuCount: 94  },
    { id: "or-2", name: "Reversible Plastic Patio Mats",     lagPercent: 12,   lagSeverity: "medium",      estimatedRevenue: "$0.8M", competitor: "Amazon",    skuCount: 67  },
    { id: "or-3", name: "Boho Stripe Outdoor Runner Rugs",   lagPercent: 9,    lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 48  },
  ],

  // ── Kids' Dining ──────────────────────────────────────────────────────────
  "Kids' Dining": [
    { id: "kd2-1", name: "Divided Silicone Plate & Bowl Sets",lagPercent: 14, lagSeverity: "medium-high", estimatedRevenue: "$0.8M", competitor: "Amazon",    skuCount: 71  },
    { id: "kd2-2", name: "Character Stainless Bento Boxes",  lagPercent: 11,  lagSeverity: "medium",      estimatedRevenue: "$0.6M", competitor: "Amazon",    skuCount: 54  },
    { id: "kd2-3", name: "Non-Spill Kids Snack Cups",        lagPercent: 8,   lagSeverity: "medium",      estimatedRevenue: "$0.4M", competitor: "Amazon",    skuCount: 42  },
  ],
  "Bar & Wine": [
    { id: "bw-1", name: "Countertop Wine Rack Towers",       lagPercent: 13,   lagSeverity: "medium",      estimatedRevenue: "$0.8M", competitor: "Amazon",    skuCount: 67  },
    { id: "bw-2", name: "Electric Wine Opener Kits",         lagPercent: 10,   lagSeverity: "medium",      estimatedRevenue: "$0.6M", competitor: "Amazon",    skuCount: 52  },
    { id: "bw-3", name: "Cocktail Mixing Glass & Bar Tool Sets",lagPercent: 16,lagSeverity: "medium-high", estimatedRevenue: "$1.0M", competitor: "Amazon",    skuCount: 81  },
  ],
  "Dorm Kitchen & Dining": [
    { id: "dk-1", name: "Dorm Essentials Kitchen Starter Sets",lagPercent: 18, lagSeverity: "medium-high", estimatedRevenue: "$1.1M", competitor: "Amazon",    skuCount: 86  },
    { id: "dk-2", name: "Compact Single-Serve Coffee Makers",lagPercent: 14,  lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 68  },
    { id: "dk-3", name: "Microwave-Safe Meal Prep Sets",     lagPercent: 10,  lagSeverity: "medium",      estimatedRevenue: "$0.6M", competitor: "Amazon",    skuCount: 51  },
  ],
  "Cutlery & Knife Acc...": [
    { id: "ck-1", name: "Forged German Steel Knife Sets",    lagPercent: 14,   lagSeverity: "medium-high", estimatedRevenue: "$0.9M", competitor: "Amazon",    skuCount: 74  },
    { id: "ck-2", name: "Knife Sharpener & Honing Rod Sets", lagPercent: 9,    lagSeverity: "medium",      estimatedRevenue: "$0.5M", competitor: "Amazon",    skuCount: 48  },
    { id: "ck-3", name: "Steak Knife Collections (8-pc)",    lagPercent: 11,   lagSeverity: "medium",      estimatedRevenue: "$0.7M", competitor: "Amazon",    skuCount: 58  },
  ],
};

/**
 * Look up gap items for a given category name.
 * Falls back to a generic set if the category is not in the catalog.
 */
export function getGapItemsByCategory(category: string): GapItem[] {
  // Exact match
  if (CATALOG[category]) return CATALOG[category];

  // Partial / case-insensitive match
  const lower = category.toLowerCase();
  const key = Object.keys(CATALOG).find((k) => k.toLowerCase() === lower);
  if (key) return CATALOG[key];

  // Partial / truncated label match (e.g. "Party Supp..." → "Party Supplies")
  const trimmed = lower.replace(/\.\.\.$/, "").trim();
  const prefixKey = Object.keys(CATALOG).find(
    (k) => k.toLowerCase().startsWith(trimmed) || trimmed.startsWith(k.toLowerCase().slice(0, 8)),
  );
  if (prefixKey) return CATALOG[prefixKey];

  return [];
}
