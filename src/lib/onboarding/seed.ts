/** Deterministic 32-bit hash from a partner / seller id. Stable across renders. */
export function hashPartnerId(partnerId: string): number {
  let hash = 0;
  for (let i = 0; i < partnerId.length; i++) {
    hash = (Math.imul(31, hash) + partnerId.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

/** Seeded pseudo-random in [0, 1). Same partner + salt always yields the same value. */
export function seededRandom(seed: number, salt: number): number {
  let s = (seed + Math.imul(salt, 9973)) >>> 0;
  s ^= s << 13;
  s ^= s >>> 17;
  s ^= s << 5;
  return (s >>> 0) / 0x1_0000_0000;
}

/** Pick an integer in [min, max] deterministically. */
export function seededInt(seed: number, salt: number, min: number, max: number): number {
  const r = seededRandom(seed, salt);
  return min + Math.floor(r * (max - min + 1));
}
