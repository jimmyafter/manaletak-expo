import { useFocusEffect, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Item } from "../../lib/db";
import { useT } from "../../lib/i18n";
import { displayPath } from "../../lib/path";
import { photoUri, recent, search } from "../../lib/repo";
import { Card } from "../../lib/ui";
import { color, font, radius } from "../../lib/theme";

export default function Find() {
  const { t } = useT();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [recents, setRecents] = useState<Item[]>([]);
  const [hits, setHits] = useState<Item[]>([]);

  useFocusEffect(useCallback(() => { recent().then(setRecents); }, []));
  useEffect(() => { let live = true; search(q).then((r) => live && setHits(r)); return () => { live = false; }; }, [q]);

  const searching = q.trim().length > 0;
  const data = searching ? hits : recents;
  return (
    <View style={s.fill}>
      <TextInput
        style={s.input} value={q} onChangeText={setQ} placeholder={t.findLabel} placeholderTextColor={color.ink2}
        accessibilityLabel={t.findLabel} returnKeyType="search" autoCorrect={false}
      />
      {searching && hits.length === 0 ? <Text style={s.muted}>{t.findEmpty}</Text> : null}
      {!searching && recents.length === 0 ? <Text style={s.muted}>{t.findNone}</Text> : null}
      {!searching && recents.length > 0 ? <Text style={s.sub}>{t.findRecent}</Text> : null}
      <FlatList
        data={data} keyExtractor={(i) => i.id} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" accessibilityLabel={item.name} onPress={() => router.push({ pathname: "/item/[id]", params: { id: item.id } })}>
            <ResultCard item={item} hidden={t.findSensitive} />
          </Pressable>
        )}
      />
    </View>
  );
}

function ResultCard({ item, hidden }: { item: Item; hidden: string }) {
  const uri = item.sensitive ? null : photoUri(item.cover_photo);
  return (
    <Card>
      {item.sensitive ? (
        <View style={s.ph}><Text style={s.phText}>🔒  {hidden}</Text></View>
      ) : uri ? (
        <Image source={{ uri }} style={{ height: 150 }} contentFit="cover" accessibilityLabel="" />
      ) : <View style={[s.ph, { height: 64 }]} />}
      <View style={{ padding: 16, gap: 6 }}>
        <Text style={s.name}>{item.name}</Text>
        {item.path_text ? <Text style={s.path}>📍 {displayPath(item.path_text)}</Text> : null}
      </View>
    </Card>
  );
}
const s = StyleSheet.create({
  fill: { flex: 1, padding: 16, gap: 12 },
  input: { minHeight: 52, borderWidth: 1.5, borderColor: color.fieldBorder, borderRadius: radius.pill, paddingHorizontal: 20, fontSize: font.body, color: color.ink, backgroundColor: color.surface },
  muted: { fontSize: font.body, color: color.ink2 },
  sub: { fontSize: font.small, fontWeight: "700", color: color.ink2 },
  ph: { height: 88, backgroundColor: color.sand, alignItems: "center", justifyContent: "center" },
  phText: { fontSize: font.small, fontWeight: "700", color: color.ink },
  name: { fontSize: font.title, fontWeight: "800", color: color.ink },
  path: { fontSize: font.body, color: color.accentInk, fontWeight: "600" },
});
