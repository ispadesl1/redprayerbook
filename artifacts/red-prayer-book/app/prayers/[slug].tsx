import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconPress, Ornament, ReadingText, SmallCaps, TocRow, useFrame } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import {
  addPrayerBookmark,
  isPrayerBookmarked,
  recordPrayerRead,
  removePrayerBookmark,
} from "@/lib/db";
import { goBack } from "@/lib/navigation";
import { getAllPrayers, getPrayerBySlug, PRAYER_SECTIONS, type Prayer } from "@/lib/prayers";
import { usePrefs } from "@/lib/prefs";
import { layout } from "@/theme/spacing";
import { fonts } from "@/theme/typography";

export default function PrayerDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const prayer = getPrayerBySlug(slug ?? "") ?? getPrayerBySlug("morning-trisagion");
  const C = usePalette();
  const insets = useSafeAreaInsets();
  const { showMargin } = useFrame();
  const readStep = usePrefs((state) => state.readStep);
  const setReadStep = usePrefs((state) => state.setReadStep);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!prayer) return;
    isPrayerBookmarked(prayer.slug).then(setBookmarked);
    recordPrayerRead(prayer.slug, prayer.title);
  }, [prayer]);

  const section = PRAYER_SECTIONS.find((item) => item.prayers.some((entry) => entry.slug === prayer?.slug));
  const all = getAllPrayers();
  const index = all.findIndex((item) => item.slug === prayer?.slug);
  const next = index >= 0 ? all[index + 1] : undefined;

  const toggleBookmark = useCallback(async () => {
    if (!prayer) return;
    if (bookmarked) {
      await removePrayerBookmark(prayer.slug);
      setBookmarked(false);
    } else {
      await addPrayerBookmark(prayer.slug, prayer.title, section?.title ?? "Prayer Book");
      setBookmarked(true);
    }
  }, [bookmarked, prayer, section?.title]);

  if (!prayer) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper, padding: 24 }}>
        <Text style={{ fontFamily: fonts.italic, color: C.ink2 }}>That prayer is not in the book.</Text>
      </View>
    );
  }

  const size = 20.5 + readStep * 1.5;
  const margin = section ? (
    <View>
      <SmallCaps>{section.title}</SmallCaps>
      {section.prayers.map((item) => (
        <TocRow
          key={item.slug}
          title={item.title}
          page={item.bookPage ? String(item.bookPage) : "›"}
          active={item.slug === prayer.slug}
          onPress={() => router.replace(`/prayers/${item.slug}` as never)}
        />
      ))}
    </View>
  ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View
        style={{
          paddingTop: insets.top + 4,
          borderBottomWidth: 1,
          borderBottomColor: C.rule,
          backgroundColor: C.paper,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
        }}
      >
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 8, flex: 1 }}>
          <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }} numberOfLines={1}>
            ‹ {section?.title ?? "Prayers"}
          </Text>
        </Pressable>
        <IconPress label="Smaller text" onPress={() => setReadStep(readStep - 1)}>
          <Text style={{ fontFamily: fonts.regular, fontSize: 16, color: C.ink2 }}>A</Text>
        </IconPress>
        <IconPress label="Larger text" onPress={() => setReadStep(readStep + 1)}>
          <Text style={{ fontFamily: fonts.regular, fontSize: 24, color: C.ink2 }}>A</Text>
        </IconPress>
        <IconPress label={bookmarked ? "Remove bookmark" : "Bookmark"} onPress={toggleBookmark} pressed={bookmarked}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 16, color: bookmarked ? C.rubric : C.ink2 }}>
            {bookmarked ? "Saved" : "Save"}
          </Text>
        </IconPress>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: showMargin ? 40 : 22,
          paddingTop: 28,
          paddingBottom: insets.bottom + 48,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: showMargin && margin ? layout.column + 56 + layout.marginalia : layout.column,
            alignSelf: "center",
            flexDirection: showMargin && margin ? "row" : "column",
            gap: showMargin && margin ? 56 : 0,
            alignItems: "flex-start",
          }}
        >
          <View style={{ width: "100%", maxWidth: layout.column }}>
            <View style={{ alignItems: "center", paddingTop: 12 }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 34, lineHeight: 40, color: C.ink, textAlign: "center" }}>
                {prayer.title}
              </Text>
              {prayer.subtitle ? (
                <Text style={{ fontFamily: fonts.italic, fontSize: 19, color: C.ink2, marginTop: 6, textAlign: "center" }}>
                  {prayer.subtitle}
                </Text>
              ) : null}
              {prayer.bookPage ? (
                <View style={{ marginTop: 8 }}>
                  <SmallCaps color={C.ink2} size={15}>
                    page {prayer.bookPage}
                  </SmallCaps>
                </View>
              ) : null}
            </View>
            <Ornament />
            {prayer.rubric ? (
              <Text
                style={{
                  fontFamily: fonts.italic,
                  color: C.rubric,
                  fontSize: 18 + readStep * 1.5,
                  lineHeight: Math.round((18 + readStep * 1.5) * 1.5),
                  marginBottom: 18,
                }}
              >
                {prayer.rubric}
              </Text>
            ) : null}
            {prayer.kind === "list" && prayer.items ? (
              <View>
                {prayer.items.map((item, itemIndex) => (
                  <Text
                    key={`${itemIndex}-${item.slice(0, 12)}`}
                    style={{
                      fontFamily: fonts.regular,
                      fontSize: size,
                      lineHeight: Math.round(size * 1.62),
                      color: C.ink,
                      marginBottom: 10,
                    }}
                  >
                    {itemIndex + 1}. {item}
                  </Text>
                ))}
              </View>
            ) : prayer.text ? (
              <ReadingText text={prayer.text} size={size} dropCap />
            ) : null}
            <Text style={{ textAlign: "center", color: C.rubric, fontFamily: fonts.regular, marginVertical: 20, fontSize: 16, lineHeight: 22 }}>✠</Text>
            {next ? (
              <Pressable
                onPress={() => router.replace(`/prayers/${next.slug}` as never)}
                style={({ pressed }) => ({
                  borderTopWidth: 1,
                  borderTopColor: C.rule,
                  paddingVertical: 16,
                  backgroundColor: pressed ? C.highlight : "transparent",
                })}
              >
                <SmallCaps color={C.ink2} size={15}>
                  Next
                </SmallCaps>
                <Text style={{ fontFamily: fonts.regular, fontSize: 20, color: C.rubric, marginTop: 4 }}>{next.title} ›</Text>
              </Pressable>
            ) : null}
            {!showMargin && margin ? <View style={{ marginTop: 12 }}>{margin}</View> : null}
          </View>
          {showMargin && margin ? (
            <View style={{ width: layout.marginalia, borderLeftWidth: 1, borderLeftColor: C.rule, paddingLeft: 28 }}>
              {margin}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
