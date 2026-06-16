import { create } from 'zustand';

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
  accentColor: '#E61C1C', // Fallback red (from Kino - Legend)
  setAccentColor: (color) => set({ accentColor: color }),
}));

export default useLastFmStore;
