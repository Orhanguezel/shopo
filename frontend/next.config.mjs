/** @type {import('next').NextConfig} */
// Next.js config dosyasında direkt process.env kullanılmalı (build time'da çalışır)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://admin.seyfibaba.com/';
const { hostname, protocol } = new URL(baseUrl);

const nextConfig = {
  // output: 'export', // Static export kaldırıldı - Node.js server ile çalışacak
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: protocol.replace(":", ""),
        hostname: hostname,
      },
    ],
  },
};

export default nextConfig;
