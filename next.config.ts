import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://app.evory.id' : '',
  
  images: {
    // UNOPTIMIZED TELAH DIHAPUS. 
    // Jangan pernah menaruh 'unoptimized: true' jika Anda ingin Vercel mengompres gambar klien.

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'cksyuviluwywysyjcouu.supabase.co', // Aset warisan Supabase
      },
      // ---------------------------------------------------------
      // MASUKKAN CUSTOM DOMAIN R2 ANDA DI BAWAH INI
      // ---------------------------------------------------------
      {
        protocol: 'https',
        hostname: 'assets.evory.id', // GANTI dengan custom domain R2 Anda yang sebenarnya
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Placeholder foto
      },
      {
        protocol: 'https',
        hostname: 'templates.evory.id', // GANTI/HAPUS jika Anda menggunakan domain yang berbeda
      },
      {
        protocol: 'https',
        hostname: 'wcc.evory.id', // GANTI/HAPUS jika Anda menggunakan domain yang berbeda
      }
    ],
  },
};

export default nextConfig;