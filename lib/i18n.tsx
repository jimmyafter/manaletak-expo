import React, { createContext, useContext, useMemo, useState } from "react";
import { getLocales } from "expo-localization";

export type Lang = "en" | "ms";

const S = {
  en: {
    tabCapture: "Add", tabFind: "Find", tabPlaces: "Places",
    capTitle: "Snap where you put it", capHint: "Take a photo of the item in its spot.",
    capShoot: "Take photo", capSkip: "Add without photo",
    capPermTitle: "Camera access needed", capPermBody: "Photos stay on your phone. We use the camera only to photograph where things go.",
    capPermBtn: "Allow camera", capMic: "Voice note (coming soon)",
    cfTitle: "Confirm", cfItem: "What is it?", cfItemPh: "e.g. Passport",
    cfPlace: "Where did you put it?", cfPlacePh: "Bilik tidur > Almari > Laci 2",
    cfPlaceHelp: "Separate levels with >", cfTags: "Tags (optional)", cfTagsPh: "penting, dokumen",
    cfSensitive: "Sensitive item", cfSensitiveHelp: "Hides the photo in lists (IDs, cards, medication, cash).",
    cfSave: "Save", cfNeedName: "Give it a name first.", cfCap: "You have reached 40 items on the free plan.",
    findLabel: "Search your things", findRecent: "Recently added", findEmpty: "Nothing found. Try another word.",
    findNone: "Nothing saved yet. Add your first item.", findSensitive: "Photo hidden",
    placesTitle: "Places", placesEmpty: "Rooms appear here after you save your first item.",
    items: (n: number) => (n === 1 ? "1 item" : `${n} items`), lang: "BM",
  },
  ms: {
    tabCapture: "Tambah", tabFind: "Cari", tabPlaces: "Tempat",
    capTitle: "Ambil gambar tempat simpan", capHint: "Ambil gambar barang di tempatnya.",
    capShoot: "Ambil gambar", capSkip: "Tambah tanpa gambar",
    capPermTitle: "Perlu akses kamera", capPermBody: "Gambar kekal dalam telefon anda. Kamera hanya digunakan untuk merakam tempat simpan.",
    capPermBtn: "Benarkan kamera", capMic: "Nota suara (akan datang)",
    cfTitle: "Sahkan", cfItem: "Apa barang ini?", cfItemPh: "cth. Pasport",
    cfPlace: "Di mana anda letak?", cfPlacePh: "Bilik tidur > Almari > Laci 2",
    cfPlaceHelp: "Asingkan peringkat dengan >", cfTags: "Tag (pilihan)", cfTagsPh: "penting, dokumen",
    cfSensitive: "Barang sensitif", cfSensitiveHelp: "Sembunyikan gambar dalam senarai (kad, dokumen, ubat, wang tunai).",
    cfSave: "Simpan", cfNeedName: "Sila namakan barang dahulu.", cfCap: "Anda sudah mencapai 40 barang dalam pelan percuma.",
    findLabel: "Cari barang anda", findRecent: "Baru ditambah", findEmpty: "Tiada hasil. Cuba perkataan lain.",
    findNone: "Belum ada apa-apa. Tambah barang pertama anda.", findSensitive: "Gambar disembunyikan",
    placesTitle: "Tempat", placesEmpty: "Bilik akan muncul di sini selepas anda simpan barang pertama.",
    items: (n: number) => `${n} barang`, lang: "EN",
  },
};
export type Strings = typeof S.en;

type Ctx = { lang: Lang; t: Strings; toggle: () => void };
const C = createContext<Ctx>({ lang: "en", t: S.en, toggle: () => {} });

function initialLang(): Lang {
  try {
    const code = getLocales()[0]?.languageCode ?? "en";
    return code === "ms" ? "ms" : "en";
  } catch {
    return "en";
  }
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const value = useMemo(
    () => ({ lang, t: S[lang] as Strings, toggle: () => setLang((l) => (l === "en" ? "ms" : "en")) }),
    [lang],
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useT = () => useContext(C);
