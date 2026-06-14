import { create } from 'zustand';

interface ScrollState {
  velocity: number;
  setVelocity: (v: number) => void;
}

const useScrollStore = create<ScrollState>((set) => ({
  velocity: 0,
  setVelocity: (v) => set({ velocity: v }),
}));

export default useScrollStore;
