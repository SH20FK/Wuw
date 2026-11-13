import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PLACEHOLDER_COVER_MARKERS = [
  '2a96cbd30df375e2f75a98af74f1ed0a',
  '2a96cbd8b46e442fc41c2b86b821562f',
  'default_image',
  'lastfm_avatar',
  'noimage',
  'no-image',
  'placeholder',
];

/** true, если URL — это заглушка Last.fm, а не настоящая обложка. */
export function isPlaceholderCover(url?: string | null): boolean {
  if (!url) return true;
  const value = url.toLowerCase();
  return PLACEHOLDER_COVER_MARKERS.some((marker) => value.includes(marker));
}

/** Последний (самый крупный) настоящий URL из массива image, иначе пустая строка. */
function largestRealImage(track: any): string {
  if (!track?.image) return '';
  const list = Array.isArray(track.image) ? track.image : [track.image];
  for (let i = list.length - 1; i >= 0; i--) {
    const url = list[i]?.['#text'];
    if (url && !isPlaceholderCover(url)) return url;
  }
  return '';
}

/**
 * Обложка трека. Заглушки Last.fm (звёздочка и default-картинки) не возвращаются
 * никогда: лучше пустая строка и нарисованный плейсхолдер, чем пять одинаковых
 * звёздочек в списке. Реальные обложки подставляет /api/lastfm.
 */
export function getTrackImage(track: any): string {
  return largestRealImage(track);
}

/** Фото артиста — та же логика, что для обложек. */
export function getArtistImage(artist: any): string {
  return largestRealImage(artist);
}



function computeAverageColor(imgUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve('#D97757');
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Локальный прокси снимает CORS и заодно отдаёт картинку 64×64: для
    // усреднения цвета больше не нужно, а трафика уходит в разы меньше.
    img.src = `/api/proxy-image?w=64&url=${encodeURIComponent(imgUrl)}`;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('#D97757');
      canvas.width = 16;
      canvas.height = 16;
      ctx.drawImage(img, 0, 0, 16, 16);
      try {
        const data = ctx.getImageData(0, 0, 16, 16).data;
        let r = 0, g = 0, b = 0, count = 0;
        
        // Filter out extreme black, white, and high-grayscale overlay pixels to capture pure cover art color
        for (let i = 0; i < data.length; i += 4) {
          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];
          const alpha = data[i + 3];
          
          if (alpha < 100) continue;
          
          const maxVal = Math.max(red, green, blue);
          const minVal = Math.min(red, green, blue);
          const diff = maxVal - minVal;
          
          // Color saturation requirement (diff of at least 15 RGB levels helps exclude flat grey/black/white)
          if (diff > 15 && maxVal > 30) {
            r += red;
            g += green;
            b += blue;
            count++;
          }
        }
        
        if (count === 0) {
          // If no highly saturated pixels exist (e.g. monochromatic covers), average non-black pixels
          for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];
            const alpha = data[i + 3];
            if (alpha > 100 && (red + green + blue > 30)) {
              r += red;
              g += green;
              b += blue;
              count++;
            }
          }
        }
        
        if (count === 0) {
          return resolve('#D97757');
        }
        
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        // Enhance brightness and saturation specifically for rendering over dark UI elements (#0E0C0F)
        const max = Math.max(r, g, b);
        if (max < 140) {
          const boostFactor = 160 / (max || 1);
          r = Math.min(255, Math.floor(r * boostFactor));
          g = Math.min(255, Math.floor(g * boostFactor));
          b = Math.min(255, Math.floor(b * boostFactor));
        }
        
        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch (e) {
        resolve('#D97757');
      }
    };
    img.onerror = () => {
      resolve('#D97757');
    };
  });
}

const averageColorCache = new Map<string, Promise<string>>();

/**
 * Cached wrapper. The same cover is used by the hero sphere, the music page and
 * the poller, so without this each of them would download it again for colour
 * extraction.
 */
export function getAverageColor(imgUrl: string): Promise<string> {
  if (!imgUrl) return Promise.resolve('#D97757');

  const cached = averageColorCache.get(imgUrl);
  if (cached) return cached;

  const pending = computeAverageColor(imgUrl).catch(() => '#D97757');
  averageColorCache.set(imgUrl, pending);

  if (averageColorCache.size > 40) {
    const oldest = averageColorCache.keys().next().value;
    if (oldest) averageColorCache.delete(oldest);
  }

  return pending;
}
