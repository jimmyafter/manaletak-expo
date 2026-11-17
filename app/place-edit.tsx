import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useKeyboardHeight } from "../lib/keyboard";
import { useT } from "../lib/i18n";
import { joinPath, nameOf, normalizePath } from "../lib/path";
import { childrenOf, deletePlace, itemsUnder, renamePlace, roomSummaries } from "../lib/repo";
import { Button } from "../lib/ui";
import { color, font, MIN_TOUCH, radius } from "../lib/theme";

export default function PlaceEdit() {
  const { t } = useT();
  const router = useRouter();
  const kb = useKeyboardHeight();
  const { path: raw } = useLocalSearchParams<{ path: string }>();
  const path = joinPath(normalizePath(String(raw ?? "")));
  const parts = normalizePath(path);
  const isRoom = parts.length === 1;

  const [name, setName] = useState(nameOf(path));
  const [err, setErr] = useState<string | null>(null);
  const [kids, setKids] = useState<{ name: string; n: number }[]>([]);
  const [count, setCount] = useState(0);
  const [others, setOthers] = useState<string[]>([]);

  useFocusEffect(useCallback(() => {
    childrenOf(path).then(setKids);
    itemsUnder(path).then((r) => setCount(r.length));
    if (isRoom) roomSummaries().then((r) => setOthers(r.map((x) => x.room).filter((x) => x !== path)));
  }, [path, isRoom]));

  const backToPlaces = () => { router.dismissAll(); router.replace("/places"); };

  const save = async () => {
    const clean = name.trim().replace(/[>›/]/g, " ").replace(/\s+/g, " ").trim();
    if (!clean) return setErr(t.peNeedName);
    await renamePlace(path, joinPath([...parts.slice(0, -1), clean]));
    backToPlaces();
  };

  const merge = (target: string) =>
    Alert.alert(t.peMergeTitle, t.peMergeBody(path, target), [
      { text: t.peCancel, style: "cancel" },
      { text: t.peMerge, onPress: async () => { await renamePlace(path, target); backToPlaces(); } },
    ]);

  const remove = () =>
    Alert.alert(t.peDeleteTitle, t.peDeleteBody(count), [
      { text: t.peCancel, style: "cancel" },
      { text: t.peDelete, style: "destructive", onPress: async () => { await deletePlace(path); backToPlaces(); } },
    ]);

  return (
    <ScrollView contentContainerStyle={[s.body, { paddingBottom: 48 + kb }]} keyboardShouldPersistTaps="handled">
      <View style={{ gap: 6 }}>
        <Text style={s.label}>{t.peName}</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} accessibilityLabel={t.peName} />
        <Text style={s.help}>{path.replace(/ > /g, " › ")}</Text>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={s.label}>{t.peInside}</Text>
        <View style={s.box}>
          {kids.length === 0 ? <Text style={[s.help, { padding: 16 }]}>{t.peNoneInside}</Text> : null}
          {kids.map((k) => (
            <Pressable key={k.name} accessibilityRole="button" accessibilityLabel={`${k.name}, ${t.items(k.n)}`}
              onPress={() => router.push({ pathname: "/place-edit", params: { path: joinPath([...parts, k.name]) } })} style={s.line}>
              <View style={{ flex: 1 }}>
                <Text style={s.lineName}>{k.name}</Text>
                <Text style={s.help}>{t.items(k.n)}</Text>
              </View>
              <Text style={{ fontSize: 18 }}>✎</Text>
            </Pressable>
          ))}
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/place-new", params: { parent: path } })} style={s.add}>
            <Text style={s.addText}>＋ {t.peAddInside}</Text>
          </Pressable>
        </View>
      </View>

      {isRoom && others.length > 0 ? (
        <View style={{ gap: 8 }}>
          <Text style={s.label}>{t.peMerge}</Text>
          <Text style={s.help}>{t.peMergeHelp}</Text>
          <View style={s.chips}>
            {others.map((o) => (
              <Pressable key={o} accessibilityRole="button" onPress={() => merge(o)} style={s.chip}>
                <Text style={s.chipText}>{o}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={remove} style={s.del}>
          <Text style={s.delText}>{t.peDelete}</Text>
        </Pressable>
        <Text style={s.help}>{t.peDeleteNote}</Text>
      </View>

      {err ? <Text style={s.err} accessibilityRole="alert">{err}</Text> : null}
      <Button label={t.peSave} onPress={save} />
      <Button label={t.peCancel} kind="ghost" onPress={() => router.back()} />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  body: { padding: 16, gap: 20 },
  label: { fontSize: font.body, fontWeight: "700", color: color.ink },
  help: { fontSize: font.small, color: color.ink2 },
  input: { minHeight: 52, borderWidth: 1.5, borderColor: color.fieldBorder, borderRadius: radius.field, paddingHorizontal: 16, fontSize: font.body, color: color.ink, backgroundColor: color.surface },
  box: { borderWidth: 1, borderColor: color.line, borderRadius: radius.card, backgroundColor: color.surface, overflow: "hidden" },
  line: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 64, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: color.line },
  lineName: { fontSize: font.body, fontWeight: "600", color: color.ink },
  add: { minHeight: 56, justifyContent: "center", paddingHorizontal: 16 },
  addText: { fontSize: font.body, fontWeight: "700", color: color.accentInk },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1.5, borderColor: color.fieldBorder, backgroundColor: color.surface, alignItems: "center", justifyContent: "center" },
  chipText: { fontSize: font.small, fontWeight: "600", color: color.ink },
  del: { minHeight: MIN_TOUCH, borderRadius: 24, borderWidth: 1.5, borderColor: color.danger, alignItems: "center", justifyContent: "center" },
  delText: { fontSize: font.body, fontWeight: "700", color: color.danger },
  err: { color: color.danger, fontSize: font.body, fontWeight: "600" },
});
