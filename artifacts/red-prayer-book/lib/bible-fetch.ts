import AsyncStorage from '@react-native-async-storage/async-storage';

export type BibleVerse = {
  verse: number;
  text: string;
};

export type BibleChapter = {
  bookId: string;
  chapter: number;
  verses: BibleVerse[];
  translation: string;
};

/**
 * Convert a bookId from bible-structure.ts to the API format.
 * E.g.: '1john' → '1+john', '2samuel' → '2+samuel', 'genesis' → 'genesis'
 */
function toApiBookId(bookId: string): string {
  return bookId.replace(/^(\d)/, '$1+');
}

/**
 * Fetch a chapter from the Bible API with caching.
 * Cache key: rpb:bible:{bookId}:{chapter}
 * If cache miss, fetches from https://bible-api.com/{apiBookId}+{chapter}?translation=kjv
 */
export async function fetchChapter(bookId: string, chapter: number): Promise<BibleChapter> {
  const cacheKey = `rpb:bible:${bookId}:${chapter}`;

  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn(`Failed to read cache for ${cacheKey}:`, err);
  }

  const apiBookId = toApiBookId(bookId);
  const url = `https://bible-api.com/${apiBookId}+${chapter}?translation=kjv`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    const bibleChapter: BibleChapter = {
      bookId,
      chapter,
      verses: data.verses.map((v: any) => ({
        verse: v.verse,
        text: v.text.trim(),
      })),
      translation: data.translation_id || 'kjv',
    };

    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(bibleChapter));
    } catch (err) {
      console.warn(`Failed to cache chapter:`, err);
    }

    return bibleChapter;
  } catch (err) {
    throw new Error(`Failed to fetch chapter: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Clear all cached Bible chapters from AsyncStorage.
 */
export async function clearBibleCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const bibleKeys = keys.filter((k) => k.startsWith('rpb:bible:'));
    if (bibleKeys.length > 0) {
      await AsyncStorage.multiRemove(bibleKeys);
    }
  } catch (err) {
    console.warn('Failed to clear Bible cache:', err);
  }
}
