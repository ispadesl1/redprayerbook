import { ReactNode, useEffect } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { usePalette } from "@/hooks/usePalette";
import { fonts } from "@/theme/typography";
import { layout } from "@/theme/spacing";
import { EASE_OUT, motion } from "@/theme/motion";
import type { Palette } from "@/theme/colors";

type KeyEvent = { nativeEvent: { key?: string }; preventDefault?: () => void };

export function onSpaceKey(action: () => void) {
  return (event: KeyEvent) => {
    if (event.nativeEvent.key === " " || event.nativeEvent.key === "Spacebar") {
      event.preventDefault?.();
      action();
    }
  };
}

export function focusRing(color: string, focused?: boolean): ViewStyle {
  if (!focused) return {};
  return { outlineStyle: "solid", outlineWidth: 2, outlineColor: color, outlineOffset: 2 };
}

function pressState(state: { pressed: boolean; focused?: boolean }) {
  return state;
}

export function useMotion() {
  const reduced = useReducedMotion();
  const duration = (ms: number) => (reduced ? 0 : ms);
  return { reduced: !!reduced, duration };
}

export function useFrame() {
  const { width } = useWindowDimensions();
  const wide = width >= layout.wide;
  const showMargin = width >= layout.margin;
  return { width, wide, showMargin };
}

export function useTabBottomPad() {
  const { wide } = useFrame();
  const tabHeight = useBottomTabBarHeight();
  if (wide) return 72;
  return tabHeight + 32;
}

export function SmallCaps({
  children,
  color,
  size = 16,
  style,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  const C = usePalette();
  return (
    <Text
      style={[
        {
          fontFamily: fonts.medium,
          fontSize: size,
          lineHeight: size + 6,
          color: color ?? C.rubric,
          fontVariant: ["small-caps"],
          letterSpacing: 0.9,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Ornament() {
  const C = usePalette();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 22 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: C.rule2 }} />
      <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 15 }}>✠</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: C.rule2 }} />
    </View>
  );
}

export function IconPress({
  onPress,
  label,
  children,
  pressed,
}: {
  onPress?: () => void;
  label: string;
  children: ReactNode;
  pressed?: boolean;
}) {
  const { duration } = useMotion();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityState={pressed == null ? undefined : { selected: pressed }}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: duration(motion.press), easing: EASE_OUT });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: duration(motion.press), easing: EASE_OUT });
      }}
      hitSlop={8}
      style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View style={style}>{children}</Animated.View>
    </Pressable>
  );
}

export function TocRow({
  title,
  subtitle,
  page,
  onPress,
  active,
}: {
  title: string;
  subtitle?: string;
  page?: string;
  onPress?: () => void;
  active?: boolean;
}) {
  const C = usePalette();
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={(state) => {
        const { pressed, focused } = pressState(state);
        return {
          flexDirection: "row",
          alignItems: "baseline",
          gap: 8,
          minHeight: 48,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: C.rule,
          backgroundColor: pressed ? C.highlight : "transparent",
          ...focusRing(C.rubric, focused),
        };
      }}
    >
      <View style={{ flexShrink: 1 }}>
        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: 19,
            lineHeight: 24,
            color: active ? C.rubric : C.ink,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontFamily: fonts.italic, fontSize: 15.5, color: C.ink2, marginTop: 1 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ flex: 1, borderBottomWidth: 1, borderStyle: "dotted", borderColor: C.rule2, transform: [{ translateY: -5 }] }} />
      <Text style={{ fontFamily: fonts.regular, fontSize: 17, color: C.ink2, fontVariant: ["oldstyle-nums"] }}>
        {page ?? "›"}
      </Text>
    </Pressable>
  );
}

export function DropCap({ text, size }: { text: string; size?: number }) {
  const C = usePalette();
  const trimmed = text.trim();
  const first = trimmed.charAt(0);
  const rest = trimmed.slice(1);
  const fontSize = size ?? 23;
  return (
    <Text style={{ fontFamily: fonts.regular, fontSize, lineHeight: Math.round(fontSize * 1.45), color: C.ink }}>
      <Text
        style={{
          fontFamily: fonts.medium,
          fontSize: fontSize * 2.6,
          lineHeight: fontSize * 2.4,
          color: C.rubric,
        }}
      >
        {first}
      </Text>
      {rest}
    </Text>
  );
}

export function ReadingText({
  text,
  size,
  dropCap,
}: {
  text: string;
  size: number;
  dropCap?: boolean;
}) {
  const C = usePalette();
  const paragraphs = text.split(/\n\n+/).filter((part) => part.trim().length > 0);
  return (
    <View>
      {paragraphs.map((paragraph, index) => {
        const body = paragraph.replace(/\n/g, "\n");
        if (dropCap && index === 0) {
          const first = body.trim().charAt(0);
          const rest = body.trim().slice(1);
          return (
            <Text
              key={index}
              style={{
                fontFamily: fonts.regular,
                fontSize: size,
                lineHeight: Math.round(size * 1.62),
                color: C.ink,
                marginBottom: Math.round(size * 0.9),
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.medium,
                  fontSize: size * 3.05,
                  lineHeight: size * 2.7,
                  color: C.rubric,
                }}
              >
                {first}
              </Text>
              {rest}
            </Text>
          );
        }
        return (
          <Text
            key={index}
            style={{
              fontFamily: fonts.regular,
              fontSize: size,
              lineHeight: Math.round(size * 1.62),
              color: C.ink,
              marginBottom: Math.round(size * 0.9),
            }}
          >
            {body}
          </Text>
        );
      })}
    </View>
  );
}

export function HourCheck({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  const C = usePalette();
  const { reduced } = useMotion();
  const opacity = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(checked ? 1 : 0.7);
  useEffect(() => {
    const ms = reduced ? 0 : 220;
    opacity.value = withTiming(checked ? 1 : 0, { duration: ms, easing: EASE_OUT });
    scale.value = withTiming(checked ? 1 : 0.7, { duration: ms, easing: EASE_OUT });
  }, [checked, reduced, opacity, scale]);
  const mark = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const press = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const toggle = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
    onToggle();
  };
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      aria-checked={checked}
      accessibilityLabel={label}
      onPress={toggle}
      {...({ onKeyDown: onSpaceKey(toggle) } as object)}
      onPressIn={() => {
        press.value = withTiming(0.97, { duration: reduced ? 0 : 160, easing: EASE_OUT });
      }}
      onPressOut={() => {
        press.value = withTiming(1, { duration: reduced ? 0 : 160, easing: EASE_OUT });
      }}
      style={(state) => {
        const { focused } = pressState(state);
        return {
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          ...focusRing(C.rubric, focused),
        };
      }}
    >
      <Animated.View style={pressStyle}>
      <View
        style={{
          width: 22,
          height: 22,
          borderWidth: 1,
          borderColor: checked ? C.rubric : C.ink2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: checked ? C.rubric : "transparent",
        }}
      >
        <Animated.Text style={[{ color: C.onRubric, fontSize: 14, fontFamily: fonts.medium }, mark]}>
          ✓
        </Animated.Text>
      </View>
      </Animated.View>
    </Pressable>
  );
}

export function FadeInBlock({ children, token }: { children: ReactNode; token: string }) {
  const { reduced } = useMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(4);
  useEffect(() => {
    const ms = reduced ? 0 : motion.fade;
    opacity.value = 0;
    translateY.value = 4;
    opacity.value = withTiming(1, { duration: ms, easing: EASE_OUT });
    translateY.value = withTiming(0, { duration: ms, easing: EASE_OUT });
  }, [token, reduced, opacity, translateY]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

function ManuscriptBody({
  children,
  margin,
  bottom,
}: {
  children: ReactNode;
  margin?: ReactNode;
  bottom: number;
}) {
  const C = usePalette();
  const insets = useSafeAreaInsets();
  const { wide, showMargin } = useFrame();
  const top = wide ? 48 : insets.top + 22;
  const withMargin = !!(showMargin && margin);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{
        paddingTop: top,
        paddingBottom: bottom,
        paddingHorizontal: wide ? 40 : 22,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          width: "100%",
          maxWidth: withMargin ? layout.column + 56 + layout.marginalia : layout.column,
          alignSelf: "center",
          flexDirection: withMargin ? "row" : "column",
          alignItems: "flex-start",
          gap: withMargin ? 56 : 0,
        }}
      >
        <View style={{ width: "100%", maxWidth: layout.column, flexGrow: 1, flexShrink: 1 }}>{children}</View>
        {withMargin ? (
          <View
            style={{
              width: layout.marginalia,
              borderLeftWidth: 1,
              borderLeftColor: C.rule,
              paddingLeft: 28,
              paddingTop: 8,
            }}
          >
            {margin}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function TabManuscript({ children, margin }: { children: ReactNode; margin?: ReactNode }) {
  const bottom = useTabBottomPad();
  return (
    <ManuscriptBody bottom={bottom} margin={margin}>
      {children}
    </ManuscriptBody>
  );
}

export function ManuscriptScroll({
  children,
  margin,
  inTabs = false,
}: {
  children: ReactNode;
  margin?: ReactNode;
  inTabs?: boolean;
}) {
  const insets = useSafeAreaInsets();
  if (inTabs) {
    return <TabManuscript margin={margin}>{children}</TabManuscript>;
  }
  return (
    <ManuscriptBody bottom={insets.bottom + 36} margin={margin}>
      {children}
    </ManuscriptBody>
  );
}

export function StackBar({
  title,
  onBack,
  right,
}: {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const C = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 6,
        paddingBottom: 8,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: C.rule,
        backgroundColor: C.paper,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {onBack ? (
        <IconPress onPress={onBack} label="Back">
          <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>‹ Back</Text>
        </IconPress>
      ) : (
        <View style={{ width: 44 }} />
      )}
      <Text
        style={{
          flex: 1,
          textAlign: "center",
          fontFamily: fonts.medium,
          fontSize: 20,
          color: C.ink,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={{ minWidth: 44, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}

export function paperPage(C: Palette): ViewStyle {
  return { flex: 1, backgroundColor: C.paper };
}

export function bodyStyle(C: Palette, size = 18): TextStyle {
  return {
    fontFamily: fonts.regular,
    fontSize: size,
    lineHeight: Math.round(size * 1.55),
    color: C.ink,
  };
}

export function italicStyle(C: Palette, size = 17): TextStyle {
  return {
    fontFamily: fonts.italic,
    fontSize: size,
    lineHeight: Math.round(size * 1.5),
    color: C.ink2,
  };
}

export { Easing };
