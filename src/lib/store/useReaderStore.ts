import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CfiPosition {
  cfi: string;
  location: number;
  percentage: number;
}

export interface Annotation {
  id: string;
  cfi: string;
  text: string;
  note?: string;
  color: string;
  createdAt: number;
}

export interface Bookmark {
  id: string;
  cfi: string;
  page: number;
  label?: string;
  createdAt: number;
}

export interface ChapterInfo {
  id: string;
  title: string;
  href: string;
  cfi: string;
  index: number;
  totalChapters: number;
}

export interface ReadingProgress {
  currentCfi: string;
  currentChapter: number;
  totalChapters: number;
  percentage: number;
  totalPages: number;
  currentPage: number;
  lastReadAt: number;
  annotations: Annotation[];
  bookmarks: Bookmark[];
}

export interface SpineSettings {
  pageSpacing: 'single' | 'double';
  scrollMode: boolean;
  hideCover: boolean;
  pageTransition: 'none' | 'slide' | 'fade'; // e-ink: prefer 'none'
}

interface ReaderState {
  currentBookId: string | null;
  progress: ReadingProgress | null;
  isReading: boolean;
  isPaused: boolean;
  spine: SpineSettings;
  toc: ChapterInfo[];
  annotationMode: boolean;
  selectionStart?: number;
  selectionEnd?: number;
  selectedText?: string;
  selectedCfi?: string;
  selectedRect?: { x: number; y: number; width: number; height: number };
}

interface ReaderStore {
  reader: ReaderState;
  setCurrentBookId: (id: string | null) => void;
  startReading: (bookId: string) => void;
  pauseReading: () => void;
  resumeReading: () => void;
  closeReader: () => void;
  updateProgress: (progress: Partial<ReadingProgress>) => void;
  setChapters: (toc: ChapterInfo[]) => void;
  navigateToChapter: (chapterIndex: number) => void;
  navigateToCfi: (cfi: string) => void;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  removeAnnotation: (id: string) => void;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  setSpineSettings: (settings: Partial<SpineSettings>) => void;
  enterAnnotationMode: () => void;
  exitAnnotationMode: () => void;
  setSelection: (cfi: string, rect: ReaderState['selectedRect'], text: string) => void;
  clearSelection: () => void;
}

const DEFAULT_READER_STATE: ReaderState = {
  currentBookId: null,
  progress: null,
  isReading: false,
  isPaused: false,
  spine: {
    pageSpacing: 'single',
    scrollMode: false,
    hideCover: false,
    pageTransition: 'none',
  },
  toc: [],
  annotationMode: false,
};

export const useReaderStore = create<ReaderStore>()(
  persist(
    (set, get) => ({
      reader: { ...DEFAULT_READER_STATE },

      setCurrentBookId: (id) => set((state) => ({
        reader: { ...state.reader, currentBookId: id }
      })),

      startReading: (bookId) =>
        set((state) => {
          const existingProgress = state.reader.progress;
          return {
            reader: {
              ...state.reader,
              currentBookId: bookId,
              isReading: true,
              isPaused: false,
              progress: existingProgress || {
                currentCfi: '',
                currentChapter: 0,
                totalChapters: 0,
                percentage: 0,
                totalPages: 0,
                currentPage: 0,
                lastReadAt: Date.now(),
                annotations: [],
                bookmarks: [],
              },
            },
          };
        }),

      pauseReading: () =>
        set((state) => ({
          reader: { ...state.reader, isPaused: true },
        })),

      resumeReading: () =>
        set((state) => ({
          reader: { ...state.reader, isPaused: false },
        })),

      closeReader: () =>
        set((state) => ({
          reader: {
            ...state.reader,
            currentBookId: null,
            isReading: false,
            isPaused: false,
            annotationMode: false,
            selectionStart: undefined,
            selectionEnd: undefined,
            selectedText: undefined,
            selectedCfi: undefined,
            selectedRect: undefined,
          },
        })),

      updateProgress: (progress) =>
        set((state) => ({
          reader: {
            ...state.reader,
            progress: {
              ...state.reader.progress!,
              ...progress,
              lastReadAt: Date.now(),
            },
          },
        })),

      setChapters: (toc) =>
        set((state) => ({
          reader: { ...state.reader, toc },
        })),

      navigateToChapter: (chapterIndex) =>
        set((state) => ({
          reader: {
            ...state.reader,
            progress: state.reader.progress
              ? {
                  ...state.reader.progress,
                  currentChapter: chapterIndex,
                }
              : null,
          },
        })),

      navigateToCfi: (cfi) =>
        set((state) => ({
          reader: {
            ...state.reader,
            progress: state.reader.progress
              ? {
                  ...state.reader.progress,
                  currentCfi: cfi,
                }
              : null,
          },
        })),

      addAnnotation: (annotation) =>
        set((state) => ({
          reader: {
            ...state.reader,
            progress: state.reader.progress
              ? {
                  ...state.reader.progress,
                  annotations: [
                    ...state.reader.progress.annotations,
                    {
                      ...annotation,
                      id: `ann-${Date.now()}`,
                      createdAt: Date.now(),
                    },
                  ],
                }
              : null,
          },
        })),

      removeAnnotation: (id) =>
        set((state) => ({
          reader: {
            ...state.reader,
            progress: state.reader.progress
              ? {
                  ...state.reader.progress,
                  annotations: state.reader.progress.annotations.filter(
                    (a) => a.id !== id
                  ),
                }
              : null,
          },
        })),

      addBookmark: (bookmark) =>
        set((state) => ({
          reader: {
            ...state.reader,
            progress: state.reader.progress
              ? {
                  ...state.reader.progress,
                  bookmarks: [
                    ...state.reader.progress.bookmarks,
                    {
                      ...bookmark,
                      id: `bm-${Date.now()}`,
                      createdAt: Date.now(),
                    },
                  ],
                }
              : null,
          },
        })),

      removeBookmark: (id) =>
        set((state) => ({
          reader: {
            ...state.reader,
            progress: state.reader.progress
              ? {
                  ...state.reader.progress,
                  bookmarks: state.reader.progress.bookmarks.filter(
                    (b) => b.id !== id
                  ),
                }
              : null,
          },
        })),

      setSpineSettings: (settings) =>
        set((state) => ({
          reader: {
            ...state.reader,
            spine: { ...state.reader.spine, ...settings },
          },
        })),

      enterAnnotationMode: () =>
        set((state) => ({
          reader: { ...state.reader, annotationMode: true },
        })),

      exitAnnotationMode: () =>
        set((state) => ({
          reader: { ...state.reader, annotationMode: false },
        })),

      setSelection: (cfi, rect, text) =>
        set((state) => ({
          reader: {
            ...state.reader,
            selectedCfi: cfi,
            selectedRect: rect,
            selectedText: text,
          },
        })),

      clearSelection: () =>
        set((state) => ({
          reader: {
            ...state.reader,
            selectionStart: undefined,
            selectionEnd: undefined,
            selectedText: undefined,
            selectedCfi: undefined,
            selectedRect: undefined,
          },
        })),
    }),
    {
      name: 'boox-reader',
      version: 1,
      partialize: (state) => ({
        // Only persist reading progress, not transient state
        reader: {
          ...state.reader,
          isReading: false,
          isPaused: false,
          annotationMode: false,
          selectedText: undefined,
          selectedCfi: undefined,
          selectedRect: undefined,
          selectionStart: undefined,
          selectionEnd: undefined,
        },
      }),
    }
  )
);