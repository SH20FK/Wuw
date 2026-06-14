import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.LASTFM_API_KEY;
const USER = 'SH20FK';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

function isMissingOrPlaceholderCover(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes('default_image') || url.includes('/2.0/s/') || url === '';
}

async function fetchiTunesArtwork(artist: string, trackName: string): Promise<string | null> {
  try {
    const term = `${artist} - ${trackName}`;
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache for 24h
    if (res.ok) {
      const json = await res.json();
      if (json.results && json.results.length > 0) {
        const artworkUrl = json.results[0].artworkUrl100;
        if (artworkUrl) {
          // Upgrade to high resolution (500x500 or larger)
          return artworkUrl.replace('100x100bb.jpg', '500x500bb.jpg').replace('100x100bb', '500x500bb');
        }
      }
    }
  } catch (e) {
    console.error('iTunes API fallback fetch error:', e);
  }
  return null;
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

    // Augment covers if they are missing or placeholders
    if (data.recenttracks?.track) {
      const tracks = Array.isArray(data.recenttracks.track) ? data.recenttracks.track : [data.recenttracks.track];
      await Promise.all(tracks.map(async (t: any) => {
        let currentCover = '';
        if (t.image && Array.isArray(t.image)) {
          const maxImg = t.image[t.image.length - 1];
          if (maxImg) currentCover = maxImg['#text'] || '';
        }
        if (isMissingOrPlaceholderCover(currentCover)) {
          const artistName = t.artist?.['#text'] || '';
          const trackName = t.name || '';
          const newCover = await fetchiTunesArtwork(artistName, trackName);
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
          const newCover = await fetchiTunesArtwork(artistName, trackName);
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
