import { useCallback, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { BadgeItem } from "@/components/ui/BadgeItem";
import { ManuscriptScroll, Ornament, SmallCaps, TocRow } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { BADGE_DEFS, getAllBadgeProgress } from "@/lib/badges";
import { getStreakData, listActivity, recordStreakToday, type ActivityEntry, type StreakData } from "@/lib/db";
import { usePrefs } from "@/lib/prefs";
import { fonts } from "@/theme/typography";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatWhen(at: number): string {
  const date = new Date(at);
  const hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const suffix = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} · ${hour12}:${minute} ${suffix}`;
}

export default function You() {
  const C = usePalette();
  const displayName = usePrefs((state) => state.displayName);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalDaysOpened: 0,
    prayersRead: 0,
  });
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [badgeId, setBadgeId] = useState<string | null>(null);
  const selected = BADGE_DEFS.find((item) => item.id === badgeId);
  const name = displayName.trim() || "You";

  const load = useCallback(async () => {
    await recordStreakToday();
    const [data, progress, log] = await Promise.all([getStreakData(), getAllBadgeProgress(), listActivity()]);
    setStreak(data);
    setBadges(progress);
    setActivity(log);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ManuscriptScroll inTabs>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Pressable onPress={() => router.push("/settings" as never)} accessibilityLabel="Settings" style={{ minHeight: 44, justifyContent: "center" }}>
            <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Settings</Text>
          </Pressable>
        </View>
        <Text style={{ fontFamily: fonts.medium, fontSize: 34, color: C.ink }}>{name}</Text>
        {!displayName.trim() ? (
          <Pressable onPress={() => router.push("/settings" as never)} style={{ minHeight: 44, justifyContent: "center" }}>
            <Text style={{ fontFamily: fonts.italic, fontSize: 16, color: C.ink2 }}>Add your name in Settings</Text>
          </Pressable>
        ) : null}
        <Ornament />
        <SmallCaps>The record</SmallCaps>
        <Text style={{ fontFamily: fonts.regular, fontSize: 18, lineHeight: 28, color: C.ink, marginTop: 8 }}>
          {streak.currentStreak} days in a row · longest {streak.longestStreak}
          {"\n"}
          {streak.totalDaysOpened} days opened · {streak.prayersRead} prayers read
        </Text>
        <Ornament />
        <TocRow title="Compose a prayer" subtitle="Needs the companion service" page="›" onPress={() => router.push("/intention" as never)} />
        <TocRow title="Spiritual companion" subtitle="Needs the companion service" page="›" onPress={() => router.push("/companion" as never)} />
        <TocRow title="Bookmarks" page="›" onPress={() => router.push("/bookmarks" as never)} />
        <TocRow title="Prayers" page="›" onPress={() => router.push("/prayers" as never)} />
        <TocRow title="Saint of the day" page="›" onPress={() => router.push("/saints/today" as never)} />
        <Ornament />
        <SmallCaps>{BADGE_DEFS.length} badges</SmallCaps>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
          {BADGE_DEFS.map((def) => (
            <BadgeItem key={def.id} def={def} progress={badges[def.id] ?? 0} onPress={() => setBadgeId(def.id)} />
          ))}
        </View>
        <Ornament />
        <SmallCaps>Activity</SmallCaps>
        {activity.length === 0 ? (
          <Text style={{ fontFamily: fonts.italic, fontSize: 18, lineHeight: 28, color: C.ink2, marginTop: 12 }}>
            Nothing recorded yet. A prayer you read, an hour you keep, a highlight, or a bookmark will be listed here.
          </Text>
        ) : (
          activity.map((item) => (
            <View key={item.id} style={{ flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.rule }}>
              <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, color: C.ink }}>{item.text}</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: C.ink2 }}>{formatWhen(item.at)}</Text>
            </View>
          ))
        )}
      </ManuscriptScroll>

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setBadgeId(null)}>
        <Pressable style={{ flex: 1, backgroundColor: C.scrim }} onPress={() => setBadgeId(null)} />
        {selected ? (
          <View style={{ backgroundColor: C.paper, padding: 24 }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 24, color: C.ink, textAlign: "center" }}>{selected.label}</Text>
            <Text style={{ fontFamily: fonts.italic, fontSize: 17, color: C.ink2, textAlign: "center", marginTop: 8 }}>{selected.description}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 18, color: C.ink, textAlign: "center", marginTop: 12 }}>
              {badges[selected.id] ?? 0} / {selected.max}
            </Text>
          </View>
        ) : null}
      </Modal>
    </View>
  );
}
