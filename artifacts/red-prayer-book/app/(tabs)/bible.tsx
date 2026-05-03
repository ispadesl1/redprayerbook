import { useState, useEffect, useCallback, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Animated,
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";
import { addHighlight, listHighlights } from "@/lib/db";
import { incrementBadge } from "@/lib/badges";
import { BIBLE_SECTIONS, type BibleBook } from "@/lib/bible-structure";
import { fetchChapter, type BibleChapter, type BibleVerse } from "@/lib/bible-fetch";

const { width } = Dimensions.get("window");

const SkeletonRow = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        flexDirection: "row",
        marginBottom: spacing.m,
        opacity,
      }}
    >
      <View style={{ width: 24, height: 16, backgroundColor: C.sacredGold, borderRadius: 4, marginRight: spacing.s }} />
      <View style={{ flex: 1 }}>
        <View style={{ height: 16, backgroundColor: C.textMuted, borderRadius: 4, marginBottom: 8 }} />
        <View style={{ height: 16, backgroundColor: C.textMuted, borderRadius: 4, width: "80%" }} />
      </View>
    </Animated.View>
  );
};

export default function Bible() {
  const [view, setView] = useState<"books" | "chapters" | "reading">("books");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [testament, setTestament] = useState<"OT" | "NT">("NT");
  
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedVerses, setHighlightedVerses] = useState<Set<number>>(new Set());
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [actionModal, setActionModal] = useState(false);

  // Load highlights for current chapter
  const loadHighlights = useCallback(async (bookId: string, chapter: number) => {
    try {
      const all = await listHighlights();
      const filtered = all
        .filter((h) => h.book === bookId && h.chapter === chapter)
        .map((h) => h.verse);
      setHighlightedVerses(new Set(filtered));
    } catch (err) {
      console.error("Failed to load highlights:", err);
    }
  }, []);

  const loadChapter = useCallback(async (bookId: string, chapter: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChapter(bookId, chapter);
      setChapterData(data);
      await loadHighlights(bookId, chapter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chapter");
    } finally {
      setLoading(false);
    }
  }, [loadHighlights]);

  useEffect(() => {
    if (view === "reading" && selectedBook && selectedChapter) {
      loadChapter(selectedBook.id, selectedChapter);
    }
  }, [view, selectedBook, selectedChapter, loadChapter]);

  const handleBookPress = (book: BibleBook) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBook(book);
    setView("chapters");
  };

  const handleChapterPress = (num: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedChapter(num);
    setView("reading");
  };

  const handleLongPress = (v: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVerse(v);
    setActionModal(true);
  };

  const handleHighlight = async () => {
    if (selectedVerse == null || !selectedBook || !selectedChapter) return;
    
    setHighlightedVerses((prev) => new Set(prev).add(selectedVerse));
    setActionModal(false);
    try {
      await addHighlight(selectedBook.id, selectedChapter, selectedVerse, "#D4AF37");
      await incrementBadge("share_verses");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Failed to save highlight:", err);
    }
  };

  const handleCopy = () => {
    if (selectedVerse == null || !chapterData) return;
    const verseText = chapterData.verses.find(v => v.verse === selectedVerse)?.text;
    if (verseText) {
      Clipboard.setString(verseText);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setActionModal(false);
  };

  const navigateChapter = (dir: "prev" | "next") => {
    if (!selectedBook || !selectedChapter) return;
    let nextChap = dir === "next" ? selectedChapter + 1 : selectedChapter - 1;
    
    if (nextChap < 1) return;
    if (nextChap > selectedBook.chapters) return;

    setSelectedChapter(nextChap);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderBooksView = () => {
    const sections = BIBLE_SECTIONS.filter(s => s.testament === testament);
    
    return (
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: spacing.m, alignItems: "center" }}>
          <Text style={{ fontFamily: "serif", fontWeight: "700", fontSize: 24, color: C.sacredGold }}>Holy Scripture</Text>
        </View>

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.m, marginBottom: spacing.m }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.hairline }} />
          <MaterialCommunityIcons name="cross" size={16} color={C.sacredGold} style={{ marginHorizontal: 8 }} />
          <View style={{ flex: 1, height: 1, backgroundColor: C.hairline }} />
        </View>

        {/* Testament Tabs */}
        <View style={{ flexDirection: "row", paddingHorizontal: spacing.m, gap: spacing.s, marginBottom: spacing.m }}>
          {(["OT", "NT"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => {
                setTestament(t);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={{
                flex: 1,
                paddingVertical: spacing.s,
                borderRadius: radii.pill,
                backgroundColor: testament === t ? C.byzantineCrimson : C.surfaceElevated,
                alignItems: "center",
                borderWidth: 1,
                borderColor: testament === t ? C.sacredGold : C.hairline,
              }}
            >
              <Text style={{ color: testament === t ? C.white : C.textSecondary, fontWeight: "600", fontSize: 13 }}>
                {t === "OT" ? "Old Testament" : "New Testament"}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.m, paddingBottom: 160 }}>
          {sections.map((section) => (
            <View key={section.id} style={{ marginBottom: spacing.l }}>
              <Text style={{ color: C.sacredGold, fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: spacing.s }}>
                {section.icon} {section.title}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {section.books.map((book) => (
                  <Pressable
                    key={book.id}
                    onPress={() => handleBookPress(book)}
                    style={{
                      width: (width - spacing.m * 2 - 32) / 5,
                      height: 40,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: C.hairline,
                      backgroundColor: C.surfaceElevated,
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <Text style={{ color: C.textPrimary, fontSize: 12, fontWeight: "600" }}>{book.abbr}</Text>
                    {book.deuterocanonical && (
                      <View style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: C.sacredGold }} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Bar */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.hairline, padding: spacing.m, alignItems: "center" }}>
          <Text style={{ color: C.textSecondary, fontSize: 12 }}>73 Books • OT & NT</Text>
        </View>
      </View>
    );
  };

  const renderChaptersView = () => {
    if (!selectedBook) return null;

    return (
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", padding: spacing.m }}>
          <Pressable onPress={() => setView("books")} style={{ padding: 4 }}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={C.sacredGold} />
          </Pressable>
          <Text style={{ flex: 1, textAlign: "center", fontFamily: "serif", fontSize: 20, fontWeight: "700", color: C.sacredGold }}>
            {selectedBook.name}
          </Text>
          <Pressable style={{ padding: 4 }}>
            <MaterialCommunityIcons name="bookmark-outline" size={24} color={C.sacredGold} />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.m }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.hairline }} />
          <MaterialCommunityIcons name="cross" size={14} color={C.sacredGold} style={{ marginHorizontal: 8 }} />
          <View style={{ flex: 1, height: 1, backgroundColor: C.hairline }} />
        </View>

        <View style={{ paddingHorizontal: spacing.m, paddingVertical: spacing.s, alignItems: "center" }}>
          <Text style={{ color: C.textSecondary, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            {BIBLE_SECTIONS.find(s => s.books.some(b => b.id === selectedBook.id))?.title}
            {selectedBook.deuterocanonical ? " | Deuterocanonical" : ""}
          </Text>
        </View>

        <FlatList
          data={Array.from({ length: selectedBook.chapters }, (_, i) => i + 1)}
          keyExtractor={(item) => item.toString()}
          numColumns={5}
          contentContainerStyle={{ padding: spacing.m, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleChapterPress(item)}
              style={{
                width: (width - spacing.m * 2 - 32) / 5,
                height: 48,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: C.hairline,
                backgroundColor: C.surfaceElevated,
                alignItems: "center",
                justifyContent: "center",
                margin: 4,
              }}
            >
              <Text style={{ color: C.textPrimary, fontSize: 16, fontWeight: "600" }}>{item}</Text>
            </Pressable>
          )}
          ListFooterComponent={() => (
            <Text style={{ textAlign: "center", color: C.textMuted, marginTop: spacing.l, fontSize: 12 }}>
              {selectedBook.chapters} Chapters
            </Text>
          )}
        />
      </View>
    );
  };

  const renderReadingView = () => {
    if (!selectedBook || !selectedChapter) return null;

    return (
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", padding: spacing.m }}>
          <Pressable onPress={() => setView("chapters")} style={{ padding: 4 }}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={C.sacredGold} />
          </Pressable>
          <Text style={{ flex: 1, textAlign: "center", fontFamily: "serif", fontSize: 18, fontWeight: "700", color: C.sacredGold }}>
            {selectedBook.name} {selectedChapter}
          </Text>
          <Pressable style={{ padding: 4 }}>
            <MaterialCommunityIcons name="bookmark-outline" size={24} color={C.sacredGold} />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.m, marginBottom: spacing.s }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.hairline }} />
          <MaterialCommunityIcons name="cross" size={14} color={C.sacredGold} style={{ marginHorizontal: 8 }} />
          <View style={{ flex: 1, height: 1, backgroundColor: C.hairline }} />
        </View>

        {loading ? (
          <ScrollView contentContainerStyle={{ padding: spacing.m }}>
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonRow key={i} />)}
          </ScrollView>
        ) : error ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={C.martyrRed} />
            <Text style={{ color: C.textPrimary, textAlign: "center", marginVertical: spacing.m }}>{error}</Text>
            <Pressable
              onPress={() => loadChapter(selectedBook.id, selectedChapter)}
              style={{ backgroundColor: C.byzantineCrimson, paddingHorizontal: spacing.l, paddingVertical: spacing.s, borderRadius: radii.m }}
            >
              <Text style={{ color: C.white, fontWeight: "600" }}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: spacing.m, paddingBottom: 180 }}
            showsVerticalScrollIndicator={false}
          >
            {chapterData?.verses.map((v) => {
              const isHighlighted = highlightedVerses.has(v.verse);
              return (
                <Pressable
                  key={v.verse}
                  onLongPress={() => handleLongPress(v.verse)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    marginBottom: spacing.s,
                    padding: 6,
                    borderRadius: 8,
                    backgroundColor: isHighlighted
                      ? "rgba(212,175,55,0.12)"
                      : pressed
                      ? "rgba(255,255,255,0.04)"
                      : "transparent",
                    borderLeftWidth: isHighlighted ? 2 : 0,
                    borderLeftColor: C.sacredGold,
                  })}
                >
                  <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 14, width: 26, textAlign: "right", marginRight: spacing.s, lineHeight: 22 }}>
                    {v.verse}
                  </Text>
                  <Text style={{ color: isHighlighted ? C.ivoryVellum : C.textPrimary, flex: 1, fontFamily: "serif", fontSize: 16, lineHeight: 24 }}>
                    {v.text}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Bottom Dock */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.s,
            backgroundColor: C.surface,
            borderTopColor: C.hairline,
            borderTopWidth: 1,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: spacing.m + 8,
          }}
        >
          <Pressable
            onPress={() => setView("chapters")}
            style={{
              paddingHorizontal: spacing.m,
              paddingVertical: spacing.xs,
              borderColor: C.sacredGold,
              borderWidth: 1,
              borderRadius: radii.pill,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text style={{ color: C.sacredGold, fontSize: 13, fontWeight: "600" }}>{selectedBook.abbr} {selectedChapter}</Text>
            <MaterialCommunityIcons name="chevron-down" size={16} color={C.sacredGold} />
          </Pressable>

          <View style={{ backgroundColor: C.surfaceElevated, paddingHorizontal: spacing.s, paddingVertical: 4, borderRadius: 4 }}>
            <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: "700" }}>KJV</Text>
          </View>

          <View style={{ flexDirection: "row", gap: spacing.xs }}>
            <Pressable
              disabled={selectedChapter === 1}
              onPress={() => navigateChapter("prev")}
              style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderColor: C.hairline, borderWidth: 1, opacity: selectedChapter === 1 ? 0.3 : 1 }}
            >
              <MaterialCommunityIcons name="chevron-left" size={20} color={C.sacredGold} />
            </Pressable>
            <Pressable
              disabled={selectedChapter === selectedBook.chapters}
              onPress={() => navigateChapter("next")}
              style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderColor: C.hairline, borderWidth: 1, opacity: selectedChapter === selectedBook.chapters ? 0.3 : 1 }}
            >
              <MaterialCommunityIcons name="chevron-right" size={20} color={C.sacredGold} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.surfaceDeep }}>
      {view === "books" && renderBooksView()}
      {view === "chapters" && renderChaptersView()}
      {view === "reading" && renderReadingView()}

      {/* Verse action sheet */}
      <Modal
        visible={actionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setActionModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setActionModal(false)}
        />
        <View
          style={{
            backgroundColor: C.surfaceElevated,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: spacing.l,
            paddingBottom: spacing.xxl,
          }}
        >
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.sacredGold, alignSelf: "center", marginBottom: spacing.m }} />
          <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 16, textAlign: "center", marginBottom: spacing.m }}>
            Verse {selectedVerse}
          </Text>
          {[
            { label: "Highlight", icon: "marker" as const, action: handleHighlight },
            { label: "Copy", icon: "content-copy" as const, action: handleCopy },
            { label: "Share", icon: "share-variant" as const, action: () => setActionModal(false) },
            { label: "Bookmark", icon: "bookmark-plus-outline" as const, action: () => setActionModal(false) },
          ].map(({ label, icon, action }) => (
            <Pressable
              key={label}
              onPress={action}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: spacing.m,
                opacity: pressed ? 0.7 : 1,
                borderBottomWidth: 1,
                borderColor: C.hairline,
                gap: spacing.m,
              })}
            >
              <MaterialCommunityIcons name={icon} size={22} color={C.sacredGold} />
              <Text style={{ color: C.textPrimary, fontFamily: "serif", fontSize: 16 }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
