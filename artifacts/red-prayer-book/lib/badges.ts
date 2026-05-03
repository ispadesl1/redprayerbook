import AsyncStorage from '@react-native-async-storage/async-storage';

export type BadgeDef = {
  id: string;
  label: string;
  description: string;
  max: number;
  color: string;
  mciIcon: string;
};

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'share_verses', label: 'Share Verses', description: 'Share 30 Bible verses', max: 30, color: '#E39C3D', mciIcon: 'share-variant' },
  { id: 'whole_bible', label: 'Whole Bible', description: 'Read 100 Bible chapters', max: 100, color: '#276A3D', mciIcon: 'book-open-variant' },
  { id: 'notes', label: 'Notes', description: 'Write 50 notes', max: 50, color: '#B22222', mciIcon: 'pencil' },
  { id: 'days_fasted', label: 'Days Fasted', description: 'Record 40 fasting days', max: 40, color: '#4A2C4E', mciIcon: 'fish' },
  { id: 'daily_prayers', label: 'Daily Prayers', description: 'Complete 100 daily prayers', max: 100, color: '#C97A24', mciIcon: 'hands-pray' },
  { id: 'streak', label: 'App Streak', description: 'Maintain a 30-day streak', max: 30, color: '#D4AF37', mciIcon: 'lightning-bolt' },
  { id: 'calendar', label: 'Calendar', description: 'Check the calendar 30 times', max: 30, color: '#2B7A5E', mciIcon: 'calendar-star' },
  { id: 'vespers', label: 'Vespers', description: 'Complete 20 Vespers prayers', max: 20, color: '#4A2C4E', mciIcon: 'candle' },
];

const KEY = (id: string) => `rpb:badge:${id}`;

export async function getBadgeProgress(id: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY(id));
    return raw ? Math.max(0, Number(raw)) : 0;
  } catch {
    return 0;
  }
}

export async function incrementBadge(id: string, by = 1): Promise<number> {
  const def = BADGE_DEFS.find((b) => b.id === id);
  if (!def) return 0;
  const current = await getBadgeProgress(id);
  const next = Math.min(def.max, current + by);
  await AsyncStorage.setItem(KEY(id), String(next));
  return next;
}

export async function getAllBadgeProgress(): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  await Promise.all(
    BADGE_DEFS.map(async (def) => {
      result[def.id] = await getBadgeProgress(def.id);
    })
  );
  return result;
}

export function getProgressFraction(progress: number, max: number): number {
  return Math.min(1, Math.max(0, progress / max));
}

export function isEarned(progress: number, max: number): boolean {
  return progress >= max;
}
