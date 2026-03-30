/** @type {import('next').NextConfig} */
// Next.js config dosyasında direkt process.env kullanılmalı (build time'da çalışır)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://admin.seyfibaba.com/';
const { hostname, protocol } = new URL(baseUrl);
const isDev = process.env.NODE_ENV === 'development';
const contentSecurityPolicy = [
  `default-src 'self' https: ${isDev ? 'http:' : ''} data: blob: 'unsafe-inline' 'unsafe-eval'`,
  `img-src 'self' https: ${isDev ? 'http:' : ''} data: blob:`,
  `media-src 'self' https: ${isDev ? 'http:' : ''} data: blob:`,
  "font-src 'self' https: data:",
  "style-src 'self' https: 'unsafe-inline'",
  `script-src 'self' https: ${isDev ? 'http:' : ''} 'unsafe-inline' 'unsafe-eval'`,
  `connect-src 'self' https: ${isDev ? 'http:' : ''} wss: ${isDev ? 'ws:' : ''}`,
  "frame-src 'self' https://www.google.com https://*.google.com https://maps.google.com https://*.google.de https://www.youtube.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https:",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-brands-svg-icons',
      'react-toastify',
      'react-share',
      'date-fns',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: protocol.replace(":", ""),
        hostname: hostname,
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // /_next/static ve /_next/image Cache-Control Next.js tarafından yönetilir — custom header kaldırıldı
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        source: "/about",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        source: "/products",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        source: "/search",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        source: "/urun/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
    ];
  },
};

export default nextConfig;
