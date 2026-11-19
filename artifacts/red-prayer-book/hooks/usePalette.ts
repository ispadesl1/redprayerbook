import { usePrefs } from "@/lib/prefs";
import { palettes, type Palette } from "@/theme/colors";

export function usePalette(): Palette {
  const appearance = usePrefs((state) => state.appearance);
  return appearance === "night" ? palettes.night : palettes.light;
}
