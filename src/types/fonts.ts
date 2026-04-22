/**
 * Font-related type definitions for the Boox Reader app.
 */

/** A loaded font entry */
export interface FontEntry {
  /** Unique font identifier */
  id: string;
  /** Display name of the font */
  name: string;
  /** File path to the font file */
  path: string;
  /** Font file format */
  format: 'ttf' | 'otf';
  /** Font weight */
  weight?: number;
  /** Font style */
  style?: 'normal' | 'italic';
  /** Whether the font was user-installed */
  isUserInstalled: boolean;
  /** Size in bytes */
  size?: number;
  /** When the font was added */
  addedAt: number;
}

/** Font family option for the font picker */
export interface FontFamilyOption {
  /** Internal font family name */
  family: string;
  /** Display name shown in picker */
  label: string;
  /** Whether this is a system/built-in font */
  isSystem: boolean;
  /** Available variations (normal, italic, bold, etc.) */
  variations?: FontVariation[];
}

/** A font variation (weight/style combination) */
export interface FontVariation {
  /** CSS-style variation name */
  variation: string;
  /** File path to the variation font file */
  path: string;
  /** Weight (e.g., 400, 700) */
  weight?: number;
  /** Style (normal or italic) */
  style?: 'normal' | 'italic';
  /** Loaded font source */
  source?: any;
}

/** Font preview text for testing */
export const FONT_PREVIEW_TEXT =
  'The quick brown fox jumps over the lazy dog. ' +
  '0123456789. Abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Default font settings */
export const DEFAULT_FONT = 'Bookerly';
export const DEFAULT_FONT_SIZE = 18;
export const DEFAULT_LINE_HEIGHT = 1.6;

/** Minimum and maximum font size limits */
export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 32;

/** Minimum and maximum line height limits */
export const MIN_LINE_HEIGHT = 1.2;
export const MAX_LINE_HEIGHT = 2.0;