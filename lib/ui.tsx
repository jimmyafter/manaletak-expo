import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { color, font, MIN_TOUCH, radius } from "./theme";

export function Button({ label, onPress, kind = "primary", disabled, style }: {
  label: string; onPress: () => void; kind?: "primary" | "ghost"; disabled?: boolean; style?: ViewStyle;
}) {
  const primary = kind === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[s.btn, primary ? s.primary : s.ghost, disabled && { opacity: 0.5 }, style]}
    >
      <Text style={[s.btnText, { color: primary ? "#fff" : color.accentInk }]}>{label}</Text>
    </Pressable>
  );
}

export function LangPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Language ${label}`} onPress={onPress} style={s.pill}>
      <Text style={{ color: color.accentInk, fontWeight: "700", fontSize: font.small }}>{label}</Text>
    </Pressable>
  );
}

export function TorchButton({ on, onPress, labelOn, labelOff }: { on: boolean; onPress: () => void; labelOn: string; labelOff: string }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={on ? labelOff : labelOn}
      onPress={onPress}
      style={[s.torch, on && s.torchOn]}
    >
      <Text style={{ fontSize: 24 }}>🔦</Text>
    </Pressable>
  );
}

export function GearButton({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={s.gear}>
      <Text style={{ fontSize: 20, color: color.ink }}>⚙</Text>
    </Pressable>
  );
}

export const Card = ({ children }: { children: React.ReactNode }) => <View style={s.card}>{children}</View>;

const s = StyleSheet.create({
  btn: { minHeight: 56, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  primary: { backgroundColor: color.accent },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: color.fieldBorder },
  btnText: { fontSize: font.body, fontWeight: "700" },
  pill: { minHeight: MIN_TOUCH, minWidth: MIN_TOUCH, borderRadius: radius.pill, backgroundColor: color.accentTint, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  torch: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: color.fieldBorder, backgroundColor: color.surface, alignItems: "center", justifyContent: "center" },
  torchOn: { backgroundColor: color.amberBg, borderColor: color.amberBorder },
  gear: { width: MIN_TOUCH, height: MIN_TOUCH, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: color.surface, borderRadius: radius.card, borderWidth: 1, borderColor: color.line, overflow: "hidden" },
});
