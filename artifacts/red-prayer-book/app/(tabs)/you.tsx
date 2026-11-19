import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { BadgeItem } from "@/components/ui/BadgeItem";
import { ManuscriptScroll, Ornament, SmallCaps, TocRow } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { BADGE_DEFS, getAllBadgeProgress } from "@/lib/badges";
import { getStreakData, recordStreakToday, type StreakData } from "@/lib/db";
import { fonts } from "@/theme/typography";

const ACTIVITY = [
  { id: "1", text: "You started a new Plan, The Bible Recap With Tara-Leigh Cobble", when: "13w" },
  { id: "2", text: "You highlighted John 1:14", when: "3d" },
  { id: "3", text: "You completed Morning Prayer", when: "2d" },
];

export default function You() {
  const C = usePalette();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalDaysOpened: 0,
    prayersRead: 0,
  });
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [church, setChurch] = useState(false);
  const [badgeId, setBadgeId] = useState<string | null>(null);
  const selected = BADGE_DEFS.find((item) => item.id === badgeId);

  const load = useCallback(async () => {
    await recordStreakToday();
    const [data, progress] = await Promise.all([getStreakData(), getAllBadgeProgress()]);
    setStreak(data);
    setBadges(progress);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ManuscriptScroll inTabs>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Pressable onPress={() => router.push("/settings" as never)} accessibilityLabel="Settings" style={{ minHeight: 44, justifyContent: "center" }}>
            <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Settings</Text>
          </Pressable>
        </View>
        <Text style={{ fontFamily: fonts.medium, fontSize: 34, color: C.ink }}>Andy Acevedo</Text>
        <Text style={{ fontFamily: fonts.italic, fontSize: 16, color: C.ink2, marginTop: 4 }}>Friends 1 · Following 1</Text>
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
        <TocRow title="Saint Nicholas" page="›" onPress={() => router.push("/saints/nicholas" as never)} />
        <TocRow title="Add your church" subtitle="Not available yet" page="›" onPress={() => setChurch(true)} />
        <Ornament />
        <SmallCaps>{BADGE_DEFS.length} badges</SmallCaps>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
          {BADGE_DEFS.map((def) => (
            <BadgeItem key={def.id} def={def} progress={badges[def.id] ?? 0} onPress={() => setBadgeId(def.id)} />
          ))}
        </View>
        <Ornament />
        <SmallCaps>Activity</SmallCaps>
        {ACTIVITY.map((item) => (
          <View key={item.id} style={{ flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.rule }}>
            <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, color: C.ink }}>{item.text}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: C.ink2 }}>{item.when}</Text>
          </View>
        ))}
      </ManuscriptScroll>

      <Modal visible={church} transparent animationType="fade" onRequestClose={() => setChurch(false)}>
        <Pressable style={{ flex: 1, backgroundColor: C.scrim }} onPress={() => setChurch(false)} />
        <View style={{ backgroundColor: C.paper, padding: 24 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 24, color: C.ink, textAlign: "center" }}>Add your church</Text>
          <Text style={{ fontFamily: fonts.italic, fontSize: 17, color: C.ink2, textAlign: "center", marginTop: 10 }}>
            Parish connection is not available in this build.
          </Text>
          <Pressable onPress={() => setChurch(false)} style={{ marginTop: 16, alignItems: "center", minHeight: 44, justifyContent: "center" }}>
            <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Close</Text>
          </Pressable>
        </View>
      </Modal>

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
