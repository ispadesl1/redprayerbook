import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";
import { fonts } from "@/theme/typography";
import { IconButton } from "@/components/ui/IconButton";
import { PressableScale } from "@/components/ui/PressableScale";
import {
  CANONICAL_HOURS,
  getCurrentHour,
  getNextHour,
  getPrevHour,
  formatTime,
  type CanonicalHour,
} from "@/lib/canonicalHours";

type MCI = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

export default function HoursScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [current, setCurrent] = useState<CanonicalHour>(() => {
    if (params.id) {
      return CANONICAL_HOURS.find((h) => h.id === params.id) ?? getCurrentHour();
    }
    return getCurrentHour();
  });
  const [clock, setClock] = useState(formatTime());

  useEffect(() => {
    const interval = setInterval(() => setClock(formatTime()), 30000);
    return () => clearInterval(interval);
  }, []);

  const goNext = useCallback(() => setCurrent((c) => getNextHour(c)), []);
  const goPrev = useCallback(() => setCurrent((c) => getPrevHour(c)), []);
  const goNow = useCallback(() => setCurrent(getCurrentHour()), []);

  const isCurrentHour = getCurrentHour().id === current.id;

  const handleShare = useCallback(async () => {
    await Share.share({
      message: `${current.name} — ${current.subtitle}\n\n${current.fullPrayer}\n\n— Red Prayer Book`,
    });
  }, [current]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.surfaceDeep }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          borderBottomWidth: 1,
          borderColor: C.hairline,
          backgroundColor: C.surfaceElevated,
        }}
      >
        <IconButton
          icon="chevron-left"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.sacredGold, fontFamily: fonts.serifBold, fontWeight: "700", fontSize: 16 }}>
            Canonical Hours
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 11 }}>Divine Office of the Church</Text>
        </View>
        <Text style={{ color: C.textMuted, fontFamily: fonts.serif, fontSize: 14, marginRight: spacing.s }}>
          {clock}
        </Text>
        <IconButton
          icon="share-outline"
          accessibilityLabel="Share this hour"
          color={C.textMuted}
          size={22}
          onPress={handleShare}
          haptic
        />
      </View>

      {/* Hours selector strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          gap: spacing.xs,
        }}
        style={{ flexGrow: 0, borderBottomWidth: 1, borderColor: C.hairline }}
      >
        {CANONICAL_HOURS.map((h) => {
          const isActive = h.id === current.id;
          const isCurrent = h.id === getCurrentHour().id;
          return (
            <PressableScale
              key={h.id}
              onPress={() => setCurrent(h)}
              accessibilityLabel={h.name}
              accessibilityState={{ selected: isActive }}
              style={{
                minHeight: 36,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.xs,
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: isActive ? h.accentColor : isCurrent ? C.hairline : "transparent",
                backgroundColor: isActive ? h.accentColor : isCurrent ? C.overlayWhite05 : "transparent",
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
            >
              <MaterialCommunityIcons
                name={h.icon as MCI}
                size={13}
                color={isActive ? C.ivoryVellum : isCurrent ? C.sacredGold : C.textMuted}
              />
              <Text
                style={{
                  color: isActive ? C.ivoryVellum : isCurrent ? C.sacredGold : C.textMuted,
                  fontSize: 12,
                  fontWeight: isActive ? "700" : "400",
                  fontFamily: fonts.serif,
                }}
              >
                {h.name}
              </Text>
              {isCurrent && !isActive && (
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: C.sacredGold,
                    marginLeft: 2,
                  }}
                />
              )}
            </PressableScale>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View
          style={{
            margin: spacing.m,
            borderRadius: radii.l,
            borderWidth: 1,
            borderColor: current.accentColor,
            backgroundColor: C.surfaceElevated,
            overflow: "hidden",
          }}
        >
          {/* Colored top band */}
          <View
            style={{
              backgroundColor: current.accentColor,
              paddingHorizontal: spacing.l,
              paddingVertical: spacing.m,
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
                backgroundColor: C.overlayOnyx25,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: C.overlayWhite30,
              }}
            >
              <MaterialCommunityIcons name={current.icon as MCI} size={26} color={C.ivoryVellum} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.ivoryVellum, fontFamily: fonts.serifBold, fontWeight: "700", fontSize: 22 }}>
                {current.name}
              </Text>
              <Text style={{ color: C.overlayIvory75, fontFamily: fonts.serif, fontSize: 13 }}>
                {current.subtitle}
              </Text>
            </View>
            {isCurrentHour && (
              <View
                style={{
                  backgroundColor: C.overlayOnyx25,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.s,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: C.overlayWhite30,
                }}
              >
                <Text style={{ color: C.ivoryVellum, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 }}>
                  NOW
                </Text>
              </View>
            )}
          </View>

          {/* Details */}
          <View style={{ padding: spacing.m }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.s }}>
              <MaterialCommunityIcons name="clock-outline" size={13} color={C.textMuted} />
              <Text style={{ color: C.textMuted, fontSize: 12 }}>{current.timeLabel}</Text>
              <Text style={{ color: C.hairline, marginHorizontal: 4 }}>·</Text>
              <Text style={{ color: C.textMuted, fontFamily: fonts.serifItalic, fontStyle: "italic", fontSize: 12 }}>
                {current.greekName}
              </Text>
            </View>

            <View
              style={{
                borderLeftWidth: 2,
                borderLeftColor: current.accentColor,
                paddingLeft: spacing.m,
                marginBottom: spacing.m,
              }}
            >
              <Text style={{ color: C.textPrimary, fontFamily: fonts.serifItalic, fontSize: 14, lineHeight: 22, fontStyle: "italic" }}>
                "{current.verse}"
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>— {current.verseRef}</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xs,
                backgroundColor: C.overlayGold07,
                borderRadius: radii.s,
                padding: spacing.s,
              }}
            >
              <MaterialCommunityIcons name="hands-pray" size={13} color={current.accentColor} />
              <Text style={{ color: C.textSecondary, fontSize: 12, flex: 1 }}>
                Intention: {current.intention}
              </Text>
            </View>
          </View>
        </View>

        {/* Ornamental divider */}
        <Text style={{ color: C.sacredGold, textAlign: "center", fontSize: 18, letterSpacing: 8, marginBottom: spacing.m }}>
          ✦ ✟ ✦
        </Text>

        {/* Full prayer */}
        <View style={{ paddingHorizontal: spacing.l, marginBottom: spacing.l }}>
          <Text
            style={{
              color: C.textPrimary,
              fontFamily: fonts.serifItalic,
              fontSize: 16,
              lineHeight: 30,
              fontStyle: "italic",
            }}
          >
            {current.fullPrayer}
          </Text>
        </View>

        {/* Ornamental divider */}
        <Text style={{ color: C.sacredGold, textAlign: "center", fontSize: 18, letterSpacing: 8, marginBottom: spacing.l }}>
          ✦ ✟ ✦
        </Text>

        {/* Navigation */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: spacing.m,
            gap: spacing.s,
            marginBottom: spacing.m,
          }}
        >
          <PressableScale
            onPress={goPrev}
            accessibilityLabel={`Previous hour, ${getPrevHour(current).name}`}
            style={{
              flex: 1,
              minHeight: 48,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.xs,
              paddingVertical: spacing.m,
              borderRadius: radii.m,
              borderWidth: 1,
              borderColor: C.hairline,
              backgroundColor: C.surfaceElevated,
            }}
          >
            <MaterialCommunityIcons name="chevron-left" size={18} color={C.textSecondary} />
            <Text style={{ color: C.textSecondary, fontFamily: fonts.serif, fontSize: 13 }}>
              {getPrevHour(current).name}
            </Text>
          </PressableScale>

          {!isCurrentHour && (
            <PressableScale
              onPress={goNow}
              haptic
              accessibilityLabel="Go to current hour"
              style={{
                minHeight: 48,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.m,
                borderRadius: radii.m,
                borderWidth: 1,
                borderColor: C.sacredGold,
                backgroundColor: C.byzantineCrimson,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: C.sacredGold, fontFamily: fonts.serifBold, fontWeight: "700", fontSize: 12 }}>
                Now
              </Text>
            </PressableScale>
          )}

          <PressableScale
            onPress={goNext}
            accessibilityLabel={`Next hour, ${getNextHour(current).name}`}
            style={{
              flex: 1,
              minHeight: 48,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.xs,
              paddingVertical: spacing.m,
              borderRadius: radii.m,
              borderWidth: 1,
              borderColor: C.hairline,
              backgroundColor: C.surfaceElevated,
            }}
          >
            <Text style={{ color: C.textSecondary, fontFamily: fonts.serif, fontSize: 13 }}>
              {getNextHour(current).name}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={C.textSecondary} />
          </PressableScale>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
