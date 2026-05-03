export type Testament = 'OT' | 'NT';

export type BibleSection =
  | 'The Law'
  | 'Historical Books'
  | 'Wisdom & Poetry'
  | 'Major Prophets'
  | 'Minor Prophets'
  | 'Gospels'
  | 'Acts'
  | 'Pauline Epistles'
  | 'General Epistles'
  | 'Revelation';

export type BibleBook = {
  id: string;
  name: string;
  abbr: string;
  chapters: number;
  section: BibleSection;
  testament: Testament;
  deuterocanonical?: boolean;
};

export const BIBLE_BOOKS: BibleBook[] = [
  // ── The Law ──────────────────────────────────────────────────────────────
  { id: 'genesis',       name: 'Genesis',              abbr: 'Gen',   chapters: 50, section: 'The Law',         testament: 'OT' },
  { id: 'exodus',        name: 'Exodus',               abbr: 'Ex',    chapters: 40, section: 'The Law',         testament: 'OT' },
  { id: 'leviticus',     name: 'Leviticus',            abbr: 'Lev',   chapters: 27, section: 'The Law',         testament: 'OT' },
  { id: 'numbers',       name: 'Numbers',              abbr: 'Num',   chapters: 36, section: 'The Law',         testament: 'OT' },
  { id: 'deuteronomy',   name: 'Deuteronomy',          abbr: 'Dt',    chapters: 34, section: 'The Law',         testament: 'OT' },

  // ── Historical Books ─────────────────────────────────────────────────────
  { id: 'joshua',        name: 'Joshua',               abbr: 'Jos',   chapters: 24, section: 'Historical Books', testament: 'OT' },
  { id: 'judges',        name: 'Judges',               abbr: 'Jg',    chapters: 21, section: 'Historical Books', testament: 'OT' },
  { id: 'ruth',          name: 'Ruth',                 abbr: 'Ru',    chapters:  4, section: 'Historical Books', testament: 'OT' },
  { id: '1samuel',       name: '1 Samuel',             abbr: '1Sa',   chapters: 31, section: 'Historical Books', testament: 'OT' },
  { id: '2samuel',       name: '2 Samuel',             abbr: '2Sa',   chapters: 24, section: 'Historical Books', testament: 'OT' },
  { id: '1kings',        name: '1 Kings',              abbr: '1Ki',   chapters: 22, section: 'Historical Books', testament: 'OT' },
  { id: '2kings',        name: '2 Kings',              abbr: '2Ki',   chapters: 25, section: 'Historical Books', testament: 'OT' },
  { id: '1chronicles',   name: '1 Chronicles',         abbr: '1Ch',   chapters: 29, section: 'Historical Books', testament: 'OT' },
  { id: '2chronicles',   name: '2 Chronicles',         abbr: '2Ch',   chapters: 36, section: 'Historical Books', testament: 'OT' },
  { id: 'ezra',          name: 'Ezra',                 abbr: 'Ezr',   chapters: 10, section: 'Historical Books', testament: 'OT' },
  { id: 'nehemiah',      name: 'Nehemiah',             abbr: 'Ne',    chapters: 13, section: 'Historical Books', testament: 'OT' },
  { id: 'tobit',         name: 'Tobit',                abbr: 'Tob',   chapters: 14, section: 'Historical Books', testament: 'OT', deuterocanonical: true },
  { id: 'judith',        name: 'Judith',               abbr: 'Jdt',   chapters: 16, section: 'Historical Books', testament: 'OT', deuterocanonical: true },
  { id: 'esther',        name: 'Esther',               abbr: 'Est',   chapters: 16, section: 'Historical Books', testament: 'OT' },
  { id: '1maccabees',    name: '1 Maccabees',          abbr: '1Ma',   chapters: 16, section: 'Historical Books', testament: 'OT', deuterocanonical: true },
  { id: '2maccabees',    name: '2 Maccabees',          abbr: '2Ma',   chapters: 15, section: 'Historical Books', testament: 'OT', deuterocanonical: true },
  { id: '3maccabees',    name: '3 Maccabees',          abbr: '3Ma',   chapters:  7, section: 'Historical Books', testament: 'OT', deuterocanonical: true },

  // ── Wisdom & Poetry ──────────────────────────────────────────────────────
  { id: 'psalms',        name: 'Psalms',               abbr: 'Ps',    chapters: 151, section: 'Wisdom & Poetry', testament: 'OT' },
  { id: 'job',           name: 'Job',                  abbr: 'Job',   chapters: 42,  section: 'Wisdom & Poetry', testament: 'OT' },
  { id: 'proverbs',      name: 'Proverbs',             abbr: 'Pr',    chapters: 31,  section: 'Wisdom & Poetry', testament: 'OT' },
  { id: 'ecclesiastes',  name: 'Ecclesiastes',         abbr: 'Ec',    chapters: 12,  section: 'Wisdom & Poetry', testament: 'OT' },
  { id: 'songofsolomon', name: 'Song of Solomon',      abbr: 'SS',    chapters:  8,  section: 'Wisdom & Poetry', testament: 'OT' },
  { id: 'wisdom',        name: 'Wisdom of Solomon',    abbr: 'Wis',   chapters: 19,  section: 'Wisdom & Poetry', testament: 'OT', deuterocanonical: true },
  { id: 'sirach',        name: 'Sirach',               abbr: 'Sir',   chapters: 51,  section: 'Wisdom & Poetry', testament: 'OT', deuterocanonical: true },

  // ── Major Prophets ───────────────────────────────────────────────────────
  { id: 'isaiah',        name: 'Isaiah',               abbr: 'Is',    chapters: 66, section: 'Major Prophets', testament: 'OT' },
  { id: 'jeremiah',      name: 'Jeremiah',             abbr: 'Jr',    chapters: 52, section: 'Major Prophets', testament: 'OT' },
  { id: 'lamentations',  name: 'Lamentations',         abbr: 'Lm',    chapters:  5, section: 'Major Prophets', testament: 'OT' },
  { id: 'baruch',        name: 'Baruch',               abbr: 'Bar',   chapters:  5, section: 'Major Prophets', testament: 'OT', deuterocanonical: true },
  { id: 'ezekiel',       name: 'Ezekiel',              abbr: 'Ezk',   chapters: 48, section: 'Major Prophets', testament: 'OT' },
  { id: 'daniel',        name: 'Daniel',               abbr: 'Dn',    chapters: 14, section: 'Major Prophets', testament: 'OT' },

  // ── Minor Prophets (LXX order) ───────────────────────────────────────────
  { id: 'hosea',         name: 'Hosea',                abbr: 'Ho',    chapters: 14, section: 'Minor Prophets', testament: 'OT' },
  { id: 'joel',          name: 'Joel',                 abbr: 'Jl',    chapters:  3, section: 'Minor Prophets', testament: 'OT' },
  { id: 'amos',          name: 'Amos',                 abbr: 'Am',    chapters:  9, section: 'Minor Prophets', testament: 'OT' },
  { id: 'obadiah',       name: 'Obadiah',              abbr: 'Ob',    chapters:  1, section: 'Minor Prophets', testament: 'OT' },
  { id: 'jonah',         name: 'Jonah',                abbr: 'Jon',   chapters:  4, section: 'Minor Prophets', testament: 'OT' },
  { id: 'micah',         name: 'Micah',                abbr: 'Mi',    chapters:  7, section: 'Minor Prophets', testament: 'OT' },
  { id: 'nahum',         name: 'Nahum',                abbr: 'Na',    chapters:  3, section: 'Minor Prophets', testament: 'OT' },
  { id: 'habakkuk',      name: 'Habakkuk',             abbr: 'Hab',   chapters:  3, section: 'Minor Prophets', testament: 'OT' },
  { id: 'zephaniah',     name: 'Zephaniah',            abbr: 'Zep',   chapters:  3, section: 'Minor Prophets', testament: 'OT' },
  { id: 'haggai',        name: 'Haggai',               abbr: 'Hag',   chapters:  2, section: 'Minor Prophets', testament: 'OT' },
  { id: 'zechariah',     name: 'Zechariah',            abbr: 'Zec',   chapters: 14, section: 'Minor Prophets', testament: 'OT' },
  { id: 'malachi',       name: 'Malachi',              abbr: 'Mal',   chapters:  4, section: 'Minor Prophets', testament: 'OT' },

  // ── Gospels ──────────────────────────────────────────────────────────────
  { id: 'matthew',       name: 'Matthew',              abbr: 'Mt',    chapters: 28, section: 'Gospels',          testament: 'NT' },
  { id: 'mark',          name: 'Mark',                 abbr: 'Mk',    chapters: 16, section: 'Gospels',          testament: 'NT' },
  { id: 'luke',          name: 'Luke',                 abbr: 'Lk',    chapters: 24, section: 'Gospels',          testament: 'NT' },
  { id: 'john',          name: 'John',                 abbr: 'Jn',    chapters: 21, section: 'Gospels',          testament: 'NT' },

  // ── Acts ─────────────────────────────────────────────────────────────────
  { id: 'acts',          name: 'Acts',                 abbr: 'Ac',    chapters: 28, section: 'Acts',             testament: 'NT' },

  // ── Pauline Epistles ─────────────────────────────────────────────────────
  { id: 'romans',        name: 'Romans',               abbr: 'Ro',    chapters: 16, section: 'Pauline Epistles', testament: 'NT' },
  { id: '1corinthians',  name: '1 Corinthians',        abbr: '1Co',   chapters: 16, section: 'Pauline Epistles', testament: 'NT' },
  { id: '2corinthians',  name: '2 Corinthians',        abbr: '2Co',   chapters: 13, section: 'Pauline Epistles', testament: 'NT' },
  { id: 'galatians',     name: 'Galatians',            abbr: 'Ga',    chapters:  6, section: 'Pauline Epistles', testament: 'NT' },
  { id: 'ephesians',     name: 'Ephesians',            abbr: 'Ep',    chapters:  6, section: 'Pauline Epistles', testament: 'NT' },
  { id: 'philippians',   name: 'Philippians',          abbr: 'Php',   chapters:  4, section: 'Pauline Epistles', testament: 'NT' },
  { id: 'colossians',    name: 'Colossians',           abbr: 'Col',   chapters:  4, section: 'Pauline Epistles', testament: 'NT' },
  { id: '1thessalonians',name: '1 Thessalonians',      abbr: '1Th',   chapters:  5, section: 'Pauline Epistles', testament: 'NT' },
  { id: '2thessalonians',name: '2 Thessalonians',      abbr: '2Th',   chapters:  3, section: 'Pauline Epistles', testament: 'NT' },
  { id: '1timothy',      name: '1 Timothy',            abbr: '1Ti',   chapters:  6, section: 'Pauline Epistles', testament: 'NT' },
  { id: '2timothy',      name: '2 Timothy',            abbr: '2Ti',   chapters:  4, section: 'Pauline Epistles', testament: 'NT' },
  { id: 'titus',         name: 'Titus',                abbr: 'Ti',    chapters:  3, section: 'Pauline Epistles', testament: 'NT' },
  { id: 'philemon',      name: 'Philemon',             abbr: 'Phm',   chapters:  1, section: 'Pauline Epistles', testament: 'NT' },
  { id: 'hebrews',       name: 'Hebrews',              abbr: 'Heb',   chapters: 13, section: 'Pauline Epistles', testament: 'NT' },

  // ── General Epistles ─────────────────────────────────────────────────────
  { id: 'james',         name: 'James',                abbr: 'Jm',    chapters:  5, section: 'General Epistles', testament: 'NT' },
  { id: '1peter',        name: '1 Peter',              abbr: '1Pt',   chapters:  5, section: 'General Epistles', testament: 'NT' },
  { id: '2peter',        name: '2 Peter',              abbr: '2Pt',   chapters:  3, section: 'General Epistles', testament: 'NT' },
  { id: '1john',         name: '1 John',               abbr: '1Jn',   chapters:  5, section: 'General Epistles', testament: 'NT' },
  { id: '2john',         name: '2 John',               abbr: '2Jn',   chapters:  1, section: 'General Epistles', testament: 'NT' },
  { id: '3john',         name: '3 John',               abbr: '3Jn',   chapters:  1, section: 'General Epistles', testament: 'NT' },
  { id: 'jude',          name: 'Jude',                 abbr: 'Jud',   chapters:  1, section: 'General Epistles', testament: 'NT' },

  // ── Revelation ───────────────────────────────────────────────────────────
  { id: 'revelation',    name: 'Revelation',           abbr: 'Rev',   chapters: 22, section: 'Revelation',       testament: 'NT' },
];

export const OT_SECTIONS: BibleSection[] = [
  'The Law',
  'Historical Books',
  'Wisdom & Poetry',
  'Major Prophets',
  'Minor Prophets',
];

export const NT_SECTIONS: BibleSection[] = [
  'Gospels',
  'Acts',
  'Pauline Epistles',
  'General Epistles',
  'Revelation',
];

export function getBookById(id: string): BibleBook | undefined {
  return BIBLE_BOOKS.find((b) => b.id === id);
}

export function getBooksForTestament(testament: Testament): BibleBook[] {
  return BIBLE_BOOKS.filter((b) => b.testament === testament);
}

export function getSectionsForTestament(testament: Testament): BibleSection[] {
  return testament === 'OT' ? OT_SECTIONS : NT_SECTIONS;
}
