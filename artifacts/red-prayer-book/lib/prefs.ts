import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { recordActivity, removeActivity } from "@/lib/db";
import { CANONICAL_HOURS } from "@/lib/canonicalHours";
import type { Appearance } from "@/theme/colors";

export type CalendarStyle = "new" | "old";

export type PrefsRead = "pending" | "ready" | "failed";

type Prefs = {
  appearance: Appearance;
  setAppearance: (appearance: Appearance) => void;
  calendarStyle: CalendarStyle;
  setCalendarStyle: (style: CalendarStyle) => void;
  readStep: number;
  setReadStep: (step: number) => void;
  ruleChecks: Record<string, string[]>;
  toggleHour: (date: string, hourId: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
  onboardingDone: boolean;
  completeOnboarding: (name?: string) => void;
  prefsRead: PrefsRead;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
};

const PREFS_KEY = "rpb:prefs";
const PREFS_READ_MS = 4000;
let persistWrites = false;
let readGeneration = 0;

const gatedStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => {
    if (!persistWrites) return Promise.resolve();
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

export const usePrefs = create<Prefs>()(
  persist(
    (set, get) => ({
      appearance: "light",
      setAppearance: (appearance) => set({ appearance }),
      calendarStyle: "new",
      setCalendarStyle: (calendarStyle) => set({ calendarStyle }),
      readStep: 0,
      setReadStep: (readStep) => set({ readStep: Math.max(-2, Math.min(4, readStep)) }),
      ruleChecks: {},
      toggleHour: (date, hourId) => {
        const current = get().ruleChecks[date] ?? [];
        const adding = !current.includes(hourId);
        const next = adding ? [...current, hourId] : current.filter((id) => id !== hourId);
        const merged = { ...get().ruleChecks, [date]: next };
        set({ ruleChecks: pruneChecks(merged) });
        const key = `hour:${date}:${hourId}`;
        if (adding) {
          const hour = CANONICAL_HOURS.find((item) => item.id === hourId);
          void recordActivity("hour", `Kept ${hour?.name ?? "an hour"}`, key);
        } else {
          void removeActivity(key);
        }
      },
      displayName: "",
      setDisplayName: (name) => set({ displayName: name.trim().slice(0, 60) }),
      onboardingDone: false,
      completeOnboarding: (name) =>
        set({
          onboardingDone: true,
          displayName: (name ?? get().displayName).trim().slice(0, 60),
        }),
      prefsRead: "pending",
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: PREFS_KEY,
      storage: createJSONStorage(() => gatedStorage),
      skipHydration: true,
      partialize: (state) => ({
        appearance: state.appearance,
        calendarStyle: state.calendarStyle,
        readStep: state.readStep,
        ruleChecks: state.ruleChecks,
        displayName: state.displayName,
        onboardingDone: state.onboardingDone,
      }),
    },
  ),
);

function applySavedPrefs(saved: Record<string, unknown>) {
  const patch: Partial<Prefs> = { prefsRead: "ready", hydrated: true };
  if (saved.appearance === "light" || saved.appearance === "night") patch.appearance = saved.appearance;
  if (saved.calendarStyle === "new" || saved.calendarStyle === "old") patch.calendarStyle = saved.calendarStyle;
  if (typeof saved.readStep === "number") patch.readStep = Math.max(-2, Math.min(4, saved.readStep));
  if (saved.ruleChecks && typeof saved.ruleChecks === "object") patch.ruleChecks = saved.ruleChecks as Record<string, string[]>;
  if (typeof saved.displayName === "string") patch.displayName = saved.displayName;
  if (typeof saved.onboardingDone === "boolean") patch.onboardingDone = saved.onboardingDone;
  usePrefs.setState(patch);
}

export async function loadPrefs(): Promise<void> {
  const generation = ++readGeneration;
  persistWrites = false;
  usePrefs.setState({ prefsRead: "pending" });
  try {
    const raw = await Promise.race([
      AsyncStorage.getItem(PREFS_KEY),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), PREFS_READ_MS);
      }),
    ]);
    if (generation !== readGeneration) return;
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
      if (!parsed || typeof parsed !== "object" || !parsed.state || typeof parsed.state !== "object") {
        throw new Error("unreadable");
      }
      applySavedPrefs(parsed.state);
    } else {
      usePrefs.setState({ prefsRead: "ready", hydrated: true });
    }
    persistWrites = true;
  } catch {
    if (generation !== readGeneration) return;
    persistWrites = false;
    usePrefs.setState({ prefsRead: "failed" });
  }
}

export function localYmd(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isHourKept(date: string, hourId: string, checks: Record<string, string[]>): boolean {
  return (checks[date] ?? []).includes(hourId);
}

function pruneChecks(checks: Record<string, string[]>, keepDays = 90): Record<string, string[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - keepDays);
  const min = localYmd(cutoff);
  const next: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(checks)) {
    if (key >= min) next[key] = value;
  }
  return next;
}
