/**
 * Font loading utility for the e-reader.
 * Handles loading custom TTF/OTF fonts and built-in fonts.
 */
import * as Font from 'expo-font';
import { FontSource } from 'expo-font';

/**
 * Built-in font faces bundled with the app.
 * Bookerly is the default serif font.
 */
const BUILTIN_FONTS: Record<string, FontSource> = {
  bookerly: require('../assets/fonts/Bookerly.ttf'),
  serif: require('../assets/fonts/serif.ttf'),
  sans: require('../assets/fonts/sans-serif.ttf'),
  monospace: require('../assets/fonts/monospace.ttf'),
};

/**
 * Supported font file extensions for user-installed fonts.
 */
export const SUPPORTED_FONT_EXTENSIONS = ['.ttf', '.otf', '.woff'] as const;

/**
 * Loads all built-in fonts into Expo Font.
 * @returns Promise resolving to a map of font family names to their sources
 */
export async function loadBuiltinFonts(): Promise<Record<string, FontSource>> {
  await Font.loadAsync(BUILTIN_FONTS);
  return { ...BUILTIN_FONTS };
}

/**
 * Loads user-installed fonts from file URIs.
 * Scans the given URIs and loads any valid font files.
 *
 * @param fontUris - Array of file URIs pointing to TTF/OTF font files
 * @returns Map of loaded font family names to their sources
 */
export async function loadUserFonts(
  fontUris: string[]
): Promise<Record<string, FontSource>> {
  const fontMap: Record<string, FontSource> = {};

  for (const uri of fontUris) {
    try {
      // Extract font family name from filename
      const fileName = uri.split('/').pop() ?? '';
      const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

      if (!SUPPORTED_FONT_EXTENSIONS.includes(ext as any)) {
        console.warn(`Unsupported font extension: ${ext}`);
        continue;
      }

      // Derive family name from filename (remove extension)
      const familyName = fileName.slice(0, fileName.lastIndexOf('.'));

      // Validate it looks like a font family name
      if (!familyName || familyName.length < 2) {
        console.warn(`Invalid font family name from: ${uri}`);
        continue;
      }

      fontMap[familyName] = { uri };
    } catch (err) {
      console.warn(`Failed to parse font URI ${uri}:`, err);
    }
  }

  if (Object.keys(fontMap).length > 0) {
    await Font.loadAsync(fontMap);
  }

  return fontMap;
}

/**
 * Loads all fonts (builtin + user fonts) at once.
 *
 * @param userFontUris - Optional array of user font file URIs
 * @returns Complete map of all loaded font families
 */
export async function loadAllFonts(
  userFontUris?: string[]
): Promise<Record<string, FontSource>> {
  const allFonts: Record<string, FontSource> = {};

  // Load built-in fonts
  const builtin = await loadBuiltinFonts();
  Object.entries(builtin).forEach(([k, v]) => { allFonts[k] = v; });

  // Load user fonts
  if (userFontUris?.length) {
    const user = await loadUserFonts(userFontUris);
    Object.entries(user).forEach(([k, v]) => { allFonts[k] = v; });
  }

  return allFonts;
}

/**
 * Checks if a font family is currently loaded.
 *
 * @param family - The font family name to check
 * @returns true if the font is loaded
 */
export function isFontLoaded(family: string): boolean {
  return Font.isLoaded(family);
}

/**
 * Gets all currently loaded font families.
 * @returns Array of loaded font family names
 */
export function getLoadedFontFamilies(): string[] {
  return Font.getLoadedFonts();
}