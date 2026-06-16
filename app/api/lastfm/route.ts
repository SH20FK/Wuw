import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_KEY = process.env.LASTFM_API_KEY;
const USER = 'SH20FK';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

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
    const res = await fetch(url, { next: { revalidate: 86400 } });
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

async function fetchiTunesArtwork(artist: string, trackName: string, country = 'us'): Promise<string | null> {
  const cleanArtist = cleanString(artist);
  const cleanTrack = cleanString(trackName);
  
  // Try relevant stores: Kazahkstan (extremely helpful for Russian releases), Russia, Ukraine, and United States
  const storeCountries = country === 'ru' ? ['kz', 'ru', 'ua', 'us'] : [country, 'kz', 'ru', 'us'];

  for (const c of storeCountries) {
    try {
      // Attempt 1: Artist - Track
      let term = `${cleanArtist} - ${cleanTrack}`;
      let url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=3&country=${c}`;
      let res = await fetch(url, { next: { revalidate: 86400 } });
      if (res.ok) {
        let json = await res.json();
        if (json.results && json.results.length > 0) {
          const matched = json.results.find((item: any) => {
            const art = (item.artistName || '').toLowerCase();
            const trk = (item.trackName || '').toLowerCase();
            return (art.includes(cleanArtist.toLowerCase()) || cleanArtist.toLowerCase().includes(art)) &&
                   (trk.includes(cleanTrack.toLowerCase()) || cleanTrack.toLowerCase().includes(trk));
          }) || json.results[0];
          const url100 = matched.artworkUrl100;
          if (url100) return url100.replace('100x100bb.jpg', '500x500bb.jpg').replace('100x100bb', '500x500bb');
        }
      }

      // Attempt 2: If we cleaned and it failed, try just Track Name with artist
      term = `${cleanArtist} ${cleanTrack}`;
      url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=2&country=${c}`;
      res = await fetch(url, { next: { revalidate: 86400 } });
      if (res.ok) {
        let json = await res.json();
        if (json.results && json.results.length > 0) {
          const url100 = json.results[0].artworkUrl100;
          if (url100) return url100.replace('100x100bb.jpg', '500x500bb.jpg').replace('100x100bb', '500x500bb');
        }
      }

      // Attempt 3: Search just the track and filter by artist match
      term = cleanTrack;
      url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=10&country=${c}`;
      res = await fetch(url, { next: { revalidate: 86400 } });
      if (res.ok) {
        let json = await res.json();
        if (json.results && json.results.length > 0) {
          const match = json.results.find((item: any) => {
            const a = (item.artistName || '').toLowerCase();
            const target = cleanArtist.toLowerCase();
            return a.includes(target) || target.includes(a);
          });
          if (match && match.artworkUrl100) {
            return match.artworkUrl100.replace('100x100bb.jpg', '500x500bb.jpg').replace('100x100bb', '500x500bb');
          }
        }
      }
    } catch (e) {
      console.error(`iTunes API country ${c} search error:`, e);
    }
  }
  return null;
}

async function fetchDeezerArtwork(artist: string, trackName: string): Promise<string | null> {
  try {
    const cleanArtist = cleanString(artist);
    const cleanTrack = cleanString(trackName);

    const queries = [
      `${cleanArtist} - ${cleanTrack}`,
      `${cleanArtist} ${cleanTrack}`,
      cleanTrack
    ];

    for (const query of queries) {
      const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
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

          if (bestMatch) {
            const coverUrl = bestMatch.album?.cover_xl || bestMatch.album?.cover_big || bestMatch.album?.cover_medium;
            if (coverUrl) return coverUrl;
          }
        }
      }
    }
  } catch (e) {
    console.error('Deezer API fallback fetch error:', e);
  }
  return null;
}

async function fetchMusicBrainzArtwork(artist: string, trackName: string): Promise<string | null> {
  try {
    const cleanArtist = cleanString(artist);
    const cleanTrack = cleanString(trackName);

    const query = `artist:"${cleanArtist}" AND recording:"${cleanTrack}"`;
    const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SH20FK-Portfolio/1.0.0 ( salamatinsana111@gmail.com )' },
      next: { revalidate: 86400 }
    });
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

async function getFallbackArtwork(artist: string, trackName: string): Promise<string | null> {
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
  if (searchArtist === 'Noize MC' && (lowerTrack.includes('сам') || lowerTrack.includes('sam'))) {
    return 'https://images.genius.com/bbaa0e29b1beaa9fa88afccb4e1957de.1000x1000x1.jpg';
  }
  if (searchArtist === 'mzlff' && (lowerTrack.includes('уходи') || lowerTrack.includes('uhodi'))) {
    return 'https://images.genius.com/f9c87ca5796245d8b85ccad0b6e9a089.1000x1000x1.jpg';
  }

  // 1. Try fetching detailed Track Info on Last.fm itself (which may have the album artwork available)
  let cover = await fetchLastFmTrackInfoCover(artist, trackName);
  if (cover) return cover;

  const hasCyrillic = /[\u0400-\u04FF]/.test(artist + " " + trackName);
  
  // 2. Try iTunes search across multiple regions (KZ, RU, UA, US)
  cover = await fetchiTunesArtwork(artist, trackName, hasCyrillic ? 'ru' : 'us');
  if (cover) return cover;

  // 3. Try Deezer
  cover = await fetchDeezerArtwork(artist, trackName);
  if (cover) return cover;

  // 4. Try MusicBrainz
  cover = await fetchMusicBrainzArtwork(artist, trackName);
  if (cover) return cover;

  return null;
}

async function fetchiTunesPreviewAndArtwork(artist: string, trackName: string): Promise<{ previewUrl: string | null; artworkUrl: string | null }> {
  const cleanArtist = cleanString(artist);
  const cleanTrack = cleanString(trackName);
  const searchCountries = ['us', 'kz', 'ru'];
  
  for (const c of searchCountries) {
    try {
      const term = `${cleanArtist} - ${cleanTrack}`;
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=3&country=${c}`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (res.ok) {
        const json = await res.json();
        if (json.results && json.results.length > 0) {
          const matched = json.results.find((item: any) => {
            const art = (item.artistName || '').toLowerCase();
            const trk = (item.trackName || '').toLowerCase();
            return (art.includes(cleanArtist.toLowerCase()) || cleanArtist.toLowerCase().includes(art)) &&
                   (trk.includes(cleanTrack.toLowerCase()) || cleanTrack.toLowerCase().includes(trk));
          }) || json.results[0];
          
          if (matched) {
            const artworkUrl = matched.artworkUrl100 
              ? matched.artworkUrl100.replace('100x100bb.jpg', '500x500bb.jpg').replace('100x100bb', '500x500bb')
              : null;
            return {
              previewUrl: matched.previewUrl || null,
              artworkUrl: artworkUrl,
            };
          }
        }
      }
    } catch (e) {
      console.error('iTunes API preview fetch error:', e);
    }
  }
  return { previewUrl: null, artworkUrl: null };
}

export async function GET(req: NextRequest) {
  if (!API_KEY) return NextResponse.json({ error: 'Last.fm API key missing' }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const method = searchParams.get('method');
  const period = searchParams.get('period') || '7day';
  const limit = searchParams.get('limit') || '10';

  if (!method) return NextResponse.json({ error: 'Method is required' }, { status: 400 });
  const allowedMethods = ['user.getrecenttracks', 'user.gettopartists', 'user.gettoptracks', 'user.getinfo', 'user.getweeklychartlist', 'user.getweeklytrackchartlist'];
  if (!allowedMethods.includes(method)) return NextResponse.json({ error: 'Method not allowed' }, { status: 403 });

  const url = `${BASE_URL}?method=${method}&user=${USER}&api_key=${API_KEY}&format=json&limit=${limit}&period=${period}`;
  try {
    const response = await fetch(url, { next: { revalidate: 30 } });
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
