import axios from 'axios';

/**
 * Koreader Sync protocol types
 */
export interface SyncPosition {
  uuid: string;
  documentUuid?: string;
  key?: string;
  value?: string;
  timestamp?: number;
}

export interface SyncBookmark {
  uuid: string;
  cfiRange: string;
  note?: string;
  page?: string;
  percent?: number;
  timestamp?: number;
  spinePos?: number;
}

export interface SyncNote {
  uuid: string;
  cfiRange: string;
  note: string;
  patches?: string;
  timestamp?: number;
}

export interface SyncHighlight extends SyncNote {
  highlights?: SyncHighlight[];
}

export interface ReaderSettings {
  fontName?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: string;
  fontOffset?: number;
  lineHeight?: number;
  margin?: number;
  backgroundColor?: string;
  textColor?: string;
  brightness?: number;
  id?: string;
}

export interface SyncDocument {
  uuid: string;
  documentPath?: string;
  dictionary?: string;
  settings?: ReaderSettings;
  version?: number;
}

export interface SyncMessage {
  type?: string;
  message?: string;
  timestamp?: number;
}

export type SyncMessageMap = {
  'readers/positions/document_uuid/key/value': SyncPosition;
  'readers/bookmarks/document_uuid/key': SyncBookmark;
  'readers/notes/document_uuid/key': SyncNote;
  'readers/settings/document_uuid/key': ReaderSettings;
  'readers/documents/document_uuid': SyncDocument;
  'readers/messages/uuid': SyncMessage;
};

/**
 * Koreader Sync server REST client.
 * Implements the sync protocol for reading progress, bookmarks, notes, and settings.
 */
class KoreaderSyncClient {
  private baseUrl: string;
  private axiosInstance;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
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
   * Get the last synced message key for a reader.
   */
  async getLastMessageKey(readerId: string): Promise<string | null> {
    try {
      const response = await this.axiosInstance.get(`/lastmessagekey/${readerId}`);
      return response.data?.message_key || null;
    } catch (error) {
      console.warn('[KoreaderSync] Failed to fetch lastMessageKey:', error);
      return null;
    }
  }

  /**
   * Set the last synced message key for a reader.
   */
  async setLastMessageKey(readerId: string, messageKey: string): Promise<boolean> {
    try {
      await this.axiosInstance.put(`/lastmessagekey/${readerId}`, messageKey);
      return true;
    } catch (error) {
      console.warn('[KoreaderSync] Failed to set lastMessageKey:', error);
      return false;
    }
  }

  /**
   * Get all messages (key-value pairs) for a reader.
   */
  async getMessages(readerId: string): Promise<Map<string, string>> {
    try {
      const response = await this.axiosInstance.get(`/messages/${readerId}`);
      const messages = response.data || {};
      return new Map(Object.entries(messages));
    } catch (error) {
      console.warn('[KoreaderSync] Failed to fetch messages:', error);
      return new Map();
    }
  }

  /**
   * Put messages (key-value pairs) for a reader.
   * Returns the server's updated message map.
   */
  async putMessages(readerId: string, messages: Map<string, string>): Promise<Map<string, string>> {
    try {
      const body = Object.fromEntries(messages);
      const response = await this.axiosInstance.put(`/messages/${readerId}`, body);
      const serverMessages = response.data || {};
      return new Map(Object.entries(serverMessages));
    } catch (error) {
      console.warn('[KoreaderSync] Failed to put messages:', error);
      return new Map(messages);
    }
  }

  /**
   * Merge local messages with server messages.
   * Uses timestamp-based conflict resolution.
   */
  async mergeMessages(
    readerId: string,
    localMessages: Map<string, string>
  ): Promise<{ serverMessages: Map<string, string>; merged: Map<string, string> }> {
    const serverMessages = await this.getMessages(readerId);
    const merged = new Map<string, string>(serverMessages);

    for (const [key, value] of localMessages) {
      const localData = JSON.parse(value) as { timestamp?: number };
      const serverData = serverMessages.has(key)
        ? JSON.parse(serverMessages.get(key) || '')
        : { timestamp: 0 };

      if (localData.timestamp && (!serverData.timestamp || localData.timestamp >= serverData.timestamp)) {
        merged.set(key, value);
      }
    }

    await this.putMessages(readerId, merged);

    return { serverMessages, merged };
  }

  /**
   * Save reading position.
   */
  async savePosition(
    readerId: string,
    documentUuid: string,
    cfiRange: string,
    percent?: number,
    page?: string
  ): Promise<boolean> {
    try {
      const safeCfi = cfiRange || '';
      const key = safeCfi.replace(/[^\w-]/g, '_');
      const positionKey = `readers/positions/${documentUuid}/${key}`;
      const position: SyncPosition = {
        uuid: readerId,
        documentUuid,
        key: positionKey,
        value: JSON.stringify({ cfiRange, percent, page, timestamp: Date.now() }),
        timestamp: Date.now(),
      };

      const messages = await this.getMessages(readerId);
      messages.set(positionKey, position.value || '{}');
      await this.putMessages(readerId, messages);
      return true;
    } catch (error) {
      console.warn('[KoreaderSync] Failed to save position:', error);
      return false;
    }
  }

  /**
   * Get saved reading position.
   */
  async getPosition(
    readerId: string,
    documentUuid: string
  ): Promise<{ cfiRange?: string; percent?: number; page?: string } | null> {
    try {
      const messages = await this.getMessages(readerId);

      for (const [key, value] of messages) {
        if (key.startsWith(`readers/positions/${documentUuid}/`)) {
          const pos = JSON.parse(value) as { cfiRange?: string; percent?: number; page?: string };
          return pos;
        }
      }
      return null;
    } catch (error) {
      console.warn('[KoreaderSync] Failed to get position:', error);
      return null;
    }
  }

  /**
   * Save a bookmark.
   */
  async saveBookmark(
    readerId: string,
    documentUuid: string,
    bookmark: Omit<SyncBookmark, 'uuid'>
  ): Promise<boolean> {
    try {
      const messages = await this.getMessages(readerId);
      const uuid = `bookmark-${Date.now()}`;
      const key = `readers/bookmarks/${documentUuid}/${uuid}`;
      const fullBookmark: SyncBookmark = { ...bookmark, uuid };

      messages.set(key, JSON.stringify(fullBookmark));
      await this.putMessages(readerId, messages);
      return true;
    } catch (error) {
      console.warn('[KoreaderSync] Failed to save bookmark:', error);
      return false;
    }
  }

  /**
   * Get all bookmarks for a document.
   */
  async getBookmarks(readerId: string, documentUuid: string): Promise<SyncBookmark[]> {
    try {
      const messages = await this.getMessages(readerId);
      const bookmarks: SyncBookmark[] = [];

      for (const [key, value] of messages) {
        if (key.startsWith(`readers/bookmarks/${documentUuid}/`)) {
          bookmarks.push(JSON.parse(value) as SyncBookmark);
        }
      }

      return bookmarks.sort((a, b) => (a.spinePos || 0) - (b.spinePos || 0));
    } catch (error) {
      console.warn('[KoreaderSync] Failed to get bookmarks:', error);
      return [];
    }
  }

  /**
   * Save reader settings (font, margin, theme, etc.).
   */
  async saveSettings(
    readerId: string,
    documentUuid: string,
    settings: ReaderSettings
  ): Promise<boolean> {
    try {
      const messages = await this.getMessages(readerId);
      const key = `readers/settings/${documentUuid}/settings`;
      messages.set(key, JSON.stringify({ ...settings, timestamp: Date.now() }));
      await this.putMessages(readerId, messages);
      return true;
    } catch (error) {
      console.warn('[KoreaderSync] Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Get saved reader settings.
   */
  async getSettings(
    readerId: string,
    documentUuid: string
  ): Promise<ReaderSettings | null> {
    try {
      const messages = await this.getMessages(readerId);
      const key = `readers/settings/${documentUuid}/settings`;
      const value = messages.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('[KoreaderSync] Failed to get settings:', error);
      return null;
    }
  }

  /**
   * Register a reader with the sync server.
   */
  async registerReader(readerName: string): Promise<string | null> {
    try {
      const response = await this.axiosInstance.post('/register', { name: readerName });
      return response.data?.uuid || null;
    } catch (error) {
      console.warn('[KoreaderSync] Failed to register reader:', error);
      return null;
    }
  }

  /**
   * Health check - verify server is reachable.
   */
  async isReachable(): Promise<boolean> {
    try {
      await this.axiosInstance.get('/lastmessagekey', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all sync data for a reader.
   */
  async clearReaderData(readerId: string): Promise<boolean> {
    try {
      await this.axiosInstance.delete(`/messages/${readerId}`);
      return true;
    } catch (error) {
      console.warn('[KoreaderSync] Failed to clear reader data:', error);
      return false;
    }
  }
}

/**
 * Singleton instance - URL is configured via useLibraryStore.
 */
export const koreaderSync = new KoreaderSyncClient('');

export default KoreaderSyncClient;