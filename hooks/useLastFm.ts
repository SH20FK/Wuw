'use client';
import { useEffect } from 'react';
import useLastFmStore from '@/store/useLastFmStore';
import gsap from 'gsap';

export function useLastFm() {
  const { setNowPlaying } = useLastFmStore();
  
  useEffect(() => {
    const grainUniforms = { uIntensity: 0.035, uSpeed: 1.0 };
    const updateGrainStore = () => useLastFmStore.getState().setGrain(grainUniforms.uIntensity, grainUniforms.uSpeed);

    async function pollLastFm() {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      try {
        const res = await fetch(`/api/lastfm?method=user.getrecenttracks&limit=1`);
        if (!res.ok) return;
        const data = await res.json();
        const tracks = data?.recenttracks?.track;
        if (!tracks || tracks.length === 0) return;
        const track = tracks[0];
        const isPlaying = track['@attr']?.nowplaying === 'true';
        
        if (isPlaying) {
          setNowPlaying(track);
          const artist = track.artist['#text']?.toLowerCase() || '';
          const isHeavy = ['mzlff', 'слава кпсс', 'pyrokinesis', 'shadowraze'].some(a => artist.includes(a));
          if (isHeavy) {
            gsap.to(grainUniforms, { uIntensity: 0.09, uSpeed: 2.5, duration: 2, onUpdate: updateGrainStore });
          } else {
            gsap.to(grainUniforms, { uIntensity: 0.045, uSpeed: 1.0, duration: 2, onUpdate: updateGrainStore });
          }
        } else {
          setNowPlaying(track);
          gsap.to(grainUniforms, { uIntensity: 0.025, uSpeed: 0.3, duration: 3, onUpdate: updateGrainStore });
        }
      } catch (err) {}
    }

    const interval = setInterval(pollLastFm, 30_000);
    pollLastFm();
    const handleVisibilityChange = () => { if (typeof document !== 'undefined' && document.visibilityState === 'visible') pollLastFm(); };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setNowPlaying]);
}
