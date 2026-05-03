import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View, useColorScheme } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors as brandColors } from "@/theme/colors";

function TabIcon({
  glyph,
  focused,
}: {
  glyph: string;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
      <Text
        style={{
          fontSize: 18,
          color: focused ? brandColors.sacredGold : brandColors.textSecondary,
        }}
      >
        {glyph}
      </Text>
    </View>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: focused ? brandColors.sacredGold : brandColors.textSecondary,
        marginTop: 2,
      }}
    >
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brandColors.sacredGold,
        tabBarInactiveTintColor: brandColors.textSecondary,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : brandColors.surfaceDeep,
          borderTopColor: brandColors.hairline,
          borderTopWidth: 1,
          height: isWeb ? 84 : 56 + insets.bottom,
          paddingBottom: isWeb ? 24 : insets.bottom,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint="dark"
              style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(14,14,16,0.7)" }]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />,
          tabBarIcon: ({ focused }) => <TabIcon glyph="⛪︎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Prayers" focused={focused} />,
          tabBarIcon: ({ focused }) => <TabIcon glyph="✟" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Calendar" focused={focused} />,
          tabBarIcon: ({ focused }) => <TabIcon glyph="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Bible" focused={focused} />,
          tabBarIcon: ({ focused }) => <TabIcon glyph="📖" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="You" focused={focused} />,
          tabBarIcon: ({ focused }) => <TabIcon glyph="◉" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
