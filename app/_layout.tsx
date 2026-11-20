import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LangProvider, useT } from "../lib/i18n";
import { OnboardingProvider } from "../lib/onboarding";
import { color } from "../lib/theme";

function Inner() {
  const { t } = useT();
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: color.ground }, headerStyle: { backgroundColor: color.ground }, headerTitleStyle: { color: color.ink }, headerShadowVisible: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="confirm" options={{ title: t.cfTitle, presentation: "modal" }} />
        <Stack.Screen name="item/[id]" options={{ title: "" }} />
        <Stack.Screen name="retake" options={{ title: t.rtTitle }} />
        <Stack.Screen name="settings" options={{ title: t.stTitle }} />
        <Stack.Screen name="plus" options={{ title: "Mana Letak Plus" }} />
        <Stack.Screen name="about" options={{ title: t.abTitle }} />
        <Stack.Screen name="room" options={{ title: "" }} />
        <Stack.Screen name="place-edit" options={{ title: t.peTitle }} />
        <Stack.Screen name="place-new" options={{ title: t.pnTitle }} />
      </Stack>
    </>
  );
}
export default function Root() {
  return <LangProvider><OnboardingProvider><Inner /></OnboardingProvider></LangProvider>;
}
