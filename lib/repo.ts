import { randomUUID } from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import { getDb, type Item } from "./db";
import { pickThumbs, type Thumb } from "./thumbs";
import { likeName, rankScore, toFtsMatch } from "./search";
import { normalizePath, joinPath, parseTags, roomOf, isUnder, replacePrefix, parentOf, childNames, withAncestors, type PlaceEntry } from "./path";

export type NewItem = { name: string; place: string; tags: string; sensitive: boolean; photoUri: string | null };

const photosDir = () => new Directory(Paths.document, "photos");

export function photoUri(name: string | null): string | null {
  return name ? new File(photosDir(), name).uri : null;
}

function storePhoto(srcUri: string): string {
  const dir = photosDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const name = `${randomUUID()}.jpg`;
  new File(srcUri).copy(new File(dir, name));
  return name;
}

export async function saveItem(input: NewItem): Promise<string> {
  const db = await getDb();
  const parts = normalizePath(input.place);
  const pathText = joinPath(parts);
  const tags = parseTags(input.tags).join(",");
  const id = randomUUID();
  const now = Date.now();
  const cover = input.photoUri ? storePhoto(input.photoUri) : null;
  await db.runAsync(
    `INSERT INTO items (id,name,path_text,room,tags,sensitive,cover_photo,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, input.name.trim(), pathText, parts[0] ?? "", tags, input.sensitive ? 1 : 0, cover, now, now],
  );
  try {
    await db.runAsync(`INSERT INTO items_fts (id,name,tags,path_text) VALUES (?,?,?,?)`, [
      id, input.name.trim(), tags.replace(/,/g, " "), pathText,
    ]);
  } catch {
    /* LIKE fallback covers it */
  }
  return id;
}

export async function activeCount(): Promise<number> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM items WHERE deleted=0`);
  return r?.n ?? 0;
}

export async function recent(limit = 20): Promise<Item[]> {
  const db = await getDb();
  return db.getAllAsync<Item>(`SELECT * FROM items WHERE deleted=0 ORDER BY created_at DESC LIMIT ?`, [limit]);
}

export async function search(raw: string): Promise<Item[]> {
  const match = toFtsMatch(raw);
  if (!match) return [];
  const db = await getDb();
  let rows: Item[] = [];
  try {
    rows = await db.getAllAsync<Item>(
      `SELECT i.* FROM items_fts f JOIN items i ON i.id=f.id
       WHERE items_fts MATCH ? AND i.deleted=0 LIMIT 50`,
      [match],
    );
  } catch {
    const p = likeName(raw);
    rows = await db.getAllAsync<Item>(
      `SELECT * FROM items WHERE deleted=0 AND (lower(name) LIKE ? OR lower(tags) LIKE ? OR lower(path_text) LIKE ?) LIMIT 50`,
      [p, p, p],
    );
  }
  return rows.sort((a, b) => rankScore(a.name, raw) - rankScore(b.name, raw) || b.created_at - a.created_at);
}

export async function roomSummaries(): Promise<{ room: string; n: number }[]> {
  const db = await getDb();
  const counts = await db.getAllAsync<{ room: string; n: number }>(
    `SELECT room, COUNT(*) AS n FROM items WHERE deleted=0 AND room<>'' GROUP BY room`,
  );
  const saved = await db.getAllAsync<{ path: string }>(`SELECT path FROM places`);
  const map = new Map<string, number>(counts.map((c) => [c.room, c.n]));
  for (const p of saved) {
    const r = roomOf(p.path);
    if (r && !map.has(r)) map.set(r, 0);
  }
  return [...map.entries()].map(([room, n]) => ({ room, n })).sort((a, b) => b.n - a.n || a.room.localeCompare(b.room));
}

async function allPaths(): Promise<string[]> {
  const db = await getDb();
  const a = await db.getAllAsync<{ p: string }>(`SELECT DISTINCT path_text AS p FROM items WHERE deleted=0 AND path_text<>''`);
  const b = await db.getAllAsync<{ p: string }>(`SELECT path AS p FROM places`);
  return [...a, ...b].map((r) => r.p);
}

/** All items at or inside a place, newest first. */
export async function itemsUnder(base: string): Promise<Item[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Item>(
    `SELECT * FROM items WHERE deleted=0 AND room=? ORDER BY created_at DESC`,
    [roomOf(base)],
  );
  return rows.filter((r) => isUnder(r.path_text, base));
}

/** Places directly inside base with their item counts. */
export async function childrenOf(base: string): Promise<{ name: string; n: number }[]> {
  const names = childNames(await allPaths(), base);
  const items = await itemsUnder(base);
  return names.map((name) => {
    const path = joinPath([...normalizePath(base), name]);
    return { name, n: items.filter((i) => isUnder(i.path_text, path)).length };
  });
}

export async function addPlace(path: string): Promise<void> {
  const clean = joinPath(normalizePath(path));
  if (!clean) return;
  const db = await getDb();
  await db.runAsync(`INSERT OR IGNORE INTO places (path, created_at) VALUES (?,?)`, [clean, Date.now()]);
}

async function reindex(item: { id: string; name: string; tags: string }, pathText: string) {
  const db = await getDb();
  try {
    await db.runAsync(`DELETE FROM items_fts WHERE id=?`, [item.id]);
    await db.runAsync(`INSERT INTO items_fts (id,name,tags,path_text) VALUES (?,?,?,?)`, [
      item.id, item.name, item.tags.replace(/,/g, " "), pathText,
    ]);
  } catch {
    /* LIKE fallback covers it */
  }
}

/** Rename or merge a place. Everything inside it moves too. Renaming onto an existing place merges them. */
export async function renamePlace(oldPath: string, newPath: string): Promise<void> {
  const from = joinPath(normalizePath(oldPath));
  const to = joinPath(normalizePath(newPath));
  if (!from || !to || from === to) return;
  const db = await getDb();
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    const items = await db.getAllAsync<Item>(`SELECT * FROM items WHERE deleted=0 AND room=?`, [roomOf(from)]);
    for (const it of items) {
      if (!isUnder(it.path_text, from)) continue;
      const np = replacePrefix(it.path_text, from, to);
      await db.runAsync(`UPDATE items SET path_text=?, room=?, updated_at=? WHERE id=?`, [np, roomOf(np), now, it.id]);
      await reindex(it, np);
    }
    const saved = await db.getAllAsync<{ path: string }>(`SELECT path FROM places`);
    for (const p of saved) {
      if (!isUnder(p.path, from)) continue;
      await db.runAsync(`DELETE FROM places WHERE path=?`, [p.path]);
      await db.runAsync(`INSERT OR IGNORE INTO places (path, created_at) VALUES (?,?)`, [replacePrefix(p.path, from, to), now]);
    }
    // keep the renamed place itself even when it is empty
    await db.runAsync(`INSERT OR IGNORE INTO places (path, created_at) VALUES (?,?)`, [to, now]);
  });
}

/** Delete a place. Items are kept and move up to the parent place ("No place" for a top-level room). */
export async function deletePlace(path: string): Promise<void> {
  const base = joinPath(normalizePath(path));
  if (!base) return;
  const parent = parentOf(base);
  const db = await getDb();
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    const items = await db.getAllAsync<Item>(`SELECT * FROM items WHERE deleted=0 AND room=?`, [roomOf(base)]);
    for (const it of items) {
      if (!isUnder(it.path_text, base)) continue;
      await db.runAsync(`UPDATE items SET path_text=?, room=?, updated_at=? WHERE id=?`, [parent, roomOf(parent), now, it.id]);
      await reindex(it, parent);
    }
    const saved = await db.getAllAsync<{ path: string }>(`SELECT path FROM places`);
    for (const p of saved) if (isUnder(p.path, base)) await db.runAsync(`DELETE FROM places WHERE path=?`, [p.path]);
  });
}

export async function getItem(id: string): Promise<Item | null> {
  const db = await getDb();
  return (await db.getFirstAsync<Item>(`SELECT * FROM items WHERE id=? AND deleted=0`, [id])) ?? null;
}

export async function moveCount(id: string): Promise<{ n: number; lastFrom: string }> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ from_path: string }>(
    `SELECT from_path FROM item_moves WHERE item_id=? ORDER BY moved_at DESC, id DESC`,
    [id],
  );
  return { n: rows.length, lastFrom: rows[0]?.from_path ?? "" };
}

/** Change where an item is. Keeps a history row so the detail screen can say where it used to be. */
export async function moveItem(id: string, place: string): Promise<void> {
  const db = await getDb();
  const it = await getItem(id);
  if (!it) return;
  const parts = normalizePath(place);
  const to = joinPath(parts);
  if (to === it.path_text) return;
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    await db.runAsync(`UPDATE items SET path_text=?, room=?, updated_at=? WHERE id=?`, [to, parts[0] ?? "", now, id]);
    await db.runAsync(`INSERT INTO item_moves (item_id, from_path, to_path, moved_at) VALUES (?,?,?,?)`, [id, it.path_text, to, now]);
    await reindex(it, to);
  });
}

export async function updateItem(id: string, input: { name: string; place: string; tags: string; sensitive: boolean }): Promise<void> {
  const db = await getDb();
  const it = await getItem(id);
  if (!it) return;
  const tags = parseTags(input.tags).join(",");
  const name = input.name.trim();
  await db.runAsync(`UPDATE items SET name=?, tags=?, sensitive=?, updated_at=? WHERE id=?`, [name, tags, input.sensitive ? 1 : 0, Date.now(), id]);
  await reindex({ id, name, tags }, it.path_text);
  await moveItem(id, input.place);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE items SET deleted=1, updated_at=? WHERE id=?`, [Date.now(), id]);
  try { await db.runAsync(`DELETE FROM items_fts WHERE id=?`, [id]); } catch { /* ignore */ }
}

/** Every place the user has used or saved, with when it was last used. For the place suggestions. */
export async function placeEntries(): Promise<PlaceEntry[]> {
  const db = await getDb();
  const used = await db.getAllAsync<{ p: string; last: number }>(
    `SELECT path_text AS p, MAX(updated_at) AS last FROM items WHERE deleted=0 AND path_text<>'' GROUP BY path_text`,
  );
  const saved = await db.getAllAsync<{ p: string; last: number }>(`SELECT path AS p, created_at AS last FROM places`);
  return withAncestors([...used, ...saved].map((r) => ({ path: r.p, last: r.last })));
}

/** Swap an item's cover photo for a new one. The old file is deleted. */
export async function replacePhoto(id: string, srcUri: string): Promise<void> {
  const db = await getDb();
  const it = await getItem(id);
  if (!it) return;
  const name = storePhoto(srcUri);
  await db.runAsync(`UPDATE items SET cover_photo=?, updated_at=? WHERE id=?`, [name, Date.now(), id]);
  if (it.cover_photo) {
    try {
      const old = new File(photosDir(), it.cover_photo);
      if (old.exists) old.delete();
    } catch {
      /* leaving an orphan file is harmless */
    }
  }
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ value: string }>(`SELECT value FROM settings WHERE key=?`, [key]);
  return r?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`, [key, value]);
}

/** Up to 3 newest items per room, for the thumbnail strip on the Places cards. Sensitive items never expose a photo. */
export async function roomThumbs(): Promise<Record<string, Thumb[]>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ room: string; cover_photo: string | null; sensitive: number }>(
    `SELECT room, cover_photo, sensitive FROM items WHERE deleted=0 AND room<>'' ORDER BY created_at DESC`,
  );
  return pickThumbs(rows, 3);
}
