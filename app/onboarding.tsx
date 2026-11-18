import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "../lib/i18n";
import { useOnboarding } from "../lib/onboarding";
import { Button, LangPill } from "../lib/ui";
import { color, font, MIN_TOUCH, radius } from "../lib/theme";

const BARS = [14, 28, 44, 30, 52, 34, 46, 24, 16];

export default function Onboarding() {
  const { t, toggle } = useT();
  const { complete } = useOnboarding();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const last = step === 2;
  const cur = t.obSteps[step];

  const finish = async () => {
    await complete();
    router.replace("/");
  };

  return (
    <View style={[s.fill, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <View style={s.top}>
        <Pressable accessibilityRole="button" onPress={finish} style={s.skip}>
          <Text style={s.skipText}>{t.obSkip}</Text>
        </Pressable>
        <LangPill label={t.lang} onPress={toggle} />
      </View>

      <View style={s.art}>
        {step === 0 ? <ArtShow caption={t.obCap0} /> : null}
        {step === 1 ? <ArtSay quote={t.obQuote} hold={t.obHold} /> : null}
        {step === 2 ? <ArtFind name={t.obResult} /> : null}
      </View>

      <View style={s.copy}>
        <Text style={s.title} accessibilityRole="header">{cur.title}</Text>
        <Text style={s.body}>{cur.body}</Text>
      </View>

      <View style={s.dots} accessible accessibilityLabel={t.obStepOf(step + 1)}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? color.accent : color.fieldBorder }} />
        ))}
      </View>

      <Button label={last ? t.obStart : t.obNext} onPress={last ? finish : () => setStep(step + 1)} />
    </View>
  );
}

function ArtShow({ caption }: { caption: string }) {
  return (
    <View style={s.photo}>
      <View style={s.shelf}>
        <View style={s.shelfInner}>
          <View style={[s.passport, { transform: [{ rotate: "-6deg" }] }]}><View style={s.seal} /></View>
          <View style={[s.paper, { transform: [{ rotate: "5deg" }] }]} />
        </View>
      </View>
      <Text style={s.cap}>{caption}</Text>
    </View>
  );
}

function ArtSay({ quote, hold }: { quote: string; hold: string }) {
  return (
    <View style={s.sayWrap}>
      <View style={s.bubble}><Text style={s.quote}>“{quote}”</Text></View>
      <View style={s.bars}>
        {BARS.map((h, i) => <View key={i} style={{ width: 6, height: h, borderRadius: 3, backgroundColor: color.accentInk }} />)}
      </View>
      <View style={s.mic}><Text style={{ fontSize: 34 }}>🎤</Text></View>
      <Text style={s.holdText}>{hold}</Text>
    </View>
  );
}

function ArtFind({ name }: { name: string }) {
  return (
    <View style={s.result}>
      <View style={[s.photo, { height: 150, borderRadius: 0, backgroundColor: "#8B6F4E" }]}>
        <View style={[s.passport, { transform: [{ rotate: "-6deg" }], height: 90, width: 64 }]}><View style={s.seal} /></View>
      </View>
      <View style={{ padding: 16, gap: 6 }}>
        <Text style={s.resName}>{name}</Text>
        <Text style={s.resPath}>📍 Bilik tidur › Almari › Laci 2</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.ground, paddingHorizontal: 24, gap: 20 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  skip: { minHeight: MIN_TOUCH, minWidth: MIN_TOUCH, justifyContent: "center" },
  skipText: { fontSize: 15, fontWeight: "600", color: color.ink2 },
  art: { flex: 1, justifyContent: "center" },
  copy: { gap: 10 },
  title: { fontSize: 32, fontWeight: "800", color: color.ink, lineHeight: 36 },
  body: { fontSize: font.body, color: color.ink2, lineHeight: 24 },
  dots: { flexDirection: "row", alignItems: "center", gap: 6, height: 8 },
  photo: { height: 280, borderRadius: radius.pill, backgroundColor: "#C9B79C", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  shelf: { width: "88%", height: "70%", borderRadius: 14, backgroundColor: "#8B6F4E", padding: 12 },
  shelfInner: { flex: 1, borderRadius: 8, backgroundColor: "#6B5238", flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 16 },
  passport: { width: 84, height: 110, borderRadius: 7, backgroundColor: "#1F3A5F", alignItems: "center", justifyContent: "center" },
  seal: { width: 30, height: 30, borderRadius: 15, borderWidth: 3, borderColor: "#D9B34A" },
  paper: { width: 100, height: 62, borderRadius: 5, backgroundColor: "#E9E2D3" },
  cap: { position: "absolute", left: 16, bottom: 16, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: "rgba(31,27,22,0.82)", color: "#FFFFFF", fontSize: 14, fontWeight: "600", overflow: "hidden" },
  sayWrap: { alignItems: "center", gap: 20 },
  bubble: { padding: 16, borderRadius: 20, backgroundColor: color.sand, alignSelf: "stretch" },
  quote: { fontSize: font.body, fontWeight: "500", color: color.ink, lineHeight: 23 },
  bars: { flexDirection: "row", alignItems: "center", gap: 6, height: 56 },
  mic: { width: 88, height: 88, borderRadius: 44, backgroundColor: color.accent, alignItems: "center", justifyContent: "center" },
  holdText: { fontSize: font.small, fontWeight: "600", color: color.ink2 },
  result: { borderRadius: radius.card, borderWidth: 1, borderColor: color.line, backgroundColor: color.surface, overflow: "hidden" },
  resName: { fontSize: font.title, fontWeight: "800", color: color.ink },
  resPath: { fontSize: font.body, fontWeight: "600", color: color.accentInk },
});
