import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { TodaysPrayerCard } from "@/components/home/TodaysPrayerCard";
import { QuickTile } from "@/components/home/QuickTile";
import { CrossDivider } from "@/components/ui/CrossDivider";
import { colors } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";

const QUICK_TILES = [
  { glyph: "☀", label: "Morning\nPrayer", target: "morning" },
  { glyph: "☾", label: "Evening\nPrayer", target: "evening" },
  { glyph: "✟", label: "Daily\nReading", target: "daily" },
  { glyph: "📅", label: "Orthodox\nCalendar", target: "calendar" },
  { glyph: "☦", label: "Lives of\nSaints", target: "saints" },
  { glyph: "🔖", label: "Bookmarks", target: "bookmarks" },
];

const PRAYER_CATEGORIES = [
  { label: "Prayer for God's Will", slug: "will" },
  { label: "A Prayer of Husband and Wife", slug: "marriage" },
  { label: "A Prayer of Single Persons", slug: "single" },
  { label: "A Prayer to Find a Spouse", slug: "spouse" },
  { label: "A Prayer in Time of Trouble", slug: "trouble" },
];

const BADGES = [
  { label: "Share\nVerses", value: "12" },
  { label: "Whole\nBible", value: "7" },
  { label: "Notes", value: "18" },
  { label: "Fasted", value: "26" },
  { label: "Prayers", value: "45" },
];

export default function Home() {
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.surfaceDeep }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.m, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: "serif",
            fontWeight: "700",
            fontSize: 28,
            color: colors.sacredGold,
            marginBottom: spacing.m,
            letterSpacing: 0.5,
          }}
        >
          ✟ Red Prayer Book
        </Text>

        <TodaysPrayerCard
          quote="Lord, teach me to pray with my whole heart, and in Your will, not mine, be done."
          onPress={() => router.push("/(tabs)/prayers")}
        />

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: spacing.l,
            gap: spacing.s,
          }}
        >
          {QUICK_TILES.map((t) => (
            <View key={t.label} style={{ width: "31.3%" }}>
              <QuickTile
                glyph={t.glyph}
                label={t.label}
                onPress={() => {
                  if (t.target === "calendar") router.push("/(tabs)/calendar");
                  else if (t.target === "saints")
                    router.push("/saints/nicholas");
                  else router.push("/(tabs)/prayers");
                }}
              />
            </View>
          ))}
        </View>

        <CrossDivider style={{ marginTop: spacing.xl }} />

        <Text
          style={{
            fontFamily: "serif",
            fontWeight: "700",
            fontSize: 22,
            color: colors.sacredGold,
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
            color: colors.textSecondary,
            textAlign: "center",
            marginBottom: spacing.m,
          }}
        >
          Timeless prayers for every season of life
        </Text>

        {PRAYER_CATEGORIES.map(({ label, slug }) => (
          <Pressable
            key={label}
            onPress={() => router.push(`/prayers/${slug}`)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              borderColor: colors.hairline,
              borderWidth: 1,
              borderRadius: radii.m,
              paddingVertical: spacing.m,
              paddingHorizontal: spacing.m,
              marginBottom: spacing.xs,
              backgroundColor: pressed
                ? colors.surface
                : colors.surfaceElevated,
            })}
          >
            <Text
              style={{
                color: colors.sacredGold,
                fontSize: 16,
                marginRight: spacing.s,
              }}
            >
              ✟
            </Text>
            <Text
              style={{
                color: colors.textPrimary,
                flex: 1,
                fontFamily: "serif",
                fontSize: 15,
              }}
            >
              {label}
            </Text>
            <Text style={{ color: colors.sacredGold, fontSize: 18 }}>›</Text>
          </Pressable>
        ))}

        <Pressable
          style={({ pressed }) => ({
            alignSelf: "center",
            paddingVertical: spacing.s,
            paddingHorizontal: spacing.xl,
            borderRadius: radii.pill,
            borderColor: colors.sacredGold,
            borderWidth: 1,
            marginTop: spacing.s,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              color: colors.sacredGold,
              fontFamily: "serif",
              fontWeight: "600",
            }}
          >
            More
          </Text>
        </Pressable>

        <CrossDivider style={{ marginTop: spacing.xl }} />

        <Text
          style={{
            fontFamily: "serif",
            fontWeight: "700",
            fontSize: 20,
            color: colors.sacredGold,
            textAlign: "center",
            marginVertical: spacing.s,
          }}
        >
          More for You
        </Text>

        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            borderRadius: radii.l,
            borderWidth: 1,
            borderColor: colors.hairline,
            padding: spacing.m,
          }}
        >
          <Text
            style={{
              color: colors.sacredGold,
              fontFamily: "serif",
              fontWeight: "700",
              fontSize: 18,
              marginBottom: 4,
            }}
          >
            Share the Red Prayer Book
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              marginBottom: spacing.m,
            }}
          >
            Invite friends to get closer to ancient Christianity.
          </Text>
          <Pressable
            style={({ pressed }) => ({
              alignSelf: "flex-start",
              paddingHorizontal: spacing.l,
              paddingVertical: spacing.xs,
              backgroundColor: pressed ? colors.surface : colors.byzantineCrimson,
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: colors.sacredGold,
            })}
          >
            <Text style={{ color: colors.sacredGold, fontWeight: "700" }}>
              Share ↗
            </Text>
          </Pressable>
        </View>

        <CrossDivider style={{ marginTop: spacing.xl }} />

        <Text
          style={{
            fontFamily: "serif",
            fontWeight: "700",
            fontSize: 20,
            color: colors.sacredGold,
            textAlign: "center",
            marginBottom: spacing.m,
          }}
        >
          Badges
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          {BADGES.map(({ label, value }) => (
            <View key={label} style={{ alignItems: "center", width: 60 }}>
              <View
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  borderWidth: 2,
                  borderColor: colors.sacredGold,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.surfaceElevated,
                }}
              >
                <Text style={{ color: colors.sacredGold }}>✟</Text>
              </View>
              <Text
                style={{
                  color: colors.sacredGold,
                  fontWeight: "700",
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {value}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 9,
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
