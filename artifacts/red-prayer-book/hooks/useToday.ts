import { useEffect, useState } from "react";
import { AppState } from "react-native";

function startOfNextDay(from: Date): number {
  const next = new Date(from);
  next.setHours(24, 0, 0, 0);
  return Math.max(1000, next.getTime() - from.getTime());
}

export function useToday(): Date {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const roll = () => {
      const now = new Date();
      setToday(now);
      timer = setTimeout(roll, startOfNextDay(now));
    };
    timer = setTimeout(roll, startOfNextDay(new Date()));
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (timer) clearTimeout(timer);
        roll();
      }
    });
    return () => {
      if (timer) clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return today;
}
