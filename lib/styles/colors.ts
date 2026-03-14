const colors = {
  black: '#000000',
  white: '#ffffff',
  c1: 'oklch(0.162 0 0)',
  c2: 'oklch(0.195 0 0)',
  c3: 'oklch(0.254 0 0)',
  c4: 'oklch(0.302 0 0)',
  c5: 'oklch(0.348 0 0)',
  c6: 'oklch(0.396 0 0)',
  c7: 'oklch(0.459 0 0)',
  c8: 'oklch(0.549 0 0)',
  c9: 'oklch(0.649 0 0)',
  c10: 'oklch(0.72 0 0)',
  c11: 'oklch(0.863 0 0)',
  c12: 'oklch(0.933 0 0)',
} as const

const themeNames = ['light', 'dark'] as const
const colorNames = ['primary', 'secondary', 'contrast'] as const

const themes = {
  light: {
    primary: colors.c12,
    secondary: colors.c1,
    contrast: colors.c8,
  },
  dark: {
    primary: colors.c1,
    secondary: colors.c12,
    contrast: colors.c11,
  },
} as const satisfies Themes

export { colors, themeNames, themes }

// UTIL TYPES
export type Themes = Record<
  (typeof themeNames)[number],
  Record<(typeof colorNames)[number], string>
>
