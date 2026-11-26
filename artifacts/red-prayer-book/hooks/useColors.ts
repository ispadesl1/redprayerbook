import colors from "@/constants/colors";
import { usePrefs } from "@/lib/prefs";

export function useColors() {
  const appearance = usePrefs((state) => state.appearance);
  const palette = appearance === "night" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
