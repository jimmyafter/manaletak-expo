import { ScrollView, StyleSheet, Text, View } from "react-native";
import appJson from "../app.json";
import { useT } from "../lib/i18n";
import { color, font, radius } from "../lib/theme";

export default function About() {
  const { t } = useT();
  const version = appJson.expo.version;
  return (
    <ScrollView contentContainerStyle={s.body}>
      <View style={s.hero}>
        <Logo />
        <Text style={s.name}>Mana Letak</Text>
        <Text style={s.tagline}>{t.abTagline}</Text>
        <Text style={s.version}>{t.abVersion(version)}</Text>
      </View>

      <View style={s.note}>
        <Text style={{ fontSize: 22 }}>🔒</Text>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={s.noteTitle}>{t.abPrivTitle}</Text>
          <Text style={s.noteBody}>{t.abPrivBody}</Text>
        </View>
      </View>

      <Text style={s.made}>{t.abMade}{"\n"}{t.abCopy}</Text>
    </ScrollView>
  );
}

/** App logo: a location pin holding a small box, drawn with plain views. */
function Logo() {
  return (
    <View style={s.logo} accessibilityRole="image" accessibilityLabel="Mana Letak">
      <View style={s.pin} />
      <View style={s.box} />
    </View>
  );
}

const s = StyleSheet.create({
  body: { padding: 16, gap: 20 },
  hero: { alignItems: "center", gap: 10, paddingTop: 12 },
  logo: { width: 96, height: 96, borderRadius: 24, backgroundColor: color.accent, alignItems: "center", justifyContent: "center" },
  pin: { width: 46, height: 46, backgroundColor: color.ground, borderTopLeftRadius: 23, borderTopRightRadius: 23, borderBottomLeftRadius: 23, borderBottomRightRadius: 0, transform: [{ rotate: "45deg" }], marginTop: -6 },
  box: { position: "absolute", width: 20, height: 20, borderRadius: 5, backgroundColor: color.accent, marginTop: -10 },
  name: { marginTop: 6, fontSize: font.h1, fontWeight: "800", color: color.ink },
  tagline: { fontSize: font.body, color: color.ink2, textAlign: "center", maxWidth: 280, lineHeight: 23 },
  version: { fontSize: 13, fontWeight: "700", color: color.accentInk, backgroundColor: color.accentTint, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, overflow: "hidden" },
  note: { flexDirection: "row", gap: 12, padding: 16, borderRadius: radius.card, backgroundColor: color.sand, alignItems: "flex-start" },
  noteTitle: { fontSize: 15, fontWeight: "700", color: color.ink },
  noteBody: { fontSize: font.small, color: color.ink2, lineHeight: 20 },
  made: { textAlign: "center", fontSize: 13, color: color.ink2, lineHeight: 20 },
});
