import { create } from 'zustand';

const ACCENT_KEY = 'SH20FK_accent';

function readStoredAccent(): string {
  if (typeof window === 'undefined') return '#D97757';
  try {
    return window.localStorage.getItem(ACCENT_KEY) || '#D97757';
  } catch {
    return '#D97757';
  }
}

interface LastFmState {
  grainIntensity: number;
  grainSpeed: number;
  setGrain: (intensity: number, speed: number) => void;
  nowPlaying: any | null;
  setNowPlaying: (track: any | null) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const useLastFmStore = create<LastFmState>((set) => ({
  grainIntensity: 0.035,
  grainSpeed: 1.0,
  setGrain: (intensity, speed) => set({ grainIntensity: intensity, grainSpeed: speed }),
  nowPlaying: null,
  setNowPlaying: (track) => set({ nowPlaying: track }),
  // Restored from storage so the theme survives reloads and route changes
  // instead of flashing back to the brand colour.
  accentColor: readStoredAccent(),
  setAccentColor: (color) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(ACCENT_KEY, color);
      } catch {}
    }
    set({ accentColor: color });
  },
}));

export default useLastFmStore;