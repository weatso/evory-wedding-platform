import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { Guest, Project, Template, Wish } from "@prisma/client";

// --- 1. DEFINISI TIPE PROPS YANG BENAR ---
export type ExtendedWish = Wish & { 
    guest: Guest | null; 
};

// PERBAIKAN: Gunakan nama WeddingTemplateProps agar sinkron dengan baris bawah file Anda
export interface WeddingTemplateProps {
    invitation: Project & {
        template: Template | null;
        wishes: ExtendedWish[];
    };
    guest?: Guest | null;
}

// --- 2. REGISTRI KOMPONEN TEMPLATE ---
// (BIARKAN DAFTAR REGISTRY ANDA DI BAWAH INI TETAP UTUH)

// --- 2. STATIC DICTIONARY REGISTRY ---
// WAJIB statis (string literal) agar Next.js bisa melakukan Code Splitting.
// File Javascript hanya akan diunduh peramban jika template ini benar-benar dipanggil.
export const TEMPLATE_REGISTRY: Record<string, ComponentType<WeddingTemplateProps>> = {
  "javanese-series": dynamic(() => import("./javanese/jvn-01"), { ssr: true }),
  "jvn-royal-01": dynamic(() => import("./javanese/jvn-01"), { ssr: true }),
  // "sultan-andara": dynamic(() => import("./custom/sultan-01"), { ssr: true }),
  // "mdn-clean-01": dynamic(() => import("./minimalist/mdn-01"), { ssr: true }),
};

// --- 3. FUNGSI PEMANGGIL ---
export const getTemplate = (templateId: string | null | undefined): ComponentType<WeddingTemplateProps> => {
  const Component = TEMPLATE_REGISTRY[templateId || "javanese-series"];
  
  if (!Component) {
    return () => (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-900 text-white">
        <h1 className="text-2xl font-bold mb-2">Template Tidak Ditemukan</h1>
        <p className="text-stone-400 text-sm tracking-widest uppercase">ID: {templateId}</p>
      </div>
    );
  }

  return Component;
};