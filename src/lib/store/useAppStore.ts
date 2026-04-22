import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  hMargin: number; // percentage or pixels
  vMargin: number; // percentage or pixels
  fontFamily: string;
  customFontUrl?: string;
}

export interface AppSettings {
  theme: ThemeMode;
  reader: ReaderSettings;
  autoSync: boolean;
  lastSyncTime?: number;
}

const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
  wordSpacing: 0,
  hMargin: 16,
  vMargin: 24,
  fontFamily: 'Bookerly',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  reader: DEFAULT_READER_SETTINGS,
  autoSync: true,
};

interface AppStore extends AppSettings {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setReaderSettings: (settings: Partial<ReaderSettings>) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setLetterSpacing: (spacing: number) => void;
  setWordSpacing: (spacing: number) => void;
  setHMargins: (margins: number) => void;
  setVMargins: (margins: number) => void;
  setFontFamily: (font: string) => void;
  setCustomFontUrl: (url: string | undefined) => void;
  setAutoSync: (enabled: boolean) => void;
  resetReaderSettings: () => void;
}

export const useAppStore = create<AppSettings & AppStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setTheme: (theme) => set({ theme }),

      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      setReaderSettings: (settings) =>
        set((state) => ({ reader: { ...state.reader, ...settings } })),

      setFontSize: (fontSize) => set((state) => ({ reader: { ...state.reader, fontSize } })),

      setLineHeight: (lineHeight) => set((state) => ({ reader: { ...state.reader, lineHeight } })),

      setLetterSpacing: (letterSpacing) =>
        set((state) => ({ reader: { ...state.reader, letterSpacing } })),

      setWordSpacing: (wordSpacing) =>
        set((state) => ({ reader: { ...state.reader, wordSpacing } })),

      setHMargins: (hMargin) => set((state) => ({ reader: { ...state.reader, hMargin } })),

      setVMargins: (vMargin) => set((state) => ({ reader: { ...state.reader, vMargin } })),

      setFontFamily: (fontFamily) => set((state) => ({ reader: { ...state.reader, fontFamily } })),

      setCustomFontUrl: (customFontUrl) =>
        set((state) => ({ reader: { ...state.reader, customFontUrl } })),

      setAutoSync: (autoSync) => set({ autoSync }),

      resetReaderSettings: () => set({ reader: DEFAULT_READER_SETTINGS }),
    }),
    {
      name: 'boox-app-settings',
      version: 1,
    }
  )
);