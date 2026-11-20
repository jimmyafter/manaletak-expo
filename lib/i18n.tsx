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
    cfSave: "Save", cfNeedName: "Give it a name first.", cfCap: "You have reached 20 items on the free plan.",
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
    obSkip: "Skip", obNext: "Next", obStart: "Get started", obCap0: "The photo is your memory cue", obStepOf: (n: number) => `Step ${n} of 3`,
    obQuote: "passport in the second drawer, bedroom cupboard", obHold: "Hold and talk", obResult: "Passport",
    obSteps: [
      { title: "Show it.", body: "Take a photo of the item where you put it. The spot is what you will remember." },
      { title: "Say it.", body: "Hold the mic and say where it goes, in Bahasa Malaysia, English or both." },
      { title: "Find it.", body: "Search or ask out loud. You get the photo of the spot and the exact place." },
    ],
    tcOn: "Turn the light on", tcOff: "Turn the light off",
    stTitle: "Settings", stGear: "Settings", stLang: "Language", stPlus: "Mana Letak Plus", stPlusSub: "Unlimited items and cloud backup. Coming soon.",
    plCap: (n: number, cap: number) => `${n} of ${cap} free items`, plCapSub: "Plus removes the limit", plSeePlus: "See Plus",
    puTitle: "Keep every item findable.", puBody: (cap: number) => `Free covers ${cap} items. Plus removes the limit and backs everything up.`,
    puB1: "Unlimited items", puB2: "Cloud backup, restore on a new phone", puB3: "150 AI captures and 600 AI searches a month", puB4: "Family sharing when it launches",
    puTrial: "7 DAYS FREE TRIAL", puYearly: "Yearly", puYearSub: "RM2.42 a month", puPerYear: "per year", puSave: "Save 38%",
    puMonthly: "Monthly", puMonthSub: "Cancel anytime", puPerMonth: "per month", puCta: "Subscribe now", puLater: "Maybe later",
    puFineYear: "7 days free, then RM29 a year. Billed by Google Play. Cancel anytime.", puFineMonth: "7 days free, then RM3.90 a month. Billed by Google Play. Cancel anytime.",
    puSoon: "Subscriptions are not open yet. We will tell you when they are.",
    stHelp: "Help and info", stIntro: "Show the intro again", stAbout: "About Mana Letak",
    abTitle: "About", abTagline: "Remember where you put things.", abVersion: (v: string) => `Version ${v}`,
    abPrivTitle: "Your things stay on your phone", abPrivBody: "Photos and items are saved on this phone. Nothing leaves it unless you turn on backup.",
    abMade: "Made in Malaysia", abCopy: "© 2026 Mana Letak",
    saveFailed: "Could not save",
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
    cfSave: "Simpan", cfNeedName: "Sila namakan barang dahulu.", cfCap: "Anda sudah mencapai 20 barang dalam pelan percuma.",
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
    obSkip: "Langkau", obNext: "Seterusnya", obStart: "Mula", obCap0: "Gambar ini peringatan anda", obStepOf: (n: number) => `Langkah ${n} daripada 3`,
    obQuote: "passport dalam laci kedua, almari bilik tidur", obHold: "Tekan dan cakap", obResult: "Pasport",
    obSteps: [
      { title: "Tunjuk.", body: "Ambil gambar barang di tempat anda simpan. Tempat itulah yang anda akan ingat." },
      { title: "Cakap.", body: "Tekan mikrofon dan sebut di mana ia disimpan, dalam BM, English atau campur." },
      { title: "Cari.", body: "Taip atau tanya dengan suara. Anda dapat gambar tempat dan lokasi tepat." },
    ],
    tcOn: "Hidupkan lampu", tcOff: "Matikan lampu",
    stTitle: "Tetapan", stGear: "Tetapan", stLang: "Bahasa", stPlus: "Mana Letak Plus", stPlusSub: "Barang tanpa had dan sandaran awan. Akan datang.",
    plCap: (n: number, cap: number) => `${n} daripada ${cap} barang percuma`, plCapSub: "Plus buang had ini", plSeePlus: "Lihat Plus",
    puTitle: "Semua barang mudah dicari.", puBody: (cap: number) => `Percuma sehingga ${cap} barang. Plus buang had dan sandarkan semuanya.`,
    puB1: "Barang tanpa had", puB2: "Sandaran awan, pulih pada telefon baharu", puB3: "150 tangkapan AI dan 600 carian AI sebulan", puB4: "Perkongsian keluarga apabila dilancarkan",
    puTrial: "PERCUBAAN PERCUMA 7 HARI", puYearly: "Tahunan", puYearSub: "RM2.42 sebulan", puPerYear: "setahun", puSave: "Jimat 38%",
    puMonthly: "Bulanan", puMonthSub: "Batal bila-bila masa", puPerMonth: "sebulan", puCta: "Langgan sekarang", puLater: "Mungkin kemudian",
    puFineYear: "7 hari percuma, kemudian RM29 setahun. Dibilkan oleh Google Play. Batal bila-bila masa.", puFineMonth: "7 hari percuma, kemudian RM3.90 sebulan. Dibilkan oleh Google Play. Batal bila-bila masa.",
    puSoon: "Langganan belum dibuka. Kami akan beritahu apabila ia dibuka.",
    stHelp: "Bantuan dan maklumat", stIntro: "Tunjuk pengenalan semula", stAbout: "Tentang Mana Letak",
    abTitle: "Tentang", abTagline: "Ingat di mana anda letak barang.", abVersion: (v: string) => `Versi ${v}`,
    abPrivTitle: "Barang anda kekal dalam telefon", abPrivBody: "Gambar dan barang disimpan dalam telefon ini. Tiada apa keluar kecuali anda hidupkan sandaran.",
    abMade: "Dibuat di Malaysia", abCopy: "© 2026 Mana Letak",
    saveFailed: "Gagal menyimpan",
    cfRecentPlaces: "Tempat terkini", cfSuggestions: "Cadangan",
    cfRetake: "Ambil gambar semula", cfAddPhoto: "Tambah gambar", rtHint: "Ambil gambar barang di tempatnya.", rtTitle: "Gambar baru",
    items: (n: number) => `${n} barang`, lang: "EN",
  },
};
export type Strings = typeof S.en;

type Ctx = { lang: Lang; t: Strings; toggle: () => void; setLang: (l: Lang) => void };
const C = createContext<Ctx>({ lang: "en", t: S.en, toggle: () => {}, setLang: () => {} });

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
    () => ({ lang, t: S[lang] as Strings, toggle: () => setLang((l) => (l === "en" ? "ms" : "en")), setLang }),
    [lang],
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useT = () => useContext(C);
