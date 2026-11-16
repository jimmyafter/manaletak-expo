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

export const Card = ({ children }: { children: React.ReactNode }) => <View style={s.card}>{children}</View>;

const s = StyleSheet.create({
  btn: { minHeight: 56, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  primary: { backgroundColor: color.accent },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: color.fieldBorder },
  btnText: { fontSize: font.body, fontWeight: "700" },
  pill: { minHeight: MIN_TOUCH, minWidth: MIN_TOUCH, borderRadius: radius.pill, backgroundColor: color.accentTint, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  card: { backgroundColor: color.surface, borderRadius: radius.card, borderWidth: 1, borderColor: color.line, overflow: "hidden" },
});
