import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useT } from "../../lib/i18n";
import { Button, TorchButton } from "../../lib/ui";
import { color, font } from "../../lib/theme";

export default function Capture() {
  const { t } = useT();
  const router = useRouter();
  const [focused, setFocused] = useState(true);
  const [perm, ask] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [torch, setTorch] = useState(false);

  // run the camera only while this tab is showing, and switch the light off when leaving
  useFocusEffect(useCallback(() => {
    setFocused(true);
    return () => { setFocused(false); setTorch(false); };
  }, []));

  const go = (uri?: string) => router.push({ pathname: "/confirm", params: uri ? { photo: uri } : {} });

  if (!perm) return <View style={s.fill} />;
  if (!perm.granted) {
    return (
      <View style={[s.fill, s.pad]}>
        <Text style={s.h}>{t.capPermTitle}</Text>
        <Text style={s.p}>{t.capPermBody}</Text>
        <Button label={t.capPermBtn} onPress={ask} />
        <Button label={t.capSkip} kind="ghost" onPress={() => go()} />
      </View>
    );
  }
  return (
    <View style={s.fill}>
      {focused ? <CameraView ref={cam} style={s.cam} facing="back" enableTorch={torch} /> : <View style={s.cam} />}
      <View style={s.bar}>
        <Text style={s.hint}>{t.capHint}</Text>
        <View style={s.shootRow}>
          <TorchButton on={torch} onPress={() => setTorch((v) => !v)} labelOn={t.tcOn} labelOff={t.tcOff} />
          <Button
            style={{ flex: 1 }}
            label={t.capShoot}
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              try {
                const pic = await cam.current?.takePictureAsync({ quality: 0.7, skipProcessing: true });
                if (pic?.uri) go(pic.uri);
              } finally {
                setBusy(false);
              }
            }}
          />
        </View>
        <Button label={t.capSkip} kind="ghost" onPress={() => go()} />
        <Text style={s.mic}>{t.capMic}</Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.ground },
  pad: { padding: 16, justifyContent: "center", gap: 16 },
  h: { fontSize: 24, fontWeight: "800", color: color.ink },
  p: { fontSize: font.body, color: color.ink2, lineHeight: 24 },
  cam: { flex: 1, margin: 16, borderRadius: 28, overflow: "hidden", backgroundColor: "#000" },
  bar: { padding: 16, gap: 12 },
  hint: { fontSize: font.body, color: color.ink, textAlign: "center" },
  shootRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  mic: { fontSize: font.small, color: color.ink2, textAlign: "center" },
});
