import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { ManuscriptScroll, StackBar, TocRow } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { getBookById } from "@/lib/bible-structure";
import {
  deletePrayerIntention,
  listHighlights,
  listPrayerBookmarks,
  listPrayerIntentions,
  removePrayerBookmark,
  type PrayerBookmark,
  type PrayerIntention,
} from "@/lib/db";
import { fonts } from "@/theme/typography";

type Highlight = { id: string; book: string; chapter: number; verse: number; color: string };
const TABS = ["Prayers", "Highlights", "Composed"] as const;
type Tab = (typeof TABS)[number];

export default function Bookmarks() {
  const C = usePalette();
  const [tab, setTab] = useState<Tab>("Prayers");
  const [prayers, setPrayers] = useState<PrayerBookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [intentions, setIntentions] = useState<PrayerIntention[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [saved, marks, composed] = await Promise.all([
      listPrayerBookmarks(),
      listHighlights(),
      listPrayerIntentions(),
    ]);
    setPrayers(saved);
    setHighlights(marks as Highlight[]);
    setIntentions(composed);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StackBar title="Bookmarks" onBack={() => router.back()} />
      <ManuscriptScroll>
        <View style={{ flexDirection: "row", gap: 18, marginBottom: 8 }}>
          {TABS.map((item) => {
            const on = tab === item;
            return (
              <Pressable key={item} onPress={() => setTab(item)} style={{ minHeight: 44, justifyContent: "center" }}>
                <Text
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 18,
                    color: on ? C.rubric : C.ink2,
                    borderBottomWidth: on ? 1 : 0,
                    borderBottomColor: C.rubric,
                    fontVariant: ["small-caps"],
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "Prayers" && prayers.length === 0 ? <Empty label="No prayers saved yet." /> : null}
        {tab === "Prayers"
          ? prayers.map((bookmark) => (
              <View key={bookmark.id}>
                <TocRow
                  title={bookmark.title}
                  subtitle={bookmark.sectionTitle}
                  page="›"
                  onPress={() => router.push(`/prayers/${bookmark.slug}` as never)}
                />
                <Pressable
                  onPress={() =>
                    Alert.alert("Remove bookmark", `Remove “${bookmark.title}”?`, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Remove",
                        style: "destructive",
                        onPress: async () => {
                          await removePrayerBookmark(bookmark.slug);
                          load();
                        },
                      },
                    ])
                  }
                >
                  <Text style={{ color: C.ink2, fontFamily: fonts.italic, fontSize: 15, marginTop: -6, marginBottom: 8 }}>
                    Remove
                  </Text>
                </Pressable>
              </View>
            ))
          : null}

        {tab === "Highlights" && highlights.length === 0 ? <Empty label="No verses highlighted yet." /> : null}
        {tab === "Highlights"
          ? highlights.map((item) => {
              const book = getBookById(item.book);
              return (
                <Text key={item.id} style={{ fontFamily: fonts.regular, fontSize: 18, color: C.ink, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.rule }}>
                  {book?.name ?? item.book} {item.chapter}:{item.verse}
                </Text>
              );
            })
          : null}

        {tab === "Composed" && intentions.length === 0 ? <Empty label="No composed prayers yet." /> : null}
        {tab === "Composed"
          ? intentions.map((item) => (
              <View key={item.id} style={{ borderBottomWidth: 1, borderBottomColor: C.rule, paddingVertical: 12 }}>
                <Pressable onPress={() => setOpenId((current) => (current === item.id ? null : item.id))}>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 18, color: C.ink }}>{item.intention}</Text>
                </Pressable>
                {openId === item.id ? (
                  <Text style={{ fontFamily: fonts.regular, fontSize: 17, lineHeight: 26, color: C.ink, marginTop: 8 }}>{item.prayerText}</Text>
                ) : null}
                <Pressable
                  onPress={() =>
                    Alert.alert("Delete prayer", "Delete this composed prayer?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          await deletePrayerIntention(item.id);
                          load();
                        },
                      },
                    ])
                  }
                >
                  <Text style={{ color: C.ink2, fontFamily: fonts.italic, fontSize: 15, marginTop: 6 }}>Delete</Text>
                </Pressable>
              </View>
            ))
          : null}
      </ManuscriptScroll>
    </View>
  );
}

function Empty({ label }: { label: string }) {
  const C = usePalette();
  return <Text style={{ fontFamily: fonts.italic, fontSize: 17, color: C.ink2, paddingVertical: 20 }}>{label}</Text>;
}
