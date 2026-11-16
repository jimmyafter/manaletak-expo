import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useT } from "../../lib/i18n";
import { activeCount, roomSummaries } from "../../lib/repo";
import { Card } from "../../lib/ui";
import { color, font } from "../../lib/theme";

export default function Places() {
  const { t } = useT();
  const [rooms, setRooms] = useState<{ room: string; n: number }[]>([]);
  const [total, setTotal] = useState(0);
  useFocusEffect(useCallback(() => { roomSummaries().then(setRooms); activeCount().then(setTotal); }, []));
  return (
    <View style={s.fill}>
      <Text style={s.h}>{t.placesTitle}</Text>
      <Text style={s.sub}>{t.items(total)}</Text>
      {rooms.length === 0 ? <Text style={s.sub}>{t.placesEmpty}</Text> : null}
      <FlatList
        data={rooms} numColumns={2} keyExtractor={(r) => r.room}
        columnWrapperStyle={{ gap: 12 }} contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <Card><View style={s.card}><Text style={s.name}>{item.room}</Text><Text style={s.sub}>{t.items(item.n)}</Text></View></Card>
          </View>
        )}
      />
    </View>
  );
}
const s = StyleSheet.create({
  fill: { flex: 1, padding: 16, gap: 8 },
  h: { fontSize: font.h1, fontWeight: "800", color: color.ink },
  sub: { fontSize: font.body, color: color.ink2 },
  card: { padding: 16, minHeight: 96, gap: 2 },
  name: { fontSize: font.title, fontWeight: "800", color: color.ink },
});
