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
import { getCurrentHour, formatTime, type CanonicalHour } from "@/lib/canonicalHours";
import { getTodayFastStatus, getPeriodProgress, getStrictnessColor } from "@/lib/fasting";

type MCI = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

function CanonicalHoursWidget() {
  const [hour, setHour] = useState<CanonicalHour>(getCurrentHour);
  const [clock, setClock] = useState(formatTime);

  useEffect(() => {
    const tick = () => {
      setHour(getCurrentHour());
      setClock(formatTime());
    };
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <Pressable
      onPress={() => router.push(`/hours?id=${hour.id}`)}
      style={({ pressed }) => ({
        marginHorizontal: spacing.m,
        marginBottom: spacing.m,
        borderRadius: radii.l,
        borderWidth: 1,
        borderColor: hour.accentColor,
        overflow: "hidden",
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {/* Accent top strip */}
      <View style={{ backgroundColor: hour.accentColor, paddingHorizontal: spacing.m, paddingVertical: spacing.s, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <MaterialCommunityIcons name={hour.icon as MCI} size={14} color="rgba(245,235,221,0.9)" />
          <Text style={{ color: "rgba(245,235,221,0.9)", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
            Current Hour of Prayer
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.ivoryVellum, opacity: 0.7 }} />
          <Text style={{ color: "rgba(245,235,221,0.7)", fontSize: 11 }}>{clock}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={{ backgroundColor: C.surfaceElevated, padding: spacing.m, flexDirection: "row", alignItems: "center", gap: spacing.m }}>
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: hour.accentColor, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}>
          <MaterialCommunityIcons name={hour.icon as MCI} size={24} color={C.ivoryVellum} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 18 }}>
            {hour.name}
          </Text>
          <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 12, fontStyle: "italic", marginTop: 2 }}>
            {hour.subtitle}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 4, lineHeight: 16 }} numberOfLines={2}>
            {hour.shortPrayer}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={C.sacredGold} />
      </View>

      {/* Time label footer */}
      <View style={{ backgroundColor: C.surface, paddingHorizontal: spacing.m, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
        <MaterialCommunityIcons name="clock-outline" size={11} color={C.textMuted} />
        <Text style={{ color: C.textMuted, fontSize: 11 }}>{hour.timeLabel}</Text>
        <Text style={{ color: C.hairline, marginHorizontal: 4 }}>·</Text>
        <Text style={{ color: C.textMuted, fontFamily: "serif", fontStyle: "italic", fontSize: 11 }}>{hour.greekName}</Text>
      </View>
    </Pressable>
  );
}

function FastingWidget() {
  const status = getTodayFastStatus();
  const color = getStrictnessColor(status.strictness);
  const progress = status.period ? getPeriodProgress(status.period) : null;

  return (
    <Pressable
      onPress={() => router.push("/fasting")}
      style={({ pressed }) => ({
        marginHorizontal: spacing.m,
        marginBottom: spacing.m,
        borderRadius: radii.l,
        borderWidth: 1,
        borderColor: color,
        overflow: "hidden",
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {/* Header strip */}
      <View style={{ backgroundColor: color, paddingHorizontal: spacing.m, paddingVertical: spacing.s, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <MaterialCommunityIcons
            name={status.isFastFree ? "party-popper" : status.isFasting ? "fish" : "information-outline"}
            size={14}
            color="rgba(245,235,221,0.9)"
          />
          <Text style={{ color: "rgba(245,235,221,0.9)", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
            {status.isFastFree ? "Fast-Free Period" : status.isFasting ? "Fasting Today" : "Fasting Calendar"}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={16} color="rgba(245,235,221,0.7)" />
      </View>

      {/* Body */}
      <View style={{ backgroundColor: C.surfaceElevated, padding: spacing.m }}>
        <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 16, marginBottom: 2 }}>
          {status.label}
        </Text>
        <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 12, marginBottom: status.rules.length ? spacing.xs : 0 }}>
          {status.sublabel}
        </Text>
        {status.rules[0] ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 4 }}>
            <MaterialCommunityIcons
              name={status.isFastFree ? "check-circle-outline" : "circle-small"}
              size={13}
              color={color}
            />
            <Text style={{ color: C.textMuted, fontSize: 12, flex: 1 }} numberOfLines={1}>
              {status.rules[0]}
            </Text>
          </View>
        ) : null}

        {/* Progress bar for active period */}
        {progress && !status.isFastFree && (
          <View style={{ marginTop: spacing.s }}>
            <View style={{ height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)" }}>
              <View style={{ width: `${Math.round(progress.pct * 100)}%`, height: 3, borderRadius: 2, backgroundColor: color }} />
            </View>
            <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
              {progress.daysLeft} day{progress.daysLeft === 1 ? "" : "s"} remaining · {Math.round(progress.pct * 100)}% complete
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

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

        {/* Canonical Hours Widget */}
        <CanonicalHoursWidget />

        {/* Fasting Widget */}
        <FastingWidget />

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
