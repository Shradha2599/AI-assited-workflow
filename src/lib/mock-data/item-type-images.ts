/** Local product thumbnail paths — always available, matched by item type name */
const LOCAL = (slug: string) => `/images/products/${slug}.svg`;

const ITEM_TYPE_IMAGES: Record<string, string> = {
  "ceramic serving high bowls": LOCAL("ceramic-serving-high-bowls"),
  "sugar bowl & creamer sets": LOCAL("sugar-bowl-creamer-sets"),
  "dip & condiment servers": LOCAL("dip-condiment-servers"),
  "cake stands & tiered servers": LOCAL("cake-stands-tiered-servers"),
  "glass cake domes": LOCAL("glass-cake-domes"),
  "outdoor string lights": LOCAL("outdoor-string-lights"),
  "pendant light fixture": LOCAL("pendant-light-fixture"),
  "halloween lantern set": LOCAL("halloween-lantern-set"),
  "ceramic table lamp": LOCAL("ceramic-table-lamp"),
  "glass beverage dispenser": LOCAL("glass-beverage-dispenser"),
  "storage basket set": LOCAL("storage-basket-set"),
  "decorative wall mirror": LOCAL("decorative-wall-mirror"),
  "linen dining chair cover": LOCAL("linen-dining-chair-cover"),
  "cupcake stand tiered server": LOCAL("cupcake-stand-tiered-server"),
  "beverage carafes & pitchers": LOCAL("glass-beverage-dispenser"),
  "ceramic pasta bowls": LOCAL("ceramic-serving-high-bowls"),
};

const ITEM_TYPE_KEYWORDS: Array<{ keywords: string[]; url: string }> = [
  { keywords: ["serving bowl", "high bowl", "pasta bowl"], url: ITEM_TYPE_IMAGES["ceramic serving high bowls"] },
  { keywords: ["sugar bowl", "creamer"], url: ITEM_TYPE_IMAGES["sugar bowl & creamer sets"] },
  { keywords: ["condiment", "dip server"], url: ITEM_TYPE_IMAGES["dip & condiment servers"] },
  { keywords: ["cake stand", "tiered server", "cupcake stand"], url: ITEM_TYPE_IMAGES["cake stands & tiered servers"] },
  { keywords: ["cake dome", "glass dome"], url: ITEM_TYPE_IMAGES["glass cake domes"] },
  { keywords: ["string light", "fairy light"], url: ITEM_TYPE_IMAGES["outdoor string lights"] },
  { keywords: ["pendant", "chandelier", "light fixture"], url: ITEM_TYPE_IMAGES["pendant light fixture"] },
  { keywords: ["table lamp", "ceramic lamp"], url: ITEM_TYPE_IMAGES["ceramic table lamp"] },
  { keywords: ["halloween", "lantern", "pumpkin"], url: ITEM_TYPE_IMAGES["halloween lantern set"] },
  { keywords: ["dispenser", "carafe", "pitcher", "beverage"], url: ITEM_TYPE_IMAGES["glass beverage dispenser"] },
  { keywords: ["basket", "storage"], url: ITEM_TYPE_IMAGES["storage basket set"] },
  { keywords: ["mirror"], url: ITEM_TYPE_IMAGES["decorative wall mirror"] },
  { keywords: ["chair cover", "linen"], url: ITEM_TYPE_IMAGES["linen dining chair cover"] },
];

function normalizeItemName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function lookupImageByName(name: string): string | undefined {
  const normalized = normalizeItemName(name);
  if (ITEM_TYPE_IMAGES[normalized]) return ITEM_TYPE_IMAGES[normalized];

  for (const entry of ITEM_TYPE_KEYWORDS) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.url;
    }
  }

  return undefined;
}

interface ResolveItemTypeImageOptions {
  id?: string;
  name?: string;
  imageUrl?: string;
}

export function resolveItemTypeImageUrl({
  id,
  name,
  imageUrl,
}: ResolveItemTypeImageOptions): string | undefined {
  if (name) {
    const byName = lookupImageByName(name);
    if (byName) return byName;
  }

  if (id) {
    const byId = lookupImageByName(id);
    if (byId) return byId;
  }

  return imageUrl?.startsWith("/") ? imageUrl : undefined;
}
