import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'up-to-date';

export interface SyncRecord {
  bookId: string;
  cfi: string;
  percentage: number;
  timestamp: number;
  device: string;
}

export interface SyncQueueItem {
  id: string;
  bookId: string;
  cfi: string;
  percentage: number;
  timestamp: number;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
  lastRetry?: number;
}

export interface SyncLogEntry {
  timestamp: number;
  type: 'start' | 'progress' | 'complete' | 'error';
  message: string;
  details?: Record<string, unknown>;
}

interface SyncState {
  koreaderUrl: string;
  deviceName: string;
  status: SyncStatus;
  lastSyncAt: number | null;
  lastSyncError?: string;
  isSyncing: boolean;
  syncDirection: 'bidirectional' | 'upload' | 'download';
  autoSyncInterval: number; // minutes
  queue: SyncQueueItem[];
  log: SyncLogEntry[];
  pendingSyncs: number;
}

interface SyncStore {
  sync: SyncState;
  setKoreaderUrl: (url: string) => void;
  setDeviceName: (name: string) => void;
  setSyncDirection: (direction: SyncState['syncDirection']) => void;
  setAutoSyncInterval: (minutes: number) => void;
  syncNow: (bookId?: string, cfi?: string, percentage?: number) => Promise<void>;
  startSync: (direction: SyncState['syncDirection']) => void;
  completeSync: () => void;
  failSync: (error: string) => void;
  addToQueue: (bookId: string, cfi: string, percentage: number) => void;
  processQueue: () => Promise<void>;
  clearLog: () => void;
  reset: () => void;
}

const DEFAULT_STATE: SyncState = {
  koreaderUrl: '',
  deviceName: 'boox-palma-2',
  status: 'idle',
  lastSyncAt: null,
  isSyncing: false,
  syncDirection: 'bidirectional',
  autoSyncInterval: 5,
  queue: [],
  log: [],
  pendingSyncs: 0,
};

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      sync: { ...DEFAULT_STATE },

      setKoreaderUrl: (url) =>
        set((state) => ({
          sync: { ...state.sync, koreaderUrl: url },
        })),

      setDeviceName: (name) =>
        set((state) => ({
          sync: { ...state.sync, deviceName: name },
        })),

      setSyncDirection: (direction) =>
        set((state) => ({
          sync: { ...state.sync, syncDirection: direction },
        })),

      setAutoSyncInterval: (minutes) =>
        set((state) => ({
          sync: { ...state.sync, autoSyncInterval: minutes },
        })),

      syncNow: async (bookId, cfi, percentage) => {
        const { koreaderUrl } = get().sync;
        if (!koreaderUrl) {
          get().failSync('No Koreader URL configured');
          return;
        }

        get().startSync('bidirectional');

        try {
          const response = await fetch(`${koreaderUrl}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              device: get().sync.deviceName,
              action: bookId ? 'update' : 'pull',
              ...(bookId && cfi !== undefined && percentage !== undefined
                ? { bookId, cfi, percentage }
                : {}),
            }),
          });

          if (!response.ok) {
            throw new Error(`Sync failed: ${response.status}`);
          }

          get().completeSync();
        } catch (error: any) {
          get().failSync(error.message || 'Unknown sync error');
        }
      },

      startSync: (direction) =>
        set((state) => ({
          sync: {
            ...state.sync,
            status: 'syncing',
            isSyncing: true,
            syncDirection: direction,
            log: [
              ...state.sync.log,
              {
                timestamp: Date.now(),
                type: 'start',
                message: `Starting ${direction} sync...`,
              },
            ],
          },
        })),

      completeSync: () =>
        set((state) => ({
          sync: {
            ...state.sync,
            status: 'up-to-date',
            isSyncing: false,
            lastSyncAt: Date.now(),
            pendingSyncs: 0,
            log: [
              ...state.sync.log,
              {
                timestamp: Date.now(),
                type: 'complete',
                message: 'Sync completed successfully',
              },
            ],
          },
        })),

      failSync: (error) =>
        set((state) => ({
          sync: {
            ...state.sync,
            status: 'error',
            isSyncing: false,
            lastSyncError: error,
            log: [
              ...state.sync.log,
              {
                timestamp: Date.now(),
                type: 'error',
                message: `Sync error: ${error}`,
              },
            ],
          },
        })),

      addToQueue: (bookId, cfi, percentage) =>
        set((state) => {
          const newItem: SyncQueueItem = {
            id: `q-${Date.now()}`,
            bookId,
            cfi,
            percentage,
            timestamp: Date.now(),
            status: 'pending',
            retryCount: 0,
          };
          return {
            sync: {
              ...state.sync,
              queue: [...state.sync.queue, newItem],
              pendingSyncs: state.sync.pendingSyncs + 1,
              log: [
                ...state.sync.log,
                {
                  timestamp: Date.now(),
                  type: 'progress',
                  message: `Queued sync for book: ${bookId}`,
                },
              ],
            },
          };
        }),

      processQueue: async () => {
        const { sync } = get();
        if (sync.queue.length === 0 || sync.isSyncing) return;

        get().startSync('upload');

        const failed: SyncQueueItem[] = [];
        const processed: SyncQueueItem[] = [];

        for (const item of sync.queue) {
          if (item.status !== 'pending') continue;

          try {
            const response = await fetch(`${sync.koreaderUrl}/sync`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                device: sync.deviceName,
                action: 'update',
                bookId: item.bookId,
                cfi: item.cfi,
                percentage: item.percentage,
              }),
            });

            if (response.ok) {
              processed.push({ ...item, status: 'sent' });
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          } catch {
            if (item.retryCount < 3) {
              failed.push({
                ...item,
                status: 'pending',
                retryCount: item.retryCount + 1,
                lastRetry: Date.now(),
              });
            } else {
              processed.push({ ...item, status: 'failed' });
            }
          }
        }

        const remaining = [...failed, ...processed.filter((p) => p.status === 'sent')];

        if (failed.length > 0) {
          get().failSync(`${failed.length} items failed after retry`);
        } else {
          get().completeSync();
        }

        set((state) => ({
          sync: {
            ...state.sync,
            queue: remaining,
            pendingSyncs: remaining.length,
          },
        }));
      },

      clearLog: () =>
        set((state) => ({
          sync: { ...state.sync, log: [] },
        })),

      reset: () =>
        set({ sync: { ...DEFAULT_STATE, log: [] } }),
    }),
    {
      name: 'boox-sync',
      version: 1,
      partialize: (state) => ({
        sync: {
          ...state.sync,
          status: 'idle' as SyncStatus,
          isSyncing: false,
          lastSyncError: undefined,
          queue: [],
          pendingSyncs: 0,
        },
      }),
    }
  )
);