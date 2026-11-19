import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePalette } from "@/hooks/usePalette";
import { fonts } from "@/theme/typography";

const STEPS = [
  {
    title: "Welcome to\nthe Red Prayer Book",
    body: "A pocket prayer book of Orthodox Christian prayer, carried with you.",
  },
  {
    title: "Pray with\nthe holy fathers",
    body: "Morning and evening prayers, the calendar, and the prayers of the book.",
  },
  {
    title: "Begin the day",
    body: "Open the page, keep the hours, and let the words be said slowly.",
  },
];

export default function Onboarding() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const C = usePalette();
  const insets = useSafeAreaInsets();
  const stepNum = Math.max(0, Math.min(2, Number(step) || 0));
  const current = STEPS[stepNum];
  const isLast = stepNum === STEPS.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper, paddingTop: insets.top + 36, paddingBottom: insets.bottom + 28, paddingHorizontal: 28 }}>
      <Text style={{ textAlign: "center", color: C.rubric, fontSize: 28 }}>✠</Text>
      <Text style={{ fontFamily: fonts.medium, fontSize: 34, lineHeight: 40, color: C.ink, textAlign: "center", marginTop: 28 }}>
        {current.title}
      </Text>
      <Text style={{ fontFamily: fonts.italic, fontSize: 19, lineHeight: 30, color: C.ink2, textAlign: "center", marginTop: 18 }}>
        {current.body}
      </Text>
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {STEPS.map((_, index) => (
          <View key={index} style={{ width: 18, height: 2, backgroundColor: index === stepNum ? C.rubric : C.rule }} />
        ))}
      </View>
      <Pressable
        onPress={() => {
          if (isLast) router.replace("/(tabs)");
          else router.push(`/onboarding/${stepNum + 1}` as never);
        }}
        style={{ backgroundColor: C.rubric, minHeight: 52, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: C.onRubric, fontFamily: fonts.medium, fontSize: 18 }}>
          {isLast ? "Begin" : "Continue"}
        </Text>
      </Pressable>
    </View>
  );
}
