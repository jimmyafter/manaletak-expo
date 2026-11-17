import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Item } from "../../lib/db";
import { useKeyboardHeight } from "../../lib/keyboard";
import { useT } from "../../lib/i18n";
import { displayPath, normalizePath } from "../../lib/path";
import { deleteItem, getItem, moveCount, moveItem, photoUri } from "../../lib/repo";
import { Button, Card } from "../../lib/ui";
import { PlaceField } from "../../lib/PlaceField";
import { color, font, radius } from "../../lib/theme";

export default function ItemDetail() {
  const { t, lang } = useT();
  const router = useRouter();
  const kb = useKeyboardHeight();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null | undefined>(undefined);
  const [moves, setMoves] = useState({ n: 0, lastFrom: "" });
  const [showPhoto, setShowPhoto] = useState(false);
  const [moving, setMoving] = useState(false);
  const [newPlace, setNewPlace] = useState("");

  const load = useCallback(() => {
    getItem(String(id)).then((it) => { setItem(it); if (it) setNewPlace(it.path_text); });
    moveCount(String(id)).then(setMoves);
  }, [id]);
  useFocusEffect(load);

  if (item === undefined) return <View style={s.fill} />;
  if (item === null) return <View style={[s.fill, { padding: 16 }]}><Text style={s.p}>{t.dtNotFound}</Text></View>;

  const levels = normalizePath(item.path_text);
  const uri = photoUri(item.cover_photo);
  const hiddenPhoto = !!item.sensitive && !showPhoto;
  const date = new Date(item.updated_at).toLocaleDateString(lang === "ms" ? "ms-MY" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  const saveMove = async () => {
    await moveItem(item.id, newPlace);
    setMoving(false);
    load();
  };
  const remove = () =>
    Alert.alert(t.dtDeleteTitle, t.dtDeleteBody, [
      { text: t.cancel, style: "cancel" },
      { text: t.dtDelete, style: "destructive", onPress: async () => { await deleteItem(item.id); router.back(); } },
    ]);

  return (
    <ScrollView contentContainerStyle={[s.body, { paddingBottom: 48 + kb }]} keyboardShouldPersistTaps="handled">
      {uri && !hiddenPhoto ? (
        <Image source={{ uri }} style={s.photo} contentFit="cover" accessibilityLabel="" />
      ) : item.sensitive ? (
        <View style={[s.photo, s.lock]}><Text style={s.lockText}>🔒  {t.dtPhotoHidden}</Text></View>
      ) : null}
      {item.sensitive && uri ? (
        <Button label={showPhoto ? t.dtHidePhoto : t.dtShowPhoto} kind="ghost" onPress={() => setShowPhoto((v) => !v)} />
      ) : null}

      <View style={s.titleRow}>
        <Text style={s.h}>{item.name}</Text>
        {item.sensitive ? <Text style={s.badge}>🔒 {t.dtSensitive}</Text> : null}
      </View>

      <Card>
        <View style={{ padding: 16, gap: 10 }}>
          <Text style={s.help}>{t.dtWhere}</Text>
          {levels.length === 0 ? <Text style={s.p}>{t.dtNoPlace}</Text> : null}
          {levels.map((lv, i) => {
            const last = i === levels.length - 1;
            return (
              <View key={`${lv}-${i}`} style={[s.level, { marginLeft: i * 18 }]}>
                <View style={[s.dot, last && s.dotLast]} />
                <Text style={last ? s.levelLast : s.level1}>{lv}</Text>
              </View>
            );
          })}
          <Text style={s.help}>{t.dtUpdated(date)}</Text>
        </View>
      </Card>

      {moves.n > 0 ? (
        <Text style={s.note}>
          {moves.n === 1 ? t.dtMovedOnce(displayPath(moves.lastFrom) || t.dtNoPlace) : t.dtMovedMany(moves.n, displayPath(moves.lastFrom) || t.dtNoPlace)}
        </Text>
      ) : null}

      {moving ? (
        <View style={{ gap: 8 }}>
          <Text style={s.label}>{t.dtMoveTitle}</Text>
          <PlaceField value={newPlace} onChangeText={setNewPlace} placeholder={t.cfPlacePh} />
          <Text style={s.help}>{t.cfPlaceHelp}</Text>
          <Button label={t.dtMoveSave} onPress={saveMove} />
          <Button label={t.cancel} kind="ghost" onPress={() => { setMoving(false); setNewPlace(item.path_text); }} />
        </View>
      ) : (
        <Button label={t.dtMoved} onPress={() => setMoving(true)} />
      )}

      <View style={s.pair}>
        <Button label={t.dtEdit} kind="ghost" style={{ flex: 1 }} onPress={() => router.push({ pathname: "/confirm", params: { id: item.id } })} />
        <Button label={t.dtDelete} kind="ghost" style={{ flex: 1, borderColor: color.danger }} onPress={remove} />
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.ground },
  body: { padding: 16, gap: 16 },
  photo: { height: 240, borderRadius: radius.pill },
  lock: { backgroundColor: color.sand, alignItems: "center", justifyContent: "center", height: 120 },
  lockText: { fontSize: font.body, fontWeight: "700", color: color.ink },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  h: { flex: 1, fontSize: font.h1, fontWeight: "800", color: color.ink },
  badge: { fontSize: font.small, fontWeight: "700", color: color.accentInk, backgroundColor: color.accentTint, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, overflow: "hidden" },
  p: { fontSize: font.body, color: color.ink2 },
  help: { fontSize: font.small, color: color.ink2, fontWeight: "600" },
  label: { fontSize: font.body, fontWeight: "700", color: color.ink },
  level: { flexDirection: "row", alignItems: "center", gap: 10 },
  level1: { fontSize: font.body, fontWeight: "500", color: color.ink },
  levelLast: { fontSize: 22, fontWeight: "800", color: color.accentInk },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.fieldBorder },
  dotLast: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.accent },
  note: { fontSize: font.small, color: color.ink2, backgroundColor: color.sand, borderRadius: 16, padding: 12 },
  pair: { flexDirection: "row", gap: 12 },
});
