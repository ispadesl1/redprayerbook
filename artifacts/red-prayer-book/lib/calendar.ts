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

export type FastMark = "strict" | "wine" | "fish";

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

export function fastMark(
  day: Pick<LiturgicalDay, "abstentions" | "fastLevel" | "fastLevelDesc" | "fastExceptionDesc">,
): FastMark | null {
  const level = day.fastLevelDesc.trim().toLowerCase();
  const exception = day.fastExceptionDesc.trim().toLowerCase();
  const set = new Set(day.abstentions);
  if ((level === "no fast" || day.fastLevel <= 0) && set.size === 0) return null;
  if (exception.includes("fish")) return "fish";
  if (exception.includes("wine") || exception.includes("oil") || exception.includes("caviar")) return "wine";
  if (set.has("wine") && set.has("oil")) return "strict";
  if (set.has("fish") && !set.has("wine") && !set.has("oil")) return "wine";
  if (set.has("meat") && !set.has("fish")) return "fish";
  return null;
}

function plainFastPhrase(value: string): string {
  const text = value.trim();
  if (!text) return "";
  if (text.toLowerCase() === "no overrides" || text.toLowerCase() === "no override") return "";
  return text;
}

export function dayHeading(day: LiturgicalDay): string {
  if (day.feasts.length > 0) return day.feasts.join("; ");
  if (day.summaryTitle) return day.summaryTitle;
  if (day.saints.length > 0) return day.saints[0];
  if (day.titles.length > 0) return day.titles[0];
  return "";
}

export function saintOfTheDay(day: LiturgicalDay): string {
  return dayTitle(day);
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

const FETCH_TIMEOUT_MS = 8000;

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Calendar request failed (${response.status})`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

export function fastLines(day: LiturgicalDay): { title: string; detail: string } {
  const unique: string[] = [];
  for (const bit of [day.fastLevelDesc, day.fastExceptionDesc]) {
    const text = plainFastPhrase(bit);
    if (!text) continue;
    if (unique.some((item) => item.toLowerCase() === text.toLowerCase())) continue;
    unique.push(text);
  }
  return {
    title: unique.join(" · "),
    detail: day.abstentions.length > 0 ? `Abstain from ${day.abstentions.join(", ")}` : "",
  };
}

export function dayTitle(day: LiturgicalDay): string {
  if (day.feasts[0]) return day.feasts[0];
  if (day.saints[0]) return day.saints[0];
  const summary = day.summaryTitle.split(";")[0]?.trim();
  if (summary) return summary;
  return day.titles[0] ?? "";
}

export function dayNotes(day: LiturgicalDay): string {
  const title = dayTitle(day);
  const names = [...day.feasts, ...day.saints].filter((name) => name && name !== title);
  return [...new Set(names)].join(" · ");
}

function dayKey(date: Date, style: CalendarStyle): string {
  const cal = calendarPath(style);
  return `${CACHE}:day:${cal}:${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function monthKey(year: number, monthIndex: number, style: CalendarStyle): string {
  const cal = calendarPath(style);
  return `${CACHE}:month:${cal}:${year}-${monthIndex + 1}`;
}

export async function readCachedDay(date: Date, style: CalendarStyle): Promise<LiturgicalDay | null> {
  return readCache<LiturgicalDay>(dayKey(date, style));
}

export async function readCachedMonth(
  year: number,
  monthIndex: number,
  style: CalendarStyle,
): Promise<LiturgicalDay[] | null> {
  return readCache<LiturgicalDay[]>(monthKey(year, monthIndex, style));
}

export async function loadFreshDay(date: Date, style: CalendarStyle): Promise<LiturgicalDay> {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const day = date.getDate();
  const cal = calendarPath(style);
  const url = `${SOURCE}/${cal}/${year}/${monthIndex + 1}/${day}/`;
  const payload = await fetchJson(url);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Calendar day was empty");
  }
  const mapped = mapOrthocalDay(payload as RawDay, year, monthIndex, day);
  await writeCache(dayKey(date, style), mapped);
  return mapped;
}

export async function loadFreshMonth(
  year: number,
  monthIndex: number,
  style: CalendarStyle,
): Promise<LiturgicalDay[]> {
  const cal = calendarPath(style);
  const url = `${SOURCE}/${cal}/${year}/${monthIndex + 1}/`;
  const payload = await fetchJson(url);
  if (!Array.isArray(payload)) throw new Error("Calendar month was not a list");
  const days = payload.map((item, index) => mapOrthocalDay(item as RawDay, year, monthIndex, index + 1));
  await writeCache(monthKey(year, monthIndex, style), days);
  return days;
}

export async function fetchLiturgicalMonth(
  year: number,
  monthIndex: number,
  style: CalendarStyle,
): Promise<LiturgicalDay[]> {
  const cached = await readCachedMonth(year, monthIndex, style);
  if (cached) return cached;
  return loadFreshMonth(year, monthIndex, style);
}

export async function fetchLiturgicalDay(date: Date, style: CalendarStyle): Promise<LiturgicalDay> {
  const cached = await readCachedDay(date, style);
  if (cached) return cached;
  return loadFreshDay(date, style);
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
