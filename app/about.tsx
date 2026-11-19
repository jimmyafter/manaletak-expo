import { Image } from "expo-image";
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

/** The Mana Letak logo (assets/about-icon.png). It already spells out the name. */
function Logo() {
  return (
    <Image
      source={require("../assets/about-icon.png")}
      style={s.logo}
      contentFit="cover"
      accessibilityLabel="Mana Letak"
    />
  );
}

const s = StyleSheet.create({
  body: { padding: 16, gap: 20 },
  hero: { alignItems: "center", gap: 10, paddingTop: 12 },
  logo: { width: 144, height: 144, borderRadius: 32 },
  tagline: { fontSize: font.body, color: color.ink2, textAlign: "center", maxWidth: 280, lineHeight: 23 },
  version: { fontSize: 13, fontWeight: "700", color: color.accentInk, backgroundColor: color.accentTint, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, overflow: "hidden" },
  note: { flexDirection: "row", gap: 12, padding: 16, borderRadius: radius.card, backgroundColor: color.sand, alignItems: "flex-start" },
  noteTitle: { fontSize: 15, fontWeight: "700", color: color.ink },
  noteBody: { fontSize: font.small, color: color.ink2, lineHeight: 20 },
  made: { textAlign: "center", fontSize: 13, color: color.ink2, lineHeight: 20 },
});
