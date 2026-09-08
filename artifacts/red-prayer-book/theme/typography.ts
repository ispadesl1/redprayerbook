export const fonts = {
  display: 'Cardo-Bold',
  serif: 'Cardo-Regular',
  serifBold: 'Cardo-Bold',
  serifMedium: 'Cardo-Regular',
  serifLight: 'Cardo-Regular',
  serifItalic: 'Cardo-Italic',
  subhead: 'Inter_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const type = {
  h1: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 52,
  },
  h2: {
    fontFamily: fonts.serifBold,
    fontSize: 26,
    lineHeight: 34,
  },
  h3: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    lineHeight: 26,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 22,
    lineHeight: 28,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  serifBody: {
    fontFamily: fonts.serif,
    fontSize: 16,
    lineHeight: 24,
  },
  serifItalic: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  tabLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
  smallCaps: {
    fontFamily: fonts.subhead,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
} as const;
