"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneFrame from "./PhoneFrame";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Template = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  description?: string | null;
  previewUrl?: string | null;
  isPremium?: boolean;
};

type Category = {
  id: string;
  name: string;
  templates: Template[];
};

export default function HybridShowcase({ categories }: { categories: Category[] }) {
  const firstTemplateImg = categories[0]?.templates[0]?.thumbnail || "";
  const [activeThumbnail, setActiveThumbnail] = useState<string>(firstTemplateImg);

  // Fungsi untuk menggulir mulus ke kategori (Anchor Link)
  const scrollToCategory = (id: string) => {
    const element = document.getElementById(`cat-${id}`);
    if (element) {
      // Menggunakan offset agar tidak tertutup oleh sub-navbar yang sticky
      const y = element.getBoundingClientRect().top + window.scrollY - 150;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section className="relative bg-[#F9F8F4] flex flex-col md:flex-row">
      
      {/* =========================================
          KIRI (33%): PHONE FRAME (STICKY)
      ========================================= */}
      <div className="hidden md:flex md:w-[35%] lg:w-[33%] sticky top-0 h-screen bg-[#07303F] items-center justify-center overflow-hidden border-r border-slate-200 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#E5C185]/20 blur-[100px] rounded-full z-0 pointer-events-none" />

        <div className="relative z-10 scale-[0.80] lg:scale-[0.90] origin-center">
          <PhoneFrame>
            <div className="w-full h-full relative bg-black overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeThumbnail}
                  src={activeThumbnail}
                  alt="Template Preview"
                  className="w-full h-full object-cover absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </AnimatePresence>
            </div>
          </PhoneFrame>
        </div>
      </div>

      {/* =========================================
          KANAN (66%): KATALOG DENGAN STICKY SUB-NAV
      ========================================= */}
      <div className="w-full md:w-[65%] lg:w-[67%] relative">
        
        {/* STICKY SUB-NAVBAR KATEGORI (Lengket di atas saat digulir) */}
        <div className="sticky top-0 z-40 bg-[#F9F8F4]/95 backdrop-blur-md pt-12 pb-4 px-6 md:px-16 border-b border-slate-200 shadow-sm">
           <h2 className="font-sans font-bold text-3xl md:text-5xl text-[#07303F] mb-6">The Collection</h2>
           
           {/* Anchor Links Kategori */}
           <div className="flex gap-6 overflow-x-auto hide-scrollbar snap-x">
             {categories.map((cat) => (
               <button 
                 key={cat.id} 
                 onClick={() => scrollToCategory(cat.id)}
                 className="snap-start text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#07303F] whitespace-nowrap pb-2 border-b-2 border-transparent hover:border-[#E5C185] transition-all"
               >
                 {cat.name}
               </button>
             ))}
           </div>
        </div>

        {/* DAFTAR KAROSEL KATEGORI */}
        <div className="py-12 px-0 flex flex-col gap-16 md:gap-24">
          {categories.map((cat) => (
            <div key={cat.id} id={`cat-${cat.id}`} className="flex flex-col pt-4">
              
              {/* Judul Kategori & Jumlah */}
              <div className="px-6 md:px-16 flex items-center gap-4 mb-6">
                 <h3 className="font-sans font-bold text-xl md:text-2xl text-[#07303F]">{cat.name}</h3>
                 <span className="h-[1px] flex-1 bg-slate-200"></span>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{cat.templates.length} Designs</span>
              </div>

              {/* KAROSEL HORIZONTAL NETFLIX-STYLE */}
              <div className="w-full overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar pl-6 md:pl-16 pr-6">
                 <div className="flex gap-4 md:gap-6 w-max">
                   {cat.templates.map((tpl) => (
                     <div 
                       key={tpl.id} 
                       className="w-[260px] md:w-[280px] shrink-0 snap-start flex flex-col group cursor-pointer"
                       onMouseEnter={() => setActiveThumbnail(tpl.thumbnail)} // Pemicu perubahan gambar di HP saat di-hover/disentuh
                     >
                       
                       {/* Thumbnail Kotak untuk Mobile / Fallback */}
                       <div className="md:hidden relative w-full aspect-[4/5] bg-slate-100 rounded-lg overflow-hidden mb-4 border border-slate-200 shadow-sm">
                          <Image src={tpl.thumbnail} alt={tpl.name} fill className="object-cover" />
                       </div>

                       {/* Kotak Area Hover Desktop (Tanpa Gambar Asli karena sudah ada di iPhone Kiri) */}
                       <div className="hidden md:flex relative w-full h-[120px] bg-slate-100/50 rounded-lg overflow-hidden mb-4 border border-slate-200 hover:border-[#E5C185] transition-colors items-center justify-center group-hover:bg-[#07303F] group-hover:shadow-lg">
                          <div className="text-center p-4">
                             <span className="text-slate-400 group-hover:text-[#E5C185] text-[10px] uppercase tracking-widest font-bold block mb-1 transition-colors">Hover to Preview</span>
                             <span className="text-[#07303F] group-hover:text-white text-xs font-medium transition-colors">On Device</span>
                          </div>
                       </div>

                       {/* Detail Teks */}
                       <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-base md:text-lg text-[#07303F] group-hover:text-[#E5C185] transition-colors line-clamp-1">{tpl.name}</h4>
                            {tpl.isPremium && <span className="text-[9px] font-bold text-[#E5C185] uppercase tracking-widest">Premium Edition</span>}
                          </div>
                       </div>
                       
                       <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{tpl.description}</p>

                       {/* Tombol Aksi */}
                       <div className="flex gap-2 mt-auto">
                          <Button asChild className="flex-1 bg-[#07303F] text-white hover:bg-[#07303F]/90 rounded-sm text-[10px] uppercase tracking-widest font-bold h-9">
                             <Link href={tpl.previewUrl || "#"} target="_blank">
                               Live Preview
                             </Link>
                          </Button>
                          <Button asChild variant="outline" size="icon" className="h-9 w-9 border-slate-300 text-slate-500 rounded-sm hover:text-[#E5C185] hover:border-[#E5C185] shrink-0">
                             <Link href={`https://wa.me/6281234567890?text=Halo%20Admin,%20konsultasi%20template%20${tpl.name}`} target="_blank">
                               <MessageCircle className="w-4 h-4" />
                             </Link>
                          </Button>
                       </div>

                     </div>
                   ))}
                 </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}