/**
 * E-Ink optimized design system for Boox Palma 2.
 * Uses pure black and white only - no grays for critical UI elements.
 */

export const EINK_COLORS = {
  dark: {
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#000000',
    border: '#CCCCCC',
    error: '#FF0000',
    card: '#FFFFFF',
    cardBorder: '#000000',
    tabActive: '#000000',
    tabInactive: '#999999',
    overlay: 'rgba(255, 255, 255, 0.95)',
    highlight: '#EEEEEE',
  },
  light: {
    background: '#000000',
    text: '#FFFFFF',
    textSecondary: '#999999',
    primary: '#FFFFFF',
    border: '#333333',
    error: '#FF4444',
    card: '#111111',
    cardBorder: '#FFFFFF',
    tabActive: '#FFFFFF',
    tabInactive: '#666666',
    overlay: 'rgba(0, 0, 0, 0.95)',
    highlight: '#222222',
  },
} as const;

export const EINK_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Font families available for e-reader.
 * Bookerly is the default (loaded separately).
 */
export const EINK_FONTS = {
  bookerly: 'serif',
  arial: 'Arial',
  georgia: 'Georgia',
  times: 'Times New Roman',
  courier: 'Courier New',
} as const;

/**
 * Minimum touch target size for e-ink (1/6th of screen width).
 * Palma Palma is ~600px wide, so minimum is ~100px.
 */
export const MIN_TOUCH_TARGET = 48;

/**
 * Create theme-aware styles with a simple helper.
 */
export function createThemeStyles<T extends Record<string, React.CSSProperties>>(
  stylesFn: (colors: typeof EINK_COLORS.dark, spacing: typeof EINK_SPACING) => T
): T {
  return stylesFn(EINK_COLORS.dark, EINK_SPACING);
}