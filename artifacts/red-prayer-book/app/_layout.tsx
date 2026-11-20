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
import { Platform, Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePalette } from "@/hooks/usePalette";
import { initNotifications } from "@/lib/notifications";
import { loadPrefs, usePrefs } from "@/lib/prefs";
import { fonts } from "@/theme/typography";

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

function SettingsUnread({ onRetry }: { onRetry: () => void }) {
  const C = usePalette();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
      <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 22, lineHeight: 28 }}>✠</Text>
      <Text style={{ fontFamily: fonts.medium, fontSize: 28, lineHeight: 34, color: C.ink, textAlign: "center", marginTop: 16 }}>
        Your settings could not be read
      </Text>
      <Text style={{ fontFamily: fonts.italic, fontSize: 18, lineHeight: 28, color: C.ink2, textAlign: "center", marginTop: 12 }}>
        Nothing was changed. Try again to read what is already stored.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Try again"
        onPress={onRetry}
        style={{ marginTop: 28, minHeight: 48, minWidth: 120, paddingHorizontal: 22, backgroundColor: C.rubric, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: C.onRubric, fontFamily: fonts.semibold, fontSize: 18 }}>Try again</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const C = usePalette();
  const appearance = usePrefs((state) => state.appearance);
  const prefsRead = usePrefs((state) => state.prefsRead);
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
    loadPrefs();
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

  if (!fontsLoaded && !fontError) return null;
  if (prefsRead === "failed") {
    return (
      <SafeAreaProvider>
        <SettingsUnread onRetry={() => loadPrefs()} />
      </SafeAreaProvider>
    );
  }
  if (prefsRead !== "ready") return null;

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
