import { create } from 'zustand';

interface LastFmState {
  grainIntensity: number;
  grainSpeed: number;
  setGrain: (intensity: number, speed: number) => void;
  nowPlaying: any | null;
  setNowPlaying: (track: any | null) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const getInitialSoundEnabled = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('SH20FK_sound_enabled');
    return saved !== 'false';
  }
  return true;
};

const useLastFmStore = create<LastFmState>((set) => ({
  grainIntensity: 0.035,
  grainSpeed: 1.0,
  setGrain: (intensity, speed) => set({ grainIntensity: intensity, grainSpeed: speed }),
  nowPlaying: null,
  setNowPlaying: (track) => set({ nowPlaying: track }),
  accentColor: '#E61C1C', // Fallback red (from Kino - Legend)
  setAccentColor: (color) => set({ accentColor: color }),
  soundEnabled: getInitialSoundEnabled(),
  toggleSound: () => set((state) => {
    const next = !state.soundEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('SH20FK_sound_enabled', String(next));
    }
    return { soundEnabled: next };
  }),
}));

export default useLastFmStore;
