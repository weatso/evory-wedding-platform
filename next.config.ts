import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', // Izinkan placeholder
      },
      {
        protocol: 'https',
        hostname: 'cksyuviluwywysyjcouu.supabase.co', // Izinkan Supabase Storage Anda
      }
    ],
  },
};

export default nextConfig;