import dynamic from "next/dynamic";
import { ComponentType } from "react";
// PERBAIKAN: Tambahkan 'Guest' di sini
import { Invitation, Template, Guest } from "@prisma/client";

// --- 1. DEFINISI TIPE PROPS (WAJIB EXPORT) ---
export type WeddingTemplateProps = {
  // Tambahkan 'wishes' & 'gallery' agar tidak error saat diakses di template
  invitation: Invitation & { 
    template: Template | null; 
    wishes?: any[]; 
    gallery?: string[] 
  };
  // PERBAIKAN: Tambahkan prop guest (Opsional)
  guest?: Guest | null;
};

// --- 2. CONFIG: DAFTAR TEMPLATE ---
export const TEMPLATES = [
  { 
    id: "javanese-series", 
    name: "Javanese Royal", 
    category: "Javanese", 
    path: "javanese/jvn-01",
    isPrivate: false 
  },
  { 
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

// --- 3. FUNGSI GET TEMPLATE ---
export const getTemplate = (templateId: string | null | undefined): ComponentType<WeddingTemplateProps> => {
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  
  return dynamic(() => import(`./${template.path}`), {
    loading: () => (
      <div className="h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800 mb-4"></div>
        <p className="text-xs uppercase tracking-widest">Loading Design...</p>
      </div>
    ),
    ssr: true 
  }) as ComponentType<WeddingTemplateProps>;
};