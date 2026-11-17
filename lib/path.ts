// Place paths look like "Bilik tidur > Almari > Laci 2".

export function normalizePath(raw: string): string[] {
  return raw
    .split(/[>›/]/)
    .map((s) => s.trim().replace(/\s+/g, " "))
    .filter((s) => s.length > 0);
}

export function joinPath(parts: string[]): string {
  return parts.join(" > ");
}

export function displayPath(pathText: string): string {
  return normalizePath(pathText).join(" › ");
}

export function roomOf(pathText: string): string {
  return normalizePath(pathText)[0] ?? "";
}

export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  for (const t of raw.split(/[,\n]/)) {
    const v = t.trim().toLowerCase();
    if (v) seen.add(v);
  }
  return [...seen];
}

export function nameOf(path: string): string {
  const p = normalizePath(path);
  return p[p.length - 1] ?? "";
}

export function parentOf(path: string): string {
  return joinPath(normalizePath(path).slice(0, -1));
}

/** True when pathText is base itself or somewhere inside it. */
export function isUnder(pathText: string, base: string): boolean {
  const p = normalizePath(pathText);
  const b = normalizePath(base);
  return b.length > 0 && b.length <= p.length && b.every((seg, i) => p[i] === seg);
}

/** Moves a path that sits under oldBase so it sits under newBase. Other paths are returned unchanged. */
export function replacePrefix(pathText: string, oldBase: string, newBase: string): string {
  if (!isUnder(pathText, oldBase)) return pathText;
  const p = normalizePath(pathText);
  const n = normalizePath(oldBase).length;
  return joinPath([...normalizePath(newBase), ...p.slice(n)]);
}

/** Names of the places directly inside base, in first-seen order, from a list of full paths. */
export function childNames(paths: string[], base: string): string[] {
  const depth = normalizePath(base).length;
  const out: string[] = [];
  for (const x of paths) {
    const p = normalizePath(x);
    if (p.length > depth && isUnder(x, base) && !out.includes(p[depth])) out.push(p[depth]);
  }
  return out;
}

export type PlaceEntry = { path: string; last: number; own: boolean };

/** Adds every parent of a saved place ("Bilik tidur", "Bilik tidur > Almari") so users can pick a level and drill down. */
export function withAncestors(entries: { path: string; last: number }[]): PlaceEntry[] {
  const map = new Map<string, PlaceEntry>();
  for (const e of entries) {
    const clean = joinPath(normalizePath(e.path));
    if (!clean) continue;
    const prev = map.get(clean);
    map.set(clean, { path: clean, last: Math.max(prev?.last ?? 0, e.last), own: true });
  }
  for (const e of [...map.values()]) {
    const parts = normalizePath(e.path);
    for (let n = 1; n < parts.length; n++) {
      const anc = joinPath(parts.slice(0, n));
      const prev = map.get(anc);
      if (!prev) map.set(anc, { path: anc, last: e.last, own: false });
      else if (prev.last < e.last) prev.last = e.last;
    }
  }
  return [...map.values()];
}

/**
 * Places to suggest while the user types. Empty query: most recently used places.
 * "Bil": places containing a word that starts with it. "Bilik tidur > ": what is inside Bilik tidur.
 */
export function suggestPlaces(entries: PlaceEntry[], query: string, limit = 6): string[] {
  const byRecent = [...entries].sort((a, b) => b.last - a.last || a.path.localeCompare(b.path));
  const q = query.trim();
  if (!q) return byRecent.filter((e) => e.own).slice(0, limit).map((e) => e.path);

  const typed = normalizePath(q);
  const current = joinPath(typed).toLowerCase();

  if (/[>›/]\s*$/.test(q)) {
    const depth = typed.length;
    return byRecent
      .filter((e) => isUnder(e.path, joinPath(typed)) && normalizePath(e.path).length > depth)
      .sort((a, b) => normalizePath(a.path).length - normalizePath(b.path).length)
      .slice(0, limit)
      .map((e) => e.path);
  }

  const words = q.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const lower = q.toLowerCase();
  const scored: { path: string; score: number; last: number }[] = [];
  for (const e of byRecent) {
    const pl = e.path.toLowerCase();
    if (pl === current) continue;
    const segs = normalizePath(e.path).map((x) => x.toLowerCase());
    const tokensOfPath = pl.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    if (!words.every((w) => tokensOfPath.some((tk) => tk.startsWith(w)))) continue;
    const score = pl.startsWith(lower) ? 0 : segs.some((sg) => sg.startsWith(lower)) ? 1 : 2;
    scored.push({ path: e.path, score, last: e.last });
  }
  return scored.sort((a, b) => a.score - b.score || b.last - a.last).slice(0, limit).map((x) => x.path);
}
