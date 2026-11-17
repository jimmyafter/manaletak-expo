import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useKeyboardHeight } from "../lib/keyboard";
import { useT } from "../lib/i18n";
import { joinPath, normalizePath } from "../lib/path";
import { addPlace, roomSummaries } from "../lib/repo";
import { Button } from "../lib/ui";
import { color, font, radius } from "../lib/theme";

export default function PlaceNew() {
  const { t } = useT();
  const router = useRouter();
  const kb = useKeyboardHeight();
  const { parent: fixedParent } = useLocalSearchParams<{ parent?: string }>();
  const fixed = fixedParent ? joinPath(normalizePath(String(fixedParent))) : "";

  const [kind, setKind] = useState<"room" | "inside">(fixed ? "inside" : "room");
  const [rooms, setRooms] = useState<string[]>([]);
  const [parent, setParent] = useState<string>(fixed);
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    roomSummaries().then((r) => {
      const names = r.map((x) => x.room);
      setRooms(names);
      setParent((p) => p || names[0] || "");
    });
  }, []));

  const save = async () => {
    const clean = name.trim().replace(/[>›/]/g, " ").replace(/\s+/g, " ").trim();
    if (!clean) return setErr(t.peNeedName);
    if (kind === "inside" && !parent) return setErr(t.pnNeedRoom);
    await addPlace(kind === "room" ? clean : joinPath([...normalizePath(parent), clean]));
    router.back();
  };

  const kinds = [
    { key: "room" as const, title: t.pnRoom, sub: t.pnRoomSub },
    { key: "inside" as const, title: t.pnInside, sub: t.pnInsideSub },
  ];

  return (
    <ScrollView contentContainerStyle={[s.body, { paddingBottom: 48 + kb }]} keyboardShouldPersistTaps="handled">
      {!fixed ? (
        <View style={{ gap: 8 }}>
          <Text style={s.label}>{t.pnKind}</Text>
          {kinds.map((k) => {
            const on = kind === k.key;
            return (
              <Pressable key={k.key} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setKind(k.key)} style={[s.kind, on && s.kindOn]}>
                <View style={[s.ring, { borderColor: on ? color.accent : color.fieldBorder }]}>{on ? <View style={s.dot} /> : null}</View>
                <View style={{ flex: 1 }}>
                  <Text style={s.kindTitle}>{k.title}</Text>
                  <Text style={s.help}>{k.sub}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text style={s.label}>{t.pnInside}: {fixed.replace(/ > /g, " › ")}</Text>
      )}

      {!fixed && kind === "inside" ? (
        <View style={{ gap: 8 }}>
          <Text style={s.label}>{t.pnParent}</Text>
          <View style={s.chips}>
            {rooms.map((r) => {
              const on = r === parent;
              return (
                <Pressable key={r} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setParent(r)} style={[s.chip, on && s.chipOn]}>
                  <Text style={[s.chipText, on && { color: color.accentInk }]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={{ gap: 6 }}>
        <Text style={s.label}>{t.pnName}</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder={t.pnPh} placeholderTextColor={color.ink2} accessibilityLabel={t.pnName} />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={s.label}>{t.pnIdeas}</Text>
        <View style={s.chips}>
          {t.pnIdeaList.map((d) => (
            <Pressable key={d} accessibilityRole="button" onPress={() => setName(d)} style={s.idea}>
              <Text style={s.ideaText}>{d}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {err ? <Text style={s.err} accessibilityRole="alert">{err}</Text> : null}
      <Button label={t.pnSave} onPress={save} />
      <Button label={t.cancel} kind="ghost" onPress={() => router.back()} />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  body: { padding: 16, gap: 20 },
  label: { fontSize: font.body, fontWeight: "700", color: color.ink },
  help: { fontSize: font.small, color: color.ink2 },
  input: { minHeight: 52, borderWidth: 1.5, borderColor: color.fieldBorder, borderRadius: radius.field, paddingHorizontal: 16, fontSize: font.body, color: color.ink, backgroundColor: color.surface },
  kind: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.card, borderWidth: 1, borderColor: color.line, backgroundColor: color.surface },
  kindOn: { borderWidth: 2, borderColor: color.accent, backgroundColor: color.accentTint },
  kindTitle: { fontSize: font.body, fontWeight: "700", color: color.ink },
  ring: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.accent },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1.5, borderColor: color.fieldBorder, backgroundColor: color.surface, alignItems: "center", justifyContent: "center" },
  chipOn: { backgroundColor: color.accentTint, borderColor: color.accent },
  chipText: { fontSize: font.small, fontWeight: "600", color: color.ink },
  idea: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, backgroundColor: color.accentTint, alignItems: "center", justifyContent: "center" },
  ideaText: { fontSize: font.small, fontWeight: "600", color: color.accentInk },
  err: { color: color.danger, fontSize: font.body, fontWeight: "600" },
});
