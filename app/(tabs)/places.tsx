import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useT } from "../../lib/i18n";
import { activeCount, photoUri, roomSummaries, roomThumbs } from "../../lib/repo";
import type { Thumb } from "../../lib/thumbs";
import { Card } from "../../lib/ui";
import { color, font, MIN_TOUCH, radius } from "../../lib/theme";

type Row = { room: string; n: number; isNew?: boolean };

export default function Places() {
  const { t } = useT();
  const router = useRouter();
  const [rooms, setRooms] = useState<{ room: string; n: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [thumbs, setThumbs] = useState<Record<string, Thumb[]>>({});
  useFocusEffect(useCallback(() => { roomSummaries().then(setRooms); activeCount().then(setTotal); roomThumbs().then(setThumbs).catch(() => setThumbs({})); }, []));

  const goNew = () => router.push("/place-new");
  const data: Row[] = [...rooms, { room: "__new__", n: 0, isNew: true }];

  return (
    <View style={s.fill}>
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <Text style={s.h}>{t.placesTitle}</Text>
          <Text style={s.sub}>{t.items(total)}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t.plAdd} onPress={goNew} style={s.plus}>
          <Text style={s.plusText}>＋</Text>
        </Pressable>
      </View>
      {rooms.length === 0 ? <Text style={s.sub}>{t.placesEmpty}</Text> : null}
      <FlatList
        data={data} numColumns={2} keyExtractor={(r) => r.room}
        columnWrapperStyle={{ gap: 12 }} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) =>
          item.isNew ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t.plNewRoom} onPress={goNew} style={[s.newTile, { flex: 1 }]}>
              <Text style={s.plusText}>＋</Text>
              <Text style={s.newText}>{t.plNewRoom}</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button" accessibilityLabel={`${item.room}, ${t.items(item.n)}`}
              style={{ flex: 1 }} onPress={() => router.push({ pathname: "/room", params: { name: item.room } })}
            >
              <Card>
                <View style={s.card}>
                  {(thumbs[item.room] ?? []).length > 0 ? (
                    <View style={s.thumbs}>
                      {(thumbs[item.room] ?? []).map((th, i) => {
                        const uri = th.sensitive ? null : photoUri(th.photo);
                        return (
                          <View key={i} style={s.thumb}>
                            {th.sensitive ? <Text style={{ fontSize: 16 }}>🔒</Text> : uri ? <Image source={{ uri }} style={s.thumbImg} contentFit="cover" accessibilityLabel="" /> : null}
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                  <Text style={s.name}>{item.room}</Text>
                  <Text style={s.sub}>{t.items(item.n)}</Text>
                </View>
              </Card>
            </Pressable>
          )
        }
      />
    </View>
  );
}
const s = StyleSheet.create({
  fill: { flex: 1, padding: 16, gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  h: { fontSize: font.h1, fontWeight: "800", color: color.ink },
  sub: { fontSize: font.body, color: color.ink2 },
  plus: { width: MIN_TOUCH, height: MIN_TOUCH, borderRadius: 24, borderWidth: 1.5, borderColor: color.fieldBorder, alignItems: "center", justifyContent: "center" },
  plusText: { fontSize: 24, color: color.ink2 },
  card: { padding: 12, minHeight: 96, gap: 2 },
  thumbs: { flexDirection: "row", gap: 6, marginBottom: 8 },
  thumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: color.sand, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  thumbImg: { width: 44, height: 44 },
  name: { fontSize: font.title, fontWeight: "800", color: color.ink },
  newTile: { minHeight: 96, borderRadius: radius.card, borderWidth: 1.5, borderStyle: "dashed", borderColor: color.fieldBorder, alignItems: "center", justifyContent: "center", gap: 4 },
  newText: { fontSize: font.small, fontWeight: "700", color: color.ink2 },
});
