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
