import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
  EBGaramond_500Medium_Italic,
  EBGaramond_600SemiBold,
  EBGaramond_600SemiBold_Italic,
  EBGaramond_700Bold,
  EBGaramond_700Bold_Italic,
  useFonts,
} from "@expo-google-fonts/eb-garamond";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePalette } from "@/hooks/usePalette";
import { initNotifications } from "@/lib/notifications";
import { usePrefs } from "@/lib/prefs";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, retryDelay: 800 },
  },
});

function RootLayoutNav() {
  const C = usePalette();
  const onboardingDone = usePrefs((state) => state.onboardingDone);
  const pathname = usePathname();
  useEffect(() => {
    if (!onboardingDone && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding/0");
    }
  }, [onboardingDone, pathname]);
  if (!onboardingDone && !pathname.startsWith("/onboarding")) {
    return <View style={{ flex: 1, backgroundColor: C.paper }} />;
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.paper },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding/[step]" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="prayers/[slug]" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="saints/[id]" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="settings" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="bookmarks" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="book" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const C = usePalette();
  const appearance = usePrefs((state) => state.appearance);
  const hydrated = usePrefs((state) => state.hydrated);
  const [fontsLoaded, fontError] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium,
    EBGaramond_500Medium_Italic,
    EBGaramond_600SemiBold,
    EBGaramond_600SemiBold_Italic,
    EBGaramond_700Bold,
    EBGaramond_700Bold_Italic,
  });

  const notifListenerRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    const finish = () => usePrefs.setState({ hydrated: true });
    const unsub = usePrefs.persist.onFinishHydration(finish);
    if (usePrefs.persist.hasHydrated()) finish();
    const fallback = setTimeout(async () => {
      if (usePrefs.persist.hasHydrated()) return;
      try {
        const raw = await AsyncStorage.getItem("rpb:prefs");
        if (raw) {
          const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
          const saved = parsed.state ?? {};
          usePrefs.setState({
            appearance: saved.appearance === "night" ? "night" : "light",
            calendarStyle: saved.calendarStyle === "old" ? "old" : "new",
            readStep: typeof saved.readStep === "number" ? saved.readStep : 0,
            ruleChecks: saved.ruleChecks && typeof saved.ruleChecks === "object" ? (saved.ruleChecks as Record<string, string[]>) : {},
            displayName: typeof saved.displayName === "string" ? saved.displayName : "",
            onboardingDone: saved.onboardingDone === true,
            hydrated: true,
          });
          return;
        }
      } catch {
        // Storage was unreadable, so this is treated as a first launch.
      }
      usePrefs.setState({ hydrated: true });
    }, 2500);
    return () => {
      unsub();
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      initNotifications();
      setupNotificationListener();
    }
    return () => {
      notifListenerRef.current?.remove();
      notifListenerRef.current = null;
    };
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.body.style.backgroundColor = C.paper;
    }
  }, [C.paper]);

  const setupNotificationListener = async () => {
    if (Platform.OS === "web") return;
    try {
      const N = await import("expo-notifications");
      notifListenerRef.current = N.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<string, string> | undefined;
        const slug = data?.slug;
        const screen = data?.screen;
        if (slug && screen === "prayer") {
          setTimeout(() => {
            router.push(`/prayers/${slug}` as never);
          }, 300);
        }
      });
    } catch {
      // Notifications are unavailable on this platform.
    }
  };

  if ((!fontsLoaded && !fontError) || !hydrated) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.paper }}>
            <StatusBar style={appearance === "night" ? "light" : "dark"} />
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
