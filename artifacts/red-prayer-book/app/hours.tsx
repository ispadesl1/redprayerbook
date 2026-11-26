import { useCallback, useEffect, useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  HourCheck,
  ManuscriptScroll,
  Ornament,
  ReadingText,
  SmallCaps,
  StackBar,
} from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import {
  CANONICAL_HOURS,
  formatTime,
  getCurrentHour,
  getNextHour,
  getPrevHour,
  type CanonicalHour,
} from "@/lib/canonicalHours";
import { isHourKept, localYmd, usePrefs } from "@/lib/prefs";
import { fonts } from "@/theme/typography";

export default function HoursScreen() {
  const C = usePalette();
  const params = useLocalSearchParams<{ id?: string }>();
  const [current, setCurrent] = useState<CanonicalHour>(() => {
    if (params.id) return CANONICAL_HOURS.find((hour) => hour.id === params.id) ?? getCurrentHour();
    return getCurrentHour();
  });
  const [clock, setClock] = useState(formatTime());
  const checks = usePrefs((state) => state.ruleChecks);
  const toggleHour = usePrefs((state) => state.toggleHour);
  const today = localYmd();

  useEffect(() => {
    const interval = setInterval(() => setClock(formatTime()), 30000);
    return () => clearInterval(interval);
  }, []);

  const share = useCallback(async () => {
    await Share.share({
      message: `${current.name} — ${current.subtitle}\n\n${current.fullPrayer}\n\n— Red Prayer Book`,
    });
  }, [current]);

  const kept = isHourKept(today, current.id, checks);
  const now = getCurrentHour().id === current.id;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StackBar
        title="Canonical Hours"
        onBack={() => router.back()}
        right={
          <Pressable onPress={share} accessibilityLabel="Share this hour" style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 8 }}>
            <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 16 }}>Share</Text>
          </Pressable>
        }
      />
      <ManuscriptScroll>
        <Text style={{ textAlign: "center", fontFamily: fonts.italic, color: C.ink2, fontSize: 16 }}>{clock}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
          {CANONICAL_HOURS.map((hour) => {
            const on = hour.id === current.id;
            return (
              <Pressable
                key={hour.id}
                onPress={() => setCurrent(hour)}
                accessibilityRole="button"
                aria-pressed={on}
                style={{ paddingHorizontal: 8, minHeight: 44, justifyContent: "center" }}
              >
                <Text
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 16,
                    color: on ? C.rubric : C.ink2,
                    fontVariant: ["small-caps"],
                    borderBottomWidth: on ? 1 : 0,
                    borderBottomColor: C.rubric,
                  }}
                >
                  {hour.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Ornament />
        <Text style={{ fontFamily: fonts.medium, fontSize: 32, lineHeight: 38, color: C.ink, textAlign: "center" }}>
          {current.name}
        </Text>
        <Text style={{ fontFamily: fonts.italic, fontSize: 18, color: C.ink2, textAlign: "center", marginTop: 4 }}>
          {current.greekName}
        </Text>
        <Text style={{ fontFamily: fonts.italic, fontSize: 16, color: C.ink2, textAlign: "center", marginTop: 4 }}>
          {current.subtitle} · {current.timeLabel}
          {now ? " · now" : ""}
        </Text>
        <Text style={{ fontFamily: fonts.italic, fontSize: 19, lineHeight: 28, color: C.ink, marginTop: 16 }}>
          “{current.verse}”
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: C.ink2, marginTop: 2 }}>{current.verseRef}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 17, color: C.ink }}>
            {kept ? "Prayed today" : "Mark this hour as prayed"}
          </Text>
          <HourCheck checked={kept} onToggle={() => toggleHour(today, current.id)} label={`Mark ${current.name} as prayed`} />
        </View>
        <Ornament />
        <SmallCaps>A short prayer</SmallCaps>
        <Text style={{ fontFamily: fonts.regular, fontSize: 18, lineHeight: 28, color: C.ink, marginTop: 8 }}>
          {current.shortPrayer}
        </Text>
        <Text style={{ fontFamily: fonts.italic, fontSize: 16, color: C.ink2, marginTop: 6 }}>{current.intention}</Text>
        <Ornament />
        <SmallCaps>The prayer of the hour</SmallCaps>
        <View style={{ marginTop: 12 }}>
          <ReadingText text={current.fullPrayer} size={20} dropCap />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.rule, marginTop: 8 }}>
          <Pressable onPress={() => setCurrent((hour) => getPrevHour(hour))} style={{ minHeight: 52, justifyContent: "center" }}>
            <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>‹ {getPrevHour(current).name}</Text>
          </Pressable>
          <Pressable onPress={() => setCurrent(getCurrentHour())} style={{ minHeight: 52, justifyContent: "center" }}>
            <Text style={{ color: C.ink2, fontFamily: fonts.regular, fontSize: 16 }}>Now</Text>
          </Pressable>
          <Pressable onPress={() => setCurrent((hour) => getNextHour(hour))} style={{ minHeight: 52, justifyContent: "center" }}>
            <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>{getNextHour(current).name} ›</Text>
          </Pressable>
        </View>
      </ManuscriptScroll>
    </View>
  );
}
