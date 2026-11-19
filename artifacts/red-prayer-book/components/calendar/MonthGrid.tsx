import { Pressable, Text, View } from "react-native";
import { usePalette } from "@/hooks/usePalette";
import { fastMark, type LiturgicalDay } from "@/lib/calendar";
import { fonts } from "@/theme/typography";

type Props = {
  year: number;
  month: number;
  days: LiturgicalDay[] | undefined;
  selected: number;
  onSelect: (day: number) => void;
};

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export function MonthGrid({ year, month, days, selected, onSelect }: Props) {
  const C = usePalette();
  const first = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let day = 1; day <= count; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  const today = new Date();

  return (
    <View style={{ maxWidth: 470, alignSelf: "center", width: "100%" }}>
      <View style={{ flexDirection: "row" }}>
        {DOW.map((label, index) => (
          <Text
            key={`${label}-${index}`}
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: fonts.medium,
              fontSize: 15,
              color: index === 0 ? C.rubric : C.ink2,
              fontVariant: ["small-caps"],
              paddingVertical: 6,
            }}
          >
            {label}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {cells.map((day, index) => {
          if (day == null) return <View key={`e-${index}`} style={{ width: "14.285%", aspectRatio: 1 }} />;
          const info = days?.find((item) => item.civilDay === day);
          const mark = info ? fastMark(info) : null;
          const feast = info?.greatFeast ?? false;
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          const isSelected = day === selected;
          const sunday = new Date(year, month, day).getDay() === 0;
          return (
            <Pressable
              key={day}
              onPress={() => onSelect(day)}
              accessibilityLabel={`${day}${feast ? ", great feast" : ""}`}
              accessibilityState={{ selected: isSelected }}
              style={{
                width: "14.285%",
                aspectRatio: 1,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                backgroundColor: isSelected ? C.rubric : "transparent",
                borderWidth: isToday && !isSelected ? 1 : 0,
                borderColor: C.rubric,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: 18,
                  color: isSelected ? C.onRubric : sunday ? C.rubric : C.ink,
                  fontVariant: ["oldstyle-nums"],
                }}
              >
                {day}
              </Text>
              <View style={{ flexDirection: "row", gap: 3, height: 8, alignItems: "center" }}>
                {feast ? (
                  <Text style={{ color: isSelected ? C.onRubric : C.rubric, fontSize: 9, lineHeight: 10 }}>✠</Text>
                ) : null}
                {mark === "strict" ? (
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: isSelected ? C.onRubric : C.rubric }} />
                ) : null}
                {mark === "fish" ? (
                  <View style={{ width: 5, height: 5, borderRadius: 3, borderWidth: 1, borderColor: isSelected ? C.onRubric : C.rubric }} />
                ) : null}
                {mark === "weekly" ? (
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: isSelected ? C.onRubric : C.ink2 }} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
