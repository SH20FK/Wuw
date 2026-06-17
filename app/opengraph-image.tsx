import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Alexander Salamatin (SH20FK) — Portfolio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const API_KEY = process.env.LASTFM_API_KEY;
const USER = 'SH20FK';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

async function getNowPlaying() {
  if (!API_KEY) return null;
  try {
    const url = `${BASE_URL}?method=user.getrecenttracks&user=${USER}&api_key=${API_KEY}&format=json&limit=1`;
    const res = await fetch(url, {
      next: { revalidate: 15 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const track = data?.recenttracks?.track?.[0];
    if (track) {
      const isNowPlaying = track['@attr']?.nowplaying === 'true';
      return {
        name: track.name,
        artist: track.artist?.['#text'] || '',
        album: track.album?.['#text'] || '',
        image: track.image?.[track.image.length - 1]?.['#text'] || '',
        isNowPlaying,
      };
    }
  } catch (e) {
    console.error('OG Image fetch failed:', e);
  }
  return null;
}

function getAccentColor(artist: string, track: string): string {
  const str = `${artist}-${track}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Warm, premium cozy palette of design accent colors
  const colors = [
    '#B8AD9E', // Warm Taupe
    '#7A8A97', // Muted Steel Blue
    '#D97757', // Coral
    '#828D95', // Slate Grey
    '#A6807B', // Muted Terracotta
    '#8C9FA6', // Soft Ocean
    '#9E8F80', // Soft Sand
    '#A18E97', // Muted Amethyst
  ];
  return colors[Math.abs(hash) % colors.length];
}

export default async function Image() {
  const track = await getNowPlaying();
  const hasNowPlaying = track && track.isNowPlaying;
  
  const accentColor = hasNowPlaying 
    ? getAccentColor(track.artist, track.name) 
    : '#D97757'; // Falling back to default accent

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#0E0C0F',
          color: '#EAE5DC',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow using accentColor */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accentColor}33 0%, rgba(14,12,15,0) 70%)`,
          }}
        />

        {/* Top Header Row */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: '#B8AD9E',
            }}
          >
            [SH20FK]
          </div>
          <div
            style={{
              fontSize: '14px',
              letterSpacing: '1.5px',
              opacity: 0.6,
              color: '#EAE5DC',
            }}
          >
            {hasNowPlaying ? '🔴 LIVE NOW PLAYING' : 'PORTFOLIO ARCHIVE'}
          </div>
        </div>

        {/* Main Content Area */}
        {hasNowPlaying ? (
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
              marginTop: '40px',
              marginBottom: '40px',
            }}
          >
            {/* Track Info (Left) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '650px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    marginRight: '8px',
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#1B9F72' }}>
                  СЛУШАЮ СЕЙЧАС (LAST.FM)
                </span>
              </div>
              <div
                style={{
                  fontSize: '52px',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: '12px',
                  color: '#EAE5DC',
                }}
              >
                {track.name}
              </div>
              <div
                style={{
                  fontSize: '28px',
                  color: accentColor,
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
              >
                {track.artist}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: '#5A5664',
                  fontStyle: 'italic',
                }}
              >
                {track.album || ''}
              </div>
            </div>

            {/* Aesthetic CSS spinning Vinyl Record (Right) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                border: '4px solid #181620',
                background: 'radial-gradient(circle, #100e12 10%, #1c1822 40%, #100e12 90%)',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              }}
            >
              {/* Core vinyl label with track color */}
              <div
                style={{
                  width: '95px',
                  height: '95px',
                  borderRadius: '50%',
                  backgroundColor: '#0E0C0F',
                  border: `3px solid ${accentColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: accentColor,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
              marginTop: '40px',
              marginBottom: '40px',
            }}
          >
            {/* Portfolio Info (Left) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '700px',
              }}
            >
              <div
                style={{
                  fontSize: '60px',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: '12px',
                  color: '#EAE5DC',
                }}
              >
                Alexander Salamatin
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: accentColor,
                  fontWeight: 600,
                  marginBottom: '20px',
                }}
              >
                Creative Frontend Developer & UI Engineer
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: '#7A8A97',
                  maxWidth: '550px',
                  lineHeight: 1.5,
                }}
              >
                Разработка физически плавных интерфейсов, кастомных решений, шейдерной графики и инструментов с высокой производительностью.
              </div>
            </div>

            {/* Architectural Status Block (Right) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid rgba(184, 173, 158, 0.1)',
                backgroundColor: '#181620',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: accentColor, marginRight: '6px' }} />
                <span style={{ fontSize: '12px', color: '#B8AD9E', fontWeight: 600, letterSpacing: '1px' }}>STATUS</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#EAE5DC' }}>ALWAYS CREATING</div>
              <div style={{ fontSize: '12px', color: '#5A5664', marginTop: '12px' }}>sh20fk.ru</div>
            </div>
          </div>
        )}

        {/* Bottom Bar Row */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            borderTop: '1px solid rgba(184, 173, 158, 0.08)',
            paddingTop: '20px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#5A5664', letterSpacing: '1px' }}>
            sh20fk • built with integrity
          </div>
          <div style={{ fontSize: '13px', color: '#5A5664', letterSpacing: '1.5px' }}>
            /WORK /MUSIC /CONTACT
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
