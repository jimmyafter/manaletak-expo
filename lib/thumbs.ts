// Pure helper: pick the newest few items of each room for the thumbnail strip on the Places cards.

export type ThumbRow = { room: string; cover_photo: string | null; sensitive: number };
export type Thumb = { photo: string | null; sensitive: boolean };

/** Rows must already be sorted newest first. Returns at most perRoom thumbnails for each room. */
export function pickThumbs(rows: ThumbRow[], perRoom = 3): Record<string, Thumb[]> {
  const out: Record<string, Thumb[]> = {};
  for (const r of rows) {
    if (!r.room) continue;
    const list = (out[r.room] ??= []);
    if (list.length < perRoom) list.push({ photo: r.sensitive ? null : r.cover_photo, sensitive: !!r.sensitive });
  }
  return out;
}
