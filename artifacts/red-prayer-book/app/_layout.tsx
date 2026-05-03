import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { colors } from "@/theme/colors";
import { initNotifications } from "@/lib/notifications";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="onboarding/[step]"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="prayers/[slug]"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="saints/[id]"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="settings"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="bookmarks"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const notifListenerRef = useRef<any>(null);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      initNotifications();
      setupNotificationListener();
    }
    return () => {
      removeNotificationListener();
    };
  }, [fontsLoaded, fontError]);

  const setupNotificationListener = async () => {
    if (Platform.OS === 'web') return;
    try {
      const N = await import('expo-notifications');

      // Handle taps on notifications (app in background or killed)
      notifListenerRef.current = N.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data as Record<string, string> | undefined;
          const slug = data?.slug;
          const screen = data?.screen;
          if (slug && screen === 'prayer') {
            // Small delay ensures navigation stack is ready
            setTimeout(() => {
              router.push(`/prayers/${slug}` as any);
            }, 300);
          }
        },
      );
    } catch {}
  };

  const removeNotificationListener = async () => {
    if (Platform.OS === 'web') return;
    try {
      if (notifListenerRef.current) {
        const N = await import('expo-notifications');
        N.removeNotificationSubscription(notifListenerRef.current);
        notifListenerRef.current = null;
      }
    } catch {}
  };

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView
            style={{ flex: 1, backgroundColor: colors.surfaceDeep }}
          >
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
