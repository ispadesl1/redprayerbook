import { useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";
import { getCalendarEntry } from "@/lib/calendar";
import { incrementBadge } from "@/lib/badges";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function Calendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [calStyle, setCalStyle] = useState<"new" | "old">("new");

  const prevMonth = () => {
    incrementBadge("calendar");
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    incrementBadge("calendar");
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const todayEntry = getCalendarEntry(now);
  const toneNum = (now.getDay() % 8) + 1;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.surfaceDeep }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.s,
          }}
        >
          <Pressable style={{ padding: 4 }}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={C.sacredGold} />
          </Pressable>
          <Text style={{ fontFamily: "serif", fontWeight: "700", fontSize: 22, color: C.ivoryVellum }}>
            Calendar
          </Text>
          <Text style={{ fontSize: 22 }}>🇺🇸</Text>
        </View>

        {/* Style toggle */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: spacing.m,
            borderRadius: radii.pill,
            borderWidth: 1,
            borderColor: C.hairline,
            overflow: "hidden",
            marginBottom: spacing.s,
          }}
        >
          {(["new", "old"] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setCalStyle(s)}
              style={{
                flex: 1,
                paddingVertical: 10,
                backgroundColor: calStyle === s ? C.byzantineCrimson : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: calStyle === s ? C.sacredGold : C.textSecondary,
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                {s === "new" ? "New Calendar" : "Old Calendar"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Month nav */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.xs,
          }}
        >
          <Pressable onPress={prevMonth} style={{ padding: spacing.s }}>
            <MaterialCommunityIcons name="chevron-left" size={26} color={C.sacredGold} />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: "serif", fontWeight: "700", fontSize: 22, color: C.sacredGold }}>
              {MONTHS[month]}
            </Text>
            <Text style={{ color: C.textSecondary, fontSize: 13 }}>{year}</Text>
          </View>
          <Pressable onPress={nextMonth} style={{ padding: spacing.s }}>
            <MaterialCommunityIcons name="chevron-right" size={26} color={C.sacredGold} />
          </Pressable>
        </View>

        <MonthGrid year={year} month={month} style={calStyle} />

        {/* Tone & today's reading */}
        <View
          style={{
            margin: spacing.m,
            padding: spacing.m,
            backgroundColor: C.surfaceElevated,
            borderRadius: radii.m,
            borderWidth: 1,
            borderColor: C.hairline,
            gap: spacing.xs,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.s }}>
            <MaterialCommunityIcons name="music-note" size={16} color={C.sacredGold} />
            <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 15 }}>
              Tone {toneNum} of the Week
            </Text>
          </View>
          {todayEntry?.saints?.length ? (
            <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 13 }}>
              {todayEntry.saints[0]}
            </Text>
          ) : null}
          {todayEntry?.fast && todayEntry.fast !== "none" ? (
            <View
              style={{
                alignSelf: "flex-start",
                paddingHorizontal: spacing.s,
                paddingVertical: 3,
                borderRadius: radii.pill,
                backgroundColor: C.vesperPurple,
              }}
            >
              <Text style={{ color: C.ivoryVellum, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>
                {todayEntry.fast} fast
              </Text>
            </View>
          ) : null}
        </View>

        {/* Sunday Readings */}
        {todayEntry?.gospel ? (
          <View
            style={{
              marginHorizontal: spacing.m,
              marginBottom: spacing.m,
              padding: spacing.m,
              backgroundColor: C.surfaceElevated,
              borderRadius: radii.m,
              borderWidth: 1,
              borderColor: C.hairline,
            }}
          >
            <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 15, marginBottom: 6 }}>
              Sunday Readings
            </Text>
            {todayEntry.gospel ? (
              <Text style={{ color: C.textPrimary, fontFamily: "serif", fontSize: 13, marginBottom: 4 }}>
                Gospel · {todayEntry.gospel.ref}
              </Text>
            ) : null}
            {todayEntry.epistle ? (
              <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 13 }}>
                Epistle · {todayEntry.epistle.ref}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* FAB-style buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: spacing.m,
            paddingHorizontal: spacing.m,
            paddingBottom: spacing.m,
          }}
        >
          {([
            { icon: "minus", label: "Prev" },
            { icon: "plus", label: "Add" },
          ] as const).map(({ icon, label }) => (
            <Pressable
              key={icon}
              style={({ pressed }) => ({
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: pressed ? C.surface : C.byzantineCrimson,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: C.sacredGold,
                elevation: 4,
              })}
            >
              <MaterialCommunityIcons name={icon} size={24} color={C.sacredGold} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
