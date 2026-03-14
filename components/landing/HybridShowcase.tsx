"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneFrame from "./PhoneFrame";
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

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(`cat-${id}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex flex-col md:flex-row">
      
      {/* =========================================
          KIRI (33%): PHONE FRAME (TIBER GELAP)
      ========================================= */}
      <div className="hidden md:flex md:w-[35%] lg:w-[33%] sticky top-0 h-screen bg-[#07303F] items-center justify-center overflow-hidden border-r border-[#07303F] relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#E5C185]/10 blur-[100px] rounded-full z-0 pointer-events-none" />

        <div className="relative z-10 scale-[0.80] lg:scale-[0.90] origin-center">
          <PhoneFrame>
            <div className="w-full h-full relative bg-black overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeThumbnail}
                  src={activeThumbnail}
                  alt="Template Preview"
                  className="w-full h-full object-cover absolute inset-0"
                  initial={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </AnimatePresence>
            </div>
          </PhoneFrame>
        </div>
      </div>

      {/* =========================================
          KANAN (66%): GALERI MINIMALIS (IVORY)
      ========================================= */}
      <div className="w-full md:w-[65%] lg:w-[67%] relative bg-[#F9F8F4]">
        
        {/* STICKY INDEX NAVBAR (Tipis & Elegan) */}
        <div className="sticky top-0 z-40 bg-[#F9F8F4]/90 backdrop-blur-xl pt-10 pb-4 px-6 md:px-16 border-b border-slate-200/50">
           <h2 className="font-sans font-light text-2xl md:text-4xl text-[#07303F] mb-6">The Collection.</h2>
           
           <div className="flex gap-8 overflow-x-auto hide-scrollbar snap-x">
             {categories.map((cat) => (
               <button 
                 key={cat.id} 
                 onClick={() => scrollToCategory(cat.id)}
                 className="snap-start text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-[#07303F] whitespace-nowrap pb-2 border-b border-transparent hover:border-[#07303F] transition-all"
               >
                 {cat.name}
               </button>
             ))}
           </div>
        </div>

        {/* DAFTAR KAROSEL KATEGORI */}
        <div className="py-16 px-0 flex flex-col gap-24">
          {categories.map((cat) => (
            <div key={cat.id} id={`cat-${cat.id}`} className="flex flex-col">
              
              <div className="px-6 md:px-16 flex items-center gap-6 mb-8">
                 <h3 className="font-sans font-bold text-lg md:text-xl text-[#07303F] tracking-wide">{cat.name}</h3>
                 <span className="text-[10px] text-[#E5C185] font-bold uppercase tracking-widest">{cat.templates.length} Editions</span>
              </div>

              {/* KAROSEL HORIZONTAL (Tanpa Border) */}
              <div className="w-full overflow-x-auto pb-10 snap-x snap-mandatory hide-scrollbar pl-6 md:pl-16 pr-6">
                 <div className="flex gap-6 md:gap-10 w-max">
                   {cat.templates.map((tpl) => (
                     <div 
                       key={tpl.id} 
                       className="w-[260px] md:w-[300px] shrink-0 snap-start flex flex-col group cursor-pointer"
                       onMouseEnter={() => setActiveThumbnail(tpl.thumbnail)}
                     >
                       
                       {/* THUMBNAIL BERSIH (Tanpa kotak abu-abu) */}
                       <div className="relative w-full aspect-[4/5] bg-slate-200 overflow-hidden mb-5">
                          <Image src={tpl.thumbnail} alt={tpl.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                          
                          {/* OVERLAY AKSI TERSEMBUNYI (Muncul Saat Hover) */}
                          <div className="absolute inset-0 bg-[#07303F]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                             <Link href={tpl.previewUrl || "#"} target="_blank" className="text-white text-[10px] uppercase tracking-widest font-bold border-b border-white pb-1 hover:text-[#E5C185] hover:border-[#E5C185] transition-colors">
                                View Live Demo
                             </Link>
                             <Link href={`https://wa.me/6281234567890?text=Halo%20Admin,%20konsultasi%20template%20${tpl.name}`} target="_blank" className="text-white text-[10px] uppercase tracking-widest font-bold border-b border-white pb-1 hover:text-[#E5C185] hover:border-[#E5C185] transition-colors">
                                Consult
                             </Link>
                          </div>
                       </div>

                       {/* TIPOGRAFI MINIMALIS */}
                       <div className="flex flex-col">
                          <div className="flex justify-between items-baseline mb-2">
                            <h4 className="font-bold text-base text-[#07303F] uppercase tracking-wide">{tpl.name}</h4>
                            {tpl.isPremium && <span className="text-[8px] font-bold text-[#E5C185] uppercase tracking-widest">Premium</span>}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 font-light">{tpl.description}</p>
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