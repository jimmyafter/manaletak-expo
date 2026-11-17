import { Image } from "expo-image";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Item } from "../lib/db";
import { useT } from "../lib/i18n";
import { displayPath, joinPath } from "../lib/path";
import { childrenOf, itemsUnder, photoUri } from "../lib/repo";
import { Button, Card } from "../lib/ui";
import { color, font, MIN_TOUCH } from "../lib/theme";

export default function Room() {
  const { t } = useT();
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const room = String(name ?? "");
  const [sel, setSel] = useState<string | null>(null);
  const [kids, setKids] = useState<{ name: string; n: number }[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);

  const base = sel ? joinPath([room, sel]) : room;
  useFocusEffect(useCallback(() => {
    childrenOf(room).then(setKids);
    itemsUnder(room).then((r) => setTotal(r.length));
    itemsUnder(base).then(setItems);
  }, [room, base]));

  const chips = [{ key: null as string | null, label: `${t.rmAll} ${total}` }, ...kids.map((k) => ({ key: k.name as string | null, label: `${k.name} ${k.n}` }))];

  return (
    <View style={s.fill}>
      <Stack.Screen
        options={{
          title: room,
          headerRight: () => (
            <Pressable accessibilityRole="button" accessibilityLabel={t.rmEdit} onPress={() => router.push({ pathname: "/place-edit", params: { path: room } })} style={s.edit}>
              <Text style={{ fontSize: 18 }}>✎</Text>
            </Pressable>
          ),
        }}
      />
      <Text style={s.sub}>{t.items(total)} · {t.rmInside(kids.length)}</Text>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
          {chips.map((c) => {
            const on = c.key === sel;
            return (
              <Pressable key={c.key ?? "__all"} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setSel(c.key)}
                style={[s.chip, on && s.chipOn]}>
                <Text style={[s.chipText, on && { color: color.accentInk }]}>{c.label}</Text>
              </Pressable>
            );
          })}
          <Pressable accessibilityRole="button" accessibilityLabel={t.rmAddPlace} onPress={() => router.push({ pathname: "/place-new", params: { parent: base } })} style={[s.chip, s.chipAdd]}>
            <Text style={s.chipText}>＋ {t.rmAddPlace}</Text>
          </Pressable>
        </ScrollView>
      </View>
      {items.length === 0 ? <Text style={s.sub}>{t.rmEmpty}</Text> : null}
      <FlatList
        data={items} keyExtractor={(i) => i.id} contentContainerStyle={{ gap: 10, paddingBottom: 16 }} style={{ flex: 1 }}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" accessibilityLabel={item.name} onPress={() => router.push({ pathname: "/item/[id]", params: { id: item.id } })}>
            <Row item={item} hidden={t.findSensitive} />
          </Pressable>
        )}
      />
      <Button label={t.rmAddItem} onPress={() => router.push({ pathname: "/confirm", params: { place: base } })} />
    </View>
  );
}

function Row({ item, hidden }: { item: Item; hidden: string }) {
  const uri = item.sensitive ? null : photoUri(item.cover_photo);
  return (
    <Card>
      <View style={s.row}>
        <View style={s.thumb}>
          {item.sensitive ? <Text>🔒</Text> : uri ? <Image source={{ uri }} style={{ width: 56, height: 56 }} contentFit="cover" accessibilityLabel="" /> : null}
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={s.name}>{item.name}</Text>
          <Text style={s.path}>{item.sensitive ? hidden : displayPath(item.path_text)}</Text>
        </View>
      </View>
    </Card>
  );
}
const s = StyleSheet.create({
  fill: { flex: 1, padding: 16, gap: 4 },
  sub: { fontSize: font.body, color: color.ink2 },
  edit: { width: MIN_TOUCH, height: MIN_TOUCH, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1.5, borderColor: color.fieldBorder, backgroundColor: color.surface, alignItems: "center", justifyContent: "center" },
  chipOn: { backgroundColor: color.accentTint, borderColor: color.accent },
  chipAdd: { borderStyle: "dashed", backgroundColor: "transparent" },
  chipText: { fontSize: font.small, fontWeight: "600", color: color.ink },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, minHeight: 80 },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: color.sand, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  name: { fontSize: font.body, fontWeight: "700", color: color.ink },
  path: { fontSize: font.small, color: color.accentInk, fontWeight: "500" },
});
