import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useT } from "../lib/i18n";
import { FREE_ITEM_CAP } from "../lib/quota";
import { Button } from "../lib/ui";
import { color, font, radius } from "../lib/theme";

/** Plus paywall. Billing is not wired yet, so Subscribe shows a "not open yet" note. */
export default function Plus() {
  const { t } = useT();
  const router = useRouter();
  const [plan, setPlan] = useState<"year" | "month">("year");
  const [soon, setSoon] = useState(false);
  const plans = [
    { key: "year" as const, title: t.puYearly, sub: t.puYearSub, price: "RM29", per: t.puPerYear, badge: true },
    { key: "month" as const, title: t.puMonthly, sub: t.puMonthSub, price: "RM3.90", per: t.puPerMonth, badge: false },
  ];
  return (
    <ScrollView contentContainerStyle={s.body}>
      <Text style={s.pill}>Mana Letak Plus</Text>
      <Text style={s.trial}>{t.puTrial}</Text>
      <Text style={s.h}>{t.puTitle}</Text>
      <Text style={s.p}>{t.puBody(FREE_ITEM_CAP)}</Text>
      <View style={{ gap: 12 }}>
        {[t.puB1, t.puB2, t.puB3, t.puB4].map((b) => (
          <View key={b} style={s.row}>
            <Text style={s.tick}>✓</Text>
            <Text style={s.benefit}>{b}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 12 }} accessibilityRole="radiogroup">
        {plans.map((p) => {
          const on = p.key === plan;
          return (
            <Pressable
              key={p.key} accessibilityRole="radio" accessibilityState={{ checked: on }}
              accessibilityLabel={`${p.title}, ${p.price} ${p.per}`} onPress={() => setPlan(p.key)}
              style={[s.plan, on ? s.planOn : s.planOff]}
            >
              <View style={s.radio}>{on ? <View style={s.dot} /> : null}</View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={s.row}>
                  <Text style={s.planTitle}>{p.title}</Text>
                  {p.badge ? <Text style={s.badge}>{t.puSave}</Text> : null}
                </View>
                <Text style={s.planSub}>{p.sub}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.price}>{p.price}</Text>
                <Text style={s.planSub}>{p.per}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={{ gap: 10 }}>
        <Button label={t.puCta} onPress={() => setSoon(true)} />
        {soon ? <Text style={s.soon}>{t.puSoon}</Text> : null}
        <Text style={s.fine}>{plan === "year" ? t.puFineYear : t.puFineMonth}</Text>
        <Button label={t.puLater} kind="ghost" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: 20, gap: 18 },
  pill: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: color.accentTint, color: color.accentInk, fontSize: 13, fontWeight: "700", overflow: "hidden" },
  trial: { alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: color.accent, color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 0.6, overflow: "hidden" },
  h: { fontSize: 32, fontWeight: "700", lineHeight: 36, color: color.ink },
  p: { fontSize: font.body, lineHeight: 24, color: color.ink2 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  tick: { width: 26, height: 26, borderRadius: 13, backgroundColor: color.accentTint, color: color.accentInk, textAlign: "center", lineHeight: 26, fontWeight: "800", overflow: "hidden" },
  benefit: { flex: 1, fontSize: font.body, fontWeight: "500", color: color.ink },
  plan: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.card, borderWidth: 2 },
  planOn: { borderColor: color.accent, backgroundColor: color.accentTint },
  planOff: { borderColor: color.line, backgroundColor: color.surface },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: color.fieldBorder, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: color.accent },
  planTitle: { fontSize: 17, fontWeight: "700", color: color.ink },
  planSub: { fontSize: 13, color: color.ink2 },
  price: { fontSize: font.title, fontWeight: "700", color: color.ink },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: color.accent, color: "#fff", fontSize: 12, fontWeight: "700", overflow: "hidden" },
  soon: { textAlign: "center", fontSize: font.small, color: color.amberInk, backgroundColor: color.amberBg, borderRadius: radius.field, padding: 12, overflow: "hidden" },
  fine: { textAlign: "center", fontSize: 13, lineHeight: 18, color: color.ink2 },
});
