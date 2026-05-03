import AsyncStorage from '@react-native-async-storage/async-storage';

type Bookmark = { id: string; page_index: number; label: string | null; created_at: number };
type Highlight = { id: string; book: string; chapter: number; verse: number; color: string; created_at: number };
export type PrayerIntention = { id: string; intention: string; prayerText: string; created_at: number };

export type PrayerBookmark = {
  id: string;
  slug: string;
  title: string;
  sectionTitle: string;
  created_at: number;
};

export type PrayerRead = {
  slug: string;
  date: string;
  timestamp: number;
};

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  totalDaysOpened: number;
  prayersRead: number;
};

const KEYS = {
  bookmarks: 'rpb:bookmarks',
  highlights: 'rpb:highlights',
  streak: 'rpb:streak',
  prayerIntentions: 'rpb:prayer_intentions',
  prayerBookmarks: 'rpb:prayer_bookmarks',
  prayerReads: 'rpb:prayer_reads',
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

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function calcCurrentStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const sorted = [...new Set(days)].sort().reverse();
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function calcLongestStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const sorted = [...new Set(days)].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export async function recordStreakToday(): Promise<void> {
  const today = todayStr();
  const days = await read<string>(KEYS.streak);
  if (!days.includes(today)) {
    days.push(today);
    await write(KEYS.streak, days);
  }
}

export async function getStreakCount(): Promise<number> {
  const days = await read<string>(KEYS.streak);
  return calcCurrentStreak(days);
}

export async function getStreakData(): Promise<StreakData> {
  const [days, reads] = await Promise.all([
    read<string>(KEYS.streak),
    read<PrayerRead>(KEYS.prayerReads),
  ]);
  return {
    currentStreak: calcCurrentStreak(days),
    longestStreak: calcLongestStreak(days),
    totalDaysOpened: new Set(days).size,
    prayersRead: reads.length,
  };
}

// ─── Prayer reads ─────────────────────────────────────────────────────────────

export async function recordPrayerRead(slug: string): Promise<void> {
  const reads = await read<PrayerRead>(KEYS.prayerReads);
  reads.unshift({ slug, date: todayStr(), timestamp: Date.now() });
  await write(KEYS.prayerReads, reads);
}

export async function getPrayerReadCount(): Promise<number> {
  const reads = await read<PrayerRead>(KEYS.prayerReads);
  return reads.length;
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

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

// ─── Highlights ───────────────────────────────────────────────────────────────

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

// ─── Prayer intentions ────────────────────────────────────────────────────────

export async function savePrayerIntention(intention: string, prayerText: string): Promise<PrayerIntention> {
  const list = await read<PrayerIntention>(KEYS.prayerIntentions);
  const item: PrayerIntention = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    intention,
    prayerText,
    created_at: Date.now(),
  };
  list.unshift(item);
  await write(KEYS.prayerIntentions, list);
  return item;
}

export async function listPrayerIntentions(): Promise<PrayerIntention[]> {
  return read<PrayerIntention>(KEYS.prayerIntentions);
}

export async function deletePrayerIntention(id: string): Promise<void> {
  const list = await read<PrayerIntention>(KEYS.prayerIntentions);
  await write(KEYS.prayerIntentions, list.filter((p) => p.id !== id));
}

// ─── Prayer bookmarks ─────────────────────────────────────────────────────────

export async function listPrayerBookmarks(): Promise<PrayerBookmark[]> {
  return read<PrayerBookmark>(KEYS.prayerBookmarks);
}

export async function isPrayerBookmarked(slug: string): Promise<boolean> {
  const list = await read<PrayerBookmark>(KEYS.prayerBookmarks);
  return list.some((b) => b.slug === slug);
}

export async function addPrayerBookmark(
  slug: string,
  title: string,
  sectionTitle: string,
): Promise<void> {
  const list = await read<PrayerBookmark>(KEYS.prayerBookmarks);
  if (list.some((b) => b.slug === slug)) return;
  list.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    slug,
    title,
    sectionTitle,
    created_at: Date.now(),
  });
  await write(KEYS.prayerBookmarks, list);
}

export async function removePrayerBookmark(slug: string): Promise<void> {
  const list = await read<PrayerBookmark>(KEYS.prayerBookmarks);
  await write(KEYS.prayerBookmarks, list.filter((b) => b.slug !== slug));
}
