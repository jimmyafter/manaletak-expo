// Pure search helpers. No imports so they can be tested with plain Node.

/** Split on anything that is not a letter or number, lowercase, drop blanks. */
export function tokens(raw: string): string[] {
  return raw
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 0);
}

/** FTS5 MATCH string with prefix matching: "kunci rumah" -> "kunci* rumah*". Null when empty. */
export function toFtsMatch(raw: string): string | null {
  const words = tokens(raw);
  return words.length === 0 ? null : words.map((w) => `${w}*`).join(" ");
}

/** LIKE pattern fallback. Strips wildcard characters the user typed. */
export function likeName(raw: string): string {
  return "%" + raw.trim().toLowerCase().replace(/[%_]/g, "") + "%";
}

/** Name matches rank above tag/path matches. Lower score is better. */
export function rankScore(name: string, query: string): number {
  const q = tokens(query);
  const n = name.toLowerCase();
  if (q.length === 0) return 3;
  if (n === q.join(" ")) return 0;
  if (q.every((t) => n.includes(t))) return 1;
  return 2;
}
