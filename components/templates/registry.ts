// components/templates/registry.ts
import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { WeddingTemplateProps } from "@/types/template"; // Pastikan interface ini ada

// 1. Import Static untuk Template Default (Mencegah layout shift/loading di awal)
import WoodVibe from "@/components/templates/WoodVibe"; 

// 2. Tipe Data Registry (Memastikan semua komponen mematuhi kontrak Props)
export const templateRegistry: Record<string, ComponentType<WeddingTemplateProps>> = {
  // --- KATALOG STANDAR ---
  "RUSTIC_A": WoodVibe, // Default

  // --- KATALOG LAIN (Lazy Load) ---
  // "CHINESE_DYNASTY": dynamic(() => import("./ChineseDynasty")),
  // "ELEGANT_WHITE": dynamic(() => import("./ElegantWhite")),
};

/**
 * Fungsi Helper untuk mengambil Component berdasarkan ID Database
 */
export function getTemplate(templateId: string | null | undefined): ComponentType<WeddingTemplateProps> {
  // 1. Jika ID kosong, kembalikan Default
  if (!templateId) return WoodVibe;

  // 2. Cari di registry
  const Component = templateRegistry[templateId];

  // 3. Jika tidak ketemu (misal typo di DB), kembalikan Default sebagai fallback
  return Component || WoodVibe; 
}