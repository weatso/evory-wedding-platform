import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://app.evory.id' : '',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'cksyuviluwywysyjcouu.supabase.co', // Supabase lama Anda (biarkan untuk aset transisi)
      },
      {
        protocol: 'https',
        hostname: 'pub-d86b499bf1504701a4e0722f3bee699c.r2.dev', // GANTI DENGAN HOSTNAME R2 TEMPLATE ANDA (tanpa https://)
      },
      {
        protocol: 'https',
        hostname: 'pub-1c9798b730b44a1082e6b5ca61c3f6cb.r2.dev', // GANTI DENGAN HOSTNAME R2 client ANDA (tanpa https://)
      }
      // Nanti tambahkan juga hostname untuk R2_CLIENT_PUBLIC_URL di sini
    ],
  },
};

export default nextConfig;