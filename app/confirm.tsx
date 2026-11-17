import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useT } from "../lib/i18n";
import { activeCount, getItem, photoUri, saveItem, updateItem } from "../lib/repo";
import { atFreeCap } from "../lib/quota";
import { Button } from "../lib/ui";
import { PlaceField } from "../lib/PlaceField";
import { color, font, radius } from "../lib/theme";

export default function Confirm() {
  const { t } = useT();
  const router = useRouter();
  const { photo, place: placeParam, id } = useLocalSearchParams<{ photo?: string; place?: string; id?: string }>();
  const editing = !!id;
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [place, setPlace] = useState(placeParam ?? "");
  const [tags, setTags] = useState("");
  const [sensitive, setSensitive] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [capped, setCapped] = useState(false);
  const [kb, setKb] = useState(0);
  const scroll = useRef<ScrollView>(null);
  const ys = useRef<Record<string, number>>({});

  useEffect(() => { if (!editing) activeCount().then((n) => setCapped(atFreeCap(n, false))); }, [editing]);

  useEffect(() => {
    if (!id) return;
    getItem(String(id)).then((it) => {
      if (!it) return;
      setName(it.name);
      setPlace(it.path_text);
      setTags(it.tags.split(",").join(", "));
      setSensitive(!!it.sensitive);
      setExistingPhoto(it.sensitive ? null : photoUri(it.cover_photo));
    });
  }, [id]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => setKb(e.endCoordinates.height));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKb(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const reveal = (key: string) => {
    setTimeout(() => scroll.current?.scrollTo({ y: Math.max(0, (ys.current[key] ?? 0) - 16), animated: true }), 150);
  };
  const track = (key: string) => (y: number) => { ys.current[key] = y; };

  const save = async () => {
    if (!name.trim()) return setErr(t.cfNeedName);
    if (capped) return setErr(t.cfCap);
    if (editing) {
      await updateItem(String(id), { name, place, tags, sensitive });
      router.back();
      return;
    }
    await saveItem({ name, place, tags, sensitive, photoUri: photo ?? null });
    router.dismissAll();
    router.replace("/find");
  };

  return (
    <ScrollView
      ref={scroll}
      contentContainerStyle={[s.body, { paddingBottom: 48 + kb }]}
      keyboardShouldPersistTaps="handled"
    >
      {(photo ?? existingPhoto) ? <Image source={{ uri: (photo ?? existingPhoto) as string }} style={s.photo} contentFit="cover" accessibilityLabel="" /> : null}
      <Field label={t.cfItem} onY={track("name")}>
        <TextInput style={s.input} value={name} onChangeText={setName} onFocus={() => reveal("name")}
          placeholder={t.cfItemPh} placeholderTextColor={color.ink2} />
      </Field>
      <Field label={t.cfPlace} help={t.cfPlaceHelp} onY={track("place")}>
        <PlaceField value={place} onChangeText={setPlace} onFocus={() => reveal("place")} placeholder={t.cfPlacePh} />
      </Field>
      <Field label={t.cfTags} onY={track("tags")}>
        <TextInput style={s.input} value={tags} onChangeText={setTags} onFocus={() => reveal("tags")}
          placeholder={t.cfTagsPh} placeholderTextColor={color.ink2} autoCapitalize="none" />
      </Field>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>{t.cfSensitive}</Text>
          <Text style={s.help}>{t.cfSensitiveHelp}</Text>
        </View>
        <Switch value={sensitive} onValueChange={setSensitive}
          trackColor={{ true: color.accent, false: color.fieldBorder }} accessibilityLabel={t.cfSensitive} />
      </View>
      {capped ? <Text style={s.warn}>{t.cfCap}</Text> : null}
      {err ? <Text style={s.err} accessibilityRole="alert">{err}</Text> : null}
      <Button label={t.cfSave} onPress={save} />
    </ScrollView>
  );
}

function Field({ label, help, onY, children }: { label: string; help?: string; onY: (y: number) => void; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }} onLayout={(e) => onY(e.nativeEvent.layout.y)}>
      <Text style={s.label}>{label}</Text>
      {children}
      {help ? <Text style={s.help}>{help}</Text> : null}
    </View>
  );
}
const s = StyleSheet.create({
  body: { padding: 16, gap: 16 },
  photo: { height: 220, borderRadius: radius.pill },
  label: { fontSize: font.body, fontWeight: "700", color: color.ink },
  help: { fontSize: font.small, color: color.ink2 },
  input: { minHeight: 52, borderWidth: 1.5, borderColor: color.fieldBorder, borderRadius: radius.field, paddingHorizontal: 16, fontSize: font.body, color: color.ink, backgroundColor: color.surface },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56 },
  err: { color: color.danger, fontSize: font.body, fontWeight: "600" },
  warn: { color: color.amberInk, backgroundColor: color.amberBg, borderRadius: radius.field, padding: 12, fontSize: font.small },
});
