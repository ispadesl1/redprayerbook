export const fonts = {
  display: 'serif',
  serif: 'serif',
  serifBold: 'serif',
  serifMedium: 'serif',
  serifLight: 'serif',
  subhead: 'System',
  body: 'System',
  bodyMedium: 'System',
  bodySemi: 'System',
  bodyBold: 'System',
};

export const type = {
  h1: { fontFamily: fonts.display, fontSize: 44, lineHeight: 52, fontWeight: '700' as const },
  h2: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 34, fontWeight: '700' as const },
  h3: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  serifBody: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  smallCaps: {
    fontFamily: fonts.subhead,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
  },
} as const;
