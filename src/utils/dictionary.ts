/**
 * Dictionary lookup utility for e-reader.
 * Provides word definition lookups via local or remote dictionary.
 */

/**
 * Result of a dictionary lookup
 */
export interface DictionaryEntry {
  word: string;
  definitions: DictionaryDefinition[];
  source: string;
}

export interface DictionaryDefinition {
  partOfSpeech: string;
  definition: string;
  example?: string;
  synonyms?: string[];
}

/**
 * Looks up a word in the dictionary.
 * In production, this would connect to:
 * - A local dictionary database (SQLite)
 * - An online dictionary API (Merriam-Webster, WordNet, etc.)
 * 
 * @param word - The word to look up
 * @returns Dictionary entry or null if not found
 */
export async function lookupWord(word: string): Promise<DictionaryEntry | null> {
  try {
    // Placeholder: In production, implement actual dictionary lookup
    // For now, return a mock entry
    const encodedWord = encodeURIComponent(word.trim().toLowerCase());
    
    // Example: Merriam-Webster API
    // const response = await fetch(`https://api.merriam-webster.com/dict/v1/en/${encodedWord}`, {
    //   headers: { 'Authorization': `Bearer ${API_KEY}` }
    // });
    
    // Example: WordNet REST API
    // const response = await fetch(`http://wordnet-rpc.princeton.edu/query?word=${encodedWord}`);
    
    // Mock result for development
    return {
      word: word.trim().toLowerCase(),
      definitions: [
        {
          partOfSpeech: 'noun',
          definition: `A word in the dictionary of the e-reader application.`,
          example: 'Example usage would appear here.',
          synonyms: ['term', 'expression', 'vocabulary'],
        },
        {
          partOfSpeech: 'verb',
          definition: `To look up or search for a word's meaning.`,
          example: 'She would often dictionary entries in her e-reader.',
        },
      ],
      source: 'local-placeholder',
    };
  } catch {
    return null;
  }
}

/**
 * Cache for dictionary lookups to avoid redundant API calls.
 */
class DictionaryCache {
  private cache: Map<string, DictionaryEntry> = new Map();
  private readonly maxSize = 100;

  get(word: string): DictionaryEntry | null {
    return this.cache.get(word.toLowerCase()) ?? null;
  }

  set(word: string, entry: DictionaryEntry): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (simple round-robin)
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(word.toLowerCase(), entry);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const dictionaryCache = new DictionaryCache();

/**
 * Looks up a word, checking the cache first.
 * @param word - The word to look up
 * @returns Dictionary entry or null if not found
 */
export async function lookupWordCached(word: string): Promise<DictionaryEntry | null> {
  const cached = dictionaryCache.get(word);
  if (cached) return cached;

  const entry = await lookupWord(word);
  if (entry) {
    dictionaryCache.set(word, entry);
  }
  return entry;
}