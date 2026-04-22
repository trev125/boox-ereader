/**
 * Koreader Sync type definitions for the Boox Reader app.
 */

/** Sync data for a single book */
export interface SyncData {
  /** Current CFI Range position */
  cfi: string;
  /** Overall book progress (0-100) */
  percentage: number;
  /** Current page number (if available) */
  page: number;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Annotations for this book */
  annotations: SyncAnnotation[];
}

/** A single annotation entry for sync */
export interface SyncAnnotation {
  /** CFI Range of the annotation */
  cfi: string;
  /** Selected text content */
  text?: string;
  /** User's note on the annotation */
  note?: string;
  /** Highlight color/identifier */
  highlight?: string;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
}

/** A change log entry for conflict resolution */
export interface SyncChange {
  /** Unique change ID */
  id: string;
  /** CFI Range that was changed */
  cfi: string;
  /** Type of change */
  type: 'position' | 'annotation_add' | 'annotation_update' | 'annotation_delete' | 'bookmark';
  /** The data associated with the change */
  data: SyncData | SyncAnnotation;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Client/device identifier that made the change */
  clientId?: string;
}

/** Sync status for a book */
export interface SyncStatus {
  bookId: string;
  /** Last successful sync timestamp */
  lastSyncAt: number;
  /** Whether a sync is currently in progress */
  isSyncing: boolean;
  /** Any sync errors */
  errors: string[];
  /** Number of pending local changes */
  pendingChanges: number;
}

/** Sync direction */
export type SyncDirection = 'upload' | 'download' | 'both';

/** Sync result */
export interface SyncResult {
  /** Whether the sync was successful */
  success: boolean;
  /** Number of items synced */
  itemsSynced: number;
  /** Any errors encountered */
  errors?: string[];
  /** The remote sync data after sync */
  remoteData?: SyncData;
  /** The local sync data after sync */
  localData?: SyncData;
}

/** Offline sync queue entry */
export interface OfflineQueueEntry {
  /** Unique queue entry ID */
  id: string;
  /** Book ID */
  bookId: string;
  /** Operation to perform when online */
  operation: 'update_position' | 'sync_annotations' | 'fetch_progress';
  /** Data to sync */
  data: SyncData | SyncAnnotation[];
  /** When the entry was queued */
  queuedAt: number;
  /** Attempt count */
  attempts: number;
  /** Max retry attempts */
  maxRetries: number;
}

/** Sync configuration */
export interface SyncConfig {
  /** Server URL */
  serverUrl: string;
  /** Auto-sync interval in seconds (default: 30) */
  autoSyncInterval: number;
  /** Sync on app resume */
  syncOnResume: boolean;
  /** Sync on book open */
  syncOnOpen: boolean;
  /** Sync on bookmark */
  syncOnBookmark: boolean;
  /** Conflict resolution strategy */
  conflictStrategy: 'last-write-wins' | 'merge';
}