import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateGuestCode(length: number = 6): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Memanggil URL absolut dari Cloudflare R2 untuk Aset Sistem (Template/Font/Music)
 * @param path - Jalur file di dalam bucket (contoh: "templates/jvn-01/bg.png")
 */
export function getSystemAsset(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_R2_ASSETS_URL;
  if (!baseUrl) {
    console.warn("PERINGATAN: NEXT_PUBLIC_R2_ASSETS_URL belum disetel di .env!");
    return "";
  }
  
  // Mencegah double-slash (//)
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
}