import { useEffect, useState } from "react";
import { Platform, Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { focusRing, useFrame } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { usePrefs } from "@/lib/prefs";
import { EASE_OUT } from "@/theme/motion";
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

function StepCopy({ title, body, token }: { title: string; body: string; token: string }) {
  const C = usePalette();
  const reduced = useReducedMotion();
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(8);
  const bodyOpacity = useSharedValue(0);
  const bodyY = useSharedValue(8);
  useEffect(() => {
    const rise = reduced ? 0 : 8;
    titleOpacity.value = 0;
    bodyOpacity.value = 0;
    titleY.value = rise;
    bodyY.value = rise;
    titleOpacity.value = withTiming(1, { duration: reduced ? 0 : 240, easing: EASE_OUT });
    titleY.value = withTiming(0, { duration: reduced ? 0 : 240, easing: EASE_OUT });
    bodyOpacity.value = withDelay(reduced ? 0 : 50, withTiming(1, { duration: reduced ? 0 : 240, easing: EASE_OUT }));
    bodyY.value = withDelay(reduced ? 0 : 50, withTiming(0, { duration: reduced ? 0 : 240, easing: EASE_OUT }));
  }, [token, reduced, titleOpacity, titleY, bodyOpacity, bodyY]);
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value, transform: [{ translateY: titleY.value }] }));
  const bodyStyle = useAnimatedStyle(() => ({ opacity: bodyOpacity.value, transform: [{ translateY: bodyY.value }] }));
  return (
    <>
      <Animated.Text style={[{ fontFamily: fonts.medium, fontSize: 34, lineHeight: 40, color: C.ink, textAlign: "center", marginTop: 28 }, titleStyle]}>
        {title}
      </Animated.Text>
      <Animated.Text style={[{ fontFamily: fonts.italic, fontSize: 19, lineHeight: 30, color: C.ink2, textAlign: "center", marginTop: 18 }, bodyStyle]}>
        {body}
      </Animated.Text>
    </>
  );
}

export default function Onboarding() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const C = usePalette();
  const insets = useSafeAreaInsets();
  const { wide } = useFrame();
  const { height } = useWindowDimensions();
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

  const focusedRing = (state: { pressed: boolean; focused?: boolean }) =>
    "focused" in state && Boolean(state.focused);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.paper,
        paddingTop: wide ? Math.round(height * 0.16) : insets.top + 36,
        paddingBottom: insets.bottom + 28,
        paddingHorizontal: 28,
        alignItems: wide ? "center" : undefined,
      }}
    >
    <View style={wide ? { width: "100%", maxWidth: 440 } : { flex: 1 }}>
      <Text style={{ textAlign: "center", color: C.rubric, fontFamily: fonts.regular, fontSize: 28, lineHeight: 34 }}>✠</Text>
      {isName ? (
        <>
          <StepCopy token="name" title={"What should we call you?"} body="Optional. You can change it later in Settings. If you skip, the book will not invent a name." />
          <TextInput
            accessibilityLabel="Your name"
            value={name}
            onChangeText={setName}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => finish(name.trim())}
            returnKeyType="done"
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
        <StepCopy token={String(stepNum)} title={current.title} body={current.body} />
      )}
      {wide ? <View style={{ height: 36 }} /> : <View style={{ flex: 1 }} />}
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Welcome progress"
        accessibilityValue={{ min: 1, max: DOTS, now: stepNum + 1 }}
        {...(Platform.OS === "web"
          ? ({
              "aria-valuemin": 1,
              "aria-valuemax": DOTS,
              "aria-valuenow": stepNum + 1,
            } as object)
          : null)}
        style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 }}
      >
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
              ...focusRing(C.rubric, focusedRing(state)),
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
              ...focusRing(C.rubric, focusedRing(state)),
            })}
          >
            <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Skip</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue"
            onPress={() => router.push(`/onboarding/${stepNum + 1}` as never)}
            style={(state) => ({
              backgroundColor: C.rubric,
              minHeight: 52,
              alignItems: "center",
              justifyContent: "center",
              ...focusRing(C.rubric, focusedRing(state)),
            })}
          >
            <Text style={{ color: C.onRubric, fontFamily: fonts.semibold, fontSize: 18 }}>Continue</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip welcome"
            onPress={() => router.push("/onboarding/3" as never)}
            style={(state) => ({
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
              ...focusRing(C.rubric, focusedRing(state)),
            })}
          >
            <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Skip</Text>
          </Pressable>
        </View>
      )}
    </View>
    </View>
  );
}
