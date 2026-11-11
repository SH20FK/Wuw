'use client';
import { useEffect } from 'react';
import useLastFmStore from '@/store/useLastFmStore';
import { getTrackImage, getAverageColor } from '@/lib/utils';
import gsap from 'gsap';

export function useLastFm() {
  const { setNowPlaying, setAccentColor } = useLastFmStore();
  
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
        
        if (data?.recenttracks?.['@attr']) {
          track.userStats = data.recenttracks['@attr'];
        }
        
        setNowPlaying(track);

        const isPlaying = track['@attr']?.nowplaying === 'true';
        
        const coverUrl = getTrackImage(track);
        if (coverUrl) {
          // Colour follows the cover whether or not playback is active, so the
          // theme survives a pause instead of snapping back to the brand accent.
          getAverageColor(coverUrl).then((color) => {
            setAccentColor(color);
          }).catch(() => {});

          const artist = track.artist['#text']?.toLowerCase() || '';
          const isHeavy = ['mzlff', 'слава кпсс', 'pyrokinesis', 'shadowraze'].some(a => artist.includes(a));
          if (isHeavy) {
            gsap.to(grainUniforms, { uIntensity: 0.09, uSpeed: 2.5, duration: 2, onUpdate: updateGrainStore });
          } else {
            gsap.to(grainUniforms, { uIntensity: 0.045, uSpeed: 1.0, duration: 2, onUpdate: updateGrainStore });
          }
        } else {
          // No cover to sample: keep the theme that is already stored instead of
          // resetting the whole site to the brand colour.
          gsap.to(grainUniforms, { uIntensity: isPlaying ? 0.025 : 0.02, uSpeed: 0.3, duration: 3, onUpdate: updateGrainStore });
        }
      } catch (err) {
        // Network hiccup: keep whatever theme is already stored.
      }
    }

    const interval = setInterval(pollLastFm, 10_000);
    pollLastFm();
    const handleVisibilityChange = () => { if (typeof document !== 'undefined' && document.visibilityState === 'visible') pollLastFm(); };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setNowPlaying, setAccentColor]);
}
