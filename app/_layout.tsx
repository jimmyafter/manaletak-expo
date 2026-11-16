import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LangProvider, useT } from "../lib/i18n";
import { color } from "../lib/theme";

function Inner() {
  const { t } = useT();
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: color.ground }, headerStyle: { backgroundColor: color.ground }, headerTitleStyle: { color: color.ink } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="confirm" options={{ title: t.cfTitle, presentation: "modal" }} />
      </Stack>
    </>
  );
}
export default function Root() {
  return <LangProvider><Inner /></LangProvider>;
}
