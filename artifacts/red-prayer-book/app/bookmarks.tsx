import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  listPrayerBookmarks,
  removePrayerBookmark,
  PrayerBookmark,
  listHighlights,
  listPrayerIntentions,
  deletePrayerIntention,
  type PrayerIntention,
} from "@/lib/db";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";

type Highlight = { id: string; book: string; chapter: number; verse: number; color: string };

const TABS = ["Prayers", "Highlights", "Composed"] as const;
type Tab = (typeof TABS)[number];

export default function Bookmarks() {
  const [activeTab, setActiveTab] = useState<Tab>("Prayers");
  const [prayerBookmarks, setPrayerBookmarks] = useState<PrayerBookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [intentions, setIntentions] = useState<PrayerIntention[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [pb, h, p] = await Promise.all([
      listPrayerBookmarks(),
      listHighlights(),
      listPrayerIntentions(),
    ]);
    setPrayerBookmarks(pb);
    setHighlights(h as Highlight[]);
    setIntentions(p);
  }, []);

  useEffect(() => { loadAll(); }, []);

  // Refresh whenever screen comes back into focus (e.g. after bookmarking from detail)
  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

  const handleRemovePrayerBookmark = (bookmark: PrayerBookmark) => {
    Alert.alert(
      "Remove Bookmark",
      `Remove "${bookmark.title}" from your saved prayers?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removePrayerBookmark(bookmark.slug);
            setPrayerBookmarks((prev) => prev.filter((b) => b.slug !== bookmark.slug));
          },
        },
      ],
    );
  };

  const handleDeleteIntention = (id: string) => {
    Alert.alert("Delete Prayer", "Remove this composed prayer from your saved collection?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deletePrayerIntention(id);
          setIntentions((prev) => prev.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  const tabCount: Record<Tab, number> = {
    Prayers: prayerBookmarks.length,
    Highlights: highlights.length,
    Composed: intentions.length,
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
          backgroundColor: C.surface,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            padding: 4,
            marginRight: spacing.s,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color={C.sacredGold} />
        </Pressable>
        <Text
          style={{
            flex: 1,
            fontFamily: "serif",
            fontWeight: "700",
            fontSize: 22,
            color: C.sacredGold,
            letterSpacing: 0.5,
          }}
        >
          ✟  Saved
        </Text>
      </View>

      {/* Tab switcher */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          gap: spacing.xs,
          borderBottomWidth: 1,
          borderBottomColor: C.hairline,
          backgroundColor: C.surface,
        }}
      >
        {TABS.map((t) => {
          const active = activeTab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setActiveTab(t)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                paddingVertical: 8,
                borderRadius: radii.pill,
                backgroundColor: active ? C.sacredGold : "transparent",
                borderWidth: 1,
                borderColor: active ? C.sacredGold : C.hairline,
              }}
            >
              <Text
                style={{
                  color: active ? C.surfaceDeep : C.textMuted,
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                {t}
              </Text>
              {tabCount[t] > 0 && (
                <View
                  style={{
                    backgroundColor: active ? C.surfaceDeep + "44" : C.hairline,
                    borderRadius: radii.pill,
                    minWidth: 18,
                    height: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: active ? C.surfaceDeep : C.textMuted,
                      fontSize: 10,
                      fontWeight: "700",
                    }}
                  >
                    {tabCount[t]}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.m, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* — Prayers tab — */}
        {activeTab === "Prayers" ? (
          prayerBookmarks.length === 0 ? (
            <EmptyState
              icon="bookmark-outline"
              title="No saved prayers yet"
              body="Tap the bookmark icon on any prayer to save it here for quick access."
              action="Go to Prayer Book"
              onAction={() => router.push("/(tabs)/prayers")}
            />
          ) : (
            <>
              <Text
                style={{
                  fontSize: 11,
                  color: C.textMuted,
                  letterSpacing: 0.5,
                  marginBottom: spacing.s,
                }}
              >
                {prayerBookmarks.length} saved {prayerBookmarks.length === 1 ? "prayer" : "prayers"}
              </Text>
              {prayerBookmarks.map((b) => (
                <PrayerBookmarkRow
                  key={b.id}
                  bookmark={b}
                  onRemove={() => handleRemovePrayerBookmark(b)}
                />
              ))}
            </>
          )
        ) : null}

        {/* — Highlights tab — */}
        {activeTab === "Highlights" ? (
          highlights.length === 0 ? (
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
                <Text
                  style={{
                    color: C.sacredGold,
                    fontFamily: "serif",
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  {h.book.charAt(0).toUpperCase() + h.book.slice(1)} {h.chapter}:{h.verse}
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 12 }}>Highlighted verse</Text>
              </View>
            ))
          )
        ) : null}

        {/* — Composed tab — */}
        {activeTab === "Composed" ? (
          intentions.length === 0 ? (
            <EmptyState
              icon="hands-pray"
              title="No composed prayers yet"
              body="Use 'Compose a Prayer' to create a personal Orthodox prayer from your intention."
            />
          ) : (
            intentions.map((p) => {
              const isExpanded = expandedId === p.id;
              const date = new Date(p.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              return (
                <View
                  key={p.id}
                  style={{
                    marginBottom: spacing.s,
                    borderRadius: radii.m,
                    borderWidth: 1,
                    borderColor: C.hairline,
                    borderLeftWidth: 3,
                    borderLeftColor: C.byzantineCrimson,
                    backgroundColor: C.surfaceElevated,
                    overflow: "hidden",
                  }}
                >
                  <Pressable
                    onPress={() => setExpandedId(isExpanded ? null : p.id)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing.s,
                      padding: spacing.m,
                      backgroundColor: pressed ? C.surface : "transparent",
                    })}
                  >
                    <MaterialCommunityIcons name="hands-pray" size={16} color={C.sacredGold} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: C.textPrimary,
                          fontFamily: "serif",
                          fontSize: 14,
                          fontStyle: "italic",
                        }}
                      >
                        {p.intention}
                      </Text>
                      <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
                        {date}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={C.textMuted}
                    />
                  </Pressable>
                  {isExpanded && (
                    <View style={{ paddingHorizontal: spacing.m, paddingBottom: spacing.m }}>
                      <View
                        style={{ height: 1, backgroundColor: C.hairline, marginBottom: spacing.m }}
                      />
                      <Text
                        style={{
                          color: C.textPrimary,
                          fontFamily: "serif",
                          fontSize: 15,
                          lineHeight: 26,
                          fontStyle: "italic",
                        }}
                      >
                        {p.prayerText}
                      </Text>
                      <Pressable
                        onPress={() => handleDeleteIntention(p.id)}
                        style={({ pressed }) => ({
                          flexDirection: "row",
                          alignItems: "center",
                          gap: spacing.xs,
                          marginTop: spacing.m,
                          alignSelf: "flex-end",
                          opacity: pressed ? 0.6 : 1,
                        })}
                      >
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={15}
                          color={C.textMuted}
                        />
                        <Text style={{ color: C.textMuted, fontSize: 12 }}>Remove</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })
          )
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function PrayerBookmarkRow({
  bookmark,
  onRemove,
}: {
  bookmark: PrayerBookmark;
  onRemove: () => void;
}) {
  const date = new Date(bookmark.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Pressable
      onPress={() => router.push(`/prayers/${bookmark.slug}` as any)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.m,
        marginBottom: spacing.xs,
        borderRadius: radii.m,
        backgroundColor: pressed ? C.surface : C.surfaceElevated,
        borderWidth: 1,
        borderColor: C.hairline,
        borderLeftWidth: 3,
        borderLeftColor: C.sacredGold,
      })}
    >
      <MaterialCommunityIcons
        name="bookmark"
        size={18}
        color={C.sacredGold}
        style={{ marginRight: spacing.s }}
      />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: C.textPrimary,
            fontFamily: "serif",
            fontWeight: "600",
            fontSize: 15,
          }}
          numberOfLines={1}
        >
          {bookmark.title}
        </Text>
        <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
          {bookmark.sectionTitle} · saved {date}
        </Text>
      </View>

      <Pressable
        onPress={onRemove}
        hitSlop={12}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
        accessibilityLabel="Remove bookmark"
      >
        <MaterialCommunityIcons name="bookmark-remove-outline" size={20} color={C.textMuted} />
      </Pressable>

      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color={C.sacredGold}
        style={{ marginLeft: 4 }}
      />
    </Pressable>
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: string;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={{ alignItems: "center", paddingTop: 60, paddingHorizontal: spacing.l }}>
      <MaterialCommunityIcons
        name={icon as any}
        size={48}
        color={C.textMuted}
        style={{ marginBottom: spacing.m }}
      />
      <Text
        style={{
          color: C.textSecondary,
          fontFamily: "serif",
          fontWeight: "700",
          fontSize: 18,
          marginBottom: spacing.s,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: C.textMuted,
          fontFamily: "serif",
          fontSize: 14,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        {body}
      </Text>
      {action && onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => ({
            marginTop: spacing.l,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.s,
            backgroundColor: pressed ? C.sacredGold + "CC" : C.sacredGold,
            borderRadius: radii.pill,
          })}
        >
          <Text
            style={{
              color: C.surfaceDeep,
              fontWeight: "700",
              fontSize: 14,
              fontFamily: "serif",
            }}
          >
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
