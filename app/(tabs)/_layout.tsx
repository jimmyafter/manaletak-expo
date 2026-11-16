import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useT } from "../../lib/i18n";
import { LangPill } from "../../lib/ui";
import { color } from "../../lib/theme";

const glyph = (g: string) => ({ color: c }: { color: string }) => <Text style={{ color: c, fontSize: 20 }}>{g}</Text>;

export default function TabsLayout() {
  const { t, toggle } = useT();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: color.accentInk,
        tabBarInactiveTintColor: color.ink2,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarStyle: { backgroundColor: color.surface, borderTopColor: color.line, minHeight: 64 },
        headerStyle: { backgroundColor: color.ground },
        headerShadowVisible: false,
        headerRight: () => <View style={{ marginRight: 12 }}><LangPill label={t.lang} onPress={toggle} /></View>,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t.tabCapture, tabBarIcon: glyph("＋") }} />
      <Tabs.Screen name="find" options={{ title: t.tabFind, tabBarIcon: glyph("⌕") }} />
      <Tabs.Screen name="places" options={{ title: t.tabPlaces, tabBarIcon: glyph("⌂") }} />
    </Tabs>
  );
}
