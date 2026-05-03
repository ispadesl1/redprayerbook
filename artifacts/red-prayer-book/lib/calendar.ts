export type CalendarEntry = {
  title: string;
  saints?: string[];
  epistle?: { ref: string; text?: string };
  gospel?: { ref: string; text?: string };
  fast?: 'none' | 'wineOil' | 'fish' | 'strict';
  tone?: number;
};

function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const SAMPLE_DATA: Record<string, CalendarEntry> = {
  [ymd(new Date())]: {
    title: 'Feast of the Holy Cross',
    saints: ['Holy Cross', 'Exaltation of the Precious and Life-Giving Cross'],
    epistle: { ref: '1 Cor 1:18-24', text: 'For the word of the cross is folly to those who are perishing, but to us who are being saved it is the power of God.' },
    gospel: { ref: 'John 19:6-11', text: 'When the chief priests and the officers saw him, they cried out, Crucify him, crucify him.' },
    fast: 'strict',
    tone: 3,
  },
};

function buildSampleYear(): Record<string, CalendarEntry> {
  const data: Record<string, CalendarEntry> = { ...SAMPLE_DATA };
  const saints = [
    'Holy Prophet', 'Great Martyr', 'Blessed Confessor', 'Holy Apostle',
    'Venerable Martyr', 'Holy Hieromartyr', 'Righteous Father', 'Holy Virgin Martyr',
  ];
  const fasts: CalendarEntry['fast'][] = ['none', 'fish', 'wineOil', 'strict', undefined];
  const gospels = ['Matt 5:1-12', 'Luke 6:17-23', 'John 1:1-18', 'Mark 1:1-20', 'Matt 25:31-46'];
  const epistles = ['Rom 8:28-39', 'Gal 5:22-26', 'Phil 4:4-9', '1 Cor 13:1-13', 'Heb 11:1-16'];
  const year = new Date().getFullYear();
  for (let m = 0; m < 12; m++) {
    for (let d = 1; d <= 31; d++) {
      const date = new Date(year, m, d);
      if (date.getMonth() !== m) break;
      const key = ymd(date);
      if (!data[key]) {
        const i = (m * 31 + d) % saints.length;
        data[key] = {
          title: `${saints[i]} of the Church`,
          saints: [`${saints[i]} of ${year}`],
          gospel: { ref: gospels[i % gospels.length] },
          epistle: { ref: epistles[i % epistles.length] },
          fast: fasts[d % fasts.length],
          tone: (d % 8) + 1,
        };
      }
    }
  }
  return data;
}

const CALENDAR_DATA = buildSampleYear();

export function getCalendarEntry(date: Date): CalendarEntry | null {
  return CALENDAR_DATA[ymd(date)] ?? null;
}

export function julianShift(date: Date, style: 'new' | 'old'): Date {
  if (style === 'new') return date;
  const d = new Date(date);
  d.setDate(d.getDate() - 13);
  return d;
}
