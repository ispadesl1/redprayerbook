import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ManuscriptScroll, SmallCaps, TocRow, useFrame, useMotion } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { getPrayerBySlug, PRAYER_SECTIONS, type Prayer, type PrayerSection } from "@/lib/prayers";
import { EASE_OUT, motion } from "@/theme/motion";
import { fonts } from "@/theme/typography";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function Chevron({ open }: { open: boolean }) {
  const { reduced } = useMotion();
  const turn = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    turn.value = withTiming(open ? 1 : 0, { duration: reduced ? 0 : 220, easing: EASE_OUT });
  }, [open, reduced, turn]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 90}deg` }] }));
  const C = usePalette();
  return (
    <Animated.Text style={[{ color: C.ink2, fontSize: 16, lineHeight: 20, width: 16, fontFamily: fonts.regular }, style]}>›</Animated.Text>
  );
}

function SectionBlock({
  section,
  index,
  open,
  onToggle,
  prayers,
}: {
  section: PrayerSection;
  index: number;
  open: boolean;
  onToggle: () => void;
  prayers: Prayer[];
}) {
  const C = usePalette();
  const { reduced } = useMotion();
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: C.rule }}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "baseline",
          gap: 10,
          minHeight: 56,
          paddingVertical: 14,
          backgroundColor: pressed ? C.highlight : "transparent",
        })}
      >
        <Text style={{ width: 32, color: C.rubric, fontFamily: fonts.regular, fontSize: 17 }}>{ROMAN[index] ?? ""}</Text>
        <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 21, color: C.ink }}>{section.title}</Text>
        <Text style={{ color: C.ink2, fontFamily: fonts.regular, fontSize: 16, fontVariant: ["oldstyle-nums"] }}>{prayers.length}</Text>
        <Chevron open={open} />
      </Pressable>
      {open ? (
        <Animated.View entering={reduced ? undefined : FadeIn.duration(motion.accordion).easing(EASE_OUT)} style={{ paddingBottom: 8 }}>
          {prayers.map((prayer) => (
            <TocRow
              key={prayer.slug}
              title={prayer.title}
              subtitle={prayer.subtitle}
              page={prayer.bookPage ? String(prayer.bookPage) : "›"}
              onPress={() => router.push(`/prayers/${prayer.slug}` as never)}
            />
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}

export default function Prayers() {
  const C = usePalette();
  const { showMargin } = useFrame();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(PRAYER_SECTIONS[0]?.id ?? null);
  const needle = query.trim().toLowerCase();

  const sections = useMemo(
    () =>
      PRAYER_SECTIONS.map((section, index) => ({
        section,
        index,
        prayers: section.prayers.filter((prayer) => {
          if (!needle) return true;
          return `${prayer.title} ${prayer.subtitle ?? ""}`.toLowerCase().includes(needle);
        }),
      })).filter((item) => item.prayers.length > 0),
    [needle],
  );

  const said = ["morning-trisagion", "jesus-prayer", "evening-trisagion"]
    .map((slug) => getPrayerBySlug(slug))
    .filter((prayer): prayer is Prayer => !!prayer);

  const margin = (
    <View>
      <SmallCaps>Said today</SmallCaps>
      {said.map((prayer) => (
        <TocRow
          key={prayer.slug}
          title={prayer.title}
          subtitle={prayer.subtitle}
          page={prayer.bookPage ? String(prayer.bookPage) : "›"}
          onPress={() => router.push(`/prayers/${prayer.slug}` as never)}
        />
      ))}
      <Pressable onPress={() => router.push("/book" as never)} style={{ minHeight: 48, justifyContent: "center", marginTop: 12 }}>
        <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Open the printed book ›</Text>
      </Pressable>
    </View>
  );

  return (
    <ManuscriptScroll inTabs margin={showMargin ? margin : undefined}>
      <Text style={{ fontFamily: fonts.medium, fontSize: 34, lineHeight: 40, color: C.ink, textAlign: "center" }}>
        The Prayer Book
      </Text>
      <Text style={{ fontFamily: fonts.italic, fontSize: 17, color: C.ink2, textAlign: "center", marginTop: 6 }}>
        {PRAYER_SECTIONS.reduce((sum, section) => sum + section.prayers.length, 0)} prayers in {PRAYER_SECTIONS.length} parts
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: C.ink2, minHeight: 48, marginTop: 18, marginBottom: 8 }}>
        <Text style={{ color: C.ink2, marginRight: 8, fontSize: 16, fontFamily: fonts.regular, lineHeight: 20 }}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search the prayers"
          placeholderTextColor={C.ink2}
          accessibilityLabel="Search prayers"
          style={{ flex: 1, fontFamily: fonts.regular, fontSize: 19, lineHeight: 26, color: C.ink, minHeight: 44, paddingVertical: 8 }}
          autoCorrect={false}
        />
      </View>
      {sections.length === 0 ? (
        <Text style={{ fontFamily: fonts.italic, fontSize: 18, color: C.ink2, paddingVertical: 28 }}>
          Nothing in the book matches “{query.trim()}”.
        </Text>
      ) : (
        sections.map(({ section, index, prayers }) => (
          <SectionBlock
            key={section.id}
            section={section}
            index={index}
            prayers={prayers}
            open={!!needle || openId === section.id}
            onToggle={() => setOpenId((current) => (current === section.id ? null : section.id))}
          />
        ))
      )}
      {!showMargin ? <View style={{ marginTop: 28 }}>{margin}</View> : null}
    </ManuscriptScroll>
  );
}
