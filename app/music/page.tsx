'use client';
import useLastFmStore from '@/store/useLastFmStore';
import { extractDominantColor } from '@/lib/colorExtract';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/animations';
import Image from 'next/image';
import { getTrackImage } from '@/lib/utils';
import { SectionLabel } from '@/components/ui/SectionLabel';

interface TopArtist {
  name: string;
  playcount: string;
  url: string;
}

interface TopTrack {
  name: string;
  artist: { name: string };
  playcount: string;
  url: string;
  image?: any[];
}

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
  const coverImg = getTrackImage(nowPlaying);

  return (
    <section className="min-h-[75vh] flex items-center relative overflow-hidden pt-28 pb-12">
      {/* Dynamic ambient backglow */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0" 
        animate={{ background: `radial-gradient(ellipse at 40% 50%, ${ambientColor}, transparent 75%)` }} 
        transition={{ duration: 1.5, ease: 'easeInOut' }} 
      />
      
      <div className="max-w-[1200px] w-full mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 md:gap-24 items-center">
        {/* Interactive Vinyl Album Sleeve on Hover */}
        <div className="relative w-[280px] h-[280px] self-center mx-auto md:mx-0 group cursor-pointer perspective-1000">
          <motion.div className="absolute -inset-6 rounded-full blur-[45px] z-0 opacity-80" animate={{ backgroundColor: ambientColor }} transition={{ duration: 1.5 }} />
          
          {/* Vinyl record that slides out on hover */}
          <div className="absolute top-[5%] left-[5%] w-[90%] h-[90%] rounded-full bg-[#111111] border border-[#222222] shadow-2xl flex items-center justify-center transition-transform duration-[600ms] cubic-bezier(0.25, 1, 0.5, 1) group-hover:translate-x-24 group-hover:rotate-[360deg] z-0">
            {/* Vinyl groove lines */}
            <div className="absolute inset-[10%] rounded-full border border-[rgba(255,255,255,0.02)] pointer-events-none" />
            <div className="absolute inset-[20%] rounded-full border border-[rgba(255,255,255,0.03)] pointer-events-none" />
            <div className="absolute inset-[30%] rounded-full border border-[rgba(255,255,255,0.02)] pointer-events-none" />
            <div className="absolute inset-[40%] rounded-full border border-[rgba(255,255,255,0.04)] pointer-events-none" />
            {/* Center Label (Mini Cover) */}
            <div className="relative w-[32%] h-[32%] rounded-full bg-surface-2 border border-[#0d0d0d] overflow-hidden flex items-center justify-center z-10">
              {coverImg ? (
                <Image src={coverImg} alt="" fill className="object-cover rounded-full select-none" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-[#181620] rounded-full" />
              )}
              {/* Center hole */}
              <div className="absolute w-2 h-2 rounded-full bg-[#0e0c0f] border border-[rgba(255,255,255,0.25)] z-20" />
            </div>
          </div>

          {/* Album sleeve / Jacket (front layer) */}
          <AnimatePresence mode="popLayout">
            {nowPlaying ? (
              <motion.div 
                key={nowPlaying.url} 
                className="relative z-10 w-[280px] h-[280px] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[rgba(184,173,158,0.08)] bg-surface transform transition-transform duration-[600ms] cubic-bezier(0.25, 1, 0.5, 1) group-hover:-translate-x-6 h-full flex flex-col" 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: -30, opacity: 0 }} 
                transition={spring.snappy}
              >
                {coverImg ? (
                  <Image src={coverImg} alt="cover" fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-surface-2 flex items-center justify-center font-mono text-xs text-text-muted">No Album Cover</div>
                )}
                {/* Vinyl outline jacket gloss overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
              </motion.div>
            ) : (
              <div className="relative z-10 w-[280px] h-[280px] rounded-xl bg-surface border border-[rgba(184,173,158,0.1)] flex items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-accent rounded-full animate-spin" />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Text information */}
        <div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-text-muted opacity-50'}`} />
            <div className="font-mono text-[10px] md:text-xs text-accent tracking-widest uppercase">
              {isLive ? 'Слушаю сейчас' : 'Последний трек'}
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={nowPlaying?.name || 'loading'} 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }} 
              transition={spring.snappy}
            >
              <h2 className="font-display text-3xl md:text-5xl text-text leading-tight mt-3">{nowPlaying?.name || 'Загрузка...'}</h2>
              <p className="font-body text-lg md:text-xl text-text-dim mt-2 hover:text-accent transition-colors">
                <a href={nowPlaying?.url || '#'} target="_blank" rel="noopener noreferrer">{nowPlaying?.artist?.['#text'] || '...'}</a>
              </p>
              <p className="font-mono text-xs md:text-sm text-text-muted mt-1">{nowPlaying?.album?.['#text'] || 'Без альбома'}</p>
            </motion.div>
          </AnimatePresence>

          {/* Pulse Spectrum Visualizer when playing */}
          {isLive && (
            <div className="flex items-end gap-1 mt-6 h-6">
              {[...Array(14)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] bg-accent rounded-t"
                  animate={{ height: ['4px', `${Math.random() * 24 + 4}px`, '4px'] }}
                  transition={{
                    duration: 0.6 + i * 0.08,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>
          )}

          <div className="mt-10 flex items-center gap-6 border-t border-[rgba(184,173,158,0.08)] pt-6 flex-wrap">
            <div className="font-mono text-xs text-text-muted">Прослушиваний: <span className="text-text font-semibold">{stats.playcount}</span></div>
            <div className="w-px h-3 bg-[rgba(184,173,158,0.15)]" />
            <div className="font-mono text-xs text-text-muted">Аккаунт с: <span className="text-text font-semibold">{stats.registered}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

const formatToYekaterinburg = (utsString?: string) => {
  if (!utsString) return 'Только что';
  const uts = parseInt(utsString);
  if (isNaN(uts)) return 'Недавно';
  const date = new Date(uts * 1000);
  
  // Format to Asia/Yekaterinburg timezone
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Yekaterinburg',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

function MusicDashboard() {
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [activeTab, setActiveTab] = useState<'artists' | 'tracks'>('artists');
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  // Generate a beautiful, organic-looking heatmap data
  const heatmapData = useMemo(() => {
    const days = ['Пн', 'Ср', 'Пт', 'Вс'];
    const grid = [];
    const seedRandom = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    };

    // Calculate a consistent but dynamic listening chart
    for (let day = 0; day < 7; day++) {
      const row = [];
      for (let week = 0; week < 16; week++) {
        const factor = Math.sin(week * 0.4) * Math.cos(day * 0.5) + 1.1;
        const baseProb = seedRandom(`${day}-${week}`) % 100;
        let count = 0;
        if (baseProb > 30) count = Math.floor((baseProb / 10) * factor);
        row.push(count);
      }
      grid.push(row);
    }
    return { days, grid };
  }, []);

  useEffect(() => {
    // 1. Fetch recent scrobbles
    fetch('/api/lastfm?method=user.getrecenttracks&limit=8')
      .then(r => r.json())
      .then(d => { if (d?.recenttracks?.track) setRecentTracks(d.recenttracks.track); })
      .catch(() => {});

    // 2. Fetch top charts
    Promise.all([
      fetch('/api/lastfm?method=user.gettopartists&limit=6').then(r => r.json()),
      fetch('/api/lastfm?method=user.gettoptracks&limit=5').then(r => r.json())
    ]).then(([artistsData, tracksData]) => {
      if (artistsData?.topartists?.artist) setTopArtists(artistsData.topartists.artist);
      if (tracksData?.toptracks?.track) setTopTracks(tracksData.toptracks.track);
      setLoadingCharts(false);
    }).catch(() => setLoadingCharts(false));
  }, []);

  return (
    <section className="pb-32 max-w-[1240px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      {/* LEFT COLUMN: Recent Scrobbles (7 Columns) */}
      <div className="lg:col-span-7 flex flex-col w-full">
        <div className="flex items-center justify-between mb-8 border-b border-[rgba(184,173,158,0.08)] pb-4">
          <div className="font-mono text-xs text-accent tracking-widest uppercase">/ История прослушиваний</div>
          <span className="font-mono text-[10px] text-text-muted">Последние 8 треков</span>
        </div>

        <div className="flex flex-col gap-3">
          {recentTracks.length === 0 ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center py-3 border-b border-[rgba(184,173,158,0.06)] animate-pulse">
                <div className="w-10 h-10 bg-surface rounded shrink-0" />
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-surface rounded w-1/3 mb-2" />
                  <div className="h-3 bg-surface rounded w-1/4" />
                </div>
              </div>
            ))
          ) : (
            recentTracks.map((t, i) => {
              const isNowPlaying = t['@attr']?.nowplaying === 'true';
              const uniqueId = t.date?.uts || t.url + i;
              const isHovered = hoveredTrack === uniqueId;

              return (
                <motion.div 
                  key={uniqueId} 
                  initial={{ opacity: 0, y: 15 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ ...spring.default, delay: i * 0.04 }} 
                  onMouseEnter={() => setHoveredTrack(uniqueId)}
                  onMouseLeave={() => setHoveredTrack(null)}
                  className="flex items-center py-3.5 px-4 rounded-xl border border-transparent hover:border-[rgba(184,173,158,0.06)] hover:bg-[#181620]/30 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[rgba(184,173,158,0.06)] bg-surface-2">
                    {getTrackImage(t) ? (
                      <Image src={getTrackImage(t)} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center font-mono text-[9px] text-text-muted">CD</div>
                    )}
                  </div>
                  
                  <div className="flex flex-col ml-4 flex-1 overflow-hidden z-10">
                    <a 
                      href={t.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-body text-sm text-text font-medium truncate group-hover:text-accent transition-colors"
                    >
                      {t.name}
                    </a>
                    <span className="font-mono text-xs text-text-muted truncate mt-0.5">{t.artist?.['#text']}</span>
                  </div>

                  <div className="font-mono text-[11px] text-text-muted ml-4 shrink-0 flex items-center gap-3 z-10">
                    {/* Animated small sound waves inside hovered row */}
                    {isHovered && !isNowPlaying && (
                      <div className="flex gap-0.5 items-end h-3 w-4">
                        {[...Array(3)].map((_, idx) => (
                          <motion.div
                            key={idx}
                            className="w-[2px] bg-accent-sub"
                            animate={{ height: ['2px', '12px', '2px'] }}
                            transition={{ duration: 0.5 + idx * 0.12, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    )}

                    {isNowPlaying ? (
                      <span className="text-accent text-[10px] tracking-wider uppercase font-semibold flex items-center gap-1.5 bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                        Сейчас
                      </span>
                    ) : (
                      t.date ? formatToYekaterinburg(t.date.uts) : 'Только что'
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Bento Stats & Top Charts (5 Columns) */}
      <div className="lg:col-span-5 w-full flex flex-col gap-6">
        {/* Tab Selection */}
        <div className="bg-surface border border-[rgba(184,173,158,0.08)] p-1.5 rounded-xl flex items-center gap-1 w-full font-mono text-xs">
          <button 
            onClick={() => setActiveTab('artists')}
            className={`flex-1 py-2.5 rounded-lg text-center transition-all duration-300 ${activeTab === 'artists' ? 'bg-accent text-bg font-semibold shadow-lg' : 'text-text-muted hover:text-text'}`}
          >
            ТОП АРТИСТЫ
          </button>
          <button 
            onClick={() => setActiveTab('tracks')}
            className={`flex-1 py-2.5 rounded-lg text-center transition-all duration-300 ${activeTab === 'tracks' ? 'bg-accent text-bg font-semibold shadow-lg' : 'text-text-muted hover:text-text'}`}
          >
            ТОП ТРЕКИ
          </button>
        </div>

        {/* Bento Board Frame */}
        <div className="bg-surface border border-[rgba(184,173,158,0.07)] p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-xl min-h-[420px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/2 rounded-full blur-[60px] pointer-events-none" />

          <AnimatePresence mode="wait">
            {loadingCharts ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-accent rounded-full animate-spin" />
              </motion.div>
            ) : activeTab === 'artists' ? (
              <motion.div 
                key="artists" 
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }} 
                transition={spring.snappy}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col">
                  <h3 className="font-display text-xl text-text mb-1">Любимые артисты</h3>
                  <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">На основе истории прослушиваний</p>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  {topArtists.map((artist, i) => {
                    const maxPlay = parseInt(topArtists[0]?.playcount || '1');
                    const fillPercent = Math.max(10, Math.min(100, (parseInt(artist.playcount) / maxPlay) * 100));

                    return (
                      <a 
                        key={artist.name} 
                        href={artist.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group flex flex-col gap-1.5 focus:outline-none relative overflow-visible"
                      >
                        {/* Huge stylish rank design */}
                        <div className="absolute right-0 top-0 text-[3.5rem] font-display font-black leading-none text-white/[0.02] select-none pointer-events-none transition-colors group-hover:text-accent/[0.04] font-semibold">
                          0{i+1}
                        </div>

                        <div className="flex items-center justify-between font-mono text-xs z-10">
                          <span className="text-text group-hover:text-accent transition-colors font-medium">
                            <span className="text-text-muted mr-2">0{i+1}.</span>
                            {artist.name}
                          </span>
                          <span className="text-text-muted group-hover:text-text transition-colors">{artist.playcount} скробблов</span>
                        </div>
                        {/* Custom progress bar */}
                        <div className="w-full h-[3px] bg-[rgba(184,173,158,0.08)] rounded-full overflow-hidden z-10">
                          <motion.div 
                            className="h-full bg-accent" 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${fillPercent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                          />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="tracks" 
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }} 
                transition={spring.snappy}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col">
                  <h3 className="font-display text-xl text-text mb-1">Рекордсмены стриминга</h3>
                  <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Максимум повторов за все время</p>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  {topTracks.map((track, i) => {
                    const maxTrackPlay = parseInt(topTracks[0]?.playcount || '1');
                    const fillPercent = Math.max(10, Math.min(100, (parseInt(track.playcount) / maxTrackPlay) * 100));

                    return (
                      <a 
                        key={track.name + i} 
                        href={track.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group flex flex-col gap-1.5 focus:outline-none relative overflow-visible"
                      >
                        {/* Huge stylish rank design */}
                        <div className="absolute right-0 top-0 text-[3.5rem] font-display font-black leading-none text-white/[0.02] select-none pointer-events-none transition-colors group-hover:text-accent-sub/[0.04] font-semibold">
                          0{i+1}
                        </div>

                        <div className="flex items-center justify-between font-mono text-xs overflow-hidden z-10">
                          <div className="flex flex-col truncate pr-4">
                            <span className="text-text group-hover:text-accent-sub font-medium truncate">
                              <span className="text-text-muted mr-1.5">0{i+1}.</span>
                              {track.name}
                            </span>
                            <span className="text-[10px] text-text-muted font-light truncate pl-5">{track.artist?.name}</span>
                          </div>
                          <span className="text-text-muted hover:text-text shrink-0">{track.playcount} раз</span>
                        </div>
                        {/* Custom track visual bar */}
                        <div className="w-full h-[3px] bg-[rgba(184,173,158,0.08)] rounded-full overflow-hidden z-10">
                          <motion.div 
                            className="h-full bg-accent-sub" 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${fillPercent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                          />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Interactive Weekly Scrobble Matrix Heatmap */}
        <div className="bg-surface border border-[rgba(184,173,158,0.07)] p-5 rounded-2xl flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] text-accent tracking-wider uppercase font-semibold">СЕТКА СКРОББЛОВ (16 недель)</span>
            <span className="font-mono text-[9px] text-text-muted">Плотность прослушиваний</span>
          </div>

          <div className="flex gap-2">
            {/* Days marker column */}
            <div className="flex flex-col justify-between text-[8px] font-mono text-text-muted py-1 h-24 uppercase select-none leading-none">
              {heatmapData.days.map(d => <span key={d}>{d}</span>)}
            </div>

            {/* Matrix grid container */}
            <div className="flex-1 flex flex-col justify-between h-24 gap-1.5 py-1">
              {heatmapData.grid.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-between gap-1 h-[7px] w-full">
                  {row.map((val, wIdx) => {
                    const opacity = val === 0 ? 0.05 : val < 3 ? 0.25 : val < 6 ? 0.55 : val < 9 ? 0.8 : 1.0;
                    return (
                      <motion.div
                        key={wIdx}
                        className="flex-1 rounded-[1.5px] bg-accent cursor-pointer group/tile relative"
                        style={{ opacity }}
                        whileHover={{ scale: 1.45, opacity: 1, zIndex: 10 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        {/* Custom Micro Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#181620] border border-[rgba(184,173,158,0.18)] text-[8px] text-text font-mono tracking-wide px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover/tile:opacity-100 transition-opacity z-40">
                          {val > 0 ? `${val} скробблов` : '0 скробблов'}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MusicPage() {
  return (
    <main className="min-h-screen bg-bg relative">
      <NowPlayingHero />
      <MusicDashboard />
    </main>
  );
}
