import test from "node:test";
import assert from "node:assert/strict";
import { tokens, toFtsMatch, likeName, rankScore } from "../lib/search.ts";
import { normalizePath, joinPath, displayPath, roomOf, parseTags } from "../lib/path.ts";
import { atFreeCap, FREE_ITEM_CAP } from "../lib/quota.ts";

test("tokens split on punctuation and keep accents/digits", () => {
  assert.deepEqual(tokens("Kunci-Rumah, laci 2!"), ["kunci", "rumah", "laci", "2"]);
  assert.deepEqual(tokens("  "), []);
});

test("toFtsMatch builds prefix query and returns null when empty", () => {
  assert.equal(toFtsMatch("kunci rumah"), "kunci* rumah*");
  assert.equal(toFtsMatch('"*()'), null);
});

test("likeName strips wildcards", () => {
  assert.equal(likeName(" 50%_Off "), "%50off%");
});

test("rankScore puts exact name before partial before other", () => {
  assert.equal(rankScore("Passport", "passport"), 0);
  assert.equal(rankScore("Passport lama", "passport"), 1);
  assert.equal(rankScore("Dokumen", "passport"), 2);
});

test("normalizePath handles >, › and extra spaces", () => {
  assert.deepEqual(normalizePath(" Bilik  tidur > Almari ›  Laci 2 "), ["Bilik tidur", "Almari", "Laci 2"]);
  assert.equal(joinPath(["A", "B"]), "A > B");
  assert.equal(displayPath("A > B"), "A › B");
  assert.equal(roomOf("Dapur > Kabinet"), "Dapur");
  assert.equal(roomOf(""), "");
});

test("parseTags lowercases and dedupes", () => {
  assert.deepEqual(parseTags("Penting, penting\nKunci"), ["penting", "kunci"]);
});

test("free cap is 40 items and Plus is unlimited", () => {
  assert.equal(atFreeCap(FREE_ITEM_CAP - 1, false), false);
  assert.equal(atFreeCap(FREE_ITEM_CAP, false), true);
  assert.equal(atFreeCap(999, true), false);
});

import { isUnder, replacePrefix, parentOf, nameOf, childNames } from "../lib/path.ts";

test("isUnder matches the place itself and anything inside, not look-alikes", () => {
  assert.equal(isUnder("Bilik tidur > Almari > Laci 2", "Bilik tidur"), true);
  assert.equal(isUnder("Bilik tidur", "Bilik tidur"), true);
  assert.equal(isUnder("Bilik tidur anak", "Bilik tidur"), false);
  assert.equal(isUnder("Dapur", "Bilik tidur"), false);
  assert.equal(isUnder("Dapur", ""), false);
});

test("replacePrefix renames a room and everything inside it", () => {
  assert.equal(replacePrefix("Stor > Rak 1", "Stor", "Gudang"), "Gudang > Rak 1");
  assert.equal(replacePrefix("Stor", "Stor", "Gudang"), "Gudang");
  assert.equal(replacePrefix("Dapur > Kabinet", "Stor", "Gudang"), "Dapur > Kabinet");
});

test("replacePrefix can rename a place in the middle of a path and merge rooms", () => {
  assert.equal(replacePrefix("Bilik tidur > Almari > Laci 2", "Bilik tidur > Almari", "Bilik tidur > Wardrobe"), "Bilik tidur > Wardrobe > Laci 2");
  assert.equal(replacePrefix("Stor > Rak 1", "Stor", "Dapur"), "Dapur > Rak 1");
});

test("parentOf and nameOf", () => {
  assert.equal(parentOf("A > B > C"), "A > B");
  assert.equal(parentOf("A"), "");
  assert.equal(nameOf("A > B > C"), "C");
  assert.equal(nameOf(""), "");
});

test("childNames lists direct children only, once each", () => {
  const paths = ["Bilik tidur > Almari > Laci 1", "Bilik tidur > Almari > Laci 2", "Bilik tidur > Meja", "Bilik tidur", "Dapur > Kabinet"];
  assert.deepEqual(childNames(paths, "Bilik tidur"), ["Almari", "Meja"]);
  assert.deepEqual(childNames(paths, "Bilik tidur > Almari"), ["Laci 1", "Laci 2"]);
  assert.deepEqual(childNames(paths, "Stor"), []);
});
