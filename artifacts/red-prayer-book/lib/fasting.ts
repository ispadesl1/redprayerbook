export type FastStrictness = "strict" | "moderate" | "light" | "weekly" | "free";

export type FastingPeriod = {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  startDate: Date;
  endDate: Date;
  strictness: FastStrictness;
  description: string;
  rules: string[];
  fastFree: boolean;
};

export type DayFastStatus = {
  isFasting: boolean;
  isFastFree: boolean;
  period: FastingPeriod | null;
  isWeeklyFast: boolean; // Wed or Fri outside major periods
  label: string;
  sublabel: string;
  strictness: FastStrictness;
  rules: string[];
};

function dateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  const d = dateOnly(date).getTime();
  return d >= dateOnly(start).getTime() && d <= dateOnly(end).getTime();
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Compute Julian Pascha (Easter) converted to Gregorian, for a given year */
export function getPascha(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31); // 3=March, 4=April
  const day = ((d + e + 114) % 31) + 1;
  // Julian date — add 13 days to convert to Gregorian (valid 1900–2099)
  const julian = new Date(year, month - 1, day);
  julian.setDate(julian.getDate() + 13);
  return julian;
}

export function getFastingPeriods(year: number): FastingPeriod[] {
  const pascha = getPascha(year);
  const nextPascha = getPascha(year + 1);

  // Key dates derived from Pascha
  const cleanMonday = addDays(pascha, -48); // Start of Great Lent
  const lazarusSaturday = addDays(pascha, -8);
  const palmSunday = addDays(pascha, -7);
  const holyMonday = addDays(pascha, -6);
  const brightMonday = addDays(pascha, 1);
  const brightSaturday = addDays(pascha, 6);
  const pentecost = addDays(pascha, 49);
  const allSaintsSunday = addDays(pascha, 56);
  const apostlesFastStart = addDays(allSaintsSunday, 1); // Monday after All Saints
  const apostlesFastEnd = new Date(year, 5, 28); // June 28 (eve of Sts. Peter & Paul)

  // Cheese Week (fast-free, dairy but no meat)
  const cheeseWeekStart = addDays(pascha, -49);
  const cheeseWeekEnd = addDays(pascha, -43);

  // Publican & Pharisee fast-free week
  const publicanFastFreeStart = addDays(pascha, -70); // Mon of that week
  const publicanFastFreeEnd = addDays(pascha, -64);   // Sat

  // Pentecost fast-free week
  const pentecostFastFreeStart = pentecost;
  const pentecostFastFreeEnd = addDays(pentecost, 6);

  // Christmas to Theophany fast-free
  const christmasFastFreeStart = new Date(year, 11, 25);
  const christmasFastFreeEnd = new Date(year + 1, 0, 4);

  const periods: FastingPeriod[] = [
    // ──────────────── FAST-FREE WEEKS ────────────────
    {
      id: "publican_free",
      name: "Publican & Pharisee Week",
      shortName: "Fast-Free Week",
      icon: "hand-peace",
      color: "#276A3D",
      startDate: publicanFastFreeStart,
      endDate: publicanFastFreeEnd,
      strictness: "free",
      fastFree: true,
      description: "A fast-free week of feasting, recalling the parable of humility before God.",
      rules: ["No fasting required", "All foods permitted", "Week of spiritual reflection on humility"],
    },
    {
      id: "cheese_week",
      name: "Cheese-Fare Week",
      shortName: "Maslenitsa",
      icon: "food-variant",
      color: "#C97A24",
      startDate: cheeseWeekStart,
      endDate: cheeseWeekEnd,
      strictness: "light",
      fastFree: false,
      description: "Final week before Great Lent. Meat is forbidden; dairy and eggs are permitted as preparation for the Great Fast.",
      rules: ["No meat", "Fish, dairy, eggs permitted", "Oil and wine permitted", "Preparation for Great Lent"],
    },
    // ──────────────── GREAT LENT ────────────────
    {
      id: "great_lent",
      name: "Great Lent",
      shortName: "Great Fast",
      icon: "cross",
      color: "#8B0E1A",
      startDate: cleanMonday,
      endDate: addDays(lazarusSaturday, -1),
      strictness: "strict",
      fastFree: false,
      description: "The most solemn fast of the Orthodox year — 40 days of repentance, prayer, and fasting in preparation for Pascha.",
      rules: [
        "No meat, poultry, or dairy",
        "No fish (except Annunciation & Palm Sunday)",
        "Oil & wine: weekends only",
        "Dry fast (xerophagy) on Mon, Wed, Fri recommended",
        "Daily church services strongly encouraged",
      ],
    },
    {
      id: "holy_week",
      name: "Holy Week",
      shortName: "Passion Week",
      icon: "cross",
      color: "#4A2C4E",
      startDate: holyMonday,
      endDate: addDays(pascha, -1),
      strictness: "strict",
      fastFree: false,
      description: "The most intense week of the Christian year. We follow Christ through His Passion, death, and anticipate the Resurrection.",
      rules: [
        "Strictest fast of the year",
        "No meat, fish, dairy, oil, or wine",
        "Holy Friday: full fast until the first star (or after Vespers)",
        "Holy Saturday: strict fast until Paschal Liturgy",
        "Attend all liturgical services if possible",
      ],
    },
    // ──────────────── BRIGHT WEEK ────────────────
    {
      id: "bright_week",
      name: "Bright Week",
      shortName: "Paschal Week",
      icon: "star-four-points",
      color: "#D4AF37",
      startDate: brightMonday,
      endDate: brightSaturday,
      strictness: "free",
      fastFree: true,
      description: "Christ is Risen! The week after Pascha is entirely fast-free. We celebrate the Resurrection with great joy.",
      rules: ["No fasting whatsoever", "All foods permitted", "Christ is Risen — truly He is Risen!"],
    },
    // ──────────────── PENTECOST WEEK ────────────────
    {
      id: "pentecost_week",
      name: "Pentecost Week",
      shortName: "Trinity Week",
      icon: "fire",
      color: "#276A3D",
      startDate: pentecostFastFreeStart,
      endDate: pentecostFastFreeEnd,
      strictness: "free",
      fastFree: true,
      description: "Fast-free week following Pentecost, celebrating the descent of the Holy Spirit upon the Apostles.",
      rules: ["No fasting required", "All foods permitted"],
    },
    // ──────────────── APOSTLES' FAST ────────────────
    ...(apostlesFastStart <= apostlesFastEnd
      ? [
          {
            id: "apostles_fast",
            name: "Apostles' Fast",
            shortName: "Apostles' Fast",
            icon: "fish",
            color: "#276A3D",
            startDate: apostlesFastStart,
            endDate: apostlesFastEnd,
            strictness: "moderate" as FastStrictness,
            fastFree: false,
            description: "A fast of varying length preparing for the Feast of Sts. Peter and Paul (June 29). Its duration depends on when Pascha falls each year.",
            rules: [
              "No meat or dairy",
              "Fish permitted most days",
              "Oil & wine: Tuesday, Thursday, Saturday, Sunday",
              "No oil or wine: Monday, Wednesday, Friday",
            ],
          },
        ]
      : []),
    // ──────────────── DORMITION FAST ────────────────
    {
      id: "dormition_fast",
      name: "Dormition Fast",
      shortName: "Theotokos Fast",
      icon: "flower",
      color: "#4A2C4E",
      startDate: new Date(year, 7, 1),  // August 1
      endDate: new Date(year, 7, 14),   // August 14
      strictness: "strict",
      fastFree: false,
      description: "A 14-day fast in honor of the Most Holy Theotokos, ending with Her glorious Dormition (Falling Asleep) on August 15.",
      rules: [
        "No meat, poultry, or dairy",
        "Fish permitted on August 6 (Transfiguration) only",
        "Oil & wine: weekends only",
        "Attend services for the Paraklesis to the Theotokos",
      ],
    },
    // ──────────────── NATIVITY FAST ────────────────
    {
      id: "nativity_fast",
      name: "Nativity Fast",
      shortName: "Advent Fast",
      icon: "star-three-points",
      color: "#C97A24",
      startDate: new Date(year, 10, 15), // November 15
      endDate: new Date(year, 11, 24),   // December 24
      strictness: "light",
      fastFree: false,
      description: "A 40-day fast preparing for the Nativity of our Lord Jesus Christ. Less strict than Great Lent, it intensifies in the final days.",
      rules: [
        "No meat or dairy (Mon, Wed, Fri)",
        "Fish, oil, and wine permitted Tue, Thu, Sat, Sun",
        "No fish Dec 20-24 (Mon, Wed, Fri)",
        "Christmas Eve (Dec 24): strict fast until the first star",
      ],
    },
    // ──────────────── CHRISTMAS FAST-FREE ────────────────
    {
      id: "christmas_free",
      name: "Christmas to Theophany",
      shortName: "Nativity Season",
      icon: "star",
      color: "#D4AF37",
      startDate: new Date(year, 11, 25),
      endDate: new Date(year + 1, 0, 4),
      strictness: "free",
      fastFree: true,
      description: "Fast-free season from the Nativity of Christ through the eve of Theophany. A time of great joy.",
      rules: ["No fasting required", "All foods permitted", "A season of rejoicing in the Incarnation"],
    },
  ];

  return periods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

/** One-day fasting commemorations */
export type SingleFast = {
  id: string;
  name: string;
  month: number; // 0-indexed
  day: number;
  description: string;
};

export const SINGLE_FASTS: SingleFast[] = [
  {
    id: "theophany_eve",
    name: "Eve of Theophany",
    month: 0, // January
    day: 5,
    description: "Strict fast before the Great Blessing of Waters on January 6.",
  },
  {
    id: "beheading_john",
    name: "Beheading of St. John the Baptist",
    month: 7, // August
    day: 29,
    description: "A strict fast in memory of the martyrdom of the Holy Prophet and Forerunner.",
  },
  {
    id: "elevation_cross",
    name: "Elevation of the Holy Cross",
    month: 8, // September
    day: 14,
    description: "A strict fast in veneration of the Life-giving Cross of the Lord.",
  },
];

export function getTodayFastStatus(date: Date = new Date()): DayFastStatus {
  const year = date.getFullYear();
  const periods = getFastingPeriods(year);
  // Also check previous year's periods that might spill over
  const prevPeriods = getFastingPeriods(year - 1);

  const allPeriods = [...prevPeriods, ...periods];

  // Find the active period
  const activePeriod = allPeriods.find((p) => isBetween(date, p.startDate, p.endDate));

  // Check single-day fasts
  const singleFast = SINGLE_FASTS.find(
    (f) => date.getMonth() === f.month && date.getDate() === f.day
  );

  // Weekly fast (Wednesday=3, Friday=5)
  const dow = date.getDay();
  const isWeeklyFastDay = dow === 3 || dow === 5;

  if (activePeriod?.fastFree) {
    return {
      isFasting: false,
      isFastFree: true,
      period: activePeriod,
      isWeeklyFast: false,
      label: activePeriod.shortName,
      sublabel: "No fast today · All foods permitted",
      strictness: "free",
      rules: activePeriod.rules,
    };
  }

  if (activePeriod) {
    const isSunOrSat = dow === 0 || dow === 6;
    const strictness: FastStrictness =
      activePeriod.id === "holy_week"
        ? "strict"
        : activePeriod.id === "great_lent" && !isSunOrSat
        ? "strict"
        : activePeriod.id === "great_lent" && isSunOrSat
        ? "moderate"
        : activePeriod.strictness;

    return {
      isFasting: true,
      isFastFree: false,
      period: activePeriod,
      isWeeklyFast: false,
      label: activePeriod.name,
      sublabel: `Day ${Math.ceil((dateOnly(date).getTime() - dateOnly(activePeriod.startDate).getTime()) / 86400000) + 1} of ${Math.ceil((dateOnly(activePeriod.endDate).getTime() - dateOnly(activePeriod.startDate).getTime()) / 86400000) + 1}`,
      strictness,
      rules: activePeriod.rules,
    };
  }

  if (singleFast) {
    return {
      isFasting: true,
      isFastFree: false,
      period: null,
      isWeeklyFast: false,
      label: singleFast.name,
      sublabel: "Strict fast · No meat, fish, dairy, oil, or wine",
      strictness: "strict",
      rules: ["No meat, fish, dairy, oil, or wine", singleFast.description],
    };
  }

  if (isWeeklyFastDay) {
    const dayName = dow === 3 ? "Wednesday" : "Friday";
    return {
      isFasting: true,
      isFastFree: false,
      period: null,
      isWeeklyFast: true,
      label: `${dayName} Fast`,
      sublabel: "No meat · Fish, dairy, oil permitted",
      strictness: "weekly",
      rules: ["No meat", "Fish, dairy, eggs, oil permitted", "Weekly fast in memory of the Betrayal (Wed) and Crucifixion (Fri)"],
    };
  }

  return {
    isFasting: false,
    isFastFree: false,
    period: null,
    isWeeklyFast: false,
    label: "No Major Fast",
    sublabel: "Regular day · Wednesday & Friday fasts apply",
    strictness: "free",
    rules: ["All foods permitted today", "Fast Wednesday and Friday weekly"],
  };
}

export function getPeriodProgress(
  period: FastingPeriod,
  today: Date = new Date()
): { elapsed: number; total: number; pct: number; daysLeft: number } {
  const start = dateOnly(period.startDate).getTime();
  const end = dateOnly(period.endDate).getTime();
  const now = dateOnly(today).getTime();
  const total = Math.round((end - start) / 86400000) + 1;
  const elapsed = Math.max(0, Math.min(total, Math.round((now - start) / 86400000) + 1));
  const daysLeft = Math.max(0, total - elapsed);
  return { elapsed, total, pct: elapsed / total, daysLeft };
}

export function getStrictnessLabel(s: FastStrictness): string {
  switch (s) {
    case "strict": return "Strict Fast";
    case "moderate": return "Moderate Fast";
    case "light": return "Light Fast";
    case "weekly": return "Weekly Fast";
    case "free": return "Fast-Free";
  }
}

export function getStrictnessColor(s: FastStrictness): string {
  switch (s) {
    case "strict": return "#8B0E1A";
    case "moderate": return "#C97A24";
    case "light": return "#D4AF37";
    case "weekly": return "#276A3D";
    case "free": return "#4A2C4E";
  }
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
