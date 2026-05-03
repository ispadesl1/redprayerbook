export const colors = {
  byzantineCrimson: '#8B0E1A',
  sacredGold: '#D4AF37',
  ivoryVellum: '#F5EBDD',
  deepOnyx: '#0E0E10',
  silverGleam: '#C0C6C6',
  vesperPurple: '#4A2C4E',
  incenseSmoke: '#6A6453',
  iconGold: '#C97A24',
  candlelightAmber: '#E39C3D',
  ashWhite: '#F2F2F2',
  liturgicalGreen: '#276A3D',
  martyrRed: '#B22222',
  surface: '#1A0507',
  surfaceElevated: '#2A0A0E',
  surfaceDeep: '#0E0E10',
  hairline: 'rgba(212,175,55,0.35)',
  textPrimary: '#F5EBDD',
  textSecondary: 'rgba(245,235,221,0.72)',
  textMuted: 'rgba(245,235,221,0.5)',
  textGold: '#D4AF37',
};

export const gradients = {
  crimsonOnyx: ['#8B0E1A', '#0E0E10'] as const,
  goldIvory: ['#D4AF37', '#F5EBDD'] as const,
  purpleOnyx: ['#4A2C4E', '#0E0E10'] as const,
};

export type ColorToken = keyof typeof colors;
