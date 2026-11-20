import { useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { focusRing } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { usePrefs } from "@/lib/prefs";
import { fonts } from "@/theme/typography";

const WELCOME = [
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

const DOTS = 4;

export default function Onboarding() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const C = usePalette();
  const insets = useSafeAreaInsets();
  const completeOnboarding = usePrefs((state) => state.completeOnboarding);
  const stepNum = Math.max(0, Math.min(3, Number(step) || 0));
  const isName = stepNum === 3;
  const current = WELCOME[Math.min(stepNum, 2)];
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);

  const finish = (value?: string) => {
    completeOnboarding(value);
    router.replace("/(tabs)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper, paddingTop: insets.top + 36, paddingBottom: insets.bottom + 28, paddingHorizontal: 28 }}>
      <Text style={{ textAlign: "center", color: C.rubric, fontFamily: fonts.regular, fontSize: 28, lineHeight: 34 }}>✠</Text>
      {isName ? (
        <>
          <Text style={{ fontFamily: fonts.medium, fontSize: 34, lineHeight: 40, color: C.ink, textAlign: "center", marginTop: 28 }}>
            What should we call you?
          </Text>
          <Text style={{ fontFamily: fonts.italic, fontSize: 19, lineHeight: 30, color: C.ink2, textAlign: "center", marginTop: 18 }}>
            Optional. You can change it later in Settings. If you skip, the book will not invent a name.
          </Text>
          <TextInput
            accessibilityLabel="Your name"
            value={name}
            onChangeText={setName}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Your name"
            placeholderTextColor={C.ink2}
            maxLength={60}
            style={{
              marginTop: 28,
              minHeight: 48,
              color: C.ink,
              fontFamily: fonts.regular,
              fontSize: 20,
              lineHeight: 28,
              borderBottomWidth: focused ? 2 : 1,
              borderBottomColor: focused ? C.rubric : C.ink2,
              ...(Platform.OS === "web" ? ({ outline: "none" } as object) : null),
            }}
          />
        </>
      ) : (
        <>
          <Text style={{ fontFamily: fonts.medium, fontSize: 34, lineHeight: 40, color: C.ink, textAlign: "center", marginTop: 28 }}>
            {current.title}
          </Text>
          <Text style={{ fontFamily: fonts.italic, fontSize: 19, lineHeight: 30, color: C.ink2, textAlign: "center", marginTop: 18 }}>
            {current.body}
          </Text>
        </>
      )}
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {Array.from({ length: DOTS }, (_, index) => (
          <View key={index} style={{ width: 18, height: 2, backgroundColor: index === stepNum ? C.rubric : C.rule }} />
        ))}
      </View>
      {isName ? (
        <View style={{ gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save name"
            onPress={() => finish(name.trim())}
            style={(state) => ({
              backgroundColor: C.rubric,
              minHeight: 52,
              alignItems: "center",
              justifyContent: "center",
              ...focusRing(C.onRubric, "focused" in state && Boolean((state as { focused?: boolean }).focused)),
            })}
          >
            <Text style={{ color: C.onRubric, fontFamily: fonts.semibold, fontSize: 18 }}>Save name</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip name"
            onPress={() => finish()}
            style={(state) => ({
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
              ...focusRing(C.rubric, "focused" in state && Boolean((state as { focused?: boolean }).focused)),
            })}
          >
            <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Skip</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/onboarding/${stepNum + 1}` as never)}
          style={(state) => ({
            backgroundColor: C.rubric,
            minHeight: 52,
            alignItems: "center",
            justifyContent: "center",
            ...focusRing(C.onRubric, "focused" in state && Boolean((state as { focused?: boolean }).focused)),
          })}
        >
          <Text style={{ color: C.onRubric, fontFamily: fonts.semibold, fontSize: 18 }}>Continue</Text>
        </Pressable>
      )}
    </View>
  );
}
