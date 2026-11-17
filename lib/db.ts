import * as SQLite from "expo-sqlite";

export type Item = {
  id: string; name: string; path_text: string; room: string; tags: string;
  sensitive: number; cover_photo: string | null; created_at: number; updated_at: number;
};

// One shared promise: several screens ask for the database at the same moment on first launch,
// and opening + setting it up more than once at the same time can fail with "database is locked".
let _ready: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_ready) {
    _ready = openAndMigrate().catch((e) => {
      _ready = null; // let the next call try again
      throw e;
    });
  }
  return _ready;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("manaletak.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
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
    CREATE TABLE IF NOT EXISTS item_moves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT NOT NULL,
      from_path TEXT NOT NULL,
      to_path TEXT NOT NULL,
      moved_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_moves_item ON item_moves(item_id);
    CREATE TABLE IF NOT EXISTS places (
      path TEXT PRIMARY KEY NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  // FTS5 is created separately: if a device build lacks it, search falls back to LIKE.
  try {
    await db.execAsync(
      `CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(id UNINDEXED, name, tags, path_text, tokenize='unicode61');`,
    );
  } catch {
    /* fall back to LIKE */
  }
  return db;
}
