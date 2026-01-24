import { ComponentType } from "react";
import { WeddingTemplateProps } from "@/types/template";
import dynamic from "next/dynamic";

// 1. Kategori & Metadata Template
export const TEMPLATES = [
  { 
    id: "JVN_01", 
    name: "Javanese Royal", 
    category: "Javanese", 
    path: "javanese/jvn-01",
    isPrivate: false // Default
  },
  { 
    id: "SULTAN_ANDARA_01", 
    name: "Exclusive for Raffi & Nagita", 
    category: "Custom", 
    path: "custom/sultan-01", // Folder terpisah agar rapi
    isPrivate: true // <-- KUNCI RAHASIANYA 
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