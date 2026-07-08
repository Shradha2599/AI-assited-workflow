/**
 * Revenue goal input utilities — international number system.
 *
 * Typing behaviour:
 *   - Plain digits are formatted with commas as thousands separators (e.g. 50,000,000)
 *   - Shorthand suffixes K / M / B are still accepted as entry shortcuts
 *   - On blur / save, shorthands are expanded to their full comma-formatted value
 *
 * Display behaviour:
 *   - formatRevenueGoalDisplay() shows the abbreviated form ($50M) in prose messages
 *   - The input field itself always shows the comma-formatted full number
 */

// ── Parse helpers ─────────────────────────────────────────────────────────────

/** Strip commas and parse a possibly-suffixed string → raw dollars (or null). */
export function parseRevenueGoalToDollars(value: string): number | null {
  if (!value) return null;

  const cleaned = value.replace(/,/g, "").trim();
  const withoutDollar = cleaned.startsWith("$") ? cleaned.slice(1) : cleaned;

  const match = withoutDollar.match(/^(\d+\.?\d*)([kKmMbB]?)$/);
  if (!match) return null;

  const amount = parseFloat(match[1]);
  if (isNaN(amount) || amount <= 0) return null;

  const suffix = match[2].toUpperCase();
  if (suffix === "B") return amount * 1_000_000_000;
  if (suffix === "M") return amount * 1_000_000;
  if (suffix === "K") return amount * 1_000;
  return amount;
}

export function parseRevenueGoalToMillions(value: string): number | null {
  const dollars = parseRevenueGoalToDollars(value);
  if (dollars === null) return null;
  return dollars / 1_000_000;
}

// ── Formatting helpers ────────────────────────────────────────────────────────

/** Format a raw dollar number as an international comma-separated string. */
function intlFormat(dollars: number): string {
  // Remove trailing .0 but keep meaningful decimals
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(dollars);
  return formatted;
}

/**
 * Called on every keystroke.
 * - Strips any existing commas and the $ prefix
 * - If the raw string ends with K/M/B, let the user keep typing the shorthand
 *   (we don't expand while they're mid-entry)
 * - Otherwise format the digit portion with commas
 */
export function normalizeRevenueGoalInput(raw: string): string {
  if (!raw) return "";

  const stripped = raw.replace(/,/g, "").trim();
  const withoutDollar = stripped.startsWith("$") ? stripped.slice(1) : stripped;

  // Allow shorthand while typing (e.g. "50M", "1.5B")
  const shortMatch = withoutDollar.match(/^(\d*\.?\d*)([kKmMbB])$/);
  if (shortMatch) {
    return `${shortMatch[1]}${shortMatch[2].toUpperCase()}`;
  }

  // Plain digits — re-add commas
  const digitsOnly = withoutDollar.replace(/[^0-9.]/g, "");
  if (!digitsOnly) return "";

  // Split on decimal so we only comma-format the integer part
  const [intPart, ...decParts] = digitsOnly.split(".");
  const decPart = decParts.join(""); // at most one decimal point

  const intFormatted = intPart ? parseInt(intPart, 10).toLocaleString("en-US") : "";

  return decParts.length > 0 ? `${intFormatted}.${decPart}` : intFormatted;
}

/**
 * Called on blur / save.
 * Expands any shorthand (50M → 50,000,000) and applies full comma formatting.
 */
export function abbreviateRevenueGoalInput(value: string): string {
  const dollars = parseRevenueGoalToDollars(value);
  if (dollars === null) return normalizeRevenueGoalInput(value);
  if (dollars === 0) return "0";
  return intlFormat(dollars);
}

export function isValidRevenueGoalInput(value: string): boolean {
  if (!value) return false;
  const dollars = parseRevenueGoalToDollars(value);
  return dollars !== null && dollars > 0;
}

/**
 * Abbreviated form for use in prose messages only (e.g. "$50M away from goal").
 * Not shown in the input field itself.
 */
export function formatRevenueGoalDisplay(value: string): string {
  const dollars = parseRevenueGoalToDollars(value);
  if (dollars === null) return value ? `$${value}` : "";

  if (dollars >= 1_000_000_000) {
    const n = dollars / 1_000_000_000;
    return `$${n % 1 === 0 ? n : n.toFixed(1)}B`;
  }
  if (dollars >= 1_000_000) {
    const n = dollars / 1_000_000;
    return `$${n % 1 === 0 ? n : n.toFixed(1)}M`;
  }
  if (dollars >= 1_000) {
    const n = dollars / 1_000;
    return `$${n % 1 === 0 ? n : n.toFixed(1)}K`;
  }
  return `$${intlFormat(dollars)}`;
}
