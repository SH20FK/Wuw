'use client';
import useLastFmStore from '@/store/useLastFmStore';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/animations';
import Image from 'next/image';
import { getTrackImage } from '@/lib/utils';
import { Crown, Headphones, Disc3, MoveUpRight } from 'lucide-react';

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

interface WeeklyTrack {
  name: string;
  artist: { '#text': string };
  playcount: string;
  url: string;
  image?: any[];
}

const SPECTRUM = Array.from({ length: 14 }, (_, i) => ({
  dur: 0.7 + ((i * 7) % 5) * 0.09,
  delay: -(((i * 3) % 11) * 0.06),
}));

const formatToYekaterinburg = (utsString?: string) => {
  if (!utsString) return '';
  const uts = parseInt(utsString);
  if (isNaN(uts)) return '';
  const date = new Date(uts * 1000);

  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Yekaterinburg',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/* ------------------------------------------------------------------ hero */

function NowPlayingHero() {
  const { nowPlaying, accentColor } = useLastFmStore();
  const [stats, setStats] = useState({ playcount: '...', registered: '...' });
  const [coverLoaded, setCoverLoaded] = useState(false);

  useEffect(() => {
    setCoverLoaded(false);
  }, [nowPlaying?.url]);

  useEffect(() => {
    fetch('/api/lastfm?method=user.getinfo')
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) {
          const year = new Date(d.user.registered.unixtime * 1000).getFullYear();
          setStats({ playcount: d.user.playcount, registered: year.toString() });
        }
      })
      .catch(() => {});
  }, []);

  const isLive = nowPlaying?.['@attr']?.nowplaying === 'true';
  const coverImg = getTrackImage(nowPlaying);

  return (
    <section className="relative overflow-hidden pt-28 pb-14 md:pb-20">
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.18]"
        animate={{ background: `radial-gradient(ellipse at 38% 45%, ${accentColor}, transparent 72%)` }}
        transition={{ duration: 1.6, ease: 'easeInOut' }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-12 px-6 md:grid-cols-[300px_1fr] md:gap-16">
        {/* sleeve */}
        <div className="group relative mx-auto h-[300px] w-[300px] md:mx-0">
          <motion.div
            className="absolute -inset-6 z-0 rounded-full opacity-40 blur-[50px]"
            animate={{ backgroundColor: accentColor }}
            transition={{ duration: 1.6 }}
          />

          <div className="absolute left-[6%] top-[5%] z-0 flex h-[88%] w-[88%] items-center justify-center rounded-full border border-[#222] bg-[#111] shadow-2xl transition-transform duration-[700ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-x-24 group-hover:rotate-[360deg]">
            <div className="pointer-events-none absolute inset-[10%] rounded-full border border-white/[0.02]" />
            <div className="pointer-events-none absolute inset-[22%] rounded-full border border-white/[0.03]" />
            <div className="pointer-events-none absolute inset-[34%] rounded-full border border-white/[0.04]" />
            <div className="relative z-10 flex h-[32%] w-[32%] items-center justify-center overflow-hidden rounded-full border border-[#0d0d0d] bg-surface-2">
              {coverImg ? (
                <Image src={coverImg} alt="" fill sizes="96px" className="select-none rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-full w-full rounded-full bg-[#181620]" />
              )}
              <div className="absolute z-20 h-2 w-2 rounded-full border border-white/25 bg-[#0e0c0f]" />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {nowPlaying ? (
              <motion.div
                key={nowPlaying.url || nowPlaying.name}
                className="relative z-10 flex h-[300px] w-[300px] flex-col overflow-hidden rounded-xl border border-[rgba(184,173,158,0.08)] bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-[700ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-x-6"
                initial={{ y: 26, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -26, opacity: 0 }}
                transition={spring.snappy}
              >
                {coverImg ? (
                  <>
                    {/* 32px variant usually sits in cache from the floating player: instant blurred base */}
                    <Image
                      src={coverImg}
                      alt=""
                      aria-hidden="true"
                      fill
                      unoptimized
                      sizes="32px"
                      className="scale-110 object-cover blur-md"
                      referrerPolicy="no-referrer"
                    />
                    <Image
                      src={coverImg}
                      alt="Обложка альбома"
                      fill
                      unoptimized
                      sizes="300px"
                      priority
                      onLoad={() => setCoverLoaded(true)}
                      className={`object-cover transition-opacity duration-500 ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
                      referrerPolicy="no-referrer"
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-2 text-text-muted">
                    <Disc3 className="h-8 w-8" strokeWidth={1.5} />
                    <span className="font-mono text-[10px] uppercase tracking-widest">Без обложки</span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent" />
              </motion.div>
            ) : (
              <div className="relative z-10 flex h-[300px] w-[300px] items-center justify-center rounded-xl border border-[rgba(184,173,158,0.1)] bg-surface">
                <div className="h-9 w-9 animate-spin rounded-full border-t-2 border-accent" />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${isLive ? 'animate-pulse bg-green-500' : 'bg-text-muted opacity-50'}`} />
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
              {isLive ? 'Слушаю сейчас' : 'Последний трек'}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={nowPlaying?.name || 'loading'}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={spring.snappy}
            >
              <h1 className="mt-3 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-black leading-[1.05] text-text">
                {nowPlaying?.name || 'Загрузка...'}
              </h1>
              <a
                href={nowPlaying?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-body text-lg text-text-dim transition-colors hover:text-accent md:text-xl"
              >
                {nowPlaying?.artist?.['#text'] || '...'}
              </a>
              <p className="mt-1 font-mono text-xs text-text-muted">{nowPlaying?.album?.['#text'] || 'Без альбома'}</p>
            </motion.div>
          </AnimatePresence>

          {nowPlaying && (
            <div className="mt-6 flex h-6 items-end gap-1" aria-hidden="true">
              {SPECTRUM.map((preset, i) => {
                const active = !!(isLive || nowPlaying?.isPlaying);
                return (
                  <span
                    key={i}
                    className={`h-full w-[3px] origin-bottom rounded-t bg-accent ${active ? 'spectrum-bar' : ''}`}
                    style={
                      active
                        ? { animationDuration: `${preset.dur}s`, animationDelay: `${preset.delay}s` }
                        : { transform: 'scaleY(0.16)' }
                    }
                  />
                );
              })}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-[rgba(184,173,158,0.08)] pt-6">
            <div className="font-mono text-xs text-text-muted">
              Прослушиваний: <span className="font-semibold text-text">{stats.playcount}</span>
            </div>
            <div className="h-3 w-px bg-[rgba(184,173,158,0.15)]" />
            <div className="font-mono text-xs text-text-muted">
              Аккаунт с: <span className="font-semibold text-text">{stats.registered}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- history */

function History() {
  const [tracks, setTracks] = useState<any[]>([]);
  const nowPlaying = useLastFmStore((state) => state.nowPlaying);
  const nowPlayingKey = nowPlaying ? `${nowPlaying.name}-${nowPlaying.artist?.['#text']}` : '';

  useEffect(() => {
    let alive = true;
    fetch('/api/lastfm?method=user.getrecenttracks&limit=8')
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.recenttracks?.track) setTracks(d.recenttracks.track);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [nowPlayingKey]);

  return (
    <div className="flex w-full flex-col lg:col-span-7">
      <div className="mb-7 flex items-center justify-between border-b border-[rgba(184,173,158,0.08)] pb-4">
        <div className="font-mono text-xs uppercase tracking-widest text-accent">/ История прослушиваний</div>
        <span className="font-mono text-[10px] text-text-muted">Последние 8 треков</span>
      </div>

      <div className="flex flex-col gap-1">
        {tracks.length === 0
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="flex animate-pulse items-center py-3">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-surface" />
                <div className="ml-4 flex-1">
                  <div className="mb-2 h-4 w-1/3 rounded bg-surface" />
                  <div className="h-3 w-1/4 rounded bg-surface" />
                </div>
              </div>
            ))
          : tracks.map((t, i) => {
              // Only the track that matches the live store entry gets the "now" badge.
              // A stale API list can otherwise mark an old row as playing.
              const isNowPlaying =
                nowPlayingKey !== '' && `${t.name}-${t.artist?.['#text']}` === nowPlayingKey;
              const cover = getTrackImage(t);

              return (
                <motion.div
                  key={(t.date?.uts || t.url) + i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring.default, delay: i * 0.03 }}
                  className="group flex items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-[rgba(184,173,158,0.07)] hover:bg-[#181620]/30"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[rgba(184,173,158,0.06)] bg-surface-2">
                    {cover ? (
                      <Image src={cover} alt="" fill sizes="48px" className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-text-muted">
                        <Disc3 className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-body text-sm font-medium text-text transition-colors group-hover:text-accent"
                    >
                      {t.name}
                    </a>
                    <span className="mt-0.5 truncate font-mono text-xs text-text-muted">{t.artist?.['#text']}</span>
                  </div>

                  <div className="ml-2 flex shrink-0 items-center">
                    {isNowPlaying ? (
                      <span className="flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                        </span>
                        Сейчас
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-text-muted">{formatToYekaterinburg(t.date?.uts)}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- charts */

function Charts() {
  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  const [activeTab, setActiveTab] = useState<'artists' | 'tracks'>('artists');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/lastfm?method=user.gettopartists&limit=6').then((r) => r.json()),
      fetch('/api/lastfm?method=user.gettoptracks&limit=5').then((r) => r.json()),
    ])
      .then(([artistsData, tracksData]) => {
        if (artistsData?.topartists?.artist) setTopArtists(artistsData.topartists.artist);
        if (tracksData?.toptracks?.track) setTopTracks(tracksData.toptracks.track);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rows = activeTab === 'artists' ? topArtists : topTracks;

  return (
    <div className="flex w-full flex-col lg:col-span-5">
      <div className="mb-6 flex w-full items-center gap-1 rounded-xl border border-[rgba(184,173,158,0.08)] bg-surface p-1.5 font-mono text-xs">
        <button
          onClick={() => setActiveTab('artists')}
          className={`flex-1 rounded-lg py-2.5 text-center transition-colors duration-300 ${
            activeTab === 'artists' ? 'bg-accent font-semibold text-bg' : 'text-text-muted hover:text-text'
          }`}
        >
          ТОП АРТИСТЫ
        </button>
        <button
          onClick={() => setActiveTab('tracks')}
          className={`flex-1 rounded-lg py-2.5 text-center transition-colors duration-300 ${
            activeTab === 'tracks' ? 'bg-accent font-semibold text-bg' : 'text-text-muted hover:text-text'
          }`}
        >
          ТОП ТРЕКИ
        </button>
      </div>

      <div className="relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[rgba(184,173,158,0.07)] bg-surface p-6">
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent/[0.04] blur-[60px]" />

        <div className="mb-5 flex items-center gap-2.5">
          {activeTab === 'artists' ? (
            <Crown className="h-4 w-4 text-accent" strokeWidth={1.5} />
          ) : (
            <Headphones className="h-4 w-4 text-accent" strokeWidth={1.5} />
          )}
          <h2 className="font-display text-lg font-bold text-text">
            {activeTab === 'artists' ? 'Любимые артисты' : 'Самые прослушиваемые'}
          </h2>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab + (loading ? '-loading' : '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-1 flex-col gap-2"
          >
            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-t-2 border-accent" />
              </div>
            ) : (
              rows.map((row: any, i: number) => {
                const max = parseInt(rows[0]?.playcount || '1');
                const pct = Math.max(10, Math.min(100, (parseInt(row.playcount) / max) * 100));
                const name = row.name;
                const sub = activeTab === 'artists' ? `#${i + 1} место` : row.artist?.name;

                return (
                  <a
                    key={name + i}
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-2.5 transition-colors hover:bg-[#181620]/60"
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-r-lg bg-accent/[0.05] transition-[width] duration-700"
                      style={{ width: `${pct}%` }}
                    />
                    <span className="relative z-10 flex min-w-0 items-center gap-3">
                      <span className="w-6 shrink-0 font-mono text-[10px] text-accent/70">{String(i + 1).padStart(2, '0')}</span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-body text-sm text-text transition-colors group-hover:text-accent">{name}</span>
                        <span className="truncate font-mono text-[9px] uppercase tracking-wider text-text-muted">{sub}</span>
                      </span>
                    </span>
                    <span className="relative z-10 shrink-0 font-mono text-xs text-text-dim">
                      <span className="font-semibold text-accent">{row.playcount}</span>{' '}
                      <span className="text-[10px] text-text-muted">{activeTab === 'artists' ? 'скр.' : 'раз'}</span>
                    </span>
                  </a>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- weekly */

function WeeklyTop() {
  const [tracks, setTracks] = useState<WeeklyTrack[]>([]);

  useEffect(() => {
    fetch('/api/lastfm?method=user.getweeklytrackchart')
      .then((r) => r.json())
      .then((d) => {
        const list = d?.weeklytrackchart?.track;
        if (Array.isArray(list)) setTracks(list.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  if (tracks.length === 0) return null;
  const max = parseInt(tracks[0]?.playcount || '1');

  return (
    <section className="mx-auto w-full max-w-[1240px] px-6 pb-28">
      <div className="mb-6 flex items-baseline justify-between border-b border-[rgba(184,173,158,0.08)] pb-4">
        <div className="font-mono text-xs uppercase tracking-widest text-accent">/ Топ за неделю</div>
        <span className="font-mono text-[10px] text-text-muted">по скробблам Last.fm</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {tracks.map((t, i) => {
          const cover = getTrackImage(t);
          const pct = Math.max(10, Math.min(100, (parseInt(t.playcount) / max) * 100));

          return (
            <a
              key={t.name + i}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 rounded-xl border border-[rgba(184,173,158,0.07)] bg-surface p-3 transition-colors hover:border-[rgba(184,173,158,0.16)]"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-2">
                {cover ? (
                  <Image
                    src={cover}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 45vw, 220px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-text-muted">
                    <Disc3 className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold text-bg">
                  {i + 1}
                </span>
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="truncate font-body text-sm text-text transition-colors group-hover:text-accent">{t.name}</span>
                <span className="truncate font-mono text-[10px] text-text-muted">{t.artist?.['#text']}</span>
              </div>

              <div className="mt-auto flex items-center gap-2">
                <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-[rgba(184,173,158,0.08)]">
                  <span className="block h-full rounded-full bg-accent/70" style={{ width: `${pct}%` }} />
                </span>
                <span className="font-mono text-[10px] text-text-dim">{t.playcount}</span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- page */

export default function MusicPage() {
  return (
    <main className="relative min-h-screen bg-bg">
      <NowPlayingHero />

      <section className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-start gap-12 px-6 pb-16 lg:grid-cols-12 lg:gap-10">
        <History />
        <Charts />
      </section>

      <WeeklyTop />

      <footer className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 pb-10 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
        <span>sh20fk · last.fm</span>
        <a href="https://www.last.fm/user/SH20FK" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-accent">
          профиль
          <MoveUpRight className="h-3 w-3" strokeWidth={1.5} />
        </a>
      </footer>
    </main>
  );
}