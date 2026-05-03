import AsyncStorage from '@react-native-async-storage/async-storage';

type Bookmark = { id: string; page_index: number; label: string | null; created_at: number };
type Highlight = { id: string; book: string; chapter: number; verse: number; color: string; created_at: number };

const KEYS = {
  bookmarks: 'rpb:bookmarks',
  highlights: 'rpb:highlights',
  streak: 'rpb:streak',
};

async function read<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function write<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export async function addBookmark(pageIndex: number, label?: string): Promise<void> {
  const list = await read<Bookmark>(KEYS.bookmarks);
  list.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    page_index: pageIndex,
    label: label ?? null,
    created_at: Date.now(),
  });
  await write(KEYS.bookmarks, list);
}

export async function listBookmarks(): Promise<{ id: string; page_index: number; label: string | null }[]> {
  const list = await read<Bookmark>(KEYS.bookmarks);
  return list.map(({ id, page_index, label }) => ({ id, page_index, label }));
}

export async function addHighlight(book: string, chapter: number, verse: number, color: string): Promise<void> {
  const list = await read<Highlight>(KEYS.highlights);
  list.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    book,
    chapter,
    verse,
    color,
    created_at: Date.now(),
  });
  await write(KEYS.highlights, list);
}

export async function listHighlights(): Promise<{ id: string; book: string; chapter: number; verse: number; color: string }[]> {
  const list = await read<Highlight>(KEYS.highlights);
  return list.map(({ id, book, chapter, verse, color }) => ({ id, book, chapter, verse, color }));
}

export async function recordStreakToday(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const days = await read<string>(KEYS.streak);
  if (!days.includes(today)) {
    days.push(today);
    await write(KEYS.streak, days);
  }
}

export async function getStreakCount(): Promise<number> {
  const days = await read<string>(KEYS.streak);
  return days.length;
}
