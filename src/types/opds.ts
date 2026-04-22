// ==================== Core OPDS Types ====================

export interface OPDSLink {
  href: string;
  type?: string;
  rel?: string;
  title?: string;
  active?: boolean;
}

export interface OPDSFeedEntry {
  id: string;
  title: string;
  updated?: string;
  summary?: string;
  links: OPDSLink[];
  authors?: { name: string; id?: string }[];
  publisher?: string;
  language?: string;
  subject?: string[];
}

export interface OPDSFeed {
  title: string;
  entries: OPDSFeedEntry[];
  links: OPDSLink[];
  subtitle?: string;
  id?: string;
}

export interface OPDSFeedResponse {
  feed: OPDSFeed;
}

// ==================== Publication Types ====================

export interface OPDSPublication {
  id: string;
  title: string;
  authors?: OPDSFeedEntry['authors'];
  summary?: string;
  description?: string;
  coverUrl?: string;
  coverImage?: string | null;
  links: OPDSLink[];
  metadata: {
    publisher?: string;
    language?: string;
    publishedDate?: string;
    published?: string;
    subjects?: string[];
    filesize?: number;
    mediaType?: string;
  };
  // Raw XML entry for OPDS client access
  entry?: OPDSEntry;
}

export interface OPDSAcquisition {
  href: string;
  type: string;
  title?: string;
}

export interface OPDSSection {
  title: string;
  publications: OPDSFeedEntry[];
  links: OPDSLink[];
  subsections?: OPDSSection[];
}

// ==================== OPDS Navigation & Search Types ====================

/** A navigation entry in an OPDS navigation feed */
export interface OPDSNavigationEntry {
  id: string;
  title: string;
  type: 'navigation';
  links: OPDSLink[];
  publications?: OPDSPublication[];
  description?: string;
}

/** An OPDS navigation feed (Feed::navigation) */
export interface OPDSNavigationFeed {
  title: string;
  entries: OPDSNavigationEntry[];
  totalCount: number;
  startIndex: number;
  itemsPerPage: number;
}

/** A full OPDS acquisition feed (Feed::acquisition) with publications */
export interface OPDSAcquisitionFeed {
  title: string;
  publications: OPDSPublication[];
  totalCount: number;
  startIndex: number;
  itemsPerPage: number;
}

/** A search result from OPDS catalog */
export interface SearchResult {
  query: string;
  publications: OPDSPublication[];
  totalCount: number;
  startIndex: number;
  itemsPerPage: number;
}

// ==================== OPDS XML Parsing Types ====================

/** Raw OPDS entry parsed from Atom XML */
export interface OPDSEntry {
  id: string;
  title: string;
  authors?: string[];
  publisher?: string;
  published?: string;
  updated?: string;
  language?: string;
  subjects?: string[];
  summary?: string;
  content?: string;
  type?: string;
  links: OPDSLink[];
}

// ==================== Catalog/Feed Types ====================

/** A catalog feed from Grimoory/Booklore */
export interface CatalogFeed {
  id: string;
  title: string;
  feedUrl: string;
  enabled: boolean;
  lastSync?: number;
}

/** Library book entry from Grimoory */
export interface LibraryBook {
  id: string;
  title: string;
  authors?: string[];
  coverUrl?: string;
  downloadUrl?: string;
  fileSize?: number;
  mediaType?: string;
  addedAt?: number;
  readProgress?: number;
}