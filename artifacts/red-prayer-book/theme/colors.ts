export type Palette = {
  paper: string;
  paper2: string;
  ink: string;
  ink2: string;
  rubric: string;
  onRubric: string;
  rule: string;
  rule2: string;
  scrim: string;
  highlight: string;
  byzantineCrimson: string;
  sacredGold: string;
  ivoryVellum: string;
  deepOnyx: string;
  silverGleam: string;
  vesperPurple: string;
  incenseSmoke: string;
  iconGold: string;
  candlelightAmber: string;
  ashWhite: string;
  liturgicalGreen: string;
  martyrRed: string;
  surface: string;
  surfaceElevated: string;
  surfaceDeep: string;
  hairline: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textGold: string;
  white: string;
};

const light: Palette = {
  paper: "#F5EFE3",
  paper2: "#EEE5D4",
  ink: "#1F1A16",
  ink2: "#574C42",
  rubric: "#9B1C1C",
  onRubric: "#FBF5EA",
  rule: "#D8CAB2",
  rule2: "#C4B293",
  scrim: "rgba(31,26,22,0.45)",
  highlight: "rgba(155,28,28,0.10)",
  byzantineCrimson: "#9B1C1C",
  sacredGold: "#9B1C1C",
  ivoryVellum: "#1F1A16",
  deepOnyx: "#1F1A16",
  silverGleam: "#574C42",
  vesperPurple: "#574C42",
  incenseSmoke: "#574C42",
  iconGold: "#9B1C1C",
  candlelightAmber: "#9B1C1C",
  ashWhite: "#F5EFE3",
  liturgicalGreen: "#3E5344",
  martyrRed: "#9B1C1C",
  surface: "#F5EFE3",
  surfaceElevated: "#EEE5D4",
  surfaceDeep: "#F5EFE3",
  hairline: "#D8CAB2",
  textPrimary: "#1F1A16",
  textSecondary: "#574C42",
  textMuted: "#574C42",
  textGold: "#9B1C1C",
  white: "#FBF5EA",
};

const night: Palette = {
  paper: "#1C1814",
  paper2: "#2A241C",
  ink: "#F3E6D4",
  ink2: "#CDBBA4",
  rubric: "#E08A7E",
  onRubric: "#1C1814",
  rule: "#4A3F34",
  rule2: "#5C4E40",
  scrim: "rgba(0,0,0,0.55)",
  highlight: "rgba(224,138,126,0.18)",
  byzantineCrimson: "#E08A7E",
  sacredGold: "#E08A7E",
  ivoryVellum: "#F3E6D4",
  deepOnyx: "#F3E6D4",
  silverGleam: "#CDBBA4",
  vesperPurple: "#CDBBA4",
  incenseSmoke: "#CDBBA4",
  iconGold: "#E08A7E",
  candlelightAmber: "#E08A7E",
  ashWhite: "#F6EDE0",
  liturgicalGreen: "#CDBBA4",
  martyrRed: "#E08A7E",
  surface: "#1C1814",
  surfaceElevated: "#2A241C",
  surfaceDeep: "#1C1814",
  hairline: "#4A3F34",
  textPrimary: "#F3E6D4",
  textSecondary: "#CDBBA4",
  textMuted: "#CDBBA4",
  textGold: "#E08A7E",
  white: "#F6EDE0",
};

export const palettes = { light, night };
export const colors = light;

export type Appearance = "light" | "night";
