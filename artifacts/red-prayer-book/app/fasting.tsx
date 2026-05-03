import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";
import {
  getFastingPeriods,
  getTodayFastStatus,
  getPeriodProgress,
  getStrictnessLabel,
  getStrictnessColor,
  formatShortDate,
  SINGLE_FASTS,
  getPascha,
  type FastingPeriod,
  type FastStrictness,
} from "@/lib/fasting";

type MCI = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const STRICTNESS_ORDER: FastStrictness[] = ["strict", "moderate", "light", "weekly", "free"];

function StrictnessBar({ strictness }: { strictness: FastStrictness }) {
  const filled = 4 - STRICTNESS_ORDER.indexOf(strictness);
  const color = getStrictnessColor(strictness);
  return (
    <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            backgroundColor: i < filled ? color : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </View>
  );
}

function PeriodCard({
  period,
  today,
}: {
  period: FastingPeriod;
  today: Date;
}) {
  const [expanded, setExpanded] = useState(false);
  const isActive = useMemo(() => {
    const d = today.getTime();
    return d >= period.startDate.getTime() && d <= period.endDate.getTime();
  }, [period, today]);

  const isFuture = today < period.startDate;
  const isPast = today > period.endDate;
  const progress = isActive ? getPeriodProgress(period, today) : null;

  const borderColor = isActive ? period.color : C.hairline;
  const striccLabel = getStrictnessLabel(period.strictness);

  return (
    <View
      style={{
        marginBottom: spacing.s,
        borderRadius: radii.m,
        borderWidth: isActive ? 1.5 : 1,
        borderColor,
        backgroundColor: C.surfaceElevated,
        overflow: "hidden",
        opacity: isPast ? 0.55 : 1,
      }}
    >
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        style={({ pressed }) => ({
          padding: spacing.m,
          backgroundColor: pressed ? C.surface : "transparent",
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.s }}>
          {/* Icon */}
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: isPast ? "rgba(255,255,255,0.05)" : period.color,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: isPast ? C.hairline : "rgba(255,255,255,0.2)",
            }}
          >
            <MaterialCommunityIcons
              name={period.icon as MCI}
              size={20}
              color={isPast ? C.textMuted : C.ivoryVellum}
            />
          </View>

          {/* Title block */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
              <Text
                style={{
                  color: isActive ? C.sacredGold : isPast ? C.textMuted : C.textPrimary,
                  fontFamily: "serif",
                  fontWeight: "700",
                  fontSize: 15,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {period.name}
              </Text>
              {isActive && (
                <View
                  style={{
                    backgroundColor: period.color,
                    borderRadius: radii.pill,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: C.ivoryVellum, fontSize: 9, fontWeight: "700", letterSpacing: 0.8 }}>
                    NOW
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
              {formatShortDate(period.startDate)} — {formatShortDate(period.endDate)}
              {progress ? ` · ${progress.daysLeft} day${progress.daysLeft === 1 ? "" : "s"} left` : ""}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.s, marginTop: 4 }}>
              <StrictnessBar strictness={period.strictness} />
              <Text style={{ color: C.textMuted, fontSize: 11 }}>
                {striccLabel}
              </Text>
            </View>
          </View>

          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={C.textMuted}
          />
        </View>

        {/* Progress bar for active period */}
        {isActive && progress && (
          <View style={{ marginTop: spacing.s }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)" }}>
              <View
                style={{
                  width: `${Math.round(progress.pct * 100)}%`,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: period.color,
                }}
              />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 3 }}>
              <Text style={{ color: C.textMuted, fontSize: 10 }}>Day {progress.elapsed} of {progress.total}</Text>
              <Text style={{ color: C.textMuted, fontSize: 10 }}>{Math.round(progress.pct * 100)}%</Text>
            </View>
          </View>
        )}
      </Pressable>

      {expanded && (
        <View
          style={{
            paddingHorizontal: spacing.m,
            paddingBottom: spacing.m,
            borderTopWidth: 1,
            borderColor: C.hairline,
          }}
        >
          <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 13, lineHeight: 20, marginTop: spacing.s, marginBottom: spacing.s }}>
            {period.description}
          </Text>
          {period.rules.map((rule, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, marginBottom: 4 }}>
              <MaterialCommunityIcons
                name={period.fastFree ? "check-circle-outline" : "cross-circle-outline"}
                size={13}
                color={period.fastFree ? "#276A3D" : period.color}
                style={{ marginTop: 2 }}
              />
              <Text style={{ color: C.textSecondary, fontSize: 13, flex: 1, lineHeight: 18 }}>{rule}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function FastingScreen() {
  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const periods = useMemo(() => getFastingPeriods(year), [year]);
  const status = useMemo(() => getTodayFastStatus(today), [today]);
  const pascha = useMemo(() => getPascha(year), [year]);

  const statusColor = getStrictnessColor(status.strictness);

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
            Fasting Calendar
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 11 }}>Orthodox fasting periods · {year}</Text>
        </View>
        <MaterialCommunityIcons name="fish" size={20} color={C.textMuted} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* Today's status hero */}
        <View
          style={{
            margin: spacing.m,
            borderRadius: radii.l,
            borderWidth: 1.5,
            borderColor: statusColor,
            overflow: "hidden",
          }}
        >
          <View style={{ backgroundColor: statusColor, paddingHorizontal: spacing.l, paddingVertical: spacing.s, flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <MaterialCommunityIcons
              name={status.isFastFree ? "party-popper" : status.isFasting ? "cross" : "check"}
              size={14}
              color="rgba(245,235,221,0.9)"
            />
            <Text style={{ color: "rgba(245,235,221,0.9)", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
              {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </Text>
          </View>

          <View style={{ backgroundColor: C.surfaceElevated, padding: spacing.l }}>
            <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 22, marginBottom: 4 }}>
              {status.label}
            </Text>
            <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 13, marginBottom: spacing.m }}>
              {status.sublabel}
            </Text>

            {/* Active period progress */}
            {status.period && !status.isFastFree && (() => {
              const prog = getPeriodProgress(status.period, today);
              return (
                <View style={{ marginBottom: spacing.m }}>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <View style={{ width: `${Math.round(prog.pct * 100)}%`, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                    <Text style={{ color: C.textMuted, fontSize: 11 }}>Day {prog.elapsed} of {prog.total}</Text>
                    <Text style={{ color: C.textMuted, fontSize: 11 }}>{prog.daysLeft} day{prog.daysLeft === 1 ? "" : "s"} remaining</Text>
                  </View>
                </View>
              );
            })()}

            {/* Today's rules */}
            <View style={{ gap: 6 }}>
              {status.rules.slice(0, 3).map((rule, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.xs }}>
                  <MaterialCommunityIcons
                    name={status.isFastFree ? "check-circle" : "circle-small"}
                    size={16}
                    color={statusColor}
                    style={{ marginTop: 1 }}
                  />
                  <Text style={{ color: C.textPrimary, fontFamily: "serif", fontSize: 14, flex: 1, lineHeight: 20 }}>{rule}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Pascha date */}
        <View
          style={{
            marginHorizontal: spacing.m,
            marginBottom: spacing.m,
            padding: spacing.m,
            borderRadius: radii.m,
            borderWidth: 1,
            borderColor: C.hairline,
            backgroundColor: C.surfaceElevated,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.m,
          }}
        >
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.byzantineCrimson, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.sacredGold }}>
            <MaterialCommunityIcons name="star-four-points" size={22} color={C.sacredGold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 15 }}>
              Pascha {year}
            </Text>
            <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 13 }}>
              {pascha.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </Text>
          </View>
          <Text style={{ color: C.textMuted, fontSize: 12 }}>
            {today < pascha
              ? `${Math.ceil((pascha.getTime() - today.getTime()) / 86400000)} days away`
              : "Christ is Risen!"}
          </Text>
        </View>

        {/* One-day fasts */}
        <Text
          style={{
            color: C.textMuted,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.8,
            textTransform: "uppercase",
            marginHorizontal: spacing.m,
            marginBottom: spacing.s,
          }}
        >
          Annual One-Day Fasts
        </Text>
        <View style={{ marginHorizontal: spacing.m, marginBottom: spacing.m, gap: spacing.xs }}>
          {SINGLE_FASTS.map((f) => {
            const d = new Date(year, f.month, f.day);
            const isToday = sameDay(d, today);
            return (
              <View
                key={f.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.m,
                  padding: spacing.m,
                  borderRadius: radii.m,
                  borderWidth: 1,
                  borderColor: isToday ? "#8B0E1A" : C.hairline,
                  backgroundColor: isToday ? "rgba(139,14,26,0.15)" : C.surfaceElevated,
                }}
              >
                <MaterialCommunityIcons name="cross" size={16} color={isToday ? C.sacredGold : C.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: isToday ? C.sacredGold : C.textPrimary, fontFamily: "serif", fontSize: 14 }}>{f.name}</Text>
                  <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{formatShortDate(d)}</Text>
                </View>
                {isToday && (
                  <View style={{ backgroundColor: "#8B0E1A", borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ color: C.ivoryVellum, fontSize: 9, fontWeight: "700" }}>TODAY</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* All periods */}
        <Text
          style={{
            color: C.textMuted,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.8,
            textTransform: "uppercase",
            marginHorizontal: spacing.m,
            marginBottom: spacing.s,
          }}
        >
          Fasting Periods · {year}
        </Text>
        <View style={{ paddingHorizontal: spacing.m }}>
          {periods.map((p) => (
            <PeriodCard key={p.id} period={p} today={today} />
          ))}
        </View>

        {/* Weekly fast note */}
        <View
          style={{
            marginHorizontal: spacing.m,
            marginTop: spacing.s,
            padding: spacing.m,
            borderRadius: radii.m,
            borderWidth: 1,
            borderColor: C.hairline,
            backgroundColor: C.surfaceElevated,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.m,
          }}
        >
          <MaterialCommunityIcons name="information-outline" size={18} color={C.textMuted} style={{ marginTop: 2 }} />
          <Text style={{ color: C.textMuted, fontFamily: "serif", fontSize: 13, lineHeight: 20, flex: 1 }}>
            Wednesday and Friday are fasting days throughout the year, except during fast-free weeks (Bright Week, Cheese Week, Pentecost Week, Christmas Week).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
