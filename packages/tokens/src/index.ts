// Color tokens
export const colors = {
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  accent: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
} as const;

// Radius tokens
export const radius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

// Easing tokens (GSAP easing strings)
export const easings = {
  swift: 'power2.out',
  smooth: 'power1.inOut',
  bounce: 'back.out(1.7)',
  elastic: 'elastic.out(1, 0.5)',
} as const;

// Duration tokens (in seconds, for GSAP)
export const durations = {
  instant: 0.05,
  fast: 0.15,
  base: 0.3,
  slow: 0.5,
  dramatic: 0.8,
} as const;

export type ColorScale = typeof colors;
export type RadiusScale = typeof radius;
export type Easings = typeof easings;
export type Durations = typeof durations;
