import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors as C } from "@/theme/colors";
import { fonts, type } from "@/theme/typography";
import { hitTarget } from "@/theme/spacing";

type MCI = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

function TabIcon({ name, focused }: { name: MCI; focused: boolean }) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        minWidth: hitTarget,
        minHeight: 28,
      }}
    >
      <MaterialCommunityIcons
        name={name}
        size={24}
        color={focused ? C.sacredGold : C.textMuted}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 16 : Math.max(insets.bottom, 8);
  const barHeight = isWeb ? 84 : 52 + bottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "none",
        tabBarShowLabel: true,
        tabBarActiveTintColor: C.sacredGold,
        tabBarInactiveTintColor: C.textMuted,
        tabBarLabelStyle: {
          ...type.tabLabel,
          fontFamily: fonts.bodySemi,
          marginTop: 2,
        },
        tabBarItemStyle: {
          minHeight: hitTarget,
          paddingTop: 4,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : C.surfaceDeep,
          borderTopColor: C.hairline,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: barHeight,
          paddingBottom: bottomPad,
          paddingTop: 4,
          elevation: 0,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={48}
              tint="dark"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: C.overlayOnyx78 },
              ]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: C.surfaceDeep,
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: C.hairline,
                },
              ]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          title: "Prayers",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="cross" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "calendar-month" : "calendar-month-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: "Bible",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "book-open-variant" : "book-open-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: "You",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "account-circle" : "account-circle-outline"} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
