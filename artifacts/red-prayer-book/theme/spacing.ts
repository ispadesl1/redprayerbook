export const spacing = {
  xxs: 4,
  xs: 8,
  s: 12,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radii = {
  s: 2,
  m: 2,
  l: 2,
  xl: 2,
  pill: 2,
};

export const shadows = {
  card: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

export const layout = {
  wide: 1100,
  margin: 1320,
  column: 640,
  side: 260,
  marginalia: 280,
};

// Press and motion tokens from the mobile-ui-polish branch (PR #2), kept for
// the PressableScale / FadeIn / IconButton primitives it added.
export const hitTarget = 44;

export const motion = {
  pressInMs: 120,
  pressOutMs: 140,
  enterMs: 280,
  staggerMs: 45,
  scalePress: 0.97,
};
