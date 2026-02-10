import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { Invitation, Template } from "@prisma/client";

// --- 1. DEFINISI TIPE PROPS (WAJIB EXPORT) ---
// Kita mendefinisikan tipe ini di sini agar bisa dipakai oleh file template (jvn-01, dll)
export type WeddingTemplateProps = {
  invitation: Invitation & { template: Template | null };
};

// --- 2. CONFIG: DAFTAR TEMPLATE ---
export const TEMPLATES = [
  { 
    // PENTING: 'id' di sini harus SAMA PERSIS dengan 'slug' di Database Anda
    id: "javanese-series", 
    name: "Javanese Royal", 
    category: "Javanese", 
    // Path relative terhadap file registry.ts ini
    // Jika registry ada di components/templates/, maka ini mengarah ke components/templates/javanese/jvn-01
    path: "javanese/jvn-01",
    isPrivate: false 
  },
  { 
    // Alias untuk template yang sama (jika di DB slugnya beda)
    id: "jvn-royal-01", 
    name: "Javanese Royal (Code)", 
    category: "Javanese", 
    path: "javanese/jvn-01", 
    isPrivate: false 
  },
  { 
    id: "sultan-andara", 
    name: "Exclusive for Raffi & Nagita", 
    category: "Custom", 
    path: "custom/sultan-01", 
    isPrivate: true 
  },
];

// --- 3. FUNGSI GET TEMPLATE (Dynamic Import) ---
export const getTemplate = (templateId: string | null | undefined): ComponentType<WeddingTemplateProps> => {
  // Cari template yang id-nya cocok dengan slug dari database
  // Jika tidak ketemu, fallback ke template pertama (index 0)
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  
  // Return komponen dengan Lazy Load
  // import(`./${template.path}`) akan mencari file index.tsx di folder tersebut
  return dynamic(() => import(`./${template.path}`), {
    loading: () => (
      <div className="h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800 mb-4"></div>
        <p className="text-xs uppercase tracking-widest">Loading Design...</p>
      </div>
    ),
    ssr: true // Pastikan Server Side Rendering aktif agar SEO bagus
  }) as ComponentType<WeddingTemplateProps>;
};