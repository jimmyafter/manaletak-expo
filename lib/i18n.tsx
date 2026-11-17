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
    rmAll: "All", rmEdit: "Edit place", rmAddItem: "Add item here", rmEmpty: "Nothing here yet. Add the first item.",
    rmAddPlace: "Add place", rmInside: (n: number) => (n === 1 ? "1 place inside" : `${n} places inside`),
    plAdd: "Add place", plNewRoom: "New room",
    peTitle: "Edit place", peName: "Place name", peInside: "Places inside", peNoneInside: "No places inside yet.",
    peAddInside: "Add place inside", peMerge: "Merge into another room", peMergeHelp: "Everything moves into the room you pick.",
    peMergeTitle: "Merge rooms?", peMergeBody: (a: string, b: string) => `Move everything in "${a}" into "${b}"?`,
    peDelete: "Delete place", peDeleteTitle: "Delete this place?",
    peDeleteBody: (n: number) => `Your ${n} items are kept. They move up one level until you give them a new spot.`,
    peDeleteNote: "Deleting never removes your items.", peSave: "Save", peCancel: "Cancel", peNeedName: "Give the place a name first.",
    pnTitle: "New place", pnKind: "What are you adding?", pnRoom: "A room", pnRoomSub: "Top level, like Kitchen or Store room",
    pnInside: "Inside a place", pnInsideSub: "Like a cupboard, shelf or drawer", pnParent: "Which room?", pnName: "Place name",
    pnPh: "e.g. Garage", pnIdeas: "Ideas", pnSave: "Save place", pnNeedRoom: "Add a room first.",
    pnIdeaList: ["Garage", "Balcony", "Bathroom", "Car boot", "Office"], cancel: "Cancel",
    dtWhere: "Where it is", dtUpdated: (d: string) => `Updated ${d}`, dtMoved: "I moved it", dtEdit: "Edit", dtDelete: "Delete",
    dtMovedOnce: (from: string) => `Moved once. Before: ${from}`, dtMovedMany: (n: number, from: string) => `Moved ${n} times. Before: ${from}`,
    dtMoveTitle: "Where is it now?", dtMoveSave: "Save new place", dtShowPhoto: "Show photo", dtHidePhoto: "Hide photo",
    dtDeleteTitle: "Delete this item?", dtDeleteBody: "It will be removed from your list and search.", dtNotFound: "This item is no longer here.",
    dtNoPlace: "No place saved", dtSensitive: "Sensitive", dtPhotoHidden: "Sensitive: photo hidden",
    cfRecentPlaces: "Recent places", cfSuggestions: "Suggestions",
    cfRetake: "Retake photo", cfAddPhoto: "Add photo", rtHint: "Photograph the item in its spot.", rtTitle: "New photo",
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
    rmAll: "Semua", rmEdit: "Ubah tempat", rmAddItem: "Tambah barang di sini", rmEmpty: "Belum ada apa-apa di sini. Tambah barang pertama.",
    rmAddPlace: "Tambah tempat", rmInside: (n: number) => `${n} tempat di dalam`,
    plAdd: "Tambah tempat", plNewRoom: "Bilik baru",
    peTitle: "Ubah tempat", peName: "Nama tempat", peInside: "Tempat di dalam", peNoneInside: "Belum ada tempat di dalam.",
    peAddInside: "Tambah tempat di dalam", peMerge: "Gabung ke bilik lain", peMergeHelp: "Semua dipindah ke bilik yang anda pilih.",
    peMergeTitle: "Gabung bilik?", peMergeBody: (a: string, b: string) => `Pindahkan semua dalam "${a}" ke "${b}"?`,
    peDelete: "Padam tempat", peDeleteTitle: "Padam tempat ini?",
    peDeleteBody: (n: number) => `${n} barang anda dikekalkan. Ia naik satu peringkat sehingga anda beri tempat baru.`,
    peDeleteNote: "Memadam tidak membuang barang anda.", peSave: "Simpan", peCancel: "Batal", peNeedName: "Sila namakan tempat dahulu.",
    pnTitle: "Tempat baru", pnKind: "Apa yang anda tambah?", pnRoom: "Sebuah bilik", pnRoomSub: "Peringkat atas, macam Dapur atau Stor",
    pnInside: "Dalam sesuatu tempat", pnInsideSub: "Macam almari, rak atau laci", pnParent: "Bilik yang mana?", pnName: "Nama tempat",
    pnPh: "cth. Garaj", pnIdeas: "Cadangan", pnSave: "Simpan tempat", pnNeedRoom: "Tambah bilik dahulu.",
    pnIdeaList: ["Garaj", "Balkoni", "Bilik air", "Bonet kereta", "Pejabat"], cancel: "Batal",
    dtWhere: "Di mana", dtUpdated: (d: string) => `Dikemas kini ${d}`, dtMoved: "Dah alih", dtEdit: "Ubah", dtDelete: "Padam",
    dtMovedOnce: (from: string) => `Pernah dialih sekali. Dulu: ${from}`, dtMovedMany: (n: number, from: string) => `Dialih ${n} kali. Dulu: ${from}`,
    dtMoveTitle: "Di mana sekarang?", dtMoveSave: "Simpan tempat baru", dtShowPhoto: "Tunjuk gambar", dtHidePhoto: "Sembunyi gambar",
    dtDeleteTitle: "Padam barang ini?", dtDeleteBody: "Ia akan dibuang daripada senarai dan carian anda.", dtNotFound: "Barang ini sudah tiada.",
    dtNoPlace: "Tiada tempat disimpan", dtSensitive: "Sensitif", dtPhotoHidden: "Sensitif: gambar disembunyi",
    cfRecentPlaces: "Tempat terkini", cfSuggestions: "Cadangan",
    cfRetake: "Ambil gambar semula", cfAddPhoto: "Tambah gambar", rtHint: "Ambil gambar barang di tempatnya.", rtTitle: "Gambar baru",
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
