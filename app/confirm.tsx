import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useT } from "../lib/i18n";
import { activeCount, saveItem } from "../lib/repo";
import { atFreeCap } from "../lib/quota";
import { Button } from "../lib/ui";
import { color, font, radius } from "../lib/theme";

export default function Confirm() {
  const { t } = useT();
  const router = useRouter();
  const { photo } = useLocalSearchParams<{ photo?: string }>();
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [tags, setTags] = useState("");
  const [sensitive, setSensitive] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [capped, setCapped] = useState(false);

  useEffect(() => { activeCount().then((n) => setCapped(atFreeCap(n, false))); }, []);

  const save = async () => {
    if (!name.trim()) return setErr(t.cfNeedName);
    if (capped) return setErr(t.cfCap);
    await saveItem({ name, place, tags, sensitive, photoUri: photo ?? null });
    router.dismissAll();
    router.replace("/find");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        {photo ? <Image source={{ uri: photo }} style={s.photo} contentFit="cover" accessibilityLabel="" /> : null}
        <Field label={t.cfItem}><TextInput style={s.input} value={name} onChangeText={setName} placeholder={t.cfItemPh} placeholderTextColor={color.ink2} /></Field>
        <Field label={t.cfPlace} help={t.cfPlaceHelp}><TextInput style={s.input} value={place} onChangeText={setPlace} placeholder={t.cfPlacePh} placeholderTextColor={color.ink2} /></Field>
        <Field label={t.cfTags}><TextInput style={s.input} value={tags} onChangeText={setTags} placeholder={t.cfTagsPh} placeholderTextColor={color.ink2} autoCapitalize="none" /></Field>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>{t.cfSensitive}</Text>
            <Text style={s.help}>{t.cfSensitiveHelp}</Text>
          </View>
          <Switch value={sensitive} onValueChange={setSensitive} trackColor={{ true: color.accent, false: color.fieldBorder }} accessibilityLabel={t.cfSensitive} />
        </View>
        {capped ? <Text style={s.warn}>{t.cfCap}</Text> : null}
        {err ? <Text style={s.err} accessibilityRole="alert">{err}</Text> : null}
        <Button label={t.cfSave} onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      {children}
      {help ? <Text style={s.help}>{help}</Text> : null}
    </View>
  );
}
const s = StyleSheet.create({
  body: { padding: 16, paddingBottom: 120, gap: 16 },
  photo: { height: 220, borderRadius: radius.pill },
  label: { fontSize: font.body, fontWeight: "700", color: color.ink },
  help: { fontSize: font.small, color: color.ink2 },
  input: { minHeight: 52, borderWidth: 1.5, borderColor: color.fieldBorder, borderRadius: radius.field, paddingHorizontal: 16, fontSize: font.body, color: color.ink, backgroundColor: color.surface },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56 },
  err: { color: color.danger, fontSize: font.body, fontWeight: "600" },
  warn: { color: color.amberInk, backgroundColor: color.amberBg, borderRadius: radius.field, padding: 12, fontSize: font.small },
});
