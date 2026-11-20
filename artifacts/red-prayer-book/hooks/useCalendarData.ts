import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loadFreshDay,
  loadFreshMonth,
  readCachedDay,
  readCachedMonth,
  type LiturgicalDay,
} from "@/lib/calendar";
import { localYmd, type CalendarStyle } from "@/lib/prefs";

export function useLiturgicalDay(date: Date, style: CalendarStyle) {
  const client = useQueryClient();
  const ymd = localYmd(date);
  const queryKey = ["orthocal-day", style, ymd] as const;
  return useQuery({
    queryKey,
    retry: false,
    staleTime: 6 * 60 * 60 * 1000,
    queryFn: async (): Promise<LiturgicalDay> => {
      const cached = await readCachedDay(date, style);
      const fresh = loadFreshDay(date, style);
      if (cached) {
        fresh.then((day) => client.setQueryData(queryKey, day)).catch(() => {});
        return cached;
      }
      return fresh;
    },
  });
}

export function useLiturgicalMonth(year: number, monthIndex: number, style: CalendarStyle) {
  const client = useQueryClient();
  const queryKey = ["orthocal-month", style, year, monthIndex] as const;
  return useQuery({
    queryKey,
    retry: false,
    staleTime: 6 * 60 * 60 * 1000,
    queryFn: async (): Promise<LiturgicalDay[]> => {
      const cached = await readCachedMonth(year, monthIndex, style);
      const fresh = loadFreshMonth(year, monthIndex, style);
      if (cached) {
        fresh.then((days) => client.setQueryData(queryKey, days)).catch(() => {});
        return cached;
      }
      return fresh;
    },
  });
}
