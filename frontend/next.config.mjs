/** @type {import('next').NextConfig} */
// Next.js config dosyasında direkt process.env kullanılmalı (build time'da çalışır)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://admin.seyfibaba.com/';
const { hostname, protocol } = new URL(baseUrl);

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
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
