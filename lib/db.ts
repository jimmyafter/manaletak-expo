import * as SQLite from "expo-sqlite";

export type Item = {
  id: string; name: string; path_text: string; room: string; tags: string;
  sensitive: number; cover_photo: string | null; created_at: number; updated_at: number;
};

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  const db = await SQLite.openDatabaseAsync("manaletak.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      path_text TEXT NOT NULL DEFAULT '',
      room TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '',
      sensitive INTEGER NOT NULL DEFAULT 0,
      cover_photo TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_items_room ON items(room, deleted);
  `);
  // FTS5 is created separately: if a device build lacks it, search falls back to LIKE.
  try {
    await db.execAsync(
      `CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(id UNINDEXED, name, tags, path_text, tokenize='unicode61');`,
    );
  } catch {
    /* fall back to LIKE */
  }
  _db = db;
  return db;
}
