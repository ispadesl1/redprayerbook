import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ManuscriptScroll, Ornament, ReadingText, SmallCaps, StackBar } from "@/components/ui/manuscript";
import { useLiturgicalDay } from "@/hooks/useCalendarData";
import { usePalette } from "@/hooks/usePalette";
import { lifeForName, saintOfTheDay, CALENDAR_CREDIT, MONTHS } from "@/lib/calendar";
import { usePrefs } from "@/lib/prefs";
import { fonts } from "@/theme/typography";

function dateFromId(id: string | undefined): Date {
  if (id && /^\d{4}-\d{2}-\d{2}$/.test(id)) {
    const [year, month, day] = id.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date();
}

export default function SaintDetail() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const C = usePalette();
  const style = usePrefs((state) => state.calendarStyle);
  const date = dateFromId(id);
  const dayQuery = useLiturgicalDay(date, style);
  const day = dayQuery.data;
  const requested = (typeof name === "string" ? name : "").trim() || (day ? saintOfTheDay(day) : "");
  const life = day && requested ? lifeForName(day.stories, requested) : null;
  const loading = dayQuery.isLoading && !day;
  const failed = dayQuery.isError && !day;
  const heading = life?.title || requested || "This commemoration";

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StackBar title="Lives of the Saints" onBack={() => router.back()} />
      <ManuscriptScroll>
        <SmallCaps>
          {date.getDate()} {MONTHS[date.getMonth()]} {date.getFullYear()}
        </SmallCaps>
        <Text style={{ fontFamily: fonts.medium, fontSize: 32, lineHeight: 38, color: C.ink, marginTop: 8 }}>{heading}</Text>
        {loading ? (
          <Text style={{ fontFamily: fonts.italic, fontSize: 18, lineHeight: 28, color: C.ink2, marginTop: 16 }}>
            Loading the life…
          </Text>
        ) : null}
        {failed ? (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontFamily: fonts.italic, fontSize: 18, lineHeight: 28, color: C.ink2 }}>
              The life could not be loaded from orthocal.info.
            </Text>
            <Pressable onPress={() => dayQuery.refetch()} style={{ minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Try again</Text>
            </Pressable>
          </View>
        ) : null}
        {!loading && !failed && life ? (
          <>
            <Ornament />
            <ReadingText text={life.story} size={20} dropCap />
            <Text style={{ fontFamily: fonts.italic, fontSize: 16, lineHeight: 24, color: C.ink2, marginTop: 22 }}>
              {CALENDAR_CREDIT}
            </Text>
          </>
        ) : null}
        {!loading && !failed && !life ? (
          <Text style={{ fontFamily: fonts.italic, fontSize: 18, lineHeight: 28, color: C.ink2, marginTop: 16 }}>
            {requested
              ? `orthocal.info did not include a life for ${requested}.`
              : "No commemoration was listed for this day, so there is no life to show."}
          </Text>
        ) : null}
      </ManuscriptScroll>
    </View>
  );
}
