import { Tabs, usePathname, router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePalette } from "@/hooks/usePalette";
import { useFrame } from "@/components/ui/manuscript";
import { fonts } from "@/theme/typography";
import { layout } from "@/theme/spacing";
import { formatCivilDate } from "@/lib/calendar";
import { getCurrentHour } from "@/lib/canonicalHours";

type MCI = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const TABS: { name: string; href: string; label: string; icon: MCI }[] = [
  { name: "index", href: "/", label: "Home", icon: "home-outline" },
  { name: "prayers", href: "/prayers", label: "Prayers", icon: "cross" },
  { name: "calendar", href: "/calendar", label: "Calendar", icon: "calendar-month-outline" },
  { name: "bible", href: "/bible", label: "Bible", icon: "book-open-outline" },
  { name: "you", href: "/you", label: "You", icon: "account-outline" },
];

function isActive(path: string, href: string) {
  if (href === "/") return path === "/" || path === "/index";
  return path === href || path.startsWith(`${href}/`);
}

function ContentsRail() {
  const C = usePalette();
  const path = usePathname();
  const hour = getCurrentHour();
  return (
    <View
      style={{
        width: layout.side,
        backgroundColor: C.paper2,
        borderRightWidth: 1,
        borderRightColor: C.rule,
        paddingHorizontal: 28,
        paddingTop: 40,
        paddingBottom: 28,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.medium,
          fontSize: 26,
          lineHeight: 30,
          color: C.rubric,
          fontVariant: ["small-caps"],
          letterSpacing: 0.4,
        }}
      >
        The Red Prayer Book
      </Text>
      <Text style={{ fontFamily: fonts.italic, fontSize: 15, color: C.ink2, marginTop: 6, marginBottom: 32 }}>
        A pocket prayer book for Orthodox Christians
      </Text>
      {TABS.map((tab) => {
        const active = isActive(path, tab.href);
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            onPress={() => router.push(tab.href as never)}
            style={(state) => {
              const focused = "focused" in state && Boolean((state as { focused?: boolean }).focused);
              return {
                flexDirection: "row" as const,
                alignItems: "center" as const,
                minHeight: 44,
                paddingVertical: 10,
                backgroundColor: state.pressed ? C.highlight : "transparent",
                outlineStyle: focused ? ("solid" as const) : undefined,
                outlineWidth: focused ? 2 : 0,
                outlineColor: C.rubric,
                outlineOffset: 2,
              };
            }}
          >
            <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 19, color: active ? C.rubric : C.ink }}>
              {tab.label}
            </Text>
            {active ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.rubric }} /> : null}
          </Pressable>
        );
      })}
      <View style={{ flex: 1 }} />
      <Text style={{ fontFamily: fonts.italic, fontSize: 15, lineHeight: 22, color: C.ink2 }}>
        {formatCivilDate(new Date())}
        {"\n"}
        {hour.name}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const C = usePalette();
  const insets = useSafeAreaInsets();
  const { wide } = useFrame();

  return (
    <View style={{ flex: 1, flexDirection: wide ? "row" : "column", backgroundColor: C.paper }}>
      {wide ? <ContentsRail /> : null}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: C.rubric,
            tabBarInactiveTintColor: C.ink2,
            tabBarLabelStyle: {
              fontFamily: fonts.medium,
              fontSize: 13,
              lineHeight: 18,
              letterSpacing: 0.4,
              fontVariant: ["small-caps"],
              textTransform: "none",
            },
            tabBarStyle: wide
              ? { display: "none", height: 0 }
              : {
                  position: "absolute",
                  backgroundColor: C.paper,
                  borderTopColor: C.rule,
                  borderTopWidth: 1,
                  height: 70 + insets.bottom,
                  paddingBottom: insets.bottom + 8,
                  paddingTop: 8,
                  elevation: 0,
                  shadowOpacity: 0,
                },
            tabBarItemStyle: {
              borderTopWidth: 0,
            },
            sceneStyle: { backgroundColor: C.paper },
          }}
        >
          {TABS.map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: tab.label,
                tabBarIcon: ({ focused }) => (
                  <MaterialCommunityIcons name={tab.icon} size={20} color={focused ? C.rubric : C.ink2} />
                ),
              }}
            />
          ))}
        </Tabs>
      </View>
    </View>
  );
}
