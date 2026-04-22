/**
 * Storage utilities for persisting app state.
 * Uses AsyncStorage as the underlying storage engine.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys for AsyncStorage.
 */
export const STORAGE_KEYS = {
  /** App-level settings (theme, font, margins, etc.) */
  APP_SETTINGS: '@booxreader:app_settings',
  /** Library state (book positions, reading progress) */
  LIBRARY_STATE: '@booxreader:library_state',
  /** Reader preferences (font, size, margins per book) */
  READER_PREFERENCES: '@booxreader:reader_preferences',
  /** Dictionary cache (word lookups) */
  DICTIONARY_CACHE: '@booxreader:dictionary_cache',
  /** Sync state (last sync times, pending operations) */
  SYNC_STATE: '@booxreader:sync_state',
  /** User-installed fonts URIs */
  USER_FONTS: '@booxreader:user_fonts',
  /** Grimoory/OPDS server configuration */
  SERVER_CONFIG: '@booxreader:server_config',
} as const;

/**
 * App settings persisted to storage.
 */
export interface PersistedAppSettings {
  theme: 'light' | 'dark';
  fontFamily: string;
  fontSize: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  lineHeight: number;
  fontWeight: number;
}

/**
 * Reader preferences for a specific book.
 */
export interface BookReaderPreferences {
  bookId: string;
  fontFamily: string;
  fontSize: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  lineHeight: number;
  theme: 'light' | 'dark';
}

/**
 * Sync state persisted to storage.
 */
export interface PersistedSyncState {
  lastSyncTime: number | null;
  pendingOperations: SyncOperation[];
  error: string | null;
}

/**
 * A pending sync operation queued for later execution.
 */
export interface SyncOperation {
  id: string;
  type: 'position_update' | 'bookmark_create' | 'bookmark_delete' | 'annotation_create' | 'annotation_update' | 'annotation_delete';
  bookId: string;
  data: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
}

/**
 * Generic typed wrapper around AsyncStorage.
 */
class StorageService {
  /**
   * Gets a value from AsyncStorage and parses it.
   * @param key - The storage key
   * @returns The parsed value, or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to get storage key "${key}":`, error);
      return null;
    }
  }

  /**
   * Sets a value in AsyncStorage, stringifying it.
   * @param key - The storage key
   * @param value - The value to store (will be JSON stringified)
   * @returns true on success, false on failure
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set storage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Removes a value from AsyncStorage.
   * @param key - The storage key to remove
   * @returns true on success, false on failure
   */
  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove storage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clears all app-related storage keys.
   * @returns true on success, false on failure
   */
  async clearAll(): Promise<boolean> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.removeMany(keys);
      return true;
    } catch (error) {
      console.error('Failed to clear all storage:', error);
      return false;
    }
  }

  /**
   * Gets all keys used by AsyncStorage.
   * @returns Array of all storage keys
   */
  getAllKeys(): Promise<string[]> {
    return AsyncStorage.getAllKeys();
  }

  /**
   * Gets multiple values in a single batch operation.
   * @param keys - Array of storage keys
   * @returns Record mapping keys to their parsed values
   */
  async getMulti<T extends Record<string, unknown>>(keys: string[]): Promise<Partial<T>> {
    try {
      const values = await AsyncStorage.getMany(keys);
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(values)) {
        if (value !== null && value !== undefined) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      }
      return result as Partial<T>;
    } catch (error) {
      console.error('Failed to get multi values:', error);
      return {};
    }
  }
}

/**
 * App settings storage operations.
 */
export const appSettingsStorage = {
  get: () => AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS).then((v: string | null) => (v ? JSON.parse(v) : null)) as Promise<PersistedAppSettings | null>,
  set: (settings: PersistedAppSettings) => AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings)),
  remove: () => AsyncStorage.removeItem(STORAGE_KEYS.APP_SETTINGS),
};

/**
 * Book reader preferences storage operations.
 */
export const readerPreferencesStorage = {
  getKey: (bookId: string) => `${STORAGE_KEYS.READER_PREFERENCES}:${bookId}`,
  get: (bookId: string) => AsyncStorage.getItem(`${STORAGE_KEYS.READER_PREFERENCES}:${bookId}`).then((v: string | null) => (v ? JSON.parse(v) : null)) as Promise<BookReaderPreferences | null>,
  set: (prefs: BookReaderPreferences) => AsyncStorage.setItem(`${STORAGE_KEYS.READER_PREFERENCES}:${prefs.bookId}`, JSON.stringify(prefs)),
  remove: (bookId: string) => AsyncStorage.removeItem(`${STORAGE_KEYS.READER_PREFERENCES}:${bookId}`),
};

/**
 * Sync state storage operations.
 */
export const syncStateStorage = {
  get: () => AsyncStorage.getItem(STORAGE_KEYS.SYNC_STATE).then((v: string | null) => (v ? JSON.parse(v) : null)) as Promise<PersistedSyncState | null>,
  set: (state: PersistedSyncState) => AsyncStorage.setItem(STORAGE_KEYS.SYNC_STATE, JSON.stringify(state)),
  remove: () => AsyncStorage.removeItem(STORAGE_KEYS.SYNC_STATE),
};

/**
 * Server configuration storage operations.
 */
export const serverConfigStorage = {
  get: () => AsyncStorage.getItem(STORAGE_KEYS.SERVER_CONFIG).then((v: string | null) => (v ? JSON.parse(v) : null)) as Promise<{ grimooryUrl: string; koreaderUrl: string } | null>,
  set: (config: { grimooryUrl: string; koreaderUrl: string }) => AsyncStorage.setItem(STORAGE_KEYS.SERVER_CONFIG, JSON.stringify(config)),
  remove: () => AsyncStorage.removeItem(STORAGE_KEYS.SERVER_CONFIG),
};

/**
 * User fonts storage operations.
 */
export const userFontsStorage = {
  get: () => AsyncStorage.getItem(STORAGE_KEYS.USER_FONTS).then((v: string | null) => (v ? JSON.parse(v) : null)) as Promise<string[] | null>,
  set: (uris: string[]) => AsyncStorage.setItem(STORAGE_KEYS.USER_FONTS, JSON.stringify(uris)),
  remove: () => AsyncStorage.removeItem(STORAGE_KEYS.USER_FONTS),
};

/**
 * Library state storage operations.
 */
export const libraryStateStorage = {
  get: () => AsyncStorage.getItem(STORAGE_KEYS.LIBRARY_STATE).then((v: string | null) => (v ? JSON.parse(v) : null)) as Promise<Record<string, { progress: number; page: number; lastRead: number }> | null>,
  set: (state: Record<string, { progress: number; page: number; lastRead: number }>) => AsyncStorage.setItem(STORAGE_KEYS.LIBRARY_STATE, JSON.stringify(state)),
  remove: () => AsyncStorage.removeItem(STORAGE_KEYS.LIBRARY_STATE),
};

/**
 * Export the main storage service instance.
 */
export const storage = new StorageService();