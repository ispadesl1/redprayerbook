import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { listBookmarks, addBookmark, listHighlights } from "@/lib/db";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";

type Bookmark = { id: string; page_index: number; label: string | null };
type Highlight = { id: string; book: string; chapter: number; verse: number; color: string };

const TABS = ["Bookmarks", "Highlights"] as const;
type Tab = (typeof TABS)[number];

export default function Bookmarks() {
  const [activeTab, setActiveTab] = useState<Tab>("Bookmarks");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    (async () => {
      const [b, h] = await Promise.all([listBookmarks(), listHighlights()]);
      setBookmarks(b as Bookmark[]);
      setHighlights(h as Highlight[]);
    })();
  }, []);

  const handleAddSample = async () => {
    await addBookmark(Math.floor(Math.random() * 50), "My favourite prayer");
    const b = await listBookmarks();
    setBookmarks(b as Bookmark[]);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.surfaceDeep }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          borderBottomWidth: 1,
          borderColor: C.hairline,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 4, marginRight: spacing.s }}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={C.sacredGold} />
        </Pressable>
        <Text style={{ flex: 1, fontFamily: "serif", fontWeight: "700", fontSize: 22, color: C.sacredGold }}>
          Saved
        </Text>
        <Pressable onPress={handleAddSample} style={{ padding: 4 }}>
          <MaterialCommunityIcons name="plus" size={24} color={C.sacredGold} />
        </Pressable>
      </View>

      {/* Tab switcher */}
      <View style={{ flexDirection: "row", paddingHorizontal: spacing.m, paddingVertical: spacing.s, gap: spacing.s }}>
        {TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setActiveTab(t)}
            style={{
              paddingHorizontal: spacing.m,
              paddingVertical: 8,
              borderRadius: radii.pill,
              backgroundColor: activeTab === t ? C.sacredGold : "transparent",
              borderWidth: 1,
              borderColor: C.sacredGold,
            }}
          >
            <Text
              style={{
                color: activeTab === t ? C.surfaceDeep : C.sacredGold,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.m, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "Bookmarks" ? (
          bookmarks.length === 0 ? (
            <EmptyState
              icon="bookmark-outline"
              title="No bookmarks yet"
              body="Bookmark your favourite prayers in the Prayer Book."
            />
          ) : (
            bookmarks.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => router.push("/(tabs)/prayers")}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  padding: spacing.m,
                  marginBottom: spacing.xs,
                  borderRadius: radii.m,
                  backgroundColor: pressed ? C.surface : C.surfaceElevated,
                  borderWidth: 1,
                  borderColor: C.hairline,
                  gap: spacing.m,
                })}
              >
                <MaterialCommunityIcons name="bookmark" size={20} color={C.sacredGold} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.textPrimary, fontFamily: "serif", fontSize: 15 }}>
                    {b.label ?? `Page ${b.page_index + 1}`}
                  </Text>
                  <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                    Prayer Book · page {b.page_index + 1}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={C.sacredGold} />
              </Pressable>
            ))
          )
        ) : highlights.length === 0 ? (
          <EmptyState
            icon="marker"
            title="No highlights yet"
            body="Long-press any Bible verse to highlight it in gold."
          />
        ) : (
          highlights.map((h) => (
            <View
              key={h.id}
              style={{
                padding: spacing.m,
                marginBottom: spacing.xs,
                borderRadius: radii.m,
                backgroundColor: C.surfaceElevated,
                borderWidth: 1,
                borderColor: C.hairline,
                borderLeftWidth: 3,
                borderLeftColor: h.color,
                gap: 4,
              }}
            >
              <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 13 }}>
                {h.book.charAt(0).toUpperCase() + h.book.slice(1)} {h.chapter}:{h.verse}
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 12 }}>Highlighted verse</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <View style={{ alignItems: "center", paddingTop: 60, paddingHorizontal: spacing.l }}>
      <MaterialCommunityIcons name={icon as any} size={48} color={C.textMuted} style={{ marginBottom: spacing.m }} />
      <Text style={{ color: C.textSecondary, fontFamily: "serif", fontWeight: "700", fontSize: 18, marginBottom: spacing.s, textAlign: "center" }}>
        {title}
      </Text>
      <Text style={{ color: C.textMuted, fontFamily: "serif", fontSize: 14, textAlign: "center", lineHeight: 22 }}>
        {body}
      </Text>
    </View>
  );
}
