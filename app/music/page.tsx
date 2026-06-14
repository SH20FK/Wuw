'use client';
import useLastFmStore from '@/store/useLastFmStore';
import { extractDominantColor } from '@/lib/colorExtract';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { spring } from '@/lib/animations';
import Image from 'next/image';

function NowPlayingHero() {
  const { nowPlaying } = useLastFmStore();
  const [ambientColor, setAmbientColor] = useState('rgba(14, 12, 15, 0)');
  const [stats, setStats] = useState({ playcount: '...', registered: '...' });

  useEffect(() => {
    if (nowPlaying?.image) {
      const imgUrl = nowPlaying.image[3]['#text'] || nowPlaying.image[2]['#text'];
      if (imgUrl) extractDominantColor(imgUrl).then(setAmbientColor);
    }
  }, [nowPlaying]);

  useEffect(() => {
    fetch('/api/lastfm?method=user.getinfo')
      .then(r => r.json())
      .then(d => {
        if (d?.user) {
          const year = new Date(d.user.registered.unixtime * 1000).getFullYear();
          setStats({ playcount: d.user.playcount, registered: year.toString() });
        }
      }).catch(() => {});
  }, []);

  const isLive = nowPlaying?.['@attr']?.nowplaying === 'true';

  return (
    <section className="min-h-[80vh] flex items-center relative overflow-hidden pt-24 pb-12">
      <motion.div className="absolute inset-0 pointer-events-none z-0" animate={{ background: `radial-gradient(ellipse at 30% 50%, ${ambientColor}, transparent 70%)` }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
      <div className="max-w-[1200px] w-full mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 md:gap-24 items-center">
        <div className="relative w-[280px]">
          <motion.div className="absolute -inset-5 rounded-full blur-[40px] z-0" animate={{ backgroundColor: ambientColor }} transition={{ duration: 1.5 }} />
          <AnimatePresence mode="popLayout">
            {nowPlaying ? (
              <motion.div key={nowPlaying.url} className="relative z-10 w-[280px] h-[280px] rounded-2xl overflow-hidden shadow-2xl" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} transition={spring.snappy}>
                <Image src={nowPlaying.image[3]['#text'] || nowPlaying.image[2]['#text']} alt="cover" fill className="object-cover" />
              </motion.div>
            ) : (
              <div className="relative z-10 w-[280px] h-[280px] rounded-2xl bg-surface border border-[rgba(184,173,158,0.1)] flex items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-accent rounded-full animate-spin" />
              </div>
            )}
          </AnimatePresence>
          {nowPlaying && <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="absolute inset-0 z-20 pointer-events-none border border-[rgba(255,255,255,0.1)] rounded-2xl" />}
        </div>
        <div>
          <div className="font-mono text-xs text-accent tracking-wider uppercase">{isLive ? 'NOW PLAYING' : 'ПОСЛЕДНЕЕ ПРОСЛУШИВАНИЕ'}</div>
          <AnimatePresence mode="wait">
            <motion.div key={nowPlaying?.name || 'loading'} initial={{ opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }} animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }} exit={{ opacity: 0, clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }} transition={spring.snappy}>
              <h2 className="font-display text-4xl md:text-5xl text-text leading-tight mt-4">{nowPlaying?.name || 'Loading...'}</h2>
              <p className="font-body text-xl text-text-dim mt-2">{nowPlaying?.artist?.['#text'] || '...'}</p>
              <p className="font-mono text-sm text-text-muted mt-1">{nowPlaying?.album?.['#text'] || 'Unknown Album'}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex items-center gap-3">
            <div className={isLive ? 'w-2 h-2 rounded-full bg-red-500 animate-pulse' : 'w-2 h-2 rounded-full bg-surface-2'} />
            <div className="font-mono text-xs text-text-muted uppercase tracking-wide">{isLive ? 'Live · Last.fm' : 'Paused'}</div>
          </div>
          <div className="mt-12 flex items-center gap-6 border-t border-[rgba(184,173,158,0.1)] pt-6 flex-wrap">
            <div className="font-mono text-xs text-text-muted">Scrobbles: <span className="text-text">{stats.playcount}</span></div>
            <div className="w-px h-4 bg-[rgba(184,173,158,0.2)]" />
            <div className="font-mono text-xs text-text-muted">Слушаю с: <span className="text-text">{stats.registered}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RecentTracks() {
  const [tracks, setTracks] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/lastfm?method=user.getrecenttracks&limit=10')
      .then(r => r.json())
      .then(d => { if (d?.recenttracks?.track) setTracks(d.recenttracks.track); });
  }, []);
  return (
    <section className="mb-24 mt-12 max-w-[800px] w-full mx-auto px-6">
      <div className="font-mono text-xs text-accent tracking-wider uppercase mb-8">/ Недавнее</div>
      <div className="flex flex-col">
        {tracks.map((t, i) => (
          <motion.div key={t.date?.uts || t.url + i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...spring.default, delay: i * 0.03 }} className="flex items-center py-3 border-b border-[rgba(184,173,158,0.06)] group">
            <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
              {t.image?.[0]?.['#text'] ? <Image src={t.image[1]['#text'] || t.image[0]['#text']} alt="" fill className="object-cover" /> : <div className="w-full h-full bg-surface-2" />}
            </div>
            <div className="flex flex-col ml-4 flex-1 overflow-hidden">
              <span className="font-body text-sm text-text truncate group-hover:text-accent transition-colors">{t.name}</span>
              <span className="font-mono text-xs text-text-muted truncate">{t.artist?.['#text']}</span>
            </div>
            <div className="font-mono text-xs text-text-muted ml-4 shrink-0 flex items-center gap-2">
              {t['@attr']?.nowplaying === 'true' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
              {t.date ? t.date['#text'] : 'Прямо сейчас'}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function MusicPage() {
  return (
    <main className="min-h-screen bg-bg relative">
      <NowPlayingHero />
      <RecentTracks />
    </main>
  );
}
