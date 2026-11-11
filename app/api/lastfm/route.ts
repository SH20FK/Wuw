import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_KEY = process.env.LASTFM_API_KEY;
const USER = 'SH20FK';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

// Каждый внешний сервис получает жёсткий таймаут, чтобы один зависший провайдер
// не блокировал выдачу обложек на десятки секунд (см. enrich-логику ниже).
const UPSTREAM_TIMEOUT_MS = 2500;
const fetchWithTimeout = (
  url: string,
  init: RequestInit = {},
  timeoutMs = UPSTREAM_TIMEOUT_MS
) => fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });

function isMissingOrPlaceholderCover(url: string | null | undefined): boolean {
  if (!url) return true;
  const u = url.toLowerCase();
  return (
    u.includes('default_image') ||
    u.includes('/2.0/s/') ||
    u.includes('lastfm_avatar') ||
    u.includes('static/images') ||
    u.includes('noimage') ||
    u.includes('no-image') ||
    u.includes('placeholder') ||
    u.includes('2a96cbd30df375e2f75a98af74f1ed0a') ||
    u.includes('2a96cbd8b46e442fc41c2b86b821562f') ||
    u === ''
  );
}

function cleanString(str: string): string {
  if (!str) return '';
  return str
    .replace(/\(feat\.[^)]*\)/gi, '')
    .replace(/\[feat\.[^\]]*\]/gi, '')
    .replace(/\b(feat|ft|featuring)\b\.?/gi, '')
    .replace(/\(prod\.[^)]*\)/gi, '')
    .replace(/\[prod\.[^\]]*\]/gi, '')
    .replace(/\(remix[^)]*\)/gi, '')
    .replace(/\[remix[^\]]*\]/gi, '')
    .replace(/\(cover[^)]*\)/gi, '')
    .replace(/\[cover[^\]]*\]/gi, '')
    .replace(/\(studio version\)/gi, '')
    .replace(/\(live version\)/gi, '')
    .replace(/\(acoustic version\)/gi, '')
    .replace(/\(deluxe[^)]*\)/gi, '')
    .replace(/\(original[^)]*\)/gi, '')
    .replace(/\b(single|ep|lp|album version)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchLastFmTrackInfoCover(artist: string, trackName: string): Promise<string | null> {
  try {
    if (!API_KEY) return null;
    const url = `${BASE_URL}?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(trackName)}&format=json`;
    const res = await fetchWithTimeout(url, { next: { revalidate: 86400 } });
    if (res.ok) {
      const data = await res.json();
      const albumImages = data?.track?.album?.image;
      if (albumImages && Array.isArray(albumImages)) {
        const bestImage = albumImages[albumImages.length - 1];
        if (bestImage && bestImage['#text'] && !isMissingOrPlaceholderCover(bestImage['#text'])) {
          return bestImage['#text'];
        }
      }
    }
  } catch (e) {
    console.error('Last.fm track.getInfo fetch error:', e);
  }
  return null;
}

async function searchiTunes(term: string, country: string, limit: number): Promise<any[]> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}&country=${country}`;
    const res = await fetchWithTimeout(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.results) ? json.results : [];
  } catch {
    return [];
  }
}

const upgradeArtwork = (url100: string) =>
  url100.replace('100x100bb.jpg', '500x500bb.jpg').replace('100x100bb', '500x500bb');

async function fetchiTunesArtworkFromCountry(
  cleanArtist: string,
  cleanTrack: string,
  c: string
): Promise<string | null> {
  const targetArtist = cleanArtist.toLowerCase();
  const targetTrack = cleanTrack.toLowerCase();

  // Attempt 1: Artist - Track
  let results = await searchiTunes(`${cleanArtist} - ${cleanTrack}`, c, 3);
  if (results.length > 0) {
    const matched = results.find((item: any) => {
      const art = (item.artistName || '').toLowerCase();
      const trk = (item.trackName || '').toLowerCase();
      return (art.includes(targetArtist) || targetArtist.includes(art)) &&
             (trk.includes(targetTrack) || targetTrack.includes(trk));
    }) || results[0];
    if (matched?.artworkUrl100) return upgradeArtwork(matched.artworkUrl100);
  }

  // Attempt 2: Artist + Track без дефиса
  results = await searchiTunes(`${cleanArtist} ${cleanTrack}`, c, 2);
  if (results[0]?.artworkUrl100) return upgradeArtwork(results[0].artworkUrl100);

  // Attempt 3: только трек + фильтр по артисту
  results = await searchiTunes(cleanTrack, c, 10);
  const match = results.find((item: any) => {
    const a = (item.artistName || '').toLowerCase();
    return a.includes(targetArtist) || targetArtist.includes(a);
  });
  if (match?.artworkUrl100) return upgradeArtwork(match.artworkUrl100);

  return null;
}

async function fetchiTunesArtwork(artist: string, trackName: string, country = 'us'): Promise<string | null> {
  const cleanArtist = cleanString(artist);
  const cleanTrack = cleanString(trackName);

  // Try relevant stores: Kazahkstan (extremely helpful for Russian releases), Russia, Ukraine, and United States
  const storeCountries = country === 'ru' ? ['kz', 'ru', 'ua', 'us'] : [country, 'kz', 'ru', 'us'];

  // Все регионы опрашиваются параллельно — раньше последовательный обход давал до 12 запросов подряд
  const covers = await Promise.all(
    storeCountries.map((c) => fetchiTunesArtworkFromCountry(cleanArtist, cleanTrack, c))
  );
  return covers.find(Boolean) ?? null;
}

async function fetchDeezerArtwork(artist: string, trackName: string): Promise<string | null> {
  const cleanArtist = cleanString(artist);
  const cleanTrack = cleanString(trackName);

  const queries = [
    `${cleanArtist} - ${cleanTrack}`,
    `${cleanArtist} ${cleanTrack}`,
    cleanTrack
  ];

  const searchQuery = async (query: string): Promise<string | null> => {
    try {
      const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5`;
      const res = await fetchWithTimeout(url, { next: { revalidate: 86400 } });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json.data || json.data.length === 0) return null;

      let bestMatch = null;
      if (query === cleanTrack) {
        bestMatch = json.data.find((item: any) => {
          const a = (item.artist?.name || '').toLowerCase();
          const target = cleanArtist.toLowerCase();
          return a.includes(target) || target.includes(a);
        });
      } else {
        bestMatch = json.data.find((item: any) =>
          item.artist?.name?.toLowerCase().includes(cleanArtist.toLowerCase()) ||
          cleanArtist.toLowerCase().includes(item.artist?.name?.toLowerCase())
        ) || json.data[0];
      }

      return bestMatch?.album?.cover_xl || bestMatch?.album?.cover_big || bestMatch?.album?.cover_medium || null;
    } catch {
      return null;
    }
  };

  // Параллельно, но приоритет сохраняем по порядку запросов
  const covers = await Promise.all(queries.map(searchQuery));
  return covers.find(Boolean) ?? null;
}

async function fetchMusicBrainzArtwork(artist: string, trackName: string): Promise<string | null> {
  try {
    const cleanArtist = cleanString(artist);
    const cleanTrack = cleanString(trackName);

    const query = `artist:"${cleanArtist}" AND recording:"${cleanTrack}"`;
    const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json`;
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'SH20FK-Portfolio/1.0.0 ( salamatinsana111@gmail.com )' },
      next: { revalidate: 86400 }
    }, 1800);
    if (res.ok) {
      const json = await res.json();
      if (json.recordings && json.recordings.length > 0) {
        for (const rec of json.recordings) {
          if (rec.releases && rec.releases.length > 0) {
            for (const rel of rec.releases) {
              if (rel.id) {
                return `https://coverartarchive.org/release/${rel.id}/front`;
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('MusicBrainz API fallback fetch error:', e);
  }
  return null;
}

// Небольшой кэш фолбэков в памяти процесса: /api/lastfm дёргается каждые 10 секунд,
// и без него одни и те же обложки искались бы в upstream-сервисах заново.
const COVER_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const COVER_CACHE_MAX = 500;
const coverCache = new Map<string, { cover: string | null; ts: number }>();
let lastCoverCacheSweep = 0;

function getCachedCover(key: string): { hit: boolean; cover: string | null } {
  const entry = coverCache.get(key);
  if (!entry) return { hit: false, cover: null };
  if (Date.now() - entry.ts > COVER_CACHE_TTL_MS) {
    coverCache.delete(key);
    return { hit: false, cover: null };
  }
  return { hit: true, cover: entry.cover };
}

function setCachedCover(key: string, cover: string | null) {
  const now = Date.now();
  if (now - lastCoverCacheSweep > 60_000) {
    lastCoverCacheSweep = now;
    for (const [k, v] of coverCache) {
      if (now - v.ts > COVER_CACHE_TTL_MS) coverCache.delete(k);
    }
  }
  if (coverCache.size >= COVER_CACHE_MAX) {
    const oldest = coverCache.keys().next().value;
    if (oldest) coverCache.delete(oldest);
  }
  coverCache.set(key, { cover, ts: now });
}

async function getFallbackArtwork(artist: string, trackName: string): Promise<string | null> {
  const cacheKey = `${artist}|||${trackName}`.toLowerCase().trim();
  const cached = getCachedCover(cacheKey);
  if (cached.hit) return cached.cover;
  let searchArtist = artist;
  const lowerArtist = artist.toLowerCase();
  const lowerTrack = trackName.toLowerCase();

  if (lowerArtist.includes('noize mc') || lowerArtist.includes('нойз мс')) {
    searchArtist = 'Noize MC';
  }
  if (lowerArtist.includes('mzlff') || lowerArtist.includes('мэзлфф')) {
    searchArtist = 'mzlff';
  }

  // 0. CDN-backed absolute cover-art guarantees for Noize MC and mzlff specified tracks
  let hardcodedCover: string | null = null;
  if (searchArtist === 'Noize MC' && (lowerTrack.includes('сам') || lowerTrack.includes('sam'))) {
    hardcodedCover = 'https://images.genius.com/bbaa0e29b1beaa9fa88afccb4e1957de.1000x1000x1.jpg';
  }
  if (searchArtist === 'mzlff' && (lowerTrack.includes('уходи') || lowerTrack.includes('uhodi'))) {
    hardcodedCover = 'https://images.genius.com/f9c87ca5796245d8b85ccad0b6e9a089.1000x1000x1.jpg';
  }
  if (hardcodedCover) {
    setCachedCover(cacheKey, hardcodedCover);
    return hardcodedCover;
  }

  // 1-2. Last.fm track.getInfo и iTunes параллельно (первые приоритетные источники)
  const hasCyrillic = /[\u0400-\u04FF]/.test(artist + " " + trackName);
  const [lastFmCover, iTunesCover] = await Promise.all([
    fetchLastFmTrackInfoCover(artist, trackName),
    fetchiTunesArtwork(artist, trackName, hasCyrillic ? 'ru' : 'us'),
  ]);
  if (lastFmCover) {
    setCachedCover(cacheKey, lastFmCover);
    return lastFmCover;
  }
  if (iTunesCover) {
    setCachedCover(cacheKey, iTunesCover);
    return iTunesCover;
  }

  // 3. Deezer — быстрый второй эшелон
  const deezerCover = await fetchDeezerArtwork(artist, trackName);
  if (deezerCover) {
    setCachedCover(cacheKey, deezerCover);
    return deezerCover;
  }

  // 4. MusicBrainz — последняя попытка, с укороченным таймаутом
  const musicBrainzCover = await fetchMusicBrainzArtwork(artist, trackName);
  setCachedCover(cacheKey, musicBrainzCover);
  return musicBrainzCover;
}

async function fetchiTunesPreviewAndArtwork(artist: string, trackName: string): Promise<{ previewUrl: string | null; artworkUrl: string | null }> {
  const cleanArtist = cleanString(artist);
  const cleanTrack = cleanString(trackName);
  const searchCountries = ['us', 'kz', 'ru'];

  const searchCountry = async (c: string) => {
    const results = await searchiTunes(`${cleanArtist} - ${cleanTrack}`, c, 3);
    if (results.length === 0) return null;
    const matched = results.find((item: any) => {
      const art = (item.artistName || '').toLowerCase();
      const trk = (item.trackName || '').toLowerCase();
      return (art.includes(cleanArtist.toLowerCase()) || cleanArtist.toLowerCase().includes(art)) &&
             (trk.includes(cleanTrack.toLowerCase()) || cleanTrack.toLowerCase().includes(trk));
    }) || results[0];
    if (!matched) return null;
    return {
      previewUrl: matched.previewUrl || null,
      artworkUrl: matched.artworkUrl100 ? upgradeArtwork(matched.artworkUrl100) : null,
    };
  };

  const results = (await Promise.all(searchCountries.map(searchCountry))).filter(Boolean) as Array<{
    previewUrl: string | null;
    artworkUrl: string | null;
  }>;

  // Предпочитаем результат с превью, иначе первый с обложкой
  return results.find((r) => r.previewUrl) || results.find((r) => r.artworkUrl) || { previewUrl: null, artworkUrl: null };
}

export async function GET(req: NextRequest) {
  if (!API_KEY) return NextResponse.json({ error: 'Last.fm API key missing' }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const method = searchParams.get('method');
  const period = searchParams.get('period') || '7day';
  const limitParam = parseInt(searchParams.get('limit') || '10', 10);
  const limit = String(Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10);

  if (!method) return NextResponse.json({ error: 'Method is required' }, { status: 400 });
  const allowedMethods = ['user.getrecenttracks', 'user.gettopartists', 'user.gettoptracks', 'user.getinfo', 'user.getweeklychartlist', 'user.getweeklytrackchart'];
  if (!allowedMethods.includes(method)) return NextResponse.json({ error: 'Method not allowed' }, { status: 403 });

  const url = `${BASE_URL}?method=${method}&user=${USER}&api_key=${API_KEY}&format=json&limit=${limit}&period=${period}`;
  try {
    const response = await fetch(url, { next: { revalidate: 30 }, signal: AbortSignal.timeout(3500) });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();

    // Augment covers if they are missing or placeholders, and retrieve preview URLs
    if (data.recenttracks?.track) {
      const tracks = Array.isArray(data.recenttracks.track) ? data.recenttracks.track : [data.recenttracks.track];
      await Promise.all(tracks.map(async (t: any, idx: number) => {
        let currentCover = '';
        if (t.image && Array.isArray(t.image)) {
          const maxImg = t.image[t.image.length - 1];
          if (maxImg) currentCover = maxImg['#text'] || '';
        }

        const artistName = t.artist?.['#text'] || '';
        const trackName = t.name || '';

        // Safely retrieve audio previews for high-fidelity interactive playback context
        if (idx < 2) {
          const info = await fetchiTunesPreviewAndArtwork(artistName, trackName);
          if (info.previewUrl) {
            t.previewUrl = info.previewUrl;
          }
          if (isMissingOrPlaceholderCover(currentCover) && info.artworkUrl) {
            currentCover = info.artworkUrl;
            if (t.image && Array.isArray(t.image)) {
              t.image = t.image.map((img: any) => ({ ...img, '#text': info.artworkUrl }));
            } else {
              t.image = [{ '#text': info.artworkUrl, size: 'extralarge' }];
            }
          }
        }

        if (isMissingOrPlaceholderCover(currentCover)) {
          const newCover = await getFallbackArtwork(artistName, trackName);
          if (newCover) {
            if (t.image && Array.isArray(t.image)) {
              t.image = t.image.map((img: any) => ({ ...img, '#text': newCover }));
            } else {
              t.image = [{ '#text': newCover, size: 'extralarge' }];
            }
          }
        }
      }));
    } else if (data.toptracks?.track) {
      const tracks = Array.isArray(data.toptracks.track) ? data.toptracks.track : [data.toptracks.track];
      await Promise.all(tracks.map(async (t: any) => {
        let currentCover = '';
        if (t.image && Array.isArray(t.image)) {
          const maxImg = t.image[t.image.length - 1];
          if (maxImg) currentCover = maxImg['#text'] || '';
        }
        if (isMissingOrPlaceholderCover(currentCover)) {
          const artistName = t.artist?.name || '';
          const trackName = t.name || '';
          const newCover = await getFallbackArtwork(artistName, trackName);
          if (newCover) {
            if (t.image && Array.isArray(t.image)) {
              t.image = t.image.map((img: any) => ({ ...img, '#text': newCover }));
            } else {
              t.image = [{ '#text': newCover, size: 'extralarge' }];
            }
          }
        }
      }));
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
