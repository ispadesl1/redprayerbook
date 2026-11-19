import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { DayEntry } from "@/components/calendar/DaySheet";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { IconPress, ManuscriptScroll, SmallCaps, useFrame } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import {
  CALENDAR_CREDIT,
  fetchLiturgicalDay,
  fetchLiturgicalMonth,
  MONTHS,
} from "@/lib/calendar";
import { incrementBadge } from "@/lib/badges";
import { getTodayFastStatus } from "@/lib/fasting";
import { localYmd, usePrefs } from "@/lib/prefs";
import { fonts } from "@/theme/typography";

export default function Calendar() {
  const C = usePalette();
  const { showMargin } = useFrame();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(now.getDate());
  const style = usePrefs((state) => state.calendarStyle);
  const setStyle = usePrefs((state) => state.setCalendarStyle);

  const shift = (delta: number) => {
    incrementBadge("calendar");
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelected(1);
  };

  const monthQuery = useQuery({
    queryKey: ["orthocal-month", style, year, month],
    queryFn: () => fetchLiturgicalMonth(year, month, style),
    staleTime: 12 * 60 * 60 * 1000,
  });

  const selectedDate = new Date(year, month, selected);
  const dayQuery = useQuery({
    queryKey: ["orthocal-day", style, localYmd(selectedDate)],
    queryFn: () => fetchLiturgicalDay(selectedDate, style),
    staleTime: 12 * 60 * 60 * 1000,
  });

  const monthDay = monthQuery.data?.find((item) => item.civilDay === selected);
  const day = dayQuery.data ?? monthDay;
  const fast = getTodayFastStatus(selectedDate);

  const margin = (
    <View>
      <SmallCaps>This day</SmallCaps>
      <Text style={{ fontFamily: fonts.regular, fontSize: 18, lineHeight: 26, color: C.ink, marginTop: 8 }}>
        {fast.label}. {fast.sublabel}
      </Text>
      <Pressable onPress={() => router.push("/fasting" as never)} style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Fasting calendar ›</Text>
      </Pressable>
    </View>
  );

  return (
    <ManuscriptScroll inTabs margin={showMargin ? margin : undefined}>
      <Text style={{ fontFamily: fonts.medium, fontSize: 34, color: C.ink, textAlign: "center" }}>Calendar</Text>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 18, marginTop: 8 }}>
        {(["new", "old"] as const).map((item) => {
          const on = style === item;
          return (
            <Pressable key={item} onPress={() => setStyle(item)} accessibilityState={{ selected: on }} style={{ minHeight: 44, justifyContent: "center" }}>
              <Text
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 18,
                  color: on ? C.rubric : C.ink2,
                  fontVariant: ["small-caps"],
                  borderBottomWidth: on ? 1 : 0,
                  borderBottomColor: C.rubric,
                }}
              >
                {item === "new" ? "New Calendar" : "Old Calendar"}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <IconPress label="Previous month" onPress={() => shift(-1)}>
          <Text style={{ color: C.ink, fontSize: 22 }}>‹</Text>
        </IconPress>
        <Text style={{ fontFamily: fonts.medium, fontSize: 26, color: C.ink }}>
          {MONTHS[month]}{" "}
          <Text style={{ fontVariant: ["oldstyle-nums"] }}>{year}</Text>
        </Text>
        <IconPress label="Next month" onPress={() => shift(1)}>
          <Text style={{ color: C.ink, fontSize: 22 }}>›</Text>
        </IconPress>
      </View>
      <MonthGrid
        year={year}
        month={month}
        days={monthQuery.data}
        selected={selected}
        onSelect={(dayNumber) => {
          setSelected(dayNumber);
          incrementBadge("calendar");
        }}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 14, maxWidth: 470, alignSelf: "center" }}>
        <Legend swatch="strict" label="Strict fast" />
        <Legend swatch="fish" label="Fish, oil, wine" />
        <Legend swatch="weekly" label="Wed/Fri fast" />
        <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 15 }}>✠ Great feast</Text>
      </View>
      {monthQuery.isError && !monthQuery.data ? (
        <Text style={{ fontFamily: fonts.italic, color: C.ink2, marginTop: 12, textAlign: "center" }}>
          The month’s commemorations could not be loaded.
        </Text>
      ) : null}
      <DayEntry
        date={selectedDate}
        style={style}
        day={day}
        loading={(dayQuery.isLoading || monthQuery.isLoading) && !day}
        failed={(dayQuery.isError || monthQuery.isError) && !day}
        textFailed={dayQuery.isError && !dayQuery.data}
      />
      {!showMargin ? <View style={{ marginTop: 20 }}>{margin}</View> : null}
      <Text style={{ fontFamily: fonts.italic, fontSize: 14, lineHeight: 20, color: C.ink2, marginTop: 28 }}>
        {CALENDAR_CREDIT}
      </Text>
    </ManuscriptScroll>
  );
}

function Legend({ swatch, label }: { swatch: "strict" | "fish" | "weekly"; label: string }) {
  const C = usePalette();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: swatch === "fish" ? "transparent" : swatch === "weekly" ? C.ink2 : C.rubric,
          borderWidth: swatch === "fish" ? 1 : 0,
          borderColor: C.rubric,
        }}
      />
      <Text style={{ color: C.ink2, fontFamily: fonts.regular, fontSize: 15 }}>{label}</Text>
    </View>
  );
}
