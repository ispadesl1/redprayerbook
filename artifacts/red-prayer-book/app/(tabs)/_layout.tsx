import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors as C } from "@/theme/colors";

type MCI = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

function TabIcon({ name, focused }: { name: MCI; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: 28, height: 28 }}>
      <MaterialCommunityIcons
        name={name}
        size={24}
        color={focused ? C.sacredGold : C.textSecondary}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: C.sacredGold,
        tabBarInactiveTintColor: C.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : C.surfaceDeep,
          borderTopColor: C.hairline,
          borderTopWidth: 1,
          height: isWeb ? 84 : 54 + insets.bottom,
          paddingBottom: isWeb ? 24 : insets.bottom,
          paddingTop: 6,
          elevation: 0,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint="dark"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(14,14,16,0.75)" },
              ]}
            />
          ) : null,
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
