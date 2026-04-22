import axios from 'axios';
import type {
  OPDSNavigationFeed,
  OPDSPublication,
  OPDSEntry,
  SearchResult,
  OPDSLink,
  OPDSNavigationEntry,
} from '@src/types/opds';

/**
 * Normalize a link object to ensure required 'type' field.
 */
export function normalizeLink(link: { href: string; rel?: string; type?: string; title?: string }): OPDSLink {
  return {
    href: link.href,
    type: link.type || '',
    rel: link.rel,
    title: link.title,
  };
}

/**
 * Parse a publication from a raw OPDS entry.
 */
function parsePublicationFromEntry(entry: OPDSEntry): OPDSPublication {
  const typedAuthors: { name: string; id?: string }[] | undefined = entry.authors
    ? entry.authors.map(a => ({ name: a }))
    : undefined;

  return {
    id: entry.id || '',
    title: entry.title || 'Untitled',
    authors: typedAuthors,
    summary: entry.summary || '',
    description: entry.summary || entry.content || '',
    links: (entry.links || []).map(normalizeLink),
    coverImage: extractCoverFromEntry(entry),
    entry,
    metadata: {
      publisher: entry.publisher || undefined,
      language: entry.language || undefined,
      published: entry.published || entry.updated || undefined,
      subjects: entry.subjects || undefined,
    },
  };
}

/**
 * Extract cover image URL from an entry.
 */
function extractCoverFromEntry(entry: OPDSEntry): string | null {
  const thumbnail = entry.links?.find(
    link => link.rel === 'thumbnail' || (link.type && link.type.includes('image'))
  );
  return thumbnail?.href || null;
}

/**
 * OPDS 1.x client for Grimoory (Booklore) server integration.
 * Implements the OPDS specification for catalog browsing.
 */
class OPDSClient {
  private baseUrl: string;
  private axiosInstance;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: {
        'Accept': 'application/atom+xml;type=extension;profile=opds-catalog;q=0.9',
      },
    });
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
    this.axiosInstance.defaults.baseURL = this.baseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Fetch the root feed (Acquisition Feed).
   */
  async getRootFeed(): Promise<OPDSNavigationFeed> {
    const response = await this.axiosInstance.get('/', {
      headers: { 'Accept': 'application/atom+xml' },
    });
    return this.parseNavigationFeed(response.data);
  }

  /**
   * Fetch a feed by path.
   */
  async getFeed(path: string): Promise<{ entries?: OPDSNavigationEntry[]; publications?: OPDSPublication[] }> {
    const response = await this.axiosInstance.get(path, {
      headers: { 'Accept': 'application/atom+xml' },
    });

    // Try navigation feed first, fall back to acquisition feed
    try {
      const nav = this.parseNavigationFeed(response.data);
      return { entries: nav.entries };
    } catch {
      const pubs = this.parsePublications(response.data);
      return { publications: pubs };
    }
  }

  /**
   * Fetch a specific publication by ID.
   */
  async getPublication(bookId: string): Promise<OPDSPublication> {
    const response = await this.axiosInstance.get(`/books/${bookId}`, {
      headers: { 'Accept': 'application/atom+xml' },
    });
    return this.parsePublication(response.data);
  }

  /**
   * Search the OPDS catalog.
   */
  async search(query: string, start: number = 0, batchSize: number = 20): Promise<SearchResult> {
    const response = await this.axiosInstance.get('/search', {
      params: { q: query, start, limit: batchSize },
      headers: { 'Accept': 'application/atom+xml' },
    });
    const publications = this.parsePublications(response.data);
    return {
      query,
      publications,
      totalCount: publications.length,
      startIndex: start,
      itemsPerPage: batchSize,
    };
  }

  /**
   * Fetch the download link for a publication.
   */
  async getDownloadLink(publication: OPDSPublication): Promise<string | null> {
    const links = [...(publication.entry?.links || []), ...(publication.links || [])];

    const pdfLink = links.find(
      link => link.rel === 'http://opds-spec.org/download' || (link.type && link.type.includes('pdf'))
    );
    if (pdfLink) return pdfLink.href;

    const selfLink = links.find(link => link.rel === 'self' || link.rel === 'alternate');
    if (selfLink) return selfLink.href;

    return null;
  }

  /**
   * Fetch the cover image for a publication if available.
   */
  getCoverImage(publication: OPDSPublication): string | null {
    const links = [...(publication.entry?.links || []), ...(publication.links || [])];
    const coverLink = links.find(link => link.rel === 'thumbnail' || (link.type && link.type.includes('image')));
    if (coverLink) {
      if (coverLink.href.startsWith('http')) return coverLink.href;
      return `${this.baseUrl}${coverLink.href.startsWith('/') ? '' : '/'}${coverLink.href}`;
    }
    return null;
  }

  // ==================== Parsing Methods ====================

  private parseNavigationFeed(xmlString: string): OPDSNavigationFeed {
    const title = this.extractTag(xmlString, 'title');
    const entries = this.extractEntries(xmlString);

    const navigationEntries: OPDSNavigationEntry[] = entries.map(entry => ({
      id: entry.id || `nav-${entry.title}`,
      title: entry.title,
      type: 'navigation',
      links: (entry.links || []).map(normalizeLink),
      publications: [],
      description: entry.summary || '',
    }));

    return {
      title: title || 'OPDS Catalog',
      entries: navigationEntries,
      totalCount: navigationEntries.length,
      startIndex: 0,
      itemsPerPage: navigationEntries.length,
    };
  }

  /**
   * Parse publications from an OPDS acquisition feed XML string.
   */
  private parsePublications(xmlString: string): OPDSPublication[] {
    const entries = this.extractEntries(xmlString);
    return entries
      .filter(entry => {
        const t = entry.type || '';
        return t.includes('epub') || t.includes('pdf');
      })
      .map(parsePublicationFromEntry);
  }

  private parsePublication(xmlString: string): OPDSPublication {
    const entry: OPDSEntry = {
      id: this.extractTag(xmlString, 'id'),
      title: this.extractTag(xmlString, 'title'),
      authors: this.extractAuthors(xmlString),
      publisher: this.extractTag(xmlString, 'publisher') || undefined,
      published: this.extractTag(xmlString, 'published') || undefined,
      updated: this.extractTag(xmlString, 'updated') || undefined,
      language: this.extractTag(xmlString, 'language') || undefined,
      subjects: this.extractSubjects(xmlString),
      summary: this.extractTag(xmlString, 'summary') || this.extractTag(xmlString, 'content') || undefined,
      content: this.extractTag(xmlString, 'content') || undefined,
      links: this.extractLinksFromXml(xmlString),
    };
    return parsePublicationFromEntry(entry);
  }

  // ==================== XML Parsing Helpers ====================

  private extractTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractEntries(xml: string): OPDSEntry[] {
    const entries: OPDSEntry[] = [];
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    let entryMatch;

    while ((entryMatch = entryRegex.exec(xml)) !== null) {
      const entryXml = entryMatch[1];
      entries.push({
        id: this.extractTag(entryXml, 'id'),
        title: this.extractTag(entryXml, 'title'),
        authors: this.extractAuthors(entryXml),
        publisher: this.extractTag(entryXml, 'publisher') || undefined,
        published: this.extractTag(entryXml, 'published') || undefined,
        updated: this.extractTag(entryXml, 'updated') || undefined,
        language: this.extractTag(entryXml, 'language') || undefined,
        subjects: this.extractSubjects(entryXml),
        summary: this.extractTag(entryXml, 'summary') || undefined,
        content: this.extractTag(entryXml, 'content') || undefined,
        type: this.extractTag(entryXml, 'type') || undefined,
        links: this.extractLinksFromXml(entryXml),
      });
    }

    return entries;
  }

  private extractAuthors(xml: string): string[] {
    const authors: string[] = [];
    const authorRegex = /<author[^>]*><name[^>]*>([^<]+)<\/name><\/author>/gi;
    let match;
    while ((match = authorRegex.exec(xml)) !== null) {
      authors.push(match[1].trim());
    }
    return authors;
  }

  private extractSubjects(xml: string): string[] {
    const subjects: string[] = [];
    const subjectRegex = /<category[^>]*term=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = subjectRegex.exec(xml)) !== null) {
      subjects.push(match[1]);
    }
    return subjects;
  }

  private extractLinksFromXml(xml: string): Array<{ href: string; rel?: string; type?: string; title?: string }> {
    const links: Array<{ href: string; rel?: string; type?: string; title?: string }> = [];
    const linkRegex = /<link[^>]*href=["']([^"']+)["'][^>]*\/?>/gi;
    let match;

    while ((match = linkRegex.exec(xml)) !== null) {
      // Find the full link tag containing this href
      const start = Math.max(0, match.index - 10);
      let end = match.index + match[0].length;
      // Find the closing > of this link tag
      const rest = xml.substring(start, end + 200);
      const closeIdx = rest.indexOf('>');
      if (closeIdx !== -1) {
        end = start + closeIdx + 1;
      }
      const fullTag = xml.substring(start, end);

      links.push({
        href: match[1],
        rel: this.extractAttr(fullTag, 'rel'),
        type: this.extractAttr(fullTag, 'type'),
        title: this.extractAttr(fullTag, 'title'),
      });
    }

    return links;
  }

  private extractAttr(context: string, attr: string): string | undefined {
    const regex = new RegExp(`${attr}=["']([^"']+)["']`, 'i');
    const match = context.match(regex);
    return match?.[1];
  }
}

/**
 * Singleton instance — URL is configured via useLibraryStore.
 */
export const opdsClient = new OPDSClient('');

/**
 * Factory function to create an OPDS client with a specific URL.
 */
export const createOPDSClient = (baseUrl: string): OPDSClient => {
  return new OPDSClient(baseUrl);
};

export default OPDSClient;