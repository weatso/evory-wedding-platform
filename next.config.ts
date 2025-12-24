import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Tambahkan domain lain di sini jika nanti pakai Supabase Storage
      // {
      //   protocol: 'https',
      //   hostname: 'xyz.supabase.co',
      // }
    ],
  },
};

export default nextConfig;