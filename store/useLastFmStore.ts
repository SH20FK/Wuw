import { create } from 'zustand';

interface LastFmState {
  grainIntensity: number;
  grainSpeed: number;
  setGrain: (intensity: number, speed: number) => void;
  nowPlaying: any | null;
  setNowPlaying: (track: any | null) => void;
}

const useLastFmStore = create<LastFmState>((set) => ({
  grainIntensity: 0.035,
  grainSpeed: 1.0,
  setGrain: (intensity, speed) => set({ grainIntensity: intensity, grainSpeed: speed }),
  nowPlaying: null,
  setNowPlaying: (track) => set({ nowPlaying: track }),
}));

export default useLastFmStore;
