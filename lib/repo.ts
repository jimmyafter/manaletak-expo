import { randomUUID } from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import { getDb, type Item } from "./db";
import { likeName, rankScore, toFtsMatch } from "./search";
import { normalizePath, joinPath, parseTags } from "./path";

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
  return db.getAllAsync<{ room: string; n: number }>(
    `SELECT room, COUNT(*) AS n FROM items WHERE deleted=0 AND room<>'' GROUP BY room ORDER BY n DESC, room`,
  );
}
