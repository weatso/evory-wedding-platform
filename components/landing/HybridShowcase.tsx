"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import PhoneFrame from "./PhoneFrame";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// --- TIPE DATA ---
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
  description?: string | null;
  templates: Template[];
};

export default function HybridShowcase({ categories }: { categories: Category[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // LOGIKA SCROLL VERTIKAL (GANTI KATEGORI)
  // Tinggi container = Jumlah Kategori * 100vh.
  // Artinya user butuh 1x scroll layar penuh untuk ganti kategori.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // State
  const [activeCatIndex, setActiveCatIndex] = useState(0); // Index Kategori (Scroll)
  const [activeTplIndex, setActiveTplIndex] = useState(0); // Index Template (Manual Click)

  // 1. Deteksi Scroll untuk Ganti Kategori
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const totalCats = categories.length;
      // Rumus: Progress 0-1 dipetakan ke jumlah kategori
      const newCatIndex = Math.min(
        Math.max(Math.floor(latest * totalCats), 0),
        totalCats - 1
      );

      // Jika kategori berubah, reset template index ke 0 (awal lagi)
      if (newCatIndex !== activeCatIndex) {
        setActiveCatIndex(newCatIndex);
        setActiveTplIndex(0); 
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, categories.length, activeCatIndex]);

  // Data Aktif
  const currentCategory = categories[activeCatIndex];
  const currentTemplate = currentCategory?.templates[activeTplIndex];

  // Navigasi Manual (Next/Prev Template)
  const nextTemplate = () => {
    if (activeTplIndex < currentCategory.templates.length - 1) {
      setActiveTplIndex((prev) => prev + 1);
    }
  };

  const prevTemplate = () => {
    if (activeTplIndex > 0) {
      setActiveTplIndex((prev) => prev - 1);
    }
  };

  if (!currentCategory || !currentTemplate) return null;

  return (
    // CONTAINER TINGGI UNTUK SCROLL TRACKING
    <section 
      ref={containerRef} 
      className="relative bg-black" 
      style={{ height: `${categories.length * 150}vh` }} // 150vh per kategori biar agak lama scrollnya
    >
      
      {/* STICKY VIEWPORT (Layar yang diam) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col lg:flex-row items-center justify-center">
        
        {/* =========================================
            BAGIAN KIRI: PHONE FRAME (Sticky)
            Berubah saat Kategori ganti OR Template diklik
        ========================================= */}
        <div className="w-full lg:w-1/2 h-[45vh] lg:h-full flex items-center justify-center pt-8 lg:pt-0 relative z-10">
          
          {/* Wrapper PhoneFrame dengan ukuran responsif */}
          <div className="scale-[0.65] sm:scale-75 lg:scale-100 origin-center transition-transform duration-500">
            <PhoneFrame>
              <div className="w-full h-full relative bg-stone-900 overflow-hidden">
                <AnimatePresence mode="popLayout" custom={activeTplIndex}>
                  <motion.img
                    key={`${currentCategory.id}-${currentTemplate.id}`} 
                    src={currentTemplate.thumbnail}
                    alt={currentTemplate.name}
                    className="w-full h-full object-cover absolute inset-0"
                    
                    // Animasi Slide Horizontal (Carousel Effect)
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </AnimatePresence>
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              </div>
            </PhoneFrame>
          </div>

          {/* Glow Effect di belakang HP */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-amber-600/20 blur-[100px] rounded-full -z-10" />
        </div>


        {/* =========================================
            BAGIAN KANAN: KONTEN TEKS & KONTROL (Sticky)
        ========================================= */}
        <div className="w-full lg:w-1/2 h-[55vh] lg:h-full flex flex-col justify-start lg:justify-center px-6 lg:px-24 pb-12 lg:pb-0 relative z-20">
          
          {/* Animasi Transisi Teks (Fade In/Out saat konten berubah) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentCategory.id}-${currentTemplate.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 lg:space-y-6 text-center lg:text-left"
            >
              
              {/* Header Kategori */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-4 justify-center lg:justify-start">
                 <Badge variant="outline" className="text-amber-500 border-amber-500/30 tracking-widest uppercase text-[10px] lg:text-xs px-3 py-1">
                   {currentCategory.name} Collection
                 </Badge>
                 <span className="text-stone-500 text-xs font-mono">
                   Template {activeTplIndex + 1} of {currentCategory.templates.length}
                 </span>
              </div>

              {/* Judul Template */}
              <h2 className="text-3xl lg:text-6xl font-serif text-white leading-tight">
                {currentTemplate.name}
              </h2>

              {/* Deskripsi */}
              <p className="text-stone-400 text-sm lg:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 min-h-[60px] lg:min-h-[80px]">
                {currentTemplate.description || "Desain premium dengan fitur undangan digital terlengkap."}
              </p>

              {/* Tombol Kontrol Manual (Next/Prev) */}
              <div className="flex items-center justify-center lg:justify-start gap-4 py-2 lg:py-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={prevTemplate}
                  disabled={activeTplIndex === 0}
                  className="rounded-full border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex gap-2">
                   {currentCategory.templates.map((_, idx) => (
                     <div 
                       key={idx} 
                       className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeTplIndex ? 'w-8 bg-amber-500' : 'w-2 bg-stone-700'}`}
                     />
                   ))}
                </div>

                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={nextTemplate}
                  disabled={activeTplIndex === currentCategory.templates.length - 1}
                  className="rounded-full border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Action Buttons (Konsultasi & Preview) */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                <Button asChild className="rounded-full bg-white text-black hover:bg-stone-200">
                   <Link href={currentTemplate.previewUrl || "#"} target="_blank">
                     Live Preview <ArrowRight className="ml-2 w-4 h-4" />
                   </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-stone-600 text-white hover:bg-stone-800">
                   <Link 
                      href={`https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20mau%20konsultasi%20template%20*${currentTemplate.name}*`}
                      target="_blank"
                   >
                     <MessageCircle className="mr-2 w-4 h-4" /> Konsultasi
                   </Link>
                </Button>
              </div>

            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}