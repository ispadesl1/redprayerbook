import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { DayEntry } from "@/components/calendar/DaySheet";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { IconPress, ManuscriptScroll, SmallCaps, useFrame } from "@/components/ui/manuscript";
import { useLiturgicalDay, useLiturgicalMonth } from "@/hooks/useCalendarData";
import { usePalette } from "@/hooks/usePalette";
import { CALENDAR_CREDIT, fastLines, MONTHS } from "@/lib/calendar";
import { incrementBadge } from "@/lib/badges";
import { usePrefs } from "@/lib/prefs";
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

  const monthQuery = useLiturgicalMonth(year, month, style);
  const selectedDate = new Date(year, month, selected);
  const dayQuery = useLiturgicalDay(selectedDate, style);
  const monthDay = monthQuery.data?.find((item) => item.civilDay === selected);
  const day = dayQuery.data ?? monthDay;
  const fast = day ? fastLines(day) : null;
  const fastFailed = (dayQuery.isError || monthQuery.isError) && !day;

  const margin = (
    <View style={{ minHeight: showMargin ? 220 : 96 }}>
      <SmallCaps>This day</SmallCaps>
      {day ? (
        <Text style={{ fontFamily: fonts.regular, fontSize: 18, lineHeight: 26, color: C.ink, marginTop: 8 }}>
          {fast?.title || "No fast is listed for this day."}
          {fast?.detail ? `\n${fast.detail}` : ""}
        </Text>
      ) : fastFailed ? (
        <Text style={{ fontFamily: fonts.italic, fontSize: 17, lineHeight: 26, color: C.ink2, marginTop: 8 }}>
          The fast for this calendar isn’t available.
        </Text>
      ) : (
        <Text style={{ fontFamily: fonts.italic, fontSize: 17, lineHeight: 26, color: C.ink2, marginTop: 8 }}>Loading the fast…</Text>
      )}
      <Pressable onPress={() => router.push("/fasting" as never)} accessibilityRole="link" style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>The book’s fasting calendar ›</Text>
      </Pressable>
    </View>
  );

  return (
    <ManuscriptScroll inTabs margin={showMargin ? margin : undefined}>
      <Text style={{ fontFamily: fonts.medium, fontSize: 34, color: C.ink, textAlign: "center" }}>Calendar</Text>
      <View accessibilityRole="radiogroup" style={{ flexDirection: "row", justifyContent: "center", gap: 18, marginTop: 8 }}>
        {(["new", "old"] as const).map((item) => {
          const on = style === item;
          return (
            <Pressable
              key={item}
              onPress={() => setStyle(item)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on, checked: on }}
              aria-checked={on}
              style={{ minHeight: 44, minWidth: 44, justifyContent: "center", paddingHorizontal: 4 }}
            >
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
          <Text style={{ color: C.ink, fontFamily: fonts.regular, fontSize: 22, lineHeight: 26 }}>‹</Text>
        </IconPress>
        <Text style={{ fontFamily: fonts.medium, fontSize: 26, color: C.ink }}>
          {MONTHS[month]}{" "}
          <Text style={{ fontVariant: ["oldstyle-nums"] }}>{year}</Text>
        </Text>
        <IconPress label="Next month" onPress={() => shift(1)}>
          <Text style={{ color: C.ink, fontFamily: fonts.regular, fontSize: 22, lineHeight: 26 }}>›</Text>
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
        <Legend swatch="wine" label="Wine and oil" />
        <Legend swatch="fish" label="Fish, wine and oil" />
        <Legend swatch="dairy" label="Dairy allowed" />
        <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 15, lineHeight: 20 }}>✠ Great feast</Text>
      </View>
      {monthQuery.isError && !monthQuery.data ? (
        <Text style={{ fontFamily: fonts.italic, color: C.ink2, marginTop: 12, textAlign: "center" }}>
          The month’s commemorations could not be loaded.
        </Text>
      ) : null}
      <Text style={{ fontFamily: fonts.italic, fontSize: 15, lineHeight: 22, color: C.ink2, marginTop: 22, minHeight: 44 }}>
        {CALENDAR_CREDIT}
      </Text>
      <DayEntry
        date={selectedDate}
        style={style}
        day={day}
        loading={(dayQuery.isLoading || monthQuery.isLoading) && !day}
        failed={(dayQuery.isError || monthQuery.isError) && !day}
        textFailed={dayQuery.isError && !dayQuery.data}
        onRetry={() => {
          dayQuery.refetch();
          monthQuery.refetch();
        }}
      />
    </ManuscriptScroll>
  );
}

function Legend({ swatch, label }: { swatch: "strict" | "wine" | "fish" | "dairy"; label: string }) {
  const C = usePalette();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: swatch === "dairy" ? 0 : 4,
          backgroundColor: swatch === "strict" ? C.rubric : "transparent",
          borderWidth: swatch === "strict" ? 0 : 1,
          borderColor: swatch === "wine" || swatch === "dairy" ? C.ink2 : C.rubric,
        }}
      />
      <Text style={{ color: C.ink2, fontFamily: fonts.regular, fontSize: 15 }}>{label}</Text>
    </View>
  );
}
