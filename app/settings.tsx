import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { type Lang, useT } from "../lib/i18n";
import { color, font, radius } from "../lib/theme";

export default function Settings() {
  const { t, lang, setLang } = useT();
  const router = useRouter();

  const langs: { key: Lang; label: string }[] = [
    { key: "en", label: "English" },
    { key: "ms", label: "Bahasa Malaysia" },
  ];

  return (
    <ScrollView contentContainerStyle={s.body}>
      <View style={{ gap: 8 }}>
        <Text style={s.sec}>{t.stLang}</Text>
        <View style={s.seg} accessibilityRole="radiogroup">
          {langs.map((l) => {
            const on = l.key === lang;
            return (
              <Pressable key={l.key} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setLang(l.key)} style={[s.segItem, on && s.segOn]}>
                <Text style={[s.segText, on && { color: color.accentInk }]}>{l.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={s.plus} accessible>
        <Text style={s.plusTitle}>{t.stPlus}</Text>
        <Text style={s.plusSub}>{t.stPlusSub}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={s.sec}>{t.stHelp}</Text>
        <View style={s.box}>
          <Row label={t.stIntro} onPress={() => router.push("/onboarding")} />
          <Row label={t.stAbout} onPress={() => router.push("/about")} last />
        </View>
      </View>
    </ScrollView>
  );
}

function Row({ label, onPress, last }: { label: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[s.row, !last && s.divider]}>
      <Text style={s.rowText}>{label}</Text>
      <Text style={s.chev}>›</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  body: { padding: 16, gap: 20 },
  sec: { fontSize: font.small, fontWeight: "700", color: color.ink2, marginHorizontal: 4 },
  seg: { flexDirection: "row", gap: 6, padding: 6, borderRadius: 28, backgroundColor: color.sand },
  segItem: { flex: 1, minHeight: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  segOn: { backgroundColor: color.surface },
  segText: { fontSize: 15, fontWeight: "700", color: color.ink2 },
  plus: { padding: 16, borderRadius: radius.card, backgroundColor: color.accent, gap: 2 },
  plusTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  plusSub: { fontSize: font.small, color: "#FFFFFF" },
  box: { borderWidth: 1, borderColor: color.line, borderRadius: radius.card, backgroundColor: color.surface, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", minHeight: 60, paddingHorizontal: 16, gap: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: color.line },
  rowText: { flex: 1, fontSize: font.body, fontWeight: "600", color: color.ink },
  chev: { fontSize: 24, color: color.ink2 },
});
