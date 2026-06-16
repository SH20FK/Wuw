'use client';
import { useEffect, useRef, useState } from 'react';
import useLastFmStore from '@/store/useLastFmStore';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/animations';
import Image from 'next/image';
import Link from 'next/link';
import { getTrackImage } from '@/lib/utils';
import { useSfx } from '@/lib/useSfx';
import { Play, Pause, X, ArrowUpRight, Music } from 'lucide-react';

export function NowPlayingFAB() {
  const { nowPlaying } = useLastFmStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const { playClick, playHover } = useSfx();

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const previewUrl = nowPlaying?.previewUrl;
  const isNowPlayingLive = nowPlaying?.['@attr']?.nowplaying === 'true';

  // Handle outside clicks to collapse the detailed view
  useEffect(() => {
    if (!isExpanded) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isExpanded]);

  // Clean up Audio components on change/unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (_) {}
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch (_) {}
        analyserRef.current = null;
      }
      setIsPlayingPreview(false);
    };
  }, [nowPlaying]);

  // Initialize live audio analyzer
  const initAnalyser = (audio: HTMLAudioElement) => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 32; // Optimized for 6 bands
        analyserRef.current = analyser;
      }

      if (!sourceRef.current) {
        const source = ctx.createMediaElementSource(audio);
        sourceRef.current = source;
        source.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
      }
    } catch (e) {
      console.warn("Could not bind real analyzer: ", e);
    }
  };

  // Play/Pause handling for iTunes preview URL
  const togglePlayPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();

    if (!previewUrl) return;

    if (!audioRef.current) {
      const audio = new Audio(previewUrl);
      audio.crossOrigin = "anonymous";
      audio.volume = 0.08; // Delicate micro-listening volume
      audio.loop = true;
      audioRef.current = audio;

      audio.addEventListener('play', () => setIsPlayingPreview(true));
      audio.addEventListener('pause', () => setIsPlayingPreview(false));
    }

    const audio = audioRef.current;

    if (isPlayingPreview) {
      audio.pause();
    } else {
      initAnalyser(audio);
      audio.play().catch(err => {
        console.warn("Audio play blocked/failed: ", err);
      });
    }
  };

  // Real-time animation loop for live analyser or sinusoidal simulated visuals
  useEffect(() => {
    let active = true;
    const frequencyData = new Uint8Array(6);

    const renderTick = () => {
      if (!active) return;

      const hasLiveAnalyser = isPlayingPreview && analyserRef.current;
      
      if (hasLiveAnalyser && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(frequencyData);
        for (let i = 0; i < 6; i++) {
          const bar = barsRef.current[i];
          if (bar) {
            const rawVal = frequencyData[i] || 0;
            // Map byte data to responsive height percentage
            const percent = Math.min(100, Math.max(12, (rawVal / 220) * 100));
            bar.style.height = `${percent}%`;
          }
        }
      } else {
        // Multi-frequency phase-shifted sine wave simulation backup
        const time = performance.now() * 0.003;
        for (let i = 0; i < 6; i++) {
          const bar = barsRef.current[i];
          if (bar) {
            const wave = Math.sin(time * (1 + i * 0.35) + i) * 35 + Math.cos(time * 0.6 - i) * 15 + 50;
            const percent = isNowPlayingLive ? Math.max(12, Math.min(100, wave)) : 12; // Flat indicator when not streaming
            bar.style.height = `${percent}%`;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderTick);
    };

    renderTick();

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlayingPreview, isNowPlayingLive]);

  if (!nowPlaying) return null;

  const coverUrl = getTrackImage(nowPlaying);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-40">
      <AnimatePresence initial={false} mode="wait">
        {!isExpanded ? (
          /* Slipped Compact View */
          <motion.div
            layoutId="fab-container"
            onClick={() => setIsExpanded(true)}
            onMouseEnter={playHover}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            whileHover={{ scale: 1.03 }}
            transition={spring.snappy}
            className="h-[52px] rounded-[26px] bg-surface/90 border border-[rgba(184,173,158,0.12)] backdrop-blur-[15px] px-4 flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0">
              {coverUrl ? (
                <Image src={coverUrl} alt="cover" fill className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                  <Music className="w-4 h-4 text-text-muted" />
                </div>
              )}
              {isNowPlayingLive && (
                <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              )}
            </div>
            
            <div className="flex flex-col items-start pr-2">
              <div className="font-mono text-xs text-text max-w-[140px] truncate">{nowPlaying.name}</div>
              <div className="font-body text-[10px] text-text-muted max-w-[140px] truncate">{nowPlaying.artist?.['#text']}</div>
            </div>

            {/* Micro compact equalizers */}
            <div className="flex items-end gap-[2px] h-3 w-4 shrink-0 pb-0.5">
              {[...Array(3)].map((_, i) => (
                <motion.span
                  key={i}
                  animate={isNowPlayingLive ? { height: ['20%', '100%', '20%'] } : { height: '20%' }}
                  transition={{ duration: 0.6 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[2px] bg-accent inline-block"
                />
              ))}
            </div>
          </motion.div>
        ) : (
          /* Expanded Detailed Card */
          <motion.div
            layoutId="fab-container"
            transition={spring.snappy}
            className="w-[290px] p-5 rounded-2xl bg-surface/95 border border-[rgba(184,173,158,0.18)] backdrop-blur-[20px] shadow-2xl flex flex-col gap-4 select-none"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isNowPlayingLive ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isNowPlayingLive ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  {isNowPlayingLive ? 'Now Playing' : 'Last Scrobble'}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); playClick(); setIsExpanded(false); }} 
                className="text-text-muted hover:text-accent transition-colors p-1 rounded-full hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cover & complete metadata list */}
            <div className="flex gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[rgba(184,173,158,0.1)] shrink-0 self-start">
                {coverUrl ? (
                  <Image src={coverUrl} alt="cover" fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-surface/50 flex items-center justify-center">
                    <Music className="w-6 h-6 text-text-muted" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <div className="font-mono text-xs text-text font-semibold leading-snug break-words">
                  {nowPlaying.name}
                </div>
                <div className="font-body text-xs text-text-muted leading-relaxed mt-1 break-words">
                  {nowPlaying.artist?.['#text']}
                </div>
                {nowPlaying.album?.['#text'] && (
                  <div className="font-body text-[10px] text-text-muted opacity-80 mt-1 truncate">
                    {nowPlaying.album['#text']}
                  </div>
                )}
              </div>
            </div>

            {/* Multi-sine visual simulation or Active WebGL playback context */}
            <div className="bg-[rgba(14,12,15,0.4)] border border-[rgba(184,173,158,0.06)] px-3 py-2 rounded-lg flex items-center justify-between">
              {/* Honest equalizer bands */}
              <div className="flex items-end gap-[3px] h-6 w-12 pb-0.5">
                {[...Array(6)].map((_, i) => (
                  <span
                    key={i}
                    ref={(el) => { barsRef.current[i] = el; }}
                    className="w-[3px] rounded-t-sm bg-accent inline-block origin-bottom transition-all duration-75"
                    style={{ height: '12%' }}
                  />
                ))}
              </div>

              {/* Streaming pre-auditions */}
              {previewUrl ? (
                <button
                  onClick={togglePlayPreview}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-accent/10 hover:bg-accent text-accent hover:text-bg font-mono text-[10px] uppercase transition-all duration-300 cursor-pointer border border-accent/20"
                >
                  {isPlayingPreview ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>Preview</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="font-mono text-[9px] uppercase text-text-muted opacity-60">
                  No preview
                </span>
              )}
            </div>

            {/* Total play statistics and directional details */}
            <div className="flex items-center justify-between border-t border-[rgba(184,173,158,0.08)] pt-3 text-[10px]">
              <div className="font-mono text-text-muted">
                {nowPlaying.userStats?.total && (
                  <>
                    Scrobbles:{' '}
                    <span className="text-text font-semibold">
                      {Number(nowPlaying.userStats.total).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
              <Link 
                href="/music" 
                onClick={() => { playClick(); setIsExpanded(false); }}
                className="flex items-center gap-0.5 font-mono text-accent hover:underline uppercase tracking-wide group"
              >
                <span>Full stats</span>
                <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
