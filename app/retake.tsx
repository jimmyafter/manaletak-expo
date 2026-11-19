import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useT } from "../lib/i18n";
import { replacePhoto } from "../lib/repo";
import { Button, TorchButton } from "../lib/ui";
import { color, font } from "../lib/theme";

/** Take a new photo for an item that is already saved. */
export default function Retake() {
  const { t } = useT();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [perm, ask] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [torch, setTorch] = useState(false);

  if (!perm) return <View style={s.fill} />;
  if (!perm.granted) {
    return (
      <View style={[s.fill, s.pad]}>
        <Text style={s.h}>{t.capPermTitle}</Text>
        <Text style={s.p}>{t.capPermBody}</Text>
        <Button label={t.capPermBtn} onPress={ask} />
      </View>
    );
  }
  return (
    <View style={s.fill}>
      <CameraView ref={cam} style={s.cam} facing="back" enableTorch={torch} />
      <View style={s.bar}>
        <Text style={s.hint}>{t.rtHint}</Text>
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
              if (pic?.uri) {
                await replacePhoto(String(id), pic.uri);
                router.back();
              }
            } finally {
              setBusy(false);
            }
          }}
        />
        </View>
        <Button label={t.cancel} kind="ghost" onPress={() => router.back()} />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.ground },
  pad: { padding: 16, justifyContent: "center", gap: 16 },
  h: { fontSize: 24, fontWeight: "800", color: color.ink },
  p: { fontSize: font.body, color: color.ink2, lineHeight: 24 },
  cam: { flex: 1, margin: 16, borderRadius: 28, overflow: "hidden" },
  bar: { padding: 16, gap: 12 },
  shootRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  hint: { fontSize: font.body, color: color.ink, textAlign: "center" },
});
