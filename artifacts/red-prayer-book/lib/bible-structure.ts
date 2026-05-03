export type Testament = 'OT' | 'NT';

export type BibleBook = {
  id: string;
  name: string;
  abbr: string;
  chapters: number;
  deuterocanonical?: boolean;
};

export type BibleSection = {
  id: string;
  title: string;
  testament: Testament;
  icon: string;
  books: BibleBook[];
};

export const BIBLE_SECTIONS: BibleSection[] = [
  // ── Old Testament ───────────────────────────────────────────────────────────
  {
    id: 'law',
    title: 'The Law',
    testament: 'OT',
    icon: '✡',
    books: [
      { id: 'genesis',      name: 'Genesis',      abbr: 'Gen',  chapters: 50 },
      { id: 'exodus',       name: 'Exodus',       abbr: 'Ex',   chapters: 40 },
      { id: 'leviticus',    name: 'Leviticus',    abbr: 'Lev',  chapters: 27 },
      { id: 'numbers',      name: 'Numbers',      abbr: 'Num',  chapters: 36 },
      { id: 'deuteronomy',  name: 'Deuteronomy',  abbr: 'Deut', chapters: 34 },
    ],
  },
  {
    id: 'historical',
    title: 'Historical Books',
    testament: 'OT',
    icon: '📜',
    books: [
      { id: 'joshua',        name: 'Joshua',        abbr: 'Josh', chapters: 24 },
      { id: 'judges',        name: 'Judges',        abbr: 'Judg', chapters: 21 },
      { id: 'ruth',          name: 'Ruth',          abbr: 'Ruth', chapters: 4  },
      { id: '1samuel',       name: '1 Samuel',      abbr: '1Sa',  chapters: 31 },
      { id: '2samuel',       name: '2 Samuel',      abbr: '2Sa',  chapters: 24 },
      { id: '1kings',        name: '1 Kings',       abbr: '1Kg',  chapters: 22 },
      { id: '2kings',        name: '2 Kings',       abbr: '2Kg',  chapters: 25 },
      { id: '1chronicles',   name: '1 Chronicles',  abbr: '1Ch',  chapters: 29 },
      { id: '2chronicles',   name: '2 Chronicles',  abbr: '2Ch',  chapters: 36 },
      { id: '1esdras',       name: '1 Esdras',      abbr: '1Esd', chapters: 9,  deuterocanonical: true },
      { id: 'ezra',          name: 'Ezra',          abbr: 'Ezra', chapters: 10 },
      { id: 'nehemiah',      name: 'Nehemiah',      abbr: 'Neh',  chapters: 13 },
      { id: 'tobit',         name: 'Tobit',         abbr: 'Tob',  chapters: 14, deuterocanonical: true },
      { id: 'judith',        name: 'Judith',        abbr: 'Jth',  chapters: 16, deuterocanonical: true },
      { id: 'esther',        name: 'Esther',        abbr: 'Est',  chapters: 16 },
      { id: '1maccabees',    name: '1 Maccabees',   abbr: '1Mac', chapters: 16, deuterocanonical: true },
      { id: '2maccabees',    name: '2 Maccabees',   abbr: '2Mac', chapters: 15, deuterocanonical: true },
      { id: '3maccabees',    name: '3 Maccabees',   abbr: '3Mac', chapters: 7,  deuterocanonical: true },
    ],
  },
  {
    id: 'wisdom',
    title: 'Wisdom Books',
    testament: 'OT',
    icon: '✦',
    books: [
      { id: 'psalms',        name: 'Psalms',                 abbr: 'Ps',   chapters: 151 },
      { id: 'job',           name: 'Job',                    abbr: 'Job',  chapters: 42  },
      { id: 'proverbs',      name: 'Proverbs',               abbr: 'Prov', chapters: 31  },
      { id: 'ecclesiastes',  name: 'Ecclesiastes',           abbr: 'Eccl', chapters: 12  },
      { id: 'songofsolomon', name: 'Song of Solomon',        abbr: 'Song', chapters: 8   },
      { id: 'wisdom',        name: 'Wisdom of Solomon',      abbr: 'Wis',  chapters: 19, deuterocanonical: true },
      { id: 'sirach',        name: 'Sirach (Ecclesiasticus)',abbr: 'Sir',  chapters: 51, deuterocanonical: true },
    ],
  },
  {
    id: 'major-prophets',
    title: 'Major Prophets',
    testament: 'OT',
    icon: '🔥',
    books: [
      { id: 'isaiah',      name: 'Isaiah',      abbr: 'Isa',  chapters: 66 },
      { id: 'jeremiah',    name: 'Jeremiah',    abbr: 'Jer',  chapters: 52 },
      { id: 'lamentations',name: 'Lamentations',abbr: 'Lam',  chapters: 5  },
      { id: 'baruch',      name: 'Baruch',      abbr: 'Bar',  chapters: 5,  deuterocanonical: true },
      { id: 'ezekiel',     name: 'Ezekiel',     abbr: 'Ezek', chapters: 48 },
      { id: 'daniel',      name: 'Daniel',      abbr: 'Dan',  chapters: 14 },
    ],
  },
  {
    id: 'minor-prophets',
    title: 'Minor Prophets',
    testament: 'OT',
    icon: '✟',
    books: [
      { id: 'hosea',     name: 'Hosea',     abbr: 'Hos',  chapters: 14 },
      { id: 'joel',      name: 'Joel',      abbr: 'Joel', chapters: 3  },
      { id: 'amos',      name: 'Amos',      abbr: 'Amos', chapters: 9  },
      { id: 'obadiah',   name: 'Obadiah',   abbr: 'Ob',   chapters: 1  },
      { id: 'jonah',     name: 'Jonah',     abbr: 'Jon',  chapters: 4  },
      { id: 'micah',     name: 'Micah',     abbr: 'Mic',  chapters: 7  },
      { id: 'nahum',     name: 'Nahum',     abbr: 'Nah',  chapters: 3  },
      { id: 'habakkuk',  name: 'Habakkuk',  abbr: 'Hab',  chapters: 3  },
      { id: 'zephaniah', name: 'Zephaniah', abbr: 'Zeph', chapters: 3  },
      { id: 'haggai',    name: 'Haggai',    abbr: 'Hag',  chapters: 2  },
      { id: 'zechariah', name: 'Zechariah', abbr: 'Zech', chapters: 14 },
      { id: 'malachi',   name: 'Malachi',   abbr: 'Mal',  chapters: 4  },
    ],
  },
  // ── New Testament ───────────────────────────────────────────────────────────
  {
    id: 'gospels',
    title: 'The Gospels',
    testament: 'NT',
    icon: '✙',
    books: [
      { id: 'matthew', name: 'Matthew', abbr: 'Matt', chapters: 28 },
      { id: 'mark',    name: 'Mark',    abbr: 'Mark', chapters: 16 },
      { id: 'luke',    name: 'Luke',    abbr: 'Luke', chapters: 24 },
      { id: 'john',    name: 'John',    abbr: 'John', chapters: 21 },
    ],
  },
  {
    id: 'acts',
    title: 'The Acts',
    testament: 'NT',
    icon: '🕊',
    books: [
      { id: 'acts', name: 'Acts of the Apostles', abbr: 'Acts', chapters: 28 },
    ],
  },
  {
    id: 'pauline',
    title: 'Pauline Epistles',
    testament: 'NT',
    icon: '✉',
    books: [
      { id: 'romans',         name: 'Romans',           abbr: 'Rom',  chapters: 16 },
      { id: '1corinthians',   name: '1 Corinthians',    abbr: '1Cor', chapters: 16 },
      { id: '2corinthians',   name: '2 Corinthians',    abbr: '2Cor', chapters: 13 },
      { id: 'galatians',      name: 'Galatians',        abbr: 'Gal',  chapters: 6  },
      { id: 'ephesians',      name: 'Ephesians',        abbr: 'Eph',  chapters: 6  },
      { id: 'philippians',    name: 'Philippians',      abbr: 'Phil', chapters: 4  },
      { id: 'colossians',     name: 'Colossians',       abbr: 'Col',  chapters: 4  },
      { id: '1thessalonians', name: '1 Thessalonians',  abbr: '1Th',  chapters: 5  },
      { id: '2thessalonians', name: '2 Thessalonians',  abbr: '2Th',  chapters: 3  },
      { id: '1timothy',       name: '1 Timothy',        abbr: '1Tim', chapters: 6  },
      { id: '2timothy',       name: '2 Timothy',        abbr: '2Tim', chapters: 4  },
      { id: 'titus',          name: 'Titus',            abbr: 'Tit',  chapters: 3  },
      { id: 'philemon',       name: 'Philemon',         abbr: 'Phm',  chapters: 1  },
    ],
  },
  {
    id: 'general',
    title: 'General Epistles',
    testament: 'NT',
    icon: '✝',
    books: [
      { id: 'hebrews',  name: 'Hebrews',  abbr: 'Heb',  chapters: 13 },
      { id: 'james',    name: 'James',    abbr: 'Jas',  chapters: 5  },
      { id: '1peter',   name: '1 Peter',  abbr: '1Pet', chapters: 5  },
      { id: '2peter',   name: '2 Peter',  abbr: '2Pet', chapters: 3  },
      { id: '1john',    name: '1 John',   abbr: '1Jn',  chapters: 5  },
      { id: '2john',    name: '2 John',   abbr: '2Jn',  chapters: 1  },
      { id: '3john',    name: '3 John',   abbr: '3Jn',  chapters: 1  },
      { id: 'jude',     name: 'Jude',     abbr: 'Jude', chapters: 1  },
    ],
  },
  {
    id: 'revelation',
    title: 'Revelation',
    testament: 'NT',
    icon: '☩',
    books: [
      { id: 'revelation', name: 'Revelation', abbr: 'Rev', chapters: 22 },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAllBooks(): BibleBook[] {
  return BIBLE_SECTIONS.flatMap((s) => s.books);
}

export function getBookById(id: string): BibleBook | undefined {
  return getAllBooks().find((b) => b.id === id);
}

export function getSectionForBook(bookId: string): BibleSection | undefined {
  return BIBLE_SECTIONS.find((s) => s.books.some((b) => b.id === bookId));
}

export function formatReference(bookId: string, chapter: number): string {
  const book = getBookById(bookId);
  return book ? `${book.name} ${chapter}` : `${bookId} ${chapter}`;
}
