import { ComponentType } from "react";
import { WeddingTemplateProps } from "@/types/template";
import dynamic from "next/dynamic";

// 1. Kategori & Metadata Template
export const TEMPLATES = [
  { 
    id: "MIN_01", 
    name: "Pure Serenity", 
    category: "Minimalist", 
    path: "minimalist/min-01" 
  },
  { 
    id: "RUSTIC_01", 
    name: "Wood Vibe", 
    category: "Rustic", 
    path: "rustic/rustic-01" 
  },
  // Nanti tinggal tambah di sini sampai ribuan pun tetap rapi
];

// 2. Fungsi untuk mengambil komponen secara Dynamic (Lazy Load)
// Ini penting agar user tidak men-download 100 template sekaligus saat buka web
export const getTemplate = (templateId: string | null | undefined): ComponentType<WeddingTemplateProps> => {
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  
  return dynamic(() => import(`./${template.path}`), {
    loading: () => <div className="h-screen flex items-center justify-center">Loading Elegant Design...</div>
  });
};