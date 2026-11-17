import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useT } from "./i18n";
import { displayPath, normalizePath, suggestPlaces, type PlaceEntry } from "./path";
import { placeEntries } from "./repo";
import { color, font, radius } from "./theme";

type Props = { value: string; onChangeText: (v: string) => void; onFocus?: () => void; placeholder?: string };

/** Place text input with a tap-to-pick list of recent and saved places underneath. */
export function PlaceField({ value, onChangeText, onFocus, placeholder }: Props) {
  const { t } = useT();
  const [entries, setEntries] = useState<PlaceEntry[]>([]);
  useEffect(() => { placeEntries().then(setEntries).catch(() => setEntries([])); }, []);

  const list = useMemo(() => suggestPlaces(entries, value, 6), [entries, value]);
  const hasChildren = (p: string) => entries.some((e) => e.path.startsWith(p + " > "));
  const pick = (p: string) => onChangeText(hasChildren(p) ? p + " > " : p);

  return (
    <View style={{ gap: 8 }}>
      <TextInput
        style={s.input} value={value} onChangeText={onChangeText} onFocus={onFocus}
        placeholder={placeholder} placeholderTextColor={color.ink2} accessibilityLabel={t.cfPlace} autoCorrect={false}
      />
      {list.length > 0 ? (
        <View>
          <Text style={s.head}>{value.trim() ? t.cfSuggestions : t.cfRecentPlaces}</Text>
          <View style={s.box}>
            {list.map((p, i) => {
              const parts = normalizePath(p);
              return (
                <Pressable
                  key={p} accessibilityRole="button" accessibilityLabel={displayPath(p)} onPress={() => pick(p)}
                  style={[s.row, i < list.length - 1 && s.divider]}
                >
                  <Text style={s.pin}>📍</Text>
                  <Text style={s.text} numberOfLines={2}>
                    {parts.slice(0, -1).length > 0 ? <Text style={s.parent}>{parts.slice(0, -1).join(" › ")} › </Text> : null}
                    <Text style={s.leaf}>{parts[parts.length - 1]}</Text>
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}
const s = StyleSheet.create({
  input: { minHeight: 52, borderWidth: 1.5, borderColor: color.fieldBorder, borderRadius: radius.field, paddingHorizontal: 16, fontSize: font.body, color: color.ink, backgroundColor: color.surface },
  head: { fontSize: font.small, fontWeight: "700", color: color.ink2, marginBottom: 6 },
  box: { borderWidth: 1, borderColor: color.line, borderRadius: radius.card, backgroundColor: color.surface, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, paddingHorizontal: 14, paddingVertical: 8 },
  divider: { borderBottomWidth: 1, borderBottomColor: color.line },
  pin: { fontSize: 16 },
  text: { flex: 1, fontSize: font.body },
  parent: { color: color.ink2 },
  leaf: { color: color.ink, fontWeight: "700" },
});
