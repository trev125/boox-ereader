import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OPDSFeed, OPDSSection } from '../../types/opds';

export interface BookMetadata {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  language?: string;
  description?: string;
  coverUrl?: string;
  publishedDate?: string;
  subjects: string[];
  filesize?: number;
  mediaType?: string;
}

export interface LibraryBook extends BookMetadata {
  localPath?: string;
  isDownloaded: boolean;
  addedAt: number;
  lastReadAt?: number;
  progress?: number; // 0-100
}

export interface CatalogFeed {
  id: string;
  title: string;
  url: string;
  description?: string;
  isBuiltIn: boolean;
}

interface LibraryState {
  grimooryUrl: string;
  isConnected: boolean;
  connectionError?: string;
  books: LibraryBook[];
  selectedBookId?: string;
  feeds: CatalogFeed[];
  currentFeed?: OPDSFeed;
  currentSection?: OPDSSection;
  searchQuery: string;
  isSearching: boolean;
  setGrimooryUrl: (url: string) => void;
  testConnection: () => Promise<boolean>;
  addBook: (book: LibraryBook) => void;
  removeBook: (id: string) => void;
  updateBookProgress: (id: string, progress: number) => void;
  setSelectedBook: (id?: string) => void;
  setFeeds: (feeds: CatalogFeed[]) => void;
  addFeed: (feed: CatalogFeed) => void;
  removeFeed: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setCurrentFeed: (feed?: OPDSFeed) => void;
  setCurrentSection: (section?: OPDSSection) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      grimooryUrl: '',
      isConnected: false,
      books: [],
      feeds: [
        {
          id: 'goodreads',
          title: 'Goodreads Recommendations',
          url: '',
          description: 'Popular recommendations',
          isBuiltIn: true,
        },
      ],
      searchQuery: '',
      isSearching: false,

      setGrimooryUrl: (url) => set({ grimooryUrl: url }),

      testConnection: async () => {
        const { grimooryUrl } = get();
        if (!grimooryUrl) {
          set({ isConnected: false, connectionError: 'No URL configured' });
          return false;
        }
        try {
          const response = await fetch(`${grimooryUrl}/api/opds/catalog`);
          if (response.ok) {
            set({ isConnected: true, connectionError: undefined });
            return true;
          }
          set({ isConnected: false, connectionError: `HTTP ${response.status}` });
          return false;
        } catch (e: any) {
          set({ isConnected: false, connectionError: e.message });
          return false;
        }
      },

      addBook: (book) =>
        set((state) => {
          const existing = state.books.findIndex((b) => b.id === book.id);
          if (existing >= 0) {
            const updated = [...state.books];
            updated[existing] = book;
            return { books: updated };
          }
          return { books: [...state.books, book] };
        }),

      removeBook: (id) => set((state) => ({ books: state.books.filter((b) => b.id !== id) })),

      updateBookProgress: (id, progress) =>
        set((state) => ({
          books: state.books.map((b) =>
            b.id === id ? { ...b, progress, lastReadAt: Date.now() } : b
          ),
        })),

      setSelectedBook: (id) => set({ selectedBookId: id }),

      setFeeds: (feeds) => set({ feeds }),

      addFeed: (feed) => set((state) => ({ feeds: [...state.feeds, feed] })),

      removeFeed: (id) => set((state) => ({ feeds: state.feeds.filter((f) => f.id !== id) })),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setCurrentFeed: (feed) => set({ currentFeed: feed }),

      setCurrentSection: (section) => set({ currentSection: section }),
    }),
    {
      name: 'boox-library',
      version: 1,
    }
  )
);