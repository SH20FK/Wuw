'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/animations';
import { ArrowUpRight, Disc3, Headphones, Crown } from 'lucide-react';
import useLastFmStore from '@/store/useLastFmStore';
import { getArtistImage, getTrackImage } from '@/lib/utils';
import { lastfm } from '@/lib/lastfm-client';

/* ------------------------------------------------------------------ данные */

type Stats = { playcount: string; registered: string };

const EMPTY_STATS: Stats = { playcount: '—', registered: '—' };

const asList = (value: any) => (Array.isArray(value) ? value : value ? [value] : []);

const fmt = (value?: string | number) => {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('ru-RU').replace(/\u00A0/g, ' ');
};

const artistOf = (track: any) => track?.artist?.['#text'] || track?.artist?.name || '';

const initials = (name: string) => {
  const clean = (name || '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';
};

const formatToYekaterinburg = (utsString?: string) => {
  if (!utsString) return '';
  const uts = parseInt(utsString, 10);
  if (isNaN(uts)) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Yekaterinburg',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(uts * 1000));
};

/* ------------------------------------------------------------------ атомы */

/**
 * Обложка с честным фолбэком. Заглушки Last.fm отсекаются ещё в /api/lastfm,
 * поэтому здесь либо настоящая картинка, либо монограмма — без «звёздочек».
 */
function Cover({
  track,
  className = '',
  sizes = '240px',
  rounded = 'rounded-xl',
  priority = false,
}: {
  track: any;
  className?: string;
  sizes?: string;
  rounded?: string;
  priority?: boolean;
}) {
  const src = getTrackImage(track);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  return (
    <div className={`relative overflow-hidden bg-surface-2 ${rounded} ${className}`}>
      {src && !failed ? (
        <Image
          src={src}
          alt={track?.name ? `Обложка: ${track.name}` : 'Обложка трека'}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,#211d29,#0f0d13)]">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted/80">
            {initials(track?.name || '')}
          </span>
        </div>
      )}
    </div>
  );
}

function ArtistPhoto({
  artist,
  className = '',
  sizes = '200px',
  rounded = 'rounded-xl',
}: {
  artist: any;
  className?: string;
  sizes?: string;
  rounded?: string;
}) {
  const src = getArtistImage(artist);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  return (
    <div className={`relative overflow-hidden bg-surface-2 ${rounded} ${className}`}>
      {src && !failed ? (
        <Image
          src={src}
          alt={artist?.name ? `Фото: ${artist.name}` : 'Артист'}
          fill
          sizes={sizes}
          onError={() => setFailed(true)}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,#211d29,#0f0d13)]">
          <span className="font-display text-lg font-black text-text-muted">{initials(artist?.name || '')}</span>
        </div>
      )}
    </div>
  );
}

function MonoLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted ${className}`}>{children}</span>;
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(5, Math.min(100, (value / max) * 100)) : 0;
  return (
    <span className="block h-[3px] w-full overflow-hidden rounded-full bg-[rgba(184,173,158,0.1)]">
      <motion.span
        className="block h-full rounded-full bg-accent/70"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </span>
  );
}

const SPECTRUM = Array.from({ length: 16 }, (_, i) => ({
  dur: 0.7 + ((i * 7) % 5) * 0.09,
  delay: -(((i * 3) % 11) * 0.06),
}));

function Spectrum({ active }: { active: boolean }) {
  return (
    <div className="flex h-6 items-end gap-[3px]" aria-hidden="true">
      {SPECTRUM.map((preset, i) => (
        <span
          key={i}
          className={`h-full w-[3px] origin-bottom rounded-t bg-accent ${active ? 'spectrum-bar' : ''}`}
          style={
            active
              ? { animationDuration: `${preset.dur}s`, animationDelay: `${preset.delay}s` }
              : { transform: 'scaleY(0.16)' }
          }
        />
      ))}
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface ${className}`} />;
}

/* ------------------------------------------------------------------ hero */

function Hero({ recent }: { recent: any[] }) {
  const { nowPlaying } = useLastFmStore();
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [coverLoaded, setCoverLoaded] = useState(false);

  const isLive = nowPlaying?.['@attr']?.nowplaying === 'true';
  const track = nowPlaying || recent[0];
  const coverImg = getTrackImage(track);
  const pending = !track;

  useEffect(() => {
    setCoverLoaded(false);
  }, [coverImg]);

  useEffect(() => {
    lastfm('method=user.getinfo')
      .then((d) => {
        if (d?.user) {
          const year = new Date(d.user.registered.unixtime * 1000).getFullYear();
          setStats({ playcount: d.user.playcount, registered: year.toString() });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative isolate overflow-hidden pb-10 pt-28 md:pb-12 md:pt-36">
      {/* фон — та же обложка, размытая. Отдаём её маленьким размером и низким
          качеством: под blur-[64px] разницы не видно, а вес падает в разы. */}
      <div className="absolute inset-0 -z-10">
        {coverImg ? (
          <Image
            src={coverImg}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="320px"
            quality={40}
            className="scale-110 object-cover opacity-40 blur-[64px] saturate-125"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full opacity-40" style={{ background: 'radial-gradient(circle at 40% 30%, var(--color-accent), transparent 70%)' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-bg/50 via-bg/80 to-bg" />
      </div>

      <div className="mx-auto w-full max-w-[1240px] px-6">
        <div className="grid items-end gap-8 md:grid-cols-[300px_minmax(0,1fr)] md:gap-12">
          {/* конверт */}
          <div className="relative mx-auto w-[260px] md:mx-0 md:w-[300px]">
            <div
              className="absolute -inset-4 -z-10 rounded-[28px] opacity-45 blur-[44px] transition-colors duration-1000"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
            <div className="relative aspect-square overflow-hidden rounded-xl border border-[rgba(184,173,158,0.14)] shadow-[0_28px_70px_rgba(0,0,0,0.55)]">
              {pending ? (
                <div className="h-full w-full animate-pulse bg-surface" />
              ) : coverImg ? (
                <>
                  <Image
                    src={coverImg}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="300px"
                    className="scale-110 object-cover blur-md"
                    referrerPolicy="no-referrer"
                  />
                  <Image
                    src={coverImg}
                    alt={track?.name ? `Обложка: ${track.name}` : 'Обложка трека'}
                    fill
                    sizes="300px"
                    priority
                    onLoad={() => setCoverLoaded(true)}
                    onError={() => setCoverLoaded(false)}
                    className={`object-cover transition-opacity duration-700 ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
                    referrerPolicy="no-referrer"
                  />
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_30%_25%,#211d29,#0f0d13)] text-text-muted">
                  <Disc3 className="h-8 w-8" strokeWidth={1.5} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em]">без обложки</span>
                </div>
              )}
            </div>
          </div>

          {/* мета */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isLive ? 'animate-pulse bg-green-500' : 'bg-text-muted/50'}`} />
                <MonoLabel className="text-accent">{isLive ? 'Слушаю сейчас' : 'Последний трек'}</MonoLabel>
              </div>
              <Spectrum active={isLive} />
            </div>

            {pending ? (
              <div className="mt-4 flex flex-col gap-3">
                <Skeleton className="h-10 w-[72%]" />
                <Skeleton className="h-5 w-40" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={nowPlaying?.name || track?.name || 'track'}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={spring.snappy}
                >
                  <h1 className="mt-4 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-black leading-[1.03] tracking-tight text-text">
                    {track?.name}
                  </h1>
                  <a
                    href={track?.url || 'https://www.last.fm/user/SH20FK'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-body text-lg text-text-dim transition-colors hover:text-accent md:text-xl"
                  >
                    {artistOf(track) || '—'}
                  </a>
                  {track?.album?.['#text'] && (
                    <p className="mt-1 font-mono text-[11px] text-text-muted">{track.album['#text']}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[rgba(184,173,158,0.1)] pt-5">
              <div>
                <div className="font-display text-xl font-black leading-none text-text">{fmt(stats.playcount)}</div>
                <MonoLabel className="mt-1.5 block">прослушиваний</MonoLabel>
              </div>
              <div className="h-8 w-px bg-[rgba(184,173,158,0.14)]" />
              <div>
                <div className="font-display text-xl font-black leading-none text-text">{stats.registered}</div>
                <MonoLabel className="mt-1.5 block">аккаунт с</MonoLabel>
              </div>
            </div>
          </div>
        </div>

        {/* лента последних треков */}
        {recent.length > 0 && (
          <div className="mt-10 border-t border-[rgba(184,173,158,0.1)] pt-6">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <MonoLabel className="text-accent">/ Последние</MonoLabel>
              <MonoLabel>{recent.length} треков</MonoLabel>
            </div>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recent.slice(0, 12).map((t, i) => (
                <a
                  key={(t.url || t.name) + i}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-[104px] shrink-0"
                >
                  <Cover
                    track={t}
                    className="h-[104px] w-[104px] transition-transform duration-500 group-hover:-translate-y-1"
                    sizes="104px"
                  />
                  <span className="mt-2 block truncate font-body text-[11px] text-text-dim transition-colors group-hover:text-accent">
                    {t.name}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[9px] text-text-muted">
                    {artistOf(t)}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- топ треки */

function TopTracks({ overall, week, loading }: { overall: any[]; week: any[]; loading: boolean }) {
  const [period, setPeriod] = useState<'all' | 'week'>('all');
  const tracks = period === 'all' ? overall : week;
  const max = parseInt(tracks[0]?.playcount || '1', 10);

  return (
    <section className="mx-auto w-full max-w-[1240px] px-6 py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(184,173,158,0.1)] pb-4">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-text">
          Самые прослушиваемые
        </h2>

        <div className="relative flex items-center gap-1 rounded-full border border-[rgba(184,173,158,0.14)] p-1">
          {(
            [
              { id: 'all', label: 'всё время' },
              { id: 'week', label: 'неделя' },
            ] as const
          ).map((option) => {
            const active = period === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPeriod(option.id)}
                aria-pressed={active}
                className="relative rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
              >
                {active && (
                  <motion.span
                    layoutId="period-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={spring.snappy}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors duration-300 ${
                    active ? 'text-bg' : 'text-text-muted hover:text-text'
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-x-10 gap-y-1 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-[68px]" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-x-10 sm:grid-cols-2"
          >
            {tracks.length === 0 ? (
              <p className="col-span-full py-8 font-mono text-[11px] text-text-muted">
                За неделю пока пусто — Last.fm ещё не собрал статистику.
              </p>
            ) : (
              tracks.slice(0, 8).map((t, i) => (
                <motion.a
                  key={(t.url || t.name) + i}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex items-center gap-4 border-b border-[rgba(184,173,158,0.07)] py-3.5"
                >
                  <Cover track={t} className="h-11 w-11 shrink-0" sizes="44px" rounded="rounded-md" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="truncate font-body text-sm text-text transition-colors group-hover:text-accent">
                        {t.name}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-text-dim">{fmt(t.playcount)}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-text-muted">{artistOf(t)}</span>
                      <span className="w-[76px] shrink-0">
                        <Bar value={parseInt(t.playcount || '0', 10)} max={max} />
                      </span>
                    </span>
                  </span>
                </motion.a>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}

/* --------------------------------------------------------------- артисты */

function Artists({ artists, loading }: { artists: any[]; loading: boolean }) {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-6 py-12">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-[rgba(184,173,158,0.1)] pb-4">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-text">
          Те, кто чаще всех
        </h2>
        <Crown className="hidden h-4 w-4 text-accent sm:block" strokeWidth={1.5} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {artists.slice(0, 6).map((a, i) => (
            <a
              key={a.name + i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2.5"
            >
              <ArtistPhoto artist={a} className="aspect-square w-full" sizes="(max-width: 640px) 45vw, 200px" />
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate font-body text-sm text-text transition-colors group-hover:text-accent">
                  {a.name}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-text-muted">{fmt(a.playcount)}</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------- страница */

export default function MusicPage() {
  const [recent, setRecent] = useState<any[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [topTracksWeek, setTopTracksWeek] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState({ recent: true, tracks: true, artists: true });
  const nowPlaying = useLastFmStore((state) => state.nowPlaying);
  const nowKey = nowPlaying ? `${nowPlaying.name}-${artistOf(nowPlaying)}` : '';
  const mounted = useRef(true);
  const firstHistoryRun = useRef(true);

  // История перезапрашивается при смене трека, чтобы «последние» не отставали.
  // Первый заход идёт через клиентский кэш, смена трека — мимо него.
  useEffect(() => {
    mounted.current = true;
    const force = !firstHistoryRun.current;
    firstHistoryRun.current = false;

    lastfm<any>('method=user.getrecenttracks&limit=12', { force })
      .then((d) => {
        if (!mounted.current || !d) return;
        setRecent(asList(d?.recenttracks?.track));
      })
      .catch(() => {})
      .finally(() => mounted.current && setLoading((s) => ({ ...s, recent: false })));
    return () => {
      mounted.current = false;
    };
  }, [nowKey]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      lastfm<any>('method=user.gettoptracks&limit=8&period=overall'),
      lastfm<any>('method=user.gettoptracks&limit=8&period=7day'),
      lastfm<any>('method=user.gettopartists&limit=6&period=overall'),
    ])
      .then(([tracks, weekTracks, topArtists]) => {
        if (!alive) return;
        setTopTracks(asList(tracks?.toptracks?.track));
        setTopTracksWeek(asList(weekTracks?.toptracks?.track));
        setArtists(asList(topArtists?.topartists?.artist));
      })
      .catch(() => {})
      .finally(() => alive && setLoading({ recent: false, tracks: false, artists: false }));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-bg">
      <Hero recent={recent} />

      <TopTracks overall={topTracks} week={topTracksWeek} loading={loading.tracks} />
      <Artists artists={artists} loading={loading.artists} />

      <footer className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-3 border-t border-[rgba(184,173,158,0.1)] px-6 py-8 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
        <span className="inline-flex items-center gap-2">
          <Headphones className="h-3 w-3" strokeWidth={1.5} />
          sh20fk · last.fm
        </span>
        <a
          href="https://www.last.fm/user/SH20FK"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
        >
          профиль
          <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
        </a>
      </footer>
    </main>
  );
}