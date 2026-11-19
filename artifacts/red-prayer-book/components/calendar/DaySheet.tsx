import { Text, View } from "react-native";
import { FadeInBlock, SmallCaps } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { dayHeading, MONTHS, WEEKDAYS, type LiturgicalDay } from "@/lib/calendar";
import type { CalendarStyle } from "@/lib/prefs";
import { fonts } from "@/theme/typography";

type Props = {
  date: Date;
  style: CalendarStyle;
  day: LiturgicalDay | undefined;
  loading: boolean;
  failed: boolean;
  textFailed?: boolean;
};

export function DayEntry({ date, style, day, loading, failed, textFailed }: Props) {
  const C = usePalette();
  const heading = day ? dayHeading(day) : "";
  const church =
    day && style === "old"
      ? `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} · Old Calendar ${day.churchDay} ${MONTHS[(day.churchMonth || 1) - 1]}`
      : `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;

  return (
    <FadeInBlock token={`${date.toDateString()}-${style}-${heading}`}>
      <View style={{ marginTop: 26, borderTopWidth: 1, borderTopColor: C.rule2, paddingTop: 18 }}>
        <SmallCaps size={15}>{church}</SmallCaps>
        {loading && !day ? (
          <Text style={{ fontFamily: fonts.italic, fontSize: 18, color: C.ink2, marginTop: 10 }}>
            Loading the commemorations…
          </Text>
        ) : null}
        {failed && !day ? (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 26, lineHeight: 32, color: C.ink }}>
              Commemorations unavailable
            </Text>
            <Text style={{ fontFamily: fonts.italic, fontSize: 17, lineHeight: 26, color: C.ink2, marginTop: 8 }}>
              Saints and readings could not be loaded. Nothing is shown in their place.
            </Text>
          </View>
        ) : null}
        {day && !heading && !loading ? (
          <Text style={{ fontFamily: fonts.italic, fontSize: 18, color: C.ink2, marginTop: 8 }}>
            No commemoration was listed for this day.
          </Text>
        ) : null}
        {heading ? (
          <Text style={{ fontFamily: fonts.medium, fontSize: 26, lineHeight: 32, color: C.ink, marginTop: 6 }}>
            {heading}
          </Text>
        ) : null}
        {day && day.saints.length > 1 ? (
          <Text style={{ fontFamily: fonts.italic, fontSize: 17, lineHeight: 26, color: C.ink2, marginTop: 8 }}>
            {day.saints.join(" · ")}
          </Text>
        ) : null}
        {day ? (
          <View style={{ marginTop: 14, gap: 8 }}>
            {day.fastLevelDesc ? (
              <Line label="Fast" value={[day.fastLevelDesc, day.fastExceptionDesc].filter(Boolean).join(" · ")} />
            ) : null}
            {day.abstentions.length > 0 ? <Line label="Abstain" value={day.abstentions.join(", ")} /> : null}
            {day.tone != null ? <Line label="Tone" value={String(day.tone)} /> : null}
            {day.readings.length === 0 ? (
              <Text style={{ fontFamily: fonts.italic, color: C.ink2, fontSize: 16 }}>No readings were listed.</Text>
            ) : (
              day.readings.map((reading) => (
                <View key={`${reading.source}-${reading.display}`} style={{ marginTop: 8 }}>
                  <SmallCaps size={15}>
                    {reading.source} · {reading.display}
                  </SmallCaps>
                  {reading.verses.length > 0 ? (
                    <Text style={{ fontFamily: fonts.regular, fontSize: 17, lineHeight: 26, color: C.ink, marginTop: 4 }}>
                      {reading.verses.map((verse) => verse.content).join(" ")}
                    </Text>
                  ) : null}
                </View>
              ))
            )}
            {textFailed ? (
              <Text style={{ fontFamily: fonts.italic, color: C.ink2, fontSize: 16, marginTop: 8 }}>
                The reading text could not be loaded.
              </Text>
            ) : null}
            {day.stories.slice(0, 2).map((story) => {
              const excerpt = story.story.length > 700 ? `${story.story.slice(0, 700).trimEnd()}…` : story.story;
              return (
                <View key={story.title} style={{ marginTop: 12 }}>
                  <SmallCaps size={15}>{story.title}</SmallCaps>
                  {excerpt ? (
                    <Text style={{ fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: C.ink, marginTop: 4 }}>
                      {excerpt}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </FadeInBlock>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  const C = usePalette();
  return (
    <Text style={{ fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, color: C.ink }}>
      <Text style={{ color: C.rubric, fontFamily: fonts.medium, fontVariant: ["small-caps"] }}>{label}  </Text>
      {value}
    </Text>
  );
}
