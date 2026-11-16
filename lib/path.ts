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
