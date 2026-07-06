/** Normalize revenue goal input (no $ prefix — shown separately in UI). */
export function normalizeRevenueGoalInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const withoutDollar = trimmed.startsWith("$") ? trimmed.slice(1) : trimmed;
  const cleaned = withoutDollar.replace(/,/g, "").replace(/[^0-9.kmbKMB]/g, "");
  const match = cleaned.match(/^(\d*\.?\d*)([kmbKMB]?)/);

  if (!match) return "";

  const [, num, suffix = ""] = match;
  if (!num && !suffix) return "";

  return `${num}${suffix.toUpperCase()}`;
}

export function parseRevenueGoalToDollars(value: string): number | null {
  const normalized = normalizeRevenueGoalInput(value);
  if (!normalized) return null;

  const match = normalized.match(/^(\d+\.?\d*)([KMB])?$/);
  if (!match) return null;

  const amount = Number.parseFloat(match[1]);
  if (Number.isNaN(amount)) return null;

  const suffix = match[2];
  if (suffix === "B") return amount * 1_000_000_000;
  if (suffix === "M") return amount * 1_000_000;
  if (suffix === "K") return amount * 1_000;

  // Plain numbers under 1,000 are treated as millions (e.g. 50 → $50M).
  if (amount >= 1_000) return amount;
  return amount * 1_000_000;
}

function formatAbbreviatedAmount(value: number, suffix: "K" | "M" | "B"): string {
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, "");
  return `${text}${suffix}`;
}

/** Convert a revenue goal value to the best K / M / B abbreviation. */
export function abbreviateRevenueGoalInput(value: string): string {
  const dollars = parseRevenueGoalToDollars(value);
  if (dollars === null) return normalizeRevenueGoalInput(value);
  if (dollars === 0) return "0";

  if (dollars >= 1_000_000_000) {
    return formatAbbreviatedAmount(dollars / 1_000_000_000, "B");
  }
  if (dollars >= 1_000_000) {
    return formatAbbreviatedAmount(dollars / 1_000_000, "M");
  }
  if (dollars >= 1_000) {
    return formatAbbreviatedAmount(dollars / 1_000, "K");
  }

  return String(dollars);
}

export function isValidRevenueGoalInput(value: string): boolean {
  if (!value) return false;
  const dollars = parseRevenueGoalToDollars(value);
  return dollars !== null && dollars > 0;
}

export function formatRevenueGoalDisplay(value: string): string {
  if (!value) return "";
  const abbreviated = abbreviateRevenueGoalInput(value);
  return abbreviated.startsWith("$") ? abbreviated : `$${abbreviated}`;
}

export function parseRevenueGoalToMillions(value: string): number | null {
  const dollars = parseRevenueGoalToDollars(value);
  if (dollars === null) return null;
  return dollars / 1_000_000;
}
