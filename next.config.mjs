/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'imgur.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lastfm.freetls.fastly.net' },
      { protocol: 'https', hostname: 'lastfm-img.freetls.fastly.net' },
      { protocol: 'https', hostname: 'lastfm-img2.akamaized.net' },
      { protocol: 'https', hostname: 'lastfm-img3.akamaized.net' },
      { protocol: 'https', hostname: '*.freetls.fastly.net' },
      { protocol: 'https', hostname: '*.akamaized.net' },
      { protocol: 'https', hostname: 'images.last.fm' },
      { protocol: 'https', hostname: 'assets.last.fm' },
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'images.genius.com' },
      { protocol: 'https', hostname: '*.mzstatic.com' },
      { protocol: 'https', hostname: 'cdn-images.deezer.com' },
      { protocol: 'https', hostname: '*.dzcdn.net' },
      { protocol: 'https', hostname: 'coverartarchive.org' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'picsum.photos' }
    ]
  }
};
export default nextConfig;
