import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Clipboard,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { usePalette } from "@/hooks/usePalette";
import { useFrame } from "@/components/ui/manuscript";
import { addHighlight, listHighlights } from "@/lib/db";
import { incrementBadge } from "@/lib/badges";
import { BIBLE_SECTIONS, getBookById, type BibleBook } from "@/lib/bible-structure";
import { fetchChapter, searchBibleCache, type BibleChapter, type SearchResult } from "@/lib/bible-fetch";
import { fonts } from "@/theme/typography";

function tap(style: "light" | "medium" = "light") {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(style === "light" ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export default function Bible() {
  const C = usePalette();
  const insets = useSafeAreaInsets();
  const { wide } = useFrame();
  const tabHeight = useBottomTabBarHeight();
  const bottom = wide ? 24 : tabHeight + 16;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchVersion = useRef(0);

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setSearchResults([]);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!text.trim()) {
      setSearching(false);
      return;
    }
    setSearching(true);
    const version = ++searchVersion.current;
    searchTimer.current = setTimeout(async () => {
      const results = await searchBibleCache(text);
      if (version === searchVersion.current) {
        setSearchResults(results);
        setSearching(false);
      }
    }, 300);
  }, []);

  const loadHighlights = useCallback(async (bookId: string, chapter: number) => {
    const all = await listHighlights();
    setHighlightedVerses(new Set(all.filter((item) => item.book === bookId && item.chapter === chapter).map((item) => item.verse)));
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

  const handleHighlight = async () => {
    if (selectedVerse == null || !selectedBook || !selectedChapter) return;
    setHighlightedVerses((prev) => new Set(prev).add(selectedVerse));
    setActionModal(false);
    try {
      await addHighlight(selectedBook.id, selectedChapter, selectedVerse, C.highlight);
      await incrementBadge("share_verses");
    } catch {
      // The verse stays marked on screen; the save can be retried.
    }
  };

  const verseText = chapterData?.verses.find((verse) => verse.verse === selectedVerse)?.text;

  const sections = BIBLE_SECTIONS.filter((section) => section.testament === testament);
  const searchingNow = searchQuery.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper, paddingTop: wide ? 12 : insets.top }}>
      {view === "books" ? (
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 34, color: C.ink, textAlign: "center", marginTop: 18 }}>Holy Scripture</Text>
          <Text style={{ fontFamily: fonts.italic, fontSize: 15, color: C.ink2, textAlign: "center", marginTop: 4 }}>
            King James Version
          </Text>
          <View style={{ marginHorizontal: 22, borderBottomWidth: 1, borderBottomColor: C.ink2, minHeight: 48, flexDirection: "row", alignItems: "center", marginTop: 12 }}>
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search cached verses"
              placeholderTextColor={C.ink2}
              style={{ flex: 1, fontFamily: fonts.regular, fontSize: 18, lineHeight: 26, color: C.ink, minHeight: 44, paddingVertical: 8 }}
              autoCorrect={false}
            />
            {searching ? <ActivityIndicator color={C.rubric} /> : null}
          </View>
          {searchingNow ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => `${item.bookId}-${item.chapter}-${item.verse}`}
              contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: bottom + 24 }}
              ListEmptyComponent={
                searching ? null : (
                  <Text style={{ fontFamily: fonts.italic, color: C.ink2, fontSize: 17, marginTop: 24 }}>
                    No cached verses match. Open a chapter first; search looks through chapters already read.
                  </Text>
                )
              }
              renderItem={({ item }) => {
                const book = getBookById(item.bookId);
                if (!book) return null;
                return (
                  <Pressable
                    onPress={() => {
                      setSelectedBook(book);
                      setSelectedChapter(item.chapter);
                      setSearchQuery("");
                      setSearchResults([]);
                      setView("reading");
                    }}
                    style={({ pressed }) => ({ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.rule, backgroundColor: pressed ? C.highlight : "transparent" })}
                  >
                    <Text style={{ fontFamily: fonts.medium, color: C.rubric, fontSize: 16 }}>
                      {book.name} {item.chapter}:{item.verse}
                    </Text>
                    <Text style={{ fontFamily: fonts.regular, color: C.ink, fontSize: 16, lineHeight: 24, marginTop: 4 }} numberOfLines={3}>
                      {item.text}
                    </Text>
                  </Pressable>
                );
              }}
            />
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: bottom + 28 }}>
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 22, marginVertical: 12 }}>
                {(["OT", "NT"] as const).map((item) => {
                  const on = testament === item;
                  return (
                    <Pressable key={item} onPress={() => { setTestament(item); tap(); }} style={{ minHeight: 44, justifyContent: "center" }}>
                      <Text style={{ fontFamily: fonts.medium, fontSize: 18, color: on ? C.rubric : C.ink2, borderBottomWidth: on ? 1 : 0, borderBottomColor: C.rubric, fontVariant: ["small-caps"] }}>
                        {item === "OT" ? "Old Testament" : "New Testament"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {sections.map((section) => (
                <View key={section.id} style={{ marginBottom: 18 }}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 16, color: C.rubric, fontVariant: ["small-caps"], marginBottom: 6 }}>{section.title}</Text>
                  {section.books.map((book) => (
                    <Pressable
                      key={book.id}
                      onPress={() => { tap(); setSelectedBook(book); setView("chapters"); }}
                      style={({ pressed }) => ({ flexDirection: "row", alignItems: "baseline", minHeight: 44, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.rule, backgroundColor: pressed ? C.highlight : "transparent" })}
                    >
                      <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 18, color: C.ink }}>
                        {book.name}
                        {book.deuterocanonical ? " · deuterocanonical" : ""}
                      </Text>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: C.ink2 }}>{book.abbr}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      ) : null}

      {view === "chapters" && selectedBook ? (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 8 }}>
            <Pressable onPress={() => setView("books")} style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 8 }}>
              <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>‹ Books</Text>
            </Pressable>
            <Text style={{ flex: 1, textAlign: "center", fontFamily: fonts.medium, fontSize: 22, color: C.ink }}>{selectedBook.name}</Text>
            <View style={{ width: 64 }} />
          </View>
          <FlatList
            data={Array.from({ length: selectedBook.chapters }, (_, index) => index + 1)}
            keyExtractor={(item) => String(item)}
            numColumns={5}
            contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { tap("medium"); setSelectedChapter(item); setView("reading"); }}
                style={{ width: "20%", aspectRatio: 1.3, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontFamily: fonts.regular, fontSize: 18, color: C.ink, fontVariant: ["oldstyle-nums"] }}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      ) : null}

      {view === "reading" && selectedBook && selectedChapter ? (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingTop: 8 }}>
            <Pressable onPress={() => setView("chapters")} style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 8 }}>
              <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>‹ {selectedBook.abbr}</Text>
            </Pressable>
            <Text style={{ flex: 1, textAlign: "center", fontFamily: fonts.medium, fontSize: 20, color: C.ink }}>
              {selectedBook.name} {selectedChapter}
            </Text>
            <Text style={{ color: C.ink2, fontFamily: fonts.medium, fontSize: 14, paddingRight: 8 }}>KJV</Text>
          </View>
          {loading ? (
            <ActivityIndicator color={C.rubric} style={{ marginTop: 32 }} />
          ) : error ? (
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text style={{ fontFamily: fonts.italic, fontSize: 17, color: C.ink, textAlign: "center" }}>{error}</Text>
              <Pressable onPress={() => loadChapter(selectedBook.id, selectedChapter)} style={{ marginTop: 16, backgroundColor: C.rubric, paddingHorizontal: 18, paddingVertical: 10 }}>
                <Text style={{ color: C.onRubric, fontFamily: fonts.medium, fontSize: 16 }}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              style={{ marginBottom: bottom + 56 }}
              contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 28, maxWidth: 680, alignSelf: "center", width: "100%" }}
            >
              {chapterData?.verses.map((verse) => {
                const marked = highlightedVerses.has(verse.verse);
                return (
                  <Pressable
                    key={verse.verse}
                    onLongPress={() => { tap("medium"); setSelectedVerse(verse.verse); setActionModal(true); }}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      gap: 10,
                      paddingVertical: 6,
                      backgroundColor: marked ? C.highlight : pressed ? C.highlight : "transparent",
                    })}
                  >
                    <Text style={{ width: 28, textAlign: "right", color: C.rubric, fontFamily: fonts.regular, fontSize: 15, lineHeight: 26, fontVariant: ["oldstyle-nums"] }}>
                      {verse.verse}
                    </Text>
                    <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 18, lineHeight: 28, color: C.ink }}>{verse.text}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
          <View style={{ position: "absolute", left: 0, right: 0, bottom, borderTopWidth: 1, borderTopColor: C.rule, backgroundColor: C.paper, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 }}>
            <Pressable disabled={selectedChapter === 1} onPress={() => setSelectedChapter((chapter) => (chapter ?? 1) - 1)} style={{ opacity: selectedChapter === 1 ? 0.35 : 1, minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: C.rubric, fontSize: 18 }}>‹ Prev</Text>
            </Pressable>
            <Pressable disabled={selectedChapter === selectedBook.chapters} onPress={() => setSelectedChapter((chapter) => (chapter ?? 1) + 1)} style={{ opacity: selectedChapter === selectedBook.chapters ? 0.35 : 1, minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: C.rubric, fontSize: 18 }}>Next ›</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {actionModal ? (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0, justifyContent: "flex-end" }}>
          <Pressable style={{ flex: 1, backgroundColor: C.scrim }} onPress={() => setActionModal(false)} />
          <View style={{ backgroundColor: C.paper, padding: 20, paddingBottom: bottom }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 18, color: C.ink, marginBottom: 8 }}>Verse {selectedVerse}</Text>
            <Pressable onPress={handleHighlight} style={{ minHeight: 48, justifyContent: "center" }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 18, color: C.rubric }}>Highlight</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                if (verseText) Clipboard.setString(verseText);
                setActionModal(false);
              }}
              style={{ minHeight: 48, justifyContent: "center" }}
            >
              <Text style={{ fontFamily: fonts.regular, fontSize: 18, color: C.ink }}>Copy</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (verseText && selectedBook && selectedChapter) {
                  Share.share({ message: `${selectedBook.name} ${selectedChapter}:${selectedVerse} (KJV)\n${verseText}` });
                }
                setActionModal(false);
              }}
              style={{ minHeight: 48, justifyContent: "center" }}
            >
              <Text style={{ fontFamily: fonts.regular, fontSize: 18, color: C.ink }}>Share</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
