import { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CrossDivider } from "@/components/ui/CrossDivider";
import { BadgeItem } from "@/components/ui/BadgeItem";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";
import { BADGE_DEFS, getAllBadgeProgress } from "@/lib/badges";
import { recordStreakToday } from "@/lib/db";
import { incrementBadge } from "@/lib/badges";
import type { BadgeDef } from "@/lib/badges";

type MCI = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const TILES: { icon: MCI; label: string; target: string }[] = [
  { icon: "weather-sunny", label: "Morning\nPrayer", target: "morning" },
  { icon: "weather-night", label: "Evening\nPrayer", target: "evening" },
  { icon: "book-open-variant", label: "Daily\nReading", target: "reading" },
  { icon: "calendar-month", label: "Orthodox\nCalendar", target: "calendar" },
  { icon: "account-star", label: "Lives of\nSaints", target: "saints" },
  { icon: "bookmark-multiple", label: "Bookmarks", target: "bookmarks" },
];

const CATEGORIES = [
  { label: "Prayer for God's Will", slug: "will" },
  { label: "A Prayer of Husband and Wife", slug: "marriage" },
  { label: "A Prayer of Single Persons", slug: "single" },
  { label: "A Prayer to Find a Spouse", slug: "spouse" },
  { label: "A Prayer in Time of Trouble", slug: "trouble" },
];

export default function Home() {
  const [badgeProgress, setBadgeProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      await recordStreakToday();
      await incrementBadge("daily_prayers", 1);
      const p = await getAllBadgeProgress();
      setBadgeProgress(p);
    })();
  }, []);

  const handleTilePress = (target: string) => {
    if (target === "calendar") router.push("/(tabs)/calendar");
    else if (target === "saints") router.push("/saints/nicholas");
    else if (target === "bookmarks") router.push("/bookmarks");
    else router.push(`/prayers/${target === "reading" ? "will" : target}`);
  };

  const TOP_BADGES = BADGE_DEFS.slice(0, 5);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.surfaceDeep }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Prayer Card */}
        <View
          style={{
            margin: spacing.m,
            borderRadius: radii.l,
            borderWidth: 1,
            borderColor: C.sacredGold,
            overflow: "hidden",
            backgroundColor: C.byzantineCrimson,
          }}
        >
          {/* Filigree corners */}
          {[
            { top: 6, left: 8 },
            { top: 6, right: 8 },
            { bottom: 6, left: 8 },
            { bottom: 6, right: 8 },
          ].map((pos, i) => (
            <Text
              key={i}
              style={{
                position: "absolute",
                ...(pos as any),
                color: C.sacredGold,
                fontSize: 11,
                zIndex: 2,
              }}
            >
              ❦
            </Text>
          ))}

          <View style={{ flexDirection: "row", minHeight: 160 }}>
            {/* Saint icon */}
            <View style={{ width: 130, backgroundColor: C.surfaceDeep }}>
              <Image
                source={require("@/assets/images/saint-nicholas.png")}
                style={{ width: 130, height: "100%", minHeight: 160 }}
                resizeMode="cover"
              />
            </View>

            {/* Text */}
            <View style={{ flex: 1, padding: spacing.m, justifyContent: "center" }}>
              <Text
                style={{
                  fontFamily: "serif",
                  fontWeight: "700",
                  fontSize: 22,
                  color: C.sacredGold,
                  lineHeight: 26,
                }}
              >
                Today's Prayer
              </Text>
              <Text
                style={{
                  fontFamily: "serif",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: C.ivoryVellum,
                  lineHeight: 20,
                  marginTop: spacing.xs,
                }}
              >
                Lord, teach me to pray with my whole heart, and in Your will, not mine, be done.
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing.s }}>
                <View style={{ flex: 1, height: 1, backgroundColor: C.sacredGold, opacity: 0.4 }} />
                <Text style={{ color: C.sacredGold, marginHorizontal: 8, fontSize: 14 }}>✟</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: C.sacredGold, opacity: 0.4 }} />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Tiles 2×3 */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            paddingHorizontal: spacing.m,
            gap: spacing.s,
          }}
        >
          {TILES.map((t) => (
            <Pressable
              key={t.label}
              onPress={() => handleTilePress(t.target)}
              style={({ pressed }) => ({
                width: "31%",
                aspectRatio: 1,
                backgroundColor: pressed ? C.surface : C.byzantineCrimson,
                borderColor: C.sacredGold,
                borderWidth: 1,
                borderRadius: radii.m,
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialCommunityIcons name={t.icon} size={26} color={C.sacredGold} />
              <Text
                style={{
                  color: C.sacredGold,
                  fontSize: 9.5,
                  letterSpacing: 0.8,
                  textAlign: "center",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  lineHeight: 13,
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <CrossDivider style={{ marginHorizontal: spacing.m, marginTop: spacing.xl }} />

        {/* Prayer Categories */}
        <Text
          style={{
            fontFamily: "serif",
            fontWeight: "700",
            fontSize: 22,
            color: C.sacredGold,
            textAlign: "center",
            marginTop: spacing.s,
          }}
        >
          Prayer Categories
        </Text>
        <Text
          style={{
            fontFamily: "serif",
            fontStyle: "italic",
            fontSize: 13,
            color: C.textSecondary,
            textAlign: "center",
            marginBottom: spacing.m,
          }}
        >
          Timeless prayers for every season of life
        </Text>

        <View style={{ paddingHorizontal: spacing.m, gap: spacing.xs }}>
          {CATEGORIES.map(({ label, slug }) => (
            <Pressable
              key={slug}
              onPress={() => router.push(`/prayers/${slug}`)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                borderColor: C.hairline,
                borderWidth: 1,
                borderRadius: radii.m,
                paddingVertical: spacing.m,
                paddingHorizontal: spacing.m,
                backgroundColor: pressed ? C.surface : C.surfaceElevated,
              })}
            >
              <MaterialCommunityIcons
                name="cross"
                size={16}
                color={C.sacredGold}
                style={{ marginRight: spacing.s }}
              />
              <Text
                style={{
                  color: C.textPrimary,
                  flex: 1,
                  fontFamily: "serif",
                  fontSize: 15,
                }}
              >
                {label}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={C.sacredGold} />
            </Pressable>
          ))}
        </View>

        <View style={{ alignItems: "center", marginTop: spacing.m, marginBottom: spacing.s }}>
          <Pressable
            style={({ pressed }) => ({
              paddingVertical: spacing.s,
              paddingHorizontal: spacing.xl,
              borderRadius: radii.pill,
              borderColor: C.sacredGold,
              borderWidth: 1,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "600" }}>
              More
            </Text>
          </Pressable>
        </View>

        <CrossDivider style={{ marginHorizontal: spacing.m, marginTop: spacing.m }} />

        {/* More for You */}
        <Text
          style={{
            fontFamily: "serif",
            fontWeight: "700",
            fontSize: 20,
            color: C.sacredGold,
            textAlign: "center",
            marginVertical: spacing.s,
          }}
        >
          More for You
        </Text>

        <View
          style={{
            marginHorizontal: spacing.m,
            backgroundColor: C.surfaceElevated,
            borderRadius: radii.l,
            borderWidth: 1,
            borderColor: C.hairline,
            padding: spacing.m,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 56,
              height: 70,
              borderRadius: 8,
              backgroundColor: C.byzantineCrimson,
              alignItems: "center",
              justifyContent: "center",
              marginRight: spacing.m,
              borderWidth: 1,
              borderColor: C.sacredGold,
            }}
          >
            <MaterialCommunityIcons name="book-cross" size={30} color={C.sacredGold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "serif",
                fontWeight: "700",
                fontSize: 16,
                color: C.sacredGold,
                marginBottom: 4,
              }}
            >
              Share the Red Prayer Book
            </Text>
            <Text style={{ color: C.textSecondary, fontSize: 12, marginBottom: spacing.s }}>
              Invite friends to get closer to ancient Christianity.
            </Text>
            <Pressable
              style={({ pressed }) => ({
                alignSelf: "flex-start",
                paddingHorizontal: spacing.m,
                paddingVertical: 6,
                backgroundColor: pressed ? C.surface : C.byzantineCrimson,
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: C.sacredGold,
              })}
            >
              <Text style={{ color: C.sacredGold, fontWeight: "700", fontSize: 13 }}>
                Share
              </Text>
            </Pressable>
          </View>
        </View>

        <CrossDivider style={{ marginHorizontal: spacing.m, marginTop: spacing.xl }} />

        {/* Badges */}
        <Text
          style={{
            fontFamily: "serif",
            fontWeight: "700",
            fontSize: 20,
            color: C.sacredGold,
            textAlign: "center",
            marginVertical: spacing.s,
          }}
        >
          Badges
        </Text>

        <View
          style={{
            paddingHorizontal: spacing.m,
            paddingBottom: spacing.s,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {TOP_BADGES.map((def: BadgeDef) => (
            <BadgeItem
              key={def.id}
              def={def}
              progress={badgeProgress[def.id] ?? 0}
              size={58}
              onPress={() => router.push("/(tabs)/you")}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
