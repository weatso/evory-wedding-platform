"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import PhoneFrame from "./PhoneFrame";

export default function HybridShowcase({ categories }: { categories: any[] }) {
  // Gabungkan semua template dari kategori yang berstatus isFeatured: true
  const allTemplates = categories.flatMap(cat => cat.templates);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (allTemplates.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allTemplates.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allTemplates.length) % allTemplates.length);
  };

  return (
    <section className="w-full bg-[#F9F8F4] pt-12 pb-24 md:pt-16 md:pb-32 overflow-hidden flex flex-col items-center">
      
      {/* Carousel Container (CoverFlow Style) */}
      <div className="relative w-full h-[450px] md:h-[500px] lg:h-[600px] flex items-center justify-center">
        {allTemplates.map((tpl, index) => {
          // Hitung jarak elemen dari posisi aktif (center)
          let offset = index - currentIndex;
          
          // Logika infinite loop (jika dari akhir lompat ke awal, atau sebaliknya)
          if (offset < -1 && currentIndex === allTemplates.length - 1 && index === 0) offset = 1;
          if (offset > 1 && currentIndex === 0 && index === allTemplates.length - 1) offset = -1;

          // Status visibilitas dan posisi
          const isCenter = offset === 0;
          const isLeft = offset === -1;
          const isRight = offset === 1;
          const isHidden = Math.abs(offset) > 1;

          let x = "0%";
          let scale = 1;
          let opacity = 1;
          let zIndex = 30;

          if (isLeft) {
            x = "-85%";
            scale = 0.75;
            opacity = 0.4;
            zIndex = 20;
          } else if (isRight) {
            x = "85%";
            scale = 0.75;
            opacity = 0.4;
            zIndex = 20;
          } else if (isHidden) {
            x = offset > 0 ? "150%" : "-150%";
            scale = 0.5;
            opacity = 0;
            zIndex = 10;
          }

          return (
            <motion.div
              key={tpl.id}
              className="absolute top-1/2 left-1/2 origin-center"
              initial={false}
              animate={{
                x: `calc(-50% + ${x})`,
                y: "-50%",
                scale,
                opacity,
                zIndex
              }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => {
                if (isLeft) handlePrev();
                if (isRight) handleNext();
              }}
              style={{ cursor: isCenter ? "default" : "pointer" }}
            >
              {isCenter ? (
                <PhoneFrame>
                  <div className="relative w-full h-full bg-slate-100 group">
                    <Image 
                      src={tpl.thumbnail} 
                      alt={tpl.name} 
                      fill 
                      className="object-cover"
                    />
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-t from-[#07303F]/90 via-[#07303F]/30 to-transparent flex flex-col justify-end p-6 md:p-8 text-center items-center pb-12"
                    >
                      <h4 className="font-serif text-3xl text-white mb-3 drop-shadow-lg">{tpl.name}</h4>
                      {tpl.tier && (
                        <span className="text-[9px] font-bold text-[#E5C185] uppercase tracking-widest border border-[#E5C185]/40 px-4 py-1.5 mb-6 backdrop-blur-sm bg-black/30 rounded-full">
                          {tpl.tier}
                        </span>
                      )}
                      <Link 
                        href={tpl.previewUrl || "#"} 
                        target="_blank"
                        className="bg-[#E5C185] text-[#07303F] px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-white transition-colors shadow-xl"
                      >
                        Preview Live
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  </div>
                </PhoneFrame>
              ) : (
                <div className="relative mx-auto w-[200px] h-[410px] md:w-[220px] md:h-[450px] lg:w-[250px] lg:h-[520px] bg-slate-100 rounded-[30px] shadow-2xl overflow-hidden group">
                  <Image 
                    src={tpl.thumbnail} 
                    alt={tpl.name} 
                    fill 
                    className="object-cover"
                  />
                  {/* Gelapkan sedikit item yang tidak aktif */}
                  <div className="absolute inset-0 bg-black/30" />
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Carousel Controls (Desktop) */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full max-w-6xl px-4 flex justify-between pointer-events-none z-40 hidden md:flex">
          <button 
            onClick={handlePrev}
            className="w-14 h-14 rounded-full bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center justify-center pointer-events-auto hover:bg-[#07303F] hover:text-[#E5C185] transition-all hover:scale-110 text-[#07303F]"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNext}
            className="w-14 h-14 rounded-full bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center justify-center pointer-events-auto hover:bg-[#07303F] hover:text-[#E5C185] transition-all hover:scale-110 text-[#07303F]"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Mobile Controls */}
      <div className="flex md:hidden gap-8 mt-12 z-40">
        <button 
          onClick={handlePrev}
          className="w-14 h-14 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#07303F]"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={handleNext}
          className="w-14 h-14 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#07303F]"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

    </section>
  );
}