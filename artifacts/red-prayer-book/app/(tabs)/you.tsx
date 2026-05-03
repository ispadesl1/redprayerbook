import { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Text, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BadgeItem } from "@/components/ui/BadgeItem";
import { CrossDivider } from "@/components/ui/CrossDivider";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";
import { BADGE_DEFS, getAllBadgeProgress } from "@/lib/badges";
import { getStreakData, recordStreakToday, type StreakData } from "@/lib/db";

const ACTIVITY_TABS = ["All", "Highlights", "Notes", "Badges"] as const;
type ActivityTab = (typeof ACTIVITY_TABS)[number];

const ACTIVITY_ITEMS = [
  { id: "1", text: "You started a new Plan,\nThe Bible Recap With Tara-Leigh Cobble", when: "13w" },
  { id: "2", text: "You highlighted John 1:14 in gold", when: "3d" },
  { id: "3", text: "You completed Morning Prayer", when: "2d" },
];

// Streak milestones: [days, label]
const MILESTONES: [number, string][] = [
  [3, "3"],
  [7, "7"],
  [30, "30"],
  [100, "100"],
];

function FlameIcon({ size = 32, lit = true }: { size?: number; lit?: boolean }) {
  return (
    <Text style={{ fontSize: size, opacity: lit ? 1 : 0.25 }}>🔥</Text>
  );
}

function StreakCard({ data }: { data: StreakData }) {
  const { currentStreak, longestStreak, prayersRead } = data;
  const nextMilestone = MILESTONES.find(([days]) => currentStreak < days);
  const nextTarget = nextMilestone ? nextMilestone[0] : null;
  const progressPct = nextTarget
    ? Math.min((currentStreak / nextTarget) * 100, 100)
    : 100;

  return (
    <View
      style={{
        marginBottom: spacing.m,
        borderColor: currentStreak >= 7 ? C.sacredGold : C.hairline,
        borderWidth: currentStreak >= 7 ? 1.5 : 1,
        borderRadius: radii.m,
        backgroundColor: C.surfaceElevated,
        overflow: "hidden",
      }}
    >
      {/* Top row: flame + streak number + label */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.m,
          paddingTop: spacing.m,
          paddingBottom: spacing.s,
        }}
      >
        <FlameIcon size={36} lit={currentStreak > 0} />
        <View style={{ marginLeft: spacing.s, flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
            <Text
              style={{
                color: currentStreak > 0 ? C.ivoryVellum : C.textMuted,
                fontFamily: "serif",
                fontWeight: "700",
                fontSize: 40,
                lineHeight: 44,
              }}
            >
              {currentStreak}
            </Text>
            <Text
              style={{
                color: C.textMuted,
                fontFamily: "serif",
                fontSize: 15,
                marginBottom: 4,
              }}
            >
              {currentStreak === 1 ? "day streak" : "day streak"}
            </Text>
          </View>
          <Text style={{ color: C.textMuted, fontSize: 12 }}>
            {currentStreak === 0
              ? "Open the app daily to build your streak"
              : currentStreak >= 30
              ? "✟ Remarkable devotion — keep it up!"
              : currentStreak >= 7
              ? "⭐ A full week of prayer!"
              : "Keep praying daily to grow your streak"}
          </Text>
        </View>
      </View>

      {/* Progress bar toward next milestone */}
      {nextTarget !== null && (
        <View style={{ paddingHorizontal: spacing.m, paddingBottom: spacing.s }}>
          <View
            style={{
              height: 5,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${progressPct}%`,
                height: 5,
                borderRadius: 3,
                backgroundColor: currentStreak >= 7 ? C.sacredGold : C.byzantineCrimson,
              }}
            />
          </View>
          <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>
            {nextTarget - currentStreak} more {nextTarget - currentStreak === 1 ? "day" : "days"} to reach {nextTarget}-day milestone
          </Text>
        </View>
      )}

      {/* Milestone pips */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.m,
          paddingBottom: spacing.m,
          gap: spacing.xs,
        }}
      >
        {MILESTONES.map(([days, label]) => {
          const reached = currentStreak >= days;
          return (
            <View
              key={days}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: spacing.xs,
                borderRadius: radii.s,
                backgroundColor: reached
                  ? C.byzantineCrimson + "55"
                  : "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: reached ? C.sacredGold + "88" : C.hairline,
              }}
            >
              {reached ? (
                <Text style={{ fontSize: 14 }}>🔥</Text>
              ) : (
                <MaterialCommunityIcons name="fire" size={14} color={C.textMuted} />
              )}
              <Text
                style={{
                  color: reached ? C.sacredGold : C.textMuted,
                  fontSize: 11,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {label}d
              </Text>
            </View>
          );
        })}
      </View>

      {/* Bottom stat bar */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: C.hairline,
        }}
      >
        {[
          { label: "Best Streak", value: `${longestStreak}d`, icon: "trophy-outline" as const },
          { label: "Prayers Read", value: String(prayersRead), icon: "book-open-outline" as const },
        ].map(({ label, value, icon }, i) => (
          <View
            key={label}
            style={{
              flex: 1,
              paddingVertical: spacing.s,
              paddingHorizontal: spacing.m,
              alignItems: "center",
              borderLeftWidth: i > 0 ? 1 : 0,
              borderLeftColor: C.hairline,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MaterialCommunityIcons name={icon} size={13} color={C.sacredGold} />
              <Text
                style={{
                  color: C.ivoryVellum,
                  fontFamily: "serif",
                  fontWeight: "700",
                  fontSize: 17,
                }}
              >
                {value}
              </Text>
            </View>
            <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 1 }}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function You() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("All");
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalDaysOpened: 0,
    prayersRead: 0,
  });
  const [badgeProgress, setBadgeProgress] = useState<Record<string, number>>({});
  const [churchModal, setChurchModal] = useState(false);
  const [badgeDetailModal, setBadgeDetailModal] = useState<string | null>(null);

  const load = useCallback(async () => {
    await recordStreakToday();
    const [data, progress] = await Promise.all([
      getStreakData(),
      getAllBadgeProgress(),
    ]);
    setStreakData(data);
    setBadgeProgress(progress);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectedBadgeDef = BADGE_DEFS.find((b) => b.id === badgeDetailModal);
  const selectedProgress = badgeDetailModal ? (badgeProgress[badgeDetailModal] ?? 0) : 0;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.surfaceDeep }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.m, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top right actions */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: spacing.m, marginBottom: spacing.m }}>
          {(["qrcode", "cog-outline", "menu"] as const).map((icon) => (
            <Pressable
              key={icon}
              onPress={() => { if (icon === "cog-outline") router.push("/settings"); }}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <MaterialCommunityIcons name={icon} size={22} color={C.sacredGold} />
            </Pressable>
          ))}
        </View>

        {/* Profile row */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.m }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "serif", fontWeight: "700", fontSize: 28, color: C.ivoryVellum }}>
              Andy Acevedo
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.xs, marginTop: spacing.xs }}>
              {["Friends 1", "Following 1"].map((p) => (
                <View
                  key={p}
                  style={{
                    paddingHorizontal: spacing.s,
                    paddingVertical: 4,
                    borderColor: C.sacredGold,
                    borderWidth: 1,
                    borderRadius: radii.pill,
                  }}
                >
                  <Text style={{ color: C.sacredGold, fontSize: 11 }}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ position: "relative" }}>
            <View
              style={{
                width: 80, height: 80, borderRadius: 40,
                borderWidth: 2, borderColor: C.sacredGold,
                backgroundColor: C.byzantineCrimson,
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 30 }}>A</Text>
            </View>
            <Pressable
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: 24, height: 24, borderRadius: 12,
                backgroundColor: C.sacredGold,
                alignItems: "center", justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="camera" size={13} color={C.deepOnyx} />
            </Pressable>
          </View>
        </View>

        {/* Compose a Prayer banner */}
        <Pressable
          onPress={() => router.push("/intention")}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", gap: spacing.m,
            paddingVertical: spacing.m, paddingHorizontal: spacing.m,
            borderColor: C.hairline, borderWidth: 1, borderRadius: radii.m,
            marginBottom: spacing.s,
            backgroundColor: pressed ? C.surface : C.surfaceElevated,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.byzantineCrimson, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.sacredGold }}>
            <MaterialCommunityIcons name="hands-pray" size={22} color={C.sacredGold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.textPrimary, fontFamily: "serif", fontWeight: "700", fontSize: 15 }}>Compose a Prayer</Text>
            <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>Enter your intention — receive a personal Orthodox prayer</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={C.sacredGold} />
        </Pressable>

        {/* AI Spiritual Companion banner */}
        <Pressable
          onPress={() => router.push("/companion")}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", gap: spacing.m,
            paddingVertical: spacing.m, paddingHorizontal: spacing.m,
            borderColor: C.sacredGold, borderWidth: 1, borderRadius: radii.m,
            marginBottom: spacing.s,
            backgroundColor: pressed ? C.surface : C.byzantineCrimson,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.surfaceDeep, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.sacredGold }}>
            <MaterialCommunityIcons name="cross" size={22} color={C.sacredGold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 15 }}>Spiritual Companion</Text>
            <Text style={{ color: C.textSecondary, fontSize: 12, marginTop: 2 }}>Ask Father Seraphim about prayers & faith</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={C.sacredGold} />
        </Pressable>

        {/* Add your church */}
        <Pressable
          onPress={() => setChurchModal(true)}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            gap: spacing.xs, paddingVertical: spacing.m,
            borderColor: C.sacredGold, borderWidth: 1, borderRadius: radii.m,
            marginBottom: spacing.m, opacity: pressed ? 0.7 : 1,
          })}
        >
          <MaterialCommunityIcons name="church" size={18} color={C.sacredGold} />
          <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "600", fontSize: 15 }}>Add Your Church</Text>
        </Pressable>

        {/* Stat tiles */}
        <View style={{ flexDirection: "row", gap: spacing.xs, marginBottom: spacing.m }}>
          {[
            { label: "Saved", icon: "bookmark-outline" as const },
            { label: "Prayer", icon: "hands-pray" as const },
            { label: "Giving", icon: "heart-outline" as const },
          ].map(({ label, icon }) => (
            <Pressable
              key={label}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: spacing.l, alignItems: "center",
                borderColor: C.hairline, borderWidth: 1, borderRadius: radii.m,
                backgroundColor: pressed ? C.surface : C.surfaceElevated,
                gap: spacing.xs,
              })}
            >
              <MaterialCommunityIcons name={icon} size={24} color={C.sacredGold} />
              <Text style={{ color: C.textPrimary, fontFamily: "serif", fontWeight: "600", fontSize: 13 }}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Streak card ── */}
        <StreakCard data={streakData} />

        {/* Badges */}
        <View
          style={{
            marginBottom: spacing.m,
            padding: spacing.m,
            borderColor: C.hairline,
            borderWidth: 1,
            borderRadius: radii.m,
            backgroundColor: C.surfaceElevated,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.m }}>
            <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 17, flex: 1 }}>
              {BADGE_DEFS.length} Badges
            </Text>
            <MaterialCommunityIcons name="medal-outline" size={22} color={C.sacredGold} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.xs, paddingRight: spacing.s }}
          >
            {BADGE_DEFS.map((def) => (
              <BadgeItem
                key={def.id}
                def={def}
                progress={badgeProgress[def.id] ?? 0}
                size={68}
                onPress={() => setBadgeDetailModal(def.id)}
              />
            ))}
          </ScrollView>
          <Text style={{ color: C.textMuted, fontSize: 11, textAlign: "center", marginTop: spacing.m, fontStyle: "italic" }}>
            Earn badges through daily prayer, reading, and worship.
          </Text>
        </View>

        <CrossDivider />

        {/* Activity */}
        <Text style={{ fontFamily: "serif", fontWeight: "700", fontSize: 22, color: C.ivoryVellum, marginTop: spacing.s, marginBottom: spacing.s }}>
          Activity
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.m }}>
          <View style={{ flexDirection: "row", gap: spacing.xs }}>
            {ACTIVITY_TABS.map((t) => (
              <Pressable
                key={t}
                onPress={() => setActiveTab(t)}
                style={{
                  paddingHorizontal: spacing.m, paddingVertical: 7,
                  borderRadius: radii.pill,
                  borderColor: activeTab === t ? C.sacredGold : C.hairline,
                  borderWidth: 1,
                  backgroundColor: activeTab === t ? C.sacredGold : "transparent",
                }}
              >
                <Text style={{ color: activeTab === t ? C.surfaceDeep : C.sacredGold, fontSize: 13, fontWeight: "600" }}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {ACTIVITY_ITEMS.map((item) => (
          <View
            key={item.id}
            style={{
              flexDirection: "row", alignItems: "center",
              paddingVertical: spacing.m,
              borderBottomWidth: 1, borderColor: C.hairline,
            }}
          >
            <View
              style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: C.byzantineCrimson,
                alignItems: "center", justifyContent: "center",
                marginRight: spacing.m, borderWidth: 1, borderColor: C.sacredGold,
              }}
            >
              <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 16 }}>A</Text>
            </View>
            <Text style={{ color: C.textPrimary, fontFamily: "serif", fontSize: 14, flex: 1, lineHeight: 20 }}>{item.text}</Text>
            <Text style={{ color: C.textMuted, fontSize: 12, marginLeft: spacing.s }}>{item.when}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Add Church Modal */}
      <Modal visible={churchModal} transparent animationType="slide" onRequestClose={() => setChurchModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={() => setChurchModal(false)} />
        <View style={{ backgroundColor: C.surfaceElevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderColor: C.hairline, padding: spacing.l, paddingBottom: spacing.xxl }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.sacredGold, alignSelf: "center", marginBottom: spacing.m }} />
          <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 20, textAlign: "center", marginBottom: spacing.m }}>Add Your Church</Text>
          <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 14, textAlign: "center", marginBottom: spacing.l }}>
            Connect with your parish community to share prayers and events.
          </Text>
          <Pressable onPress={() => setChurchModal(false)} style={({ pressed }) => ({ backgroundColor: pressed ? C.surface : C.byzantineCrimson, paddingVertical: spacing.m, borderRadius: radii.pill, alignItems: "center", borderWidth: 1, borderColor: C.sacredGold })}>
            <Text style={{ color: C.sacredGold, fontWeight: "700", fontFamily: "serif" }}>Coming Soon</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Badge Detail Modal */}
      {selectedBadgeDef && (
        <Modal visible={!!badgeDetailModal} transparent animationType="slide" onRequestClose={() => setBadgeDetailModal(null)}>
          <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={() => setBadgeDetailModal(null)} />
          <View style={{ backgroundColor: C.surfaceElevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderColor: C.hairline, padding: spacing.l, paddingBottom: spacing.xxl, alignItems: "center" }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.sacredGold, alignSelf: "center", marginBottom: spacing.m }} />
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: selectedBadgeDef.color, marginBottom: spacing.m }}>
              <MaterialCommunityIcons name={selectedBadgeDef.mciIcon as any} size={36} color={selectedBadgeDef.color} />
            </View>
            <Text style={{ fontFamily: "serif", fontWeight: "700", fontSize: 22, color: C.sacredGold, marginBottom: 6 }}>{selectedBadgeDef.label}</Text>
            <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 14, textAlign: "center", marginBottom: spacing.m }}>{selectedBadgeDef.description}</Text>
            <View style={{ width: "100%", height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)", marginBottom: 8 }}>
              <View style={{ width: `${Math.round((selectedProgress / selectedBadgeDef.max) * 100)}%`, height: 6, borderRadius: 3, backgroundColor: selectedBadgeDef.color }} />
            </View>
            <Text style={{ color: C.textMuted, fontSize: 13 }}>
              {selectedProgress} / {selectedBadgeDef.max} — {Math.round((selectedProgress / selectedBadgeDef.max) * 100)}%
            </Text>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
