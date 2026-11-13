import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

/**
 * Прокси нужен только для одного: клиент сэмплит цвет обложки через canvas, а
 * сторонние CDN не отдают CORS-заголовки. Это не «открытый прокси»: раньше в
 * `?url=` можно было подставить что угодно, включая внутренние адреса
 * (169.254.169.254 и прочий SSRF), поэтому ходим строго по белому списку.
 */
const ALLOWED_HOSTS = new Set([
  'lastfm.freetls.fastly.net',
  'lastfm-img.freetls.fastly.net',
  'lastfm-img2.akamaized.net',
  'lastfm-img3.akamaized.net',
  'images.last.fm',
  'assets.last.fm',
  'i.scdn.co',
  'images.genius.com',
  'cdn-images.deezer.com',
  'coverartarchive.org',
  'i.ibb.co',
  'i.imgur.com',
]);

const ALLOWED_SUFFIXES = ['.mzstatic.com', '.fastly.net', '.akamaized.net', '.dzcdn.net', '.deezer.com'];

const MAX_BYTES = 8 * 1024 * 1024;

function isAllowed(target: URL) {
  if (target.protocol !== 'https:') return false;
  const host = target.hostname.toLowerCase();
  if (!host || host === 'localhost' || host.endsWith('.local')) return false;
  // IP-адреса и IPv6 — мимо: они и есть основной вектор SSRF.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')) return false;
  if (ALLOWED_HOSTS.has(host)) return true;
  return ALLOWED_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');
  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(imageUrl);
  } catch {
    return new NextResponse('Invalid url parameter', { status: 400 });
  }

  if (!isAllowed(target)) {
    return new NextResponse('Host is not allowed', { status: 403 });
  }

  try {
    const response = await fetch(target.toString(), {
      headers: { Accept: 'image/*' },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return new NextResponse('Failed to load image from upstream origin', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Upstream is not an image', { status: 415 });
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return new NextResponse('Image is too large', { status: 413 });
    }

    // Прокси существует ради одной задачи — посчитать средний цвет обложки на
    // клиенте. Для этого хватает картинки 64×64, поэтому режем на сервере:
    // вместо 100 КБ по сети уезжает пара килобайт webp.
    const requestedWidth = parseInt(searchParams.get('w') || '', 10);
    const width = Number.isFinite(requestedWidth) ? Math.min(Math.max(requestedWidth, 8), 512) : 64;

    let body: Buffer | ArrayBuffer = buffer;

    if (width > 0) {
      try {
        body = await sharp(Buffer.from(buffer))
          .resize(width, width, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 70 })
          .toBuffer();
      } catch {
        // Экзотический формат — отдаём оригинал, клиент всё равно сожмёт в 16×16.
        body = buffer;
      }
    }

    return new NextResponse(body as unknown as BodyInit, {
      headers: {
        'Content-Type': width > 0 && body !== buffer ? 'image/webp' : contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal server error loading proxy image', { status: 500 });
  }
}