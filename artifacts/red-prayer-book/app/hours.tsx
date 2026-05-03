import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";
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
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginRight: spacing.m })}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color={C.sacredGold} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 16 }}>
            Canonical Hours
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 11 }}>Divine Office of the Church</Text>
        </View>
        <Text style={{ color: C.textMuted, fontFamily: "serif", fontSize: 14, marginRight: spacing.s }}>
          {clock}
        </Text>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <MaterialCommunityIcons name="share-outline" size={22} color={C.textMuted} />
        </Pressable>
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
            <Pressable
              key={h.id}
              onPress={() => setCurrent(h)}
              style={({ pressed }) => ({
                paddingHorizontal: spacing.m,
                paddingVertical: 8,
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: isActive ? h.accentColor : isCurrent ? C.hairline : "transparent",
                backgroundColor: isActive ? h.accentColor : isCurrent ? "rgba(255,255,255,0.05)" : "transparent",
                opacity: pressed ? 0.7 : 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              })}
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
                  fontFamily: "serif",
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
            </Pressable>
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
                backgroundColor: "rgba(0,0,0,0.25)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <MaterialCommunityIcons name={current.icon as MCI} size={26} color={C.ivoryVellum} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.ivoryVellum, fontFamily: "serif", fontWeight: "700", fontSize: 22 }}>
                {current.name}
              </Text>
              <Text style={{ color: "rgba(245,235,221,0.75)", fontFamily: "serif", fontSize: 13 }}>
                {current.subtitle}
              </Text>
            </View>
            {isCurrentHour && (
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.25)",
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.s,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
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
              <Text style={{ color: C.textMuted, fontFamily: "serif", fontStyle: "italic", fontSize: 12 }}>
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
              <Text style={{ color: C.textPrimary, fontFamily: "serif", fontSize: 14, lineHeight: 22, fontStyle: "italic" }}>
                "{current.verse}"
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>— {current.verseRef}</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xs,
                backgroundColor: "rgba(212,175,55,0.07)",
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
              fontFamily: "serif",
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
          <Pressable
            onPress={goPrev}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.xs,
              paddingVertical: spacing.m,
              borderRadius: radii.m,
              borderWidth: 1,
              borderColor: C.hairline,
              backgroundColor: pressed ? C.surface : C.surfaceElevated,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <MaterialCommunityIcons name="chevron-left" size={18} color={C.textSecondary} />
            <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 13 }}>
              {getPrevHour(current).name}
            </Text>
          </Pressable>

          {!isCurrentHour && (
            <Pressable
              onPress={goNow}
              style={({ pressed }) => ({
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.m,
                borderRadius: radii.m,
                borderWidth: 1,
                borderColor: C.sacredGold,
                backgroundColor: pressed ? C.surface : C.byzantineCrimson,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 12 }}>
                Now
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={goNext}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.xs,
              paddingVertical: spacing.m,
              borderRadius: radii.m,
              borderWidth: 1,
              borderColor: C.hairline,
              backgroundColor: pressed ? C.surface : C.surfaceElevated,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 13 }}>
              {getNextHour(current).name}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={C.textSecondary} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
