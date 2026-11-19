import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CalendarStyle } from "@/lib/prefs";

const SOURCE = "https://orthocal.info/api";
const CACHE = "rpb:orthocal:v1";

export type Reading = {
  source: string;
  display: string;
  shortDisplay: string;
  verses: { verse: number; content: string }[];
};

export type SaintStory = {
  title: string;
  story: string;
};

export type LiturgicalDay = {
  civilYear: number;
  civilMonth: number;
  civilDay: number;
  churchYear: number;
  churchMonth: number;
  churchDay: number;
  tone: number | null;
  titles: string[];
  summaryTitle: string;
  saints: string[];
  feasts: string[];
  feastLevel: number;
  greatFeast: boolean;
  fastLevel: number;
  fastLevelDesc: string;
  fastExceptionDesc: string;
  abstentions: string[];
  readings: Reading[];
  stories: SaintStory[];
};

export type FastMark = "strict" | "fish" | "weekly";

type RawReading = {
  source?: string;
  display?: string;
  short_display?: string;
  passage?: { verse?: number; content?: string }[];
};

type RawDay = {
  year?: number;
  month?: number;
  day?: number;
  tone?: number;
  titles?: string[] | null;
  summary_title?: string;
  saints?: string[] | null;
  feasts?: string[] | null;
  feast_level?: number;
  fast_level?: number;
  fast_level_desc?: string;
  fast_exception_desc?: string;
  fast_abstentions?: string[] | null;
  readings?: RawReading[] | null;
  stories?: { title?: string; story?: string }[] | null;
};

const memory = new Map<string, unknown>();

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function mapReading(raw: RawReading): Reading | null {
  const display = (raw.display ?? "").trim();
  if (!display) return null;
  const verses = (raw.passage ?? [])
    .map((verse) => ({
      verse: verse.verse ?? 0,
      content: stripHtml(verse.content ?? ""),
    }))
    .filter((verse) => verse.content.length > 0);
  return {
    source: (raw.source ?? "Reading").trim(),
    display,
    shortDisplay: (raw.short_display ?? display).trim(),
    verses,
  };
}

export function mapOrthocalDay(
  raw: RawDay,
  civilYear: number,
  civilMonth: number,
  civilDay: number,
): LiturgicalDay {
  const feastLevel = raw.feast_level ?? 0;
  const feasts = (raw.feasts ?? []).filter((item): item is string => !!item);
  return {
    civilYear,
    civilMonth,
    civilDay,
    churchYear: raw.year ?? civilYear,
    churchMonth: raw.month ?? civilMonth + 1,
    churchDay: raw.day ?? civilDay,
    tone: typeof raw.tone === "number" ? raw.tone : null,
    titles: (raw.titles ?? []).filter((item): item is string => !!item),
    summaryTitle: (raw.summary_title ?? "").trim(),
    saints: (raw.saints ?? []).filter((item): item is string => !!item),
    feasts,
    feastLevel,
    greatFeast: feastLevel >= 7,
    fastLevel: raw.fast_level ?? 0,
    fastLevelDesc: (raw.fast_level_desc ?? "").trim(),
    fastExceptionDesc: (raw.fast_exception_desc ?? "").trim(),
    abstentions: (raw.fast_abstentions ?? []).filter((item): item is string => !!item),
    readings: (raw.readings ?? []).map(mapReading).filter((item): item is Reading => !!item),
    stories: (raw.stories ?? [])
      .map((story) => ({
        title: (story.title ?? "").trim(),
        story: stripHtml(story.story ?? ""),
      }))
      .filter((story) => story.title || story.story),
  };
}

export function fastMark(day: Pick<LiturgicalDay, "abstentions" | "fastLevel">): FastMark | null {
  const set = new Set(day.abstentions);
  if (day.fastLevel <= 0 && set.size === 0) return null;
  const noMeat = set.has("meat");
  const noFish = set.has("fish");
  const noWine = set.has("wine");
  const noOil = set.has("oil");
  if (noFish && noOil && noWine) return "strict";
  if (noMeat && !noFish) return "fish";
  if (noMeat || day.fastLevel > 0) return "weekly";
  return null;
}

export function dayHeading(day: LiturgicalDay): string {
  if (day.feasts.length > 0) return day.feasts.join("; ");
  if (day.summaryTitle) return day.summaryTitle;
  if (day.saints.length > 0) return day.saints[0];
  if (day.titles.length > 0) return day.titles[0];
  return "";
}

export function saintOfTheDay(day: LiturgicalDay): string {
  if (day.saints.length > 0) return day.saints[0];
  return dayHeading(day);
}

function calendarPath(style: CalendarStyle): "gregorian" | "julian" {
  return style === "old" ? "julian" : "gregorian";
}

async function readCache<T>(key: string): Promise<T | null> {
  const hit = memory.get(key);
  if (hit) return hit as T;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T;
    memory.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

async function writeCache(key: string, value: unknown): Promise<void> {
  memory.set(key, value);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The in-memory copy is enough for this session.
  }
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Calendar request failed (${response.status})`);
  return response.json();
}

export async function fetchLiturgicalMonth(
  year: number,
  monthIndex: number,
  style: CalendarStyle,
): Promise<LiturgicalDay[]> {
  const cal = calendarPath(style);
  const key = `${CACHE}:month:${cal}:${year}-${monthIndex + 1}`;
  const url = `${SOURCE}/${cal}/${year}/${monthIndex + 1}/`;
  try {
    const payload = await fetchJson(url);
    if (!Array.isArray(payload)) throw new Error("Calendar month was not a list");
    const days = payload.map((item, index) =>
      mapOrthocalDay(item as RawDay, year, monthIndex, index + 1),
    );
    await writeCache(key, days);
    return days;
  } catch (error) {
    const cached = await readCache<LiturgicalDay[]>(key);
    if (cached) return cached;
    throw error;
  }
}

export async function fetchLiturgicalDay(
  date: Date,
  style: CalendarStyle,
): Promise<LiturgicalDay> {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const day = date.getDate();
  const cal = calendarPath(style);
  const key = `${CACHE}:day:${cal}:${year}-${monthIndex + 1}-${day}`;
  const url = `${SOURCE}/${cal}/${year}/${monthIndex + 1}/${day}/`;
  try {
    const payload = await fetchJson(url);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("Calendar day was empty");
    }
    const mapped = mapOrthocalDay(payload as RawDay, year, monthIndex, day);
    await writeCache(key, mapped);
    return mapped;
  } catch (error) {
    const cached = await readCache<LiturgicalDay>(key);
    if (cached) return cached;
    throw error;
  }
}

export const CALENDAR_CREDIT =
  "Saints, feasts, and readings from orthocal.info (OCA, Slavic tradition). New Calendar uses the Gregorian date; Old Calendar uses the Julian date for that civil day.";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function formatCivilDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
