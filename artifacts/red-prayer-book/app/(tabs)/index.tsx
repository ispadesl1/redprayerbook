import { useEffect, useState } from "react";
import { ScrollView, View, Text, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CrossDivider } from "@/components/ui/CrossDivider";
import { BadgeItem } from "@/components/ui/BadgeItem";
import { PressableScale } from "@/components/ui/PressableScale";
import { FadeIn } from "@/components/ui/FadeIn";
import { TodaysPrayerCard } from "@/components/home/TodaysPrayerCard";
import { QuickTile } from "@/components/home/QuickTile";
import { colors as C } from "@/theme/colors";
import { spacing, radii, motion } from "@/theme/spacing";
import { fonts, type } from "@/theme/typography";
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
    <PressableScale
      onPress={() => router.push(`/hours?id=${hour.id}`)}
      haptic
      accessibilityLabel={`Current hour of prayer, ${hour.name}`}
      style={{
        marginHorizontal: spacing.m,
        marginBottom: spacing.s,
        borderRadius: radii.l,
        borderWidth: 1,
        borderColor: hour.accentColor,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          backgroundColor: hour.accentColor,
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <MaterialCommunityIcons name={hour.icon as MCI} size={14} color={C.textOnAccent} />
          <Text style={{ ...type.label, color: C.textOnAccent }}>
            Current Hour of Prayer
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.ivoryVellum, opacity: 0.7 }} />
          <Text style={{ color: C.overlayIvory70, fontFamily: fonts.body, fontSize: 11 }}>{clock}</Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: C.surfaceElevated,
          padding: spacing.m,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.m,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: hour.accentColor,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: C.overlayWhite20,
          }}
        >
          <MaterialCommunityIcons name={hour.icon as MCI} size={24} color={C.ivoryVellum} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.sacredGold, fontFamily: fonts.serifBold, fontSize: 18, lineHeight: 22 }}>
            {hour.name}
          </Text>
          <Text
            style={{
              color: C.textSecondary,
              fontFamily: fonts.serifItalic,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {hour.subtitle}
          </Text>
          <Text
            style={{ color: C.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 4, lineHeight: 16 }}
            numberOfLines={2}
          >
            {hour.shortPrayer}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={C.sacredGold} />
      </View>

      <View
        style={{
          backgroundColor: C.surface,
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.xs,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.xs,
        }}
      >
        <MaterialCommunityIcons name="clock-outline" size={11} color={C.textMuted} />
        <Text style={{ color: C.textMuted, fontFamily: fonts.body, fontSize: 11 }}>{hour.timeLabel}</Text>
        <Text style={{ color: C.hairline, marginHorizontal: 4 }}>·</Text>
        <Text style={{ color: C.textMuted, fontFamily: fonts.serifItalic, fontSize: 11 }}>{hour.greekName}</Text>
      </View>
    </PressableScale>
  );
}

function FastingWidget() {
  const status = getTodayFastStatus();
  const color = getStrictnessColor(status.strictness);
  const progress = status.period ? getPeriodProgress(status.period) : null;

  return (
    <PressableScale
      onPress={() => router.push("/fasting")}
      haptic
      accessibilityLabel={status.isFastFree ? "Fast-free period" : status.isFasting ? "Fasting today" : "Fasting calendar"}
      style={{
        marginHorizontal: spacing.m,
        marginBottom: spacing.l,
        borderRadius: radii.l,
        borderWidth: 1,
        borderColor: color,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          backgroundColor: color,
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <MaterialCommunityIcons
            name={status.isFastFree ? "party-popper" : status.isFasting ? "fish" : "information-outline"}
            size={14}
            color={C.textOnAccent}
          />
          <Text style={{ ...type.label, color: C.textOnAccent }}>
            {status.isFastFree ? "Fast-Free Period" : status.isFasting ? "Fasting Today" : "Fasting Calendar"}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={16} color={C.overlayIvory70} />
      </View>

      <View style={{ backgroundColor: C.surfaceElevated, padding: spacing.m }}>
        <Text style={{ color: C.sacredGold, fontFamily: fonts.serifBold, fontSize: 16, marginBottom: 2 }}>
          {status.label}
        </Text>
        <Text
          style={{
            color: C.textSecondary,
            fontFamily: fonts.serif,
            fontSize: 12,
            marginBottom: status.rules.length ? spacing.xs : 0,
          }}
        >
          {status.sublabel}
        </Text>
        {status.rules[0] ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 4 }}>
            <MaterialCommunityIcons
              name={status.isFastFree ? "check-circle-outline" : "circle-small"}
              size={13}
              color={color}
            />
            <Text
              style={{ color: C.textMuted, fontFamily: fonts.body, fontSize: 12, flex: 1 }}
              numberOfLines={1}
            >
              {status.rules[0]}
            </Text>
          </View>
        ) : null}

        {progress && !status.isFastFree && (
          <View style={{ marginTop: spacing.s }}>
            <View style={{ height: 3, borderRadius: 2, backgroundColor: C.overlayWhite10 }}>
              <View
                style={{
                  width: `${Math.round(progress.pct * 100)}%`,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: color,
                }}
              />
            </View>
            <Text style={{ color: C.textMuted, fontFamily: fonts.body, fontSize: 10, marginTop: 2 }}>
              {progress.daysLeft} day{progress.daysLeft === 1 ? "" : "s"} remaining · {Math.round(progress.pct * 100)}% complete
            </Text>
          </View>
        )}
      </View>
    </PressableScale>
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
  { label: "Prayer for God's Will", slug: "morning-prayer-grant-me" },
  { label: "A Prayer of Husband and Wife", slug: "for-married" },
  { label: "A Prayer of Single Persons", slug: "for-single" },
  { label: "Before Commencing Any Task", slug: "before-work" },
  { label: "A Prayer in Time of Trouble", slug: "in-time-of-trouble" },
];

export default function Home() {
  const [badgeProgress, setBadgeProgress] = useState<Record<string, number>>({});
  const { width } = useWindowDimensions();
  const tileGap = spacing.s;
  const tileSize = (width - spacing.m * 2 - tileGap * 2) / 3;

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
        contentContainerStyle={{ paddingTop: spacing.s, paddingBottom: 108 }}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn delay={0}>
          <TodaysPrayerCard quote="Lord, teach me to pray with my whole heart, and in Your will, not mine, be done." />
        </FadeIn>

        <FadeIn delay={motion.staggerMs}>
          <CanonicalHoursWidget />
        </FadeIn>

        <FadeIn delay={motion.staggerMs * 2}>
          <FastingWidget />
        </FadeIn>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            paddingHorizontal: spacing.m,
            gap: tileGap,
          }}
        >
          {TILES.map((t) => (
            <QuickTile
              key={t.label}
              icon={t.icon}
              label={t.label}
              size={tileSize}
              onPress={() => handleTilePress(t.target)}
            />
          ))}
        </View>

        <CrossDivider style={{ marginHorizontal: spacing.m, marginTop: spacing.xl }} />

        <Text
          style={{
            ...type.title,
            color: C.sacredGold,
            textAlign: "center",
            marginTop: spacing.s,
          }}
        >
          Prayer Categories
        </Text>
        <Text
          style={{
            fontFamily: fonts.serifItalic,
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
            <PressableScale
              key={slug}
              onPress={() => router.push(`/prayers/${slug}`)}
              haptic
              accessibilityLabel={label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                minHeight: 52,
                borderColor: C.hairline,
                borderWidth: 1,
                borderRadius: radii.m,
                paddingVertical: spacing.m,
                paddingHorizontal: spacing.m,
                backgroundColor: C.surfaceElevated,
              }}
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
                  fontFamily: fonts.serif,
                  fontSize: 15,
                }}
              >
                {label}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={C.sacredGold} />
            </PressableScale>
          ))}
        </View>

        <View style={{ alignItems: "center", marginTop: spacing.m, marginBottom: spacing.s }}>
          <PressableScale
            onPress={() => router.push("/(tabs)/prayers")}
            accessibilityLabel="More prayer categories"
            style={{
              minHeight: 44,
              paddingVertical: spacing.s,
              paddingHorizontal: spacing.xl,
              borderRadius: radii.pill,
              borderColor: C.sacredGold,
              borderWidth: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: C.sacredGold, fontFamily: fonts.serifBold, fontSize: 16 }}>
              More
            </Text>
          </PressableScale>
        </View>

        <CrossDivider style={{ marginHorizontal: spacing.m, marginTop: spacing.m }} />

        <Text
          style={{
            fontFamily: fonts.serifBold,
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
              borderRadius: radii.s,
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
                fontFamily: fonts.serifBold,
                fontSize: 16,
                color: C.sacredGold,
                marginBottom: 4,
              }}
            >
              Share the Red Prayer Book
            </Text>
            <Text style={{ color: C.textSecondary, fontFamily: fonts.body, fontSize: 12, marginBottom: spacing.s }}>
              Invite friends to get closer to ancient Christianity.
            </Text>
            <PressableScale
              haptic
              accessibilityLabel="Share the Red Prayer Book"
              style={{
                alignSelf: "flex-start",
                minHeight: 36,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.xs,
                backgroundColor: C.byzantineCrimson,
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: C.sacredGold,
                justifyContent: "center",
              }}
            >
              <Text style={{ color: C.textOnAccent, fontFamily: fonts.bodyBold, fontSize: 13 }}>
                Share
              </Text>
            </PressableScale>
          </View>
        </View>

        <CrossDivider style={{ marginHorizontal: spacing.m, marginTop: spacing.xl }} />

        <Text
          style={{
            fontFamily: fonts.serifBold,
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
