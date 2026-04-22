/**
 * EPUB-related type definitions for the Boox Reader app.
 */

/** Represents a single chapter or section within an EPUB */
export interface Chapter {
  id: string;
  title: string;
  href: string;
  startIndex?: number;
  /** Nested sub-chapters */
  subitems?: Chapter[];
}

/** NCX (NAV) document structure from EPUB */
export interface NCXDocument {
  title: string;
  navPoints: Chapter[];
}

/** EPUB package document metadata */
export interface EPUBMetadata {
  title: string;
  authors: string[];
  contributors: string[];
  language: string;
  identifier: string;
  publisher: string;
  published: string;
  description: string;
  subjects: string[];
  rights: string;
  baseUri: string;
}

/** EPUB spine item reference */
export interface SpineItem {
  id: string;
  href: string;
  index: number;
}

/** EPUB spine order */
export interface Spine {
  items: SpineItem[];
  /** First item in reading order */
  first: SpineItem | null;
}

/** An EPUB manifest item */
export interface ManifestItem {
  id: string;
  href: string;
  mediaType: string;
  properties?: string[];
}

/** EPUB spine and manifest combined */
export interface EPUBStructure {
  metadata: EPUBMetadata;
  spine: Spine;
  manifest: ManifestItem[];
  navDoc: NCXDocument | null;
  coverHtmlUrl?: string;
  coverImageHref?: string;
  css?: string;
}

/** Rendition override settings for rendering */
export interface RenditionOverride {
  fontSize?: number | string;
  fontFamily?: string;
  lineHeight?: number | string;
  margin?: string;
  textAlign?: string;
  color?: string;
  backgroundColor?: string;
  wordSpacing?: string;
  letterSpacing?: string;
  textTransform?: string;
  hyphens?: string;
  columnCount?: number | string;
}

/** Position in EPUB using CFI (Canonical Fragment Identifier) */
export interface EPUBPosition {
  cfi: string;
  /** Percentage through the book (0-100) */
  percentage: number;
  /** Current chapter/section index */
  chapterIndex: number;
  /** Page number (if available) */
  page?: number;
}

/** EPUB book entry for library */
export interface BookEntry {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  language?: string;
  publisher?: string;
  published?: string;
  subjects?: string[];
  identifier: string;
  coverUrl?: string;
  /** Local file path to the EPUB */
  filePath?: string;
  /** URL to download the EPUB */
  downloadUrl?: string;
  /** Size in bytes */
  size?: number;
  /** Last modified timestamp */
  lastOpened?: number;
  /** Last modified timestamp */
  lastRead?: number;
  /** Whether the book is downloaded locally */
  isDownloaded: boolean;
  /** Number of pages (if available) */
  pageCount?: number;
}

/** Annotation within an EPUB */
export interface Annotation {
  id: string;
  bookId: string;
  /** CFIRange of the highlighted text */
  cfi: string;
  /** Selected text content */
  text?: string;
  /** User's note on the annotation */
  note?: string;
  /** Highlight color/style */
  highlight?: string;
  createdAt: number;
  updatedAt: number;
}