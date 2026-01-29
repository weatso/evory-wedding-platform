"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Envelope3D from "@/components/landing/Envelope3D"; 
import { ArrowRight, Lock, Heart, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";

// DATA TEMPLATE
const templates = [
  {
    id: "javanese",
    style: "TRADITIONAL SERIES",
    name: "Javanese Royal",
    desc: "Keanggunan budaya Jawa dalam balutan teknologi. Motif batik klasik berpadu dengan ornamen emas.",
    bgClass: "bg-[#1A1A1A]", 
    previewText: "JVN"
  },
  {
    id: "modern",
    style: "MODERN MINIMALIST",
    name: "Ethereal White",
    desc: "Kesederhanaan adalah bentuk kemewahan tertinggi. Desain bersih dengan tipografi modern.",
    bgClass: "bg-[#8A8A8A]", 
    previewText: "MDR"
  },
  {
    id: "luxury",
    style: "LUXURY GOLD",
    name: "Golden Era",
    desc: "Kemewahan tanpa batas. Dominasi warna emas dan hitam pekat memberikan kesan eksklusif.",
    bgClass: "bg-[#D4AF37]", 
    previewText: "LUX"
  }
];

export default function LandingPage() {
  const [activeTemplate, setActiveTemplate] = useState(0);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);

  // 1. Logic Scroll Spy (Ganti Gambar HP)
  useEffect(() => {
    const handleScroll = () => {
      sectionsRef.current.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          // Trigger diperketat: Aktif saat tengah elemen ada di tengah layar
          if (rect.top >= -window.innerHeight * 0.3 && rect.top <= window.innerHeight * 0.5) {
            setActiveTemplate(index);
          }
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Logic Auto Loop (INSTANT)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // LANGSUNG LEMPAR KE ATAS TANPA JEDA
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      },
      { threshold: 0.1 } 
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-evory-base text-evory-dark selection:bg-evory-gold selection:text-white font-sans relative">
      

      {/* --- 1. HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 pt-20 lg:pt-0 overflow-hidden">
        
        {/* KIRI: Text & Login */}
        <div className="w-full lg:w-1/2 space-y-6 lg:space-y-8 z-10 text-center lg:text-left mt-10 lg:mt-0 order-2 lg:order-1">
             
             <h1 className="text-4xl lg:text-8xl font-serif leading-[1.0] mb-4 lg:mb-6 text-evory-dark">
               Timeless <br/> 
               <span className="text-gold-shine italic pr-2">Elegance.</span>
             </h1>
             
             <p className="text-evory-grey text-sm lg:text-lg max-w-xs lg:max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
               Platform undangan pernikahan digital premium. Wujudkan momen sakral Anda dengan perpaduan tradisi dan teknologi.
             </p>

             <div className="flex flex-col items-center lg:items-start gap-4 pt-2 lg:pt-4">
                <Link href="/login" className="group w-full sm:w-auto">
                   <div className="bg-evory-dark text-white px-8 py-4 lg:px-10 lg:py-5 rounded-full font-bold flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-2xl border border-transparent hover:border-evory-gold/50">
                      <Heart size={16} className="fill-white" /> 
                      <span className="tracking-wide text-sm lg:text-lg">LOGIN PORTAL</span>
                      <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform"/>
                   </div>
                </Link>
                
                <Link href="/admin/login" className="text-[10px] lg:text-xs text-evory-grey hover:text-evory-gold flex items-center gap-2 transition-colors opacity-70 hover:opacity-100">
                   <Lock size={10} /> <span>Staff / Admin Access</span>
                </Link>
             </div>
        </div>

        {/* KANAN: 3D Envelope */}
        <div className="w-full lg:w-1/2 h-[40vh] lg:h-screen relative z-0 order-1 lg:order-2">
           <Envelope3D />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] lg:w-[400px] h-[200px] lg:h-[400px] bg-evory-gold blur-[80px] lg:blur-[150px] opacity-20 -z-10 rounded-full" />
        </div>
      </section>

      {/* --- 2. MARQUEE SECTION --- */}
      <section className="py-4 lg:py-6 bg-evory-dark text-evory-base overflow-hidden border-y border-evory-gold/50 relative z-20">
        <div className="flex whitespace-nowrap overflow-hidden w-full">
          <div className="flex animate-marquee min-w-full shrink-0 items-center gap-8 lg:gap-12 px-6">
             <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">JAVANESE ROYAL</span>
             <span className="text-evory-gold text-xl lg:text-2xl">•</span>
             <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">MODERN MINIMALIST</span>
             <span className="text-evory-gold text-xl lg:text-2xl">•</span>
             <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">LUXURY GOLD</span>
             <span className="text-evory-gold text-xl lg:text-2xl">•</span>
          </div>
          <div className="flex animate-marquee min-w-full shrink-0 items-center gap-8 lg:gap-12 px-6" aria-hidden="true">
             <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">JAVANESE ROYAL</span>
             <span className="text-evory-gold text-xl lg:text-2xl">•</span>
             <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">MODERN MINIMALIST</span>
             <span className="text-evory-gold text-xl lg:text-2xl">•</span>
             <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">LUXURY GOLD</span>
             <span className="text-evory-gold text-xl lg:text-2xl">•</span>
          </div>
        </div>
      </section>

      {/* --- 3. STICKY SCROLL PORTFOLIO --- */}
      <section className="relative bg-[#0F0F0F] text-evory-base"> 
        <div className="flex flex-row items-start">
          
          {/* KOLOM 1: STICKY PHONE FRAME */}
          <div className="w-[45%] lg:w-1/2 h-screen sticky top-0 flex items-center justify-center bg-[#141414] border-r border-white/5 z-10 overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
             <div className="relative w-[95%] lg:w-auto h-[50vh] lg:h-[75vh] aspect-[9/19] bg-black rounded-[1.5rem] lg:rounded-[3rem] shadow-[0_0_20px_rgba(212,175,55,0.15)] border-[4px] lg:border-[8px] border-[#2a2a2a] ring-1 ring-white/10 overflow-hidden transform transition-all duration-700 ease-in-out z-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-12 lg:h-6 lg:w-24 bg-black rounded-b-lg lg:rounded-b-xl z-20"></div>
                <div className={`w-full h-full flex items-center justify-center transition-colors duration-700 ${templates[activeTemplate].bgClass}`}>
                   <h3 className="text-white/20 text-4xl lg:text-8xl font-serif font-bold animate-pulse">{templates[activeTemplate].previewText}</h3>
                </div>
             </div>
             <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[80%] bg-gradient-to-b from-evory-gold/5 to-transparent rounded-full blur-[50px] lg:blur-[100px]" />
             </div>
          </div>

          {/* KOLOM 2: TEXT SCROLL AREA */}
          <div className="w-[55%] lg:w-1/2 relative z-20 bg-[#0F0F0F]">
             {templates.map((template, index) => (
               <div 
                 key={template.id} 
                 ref={(el) => { sectionsRef.current[index] = el; }}
                 // ALIGNMENT FIX: Menggunakan h-screen (bukan min-h) di Desktop agar presisi 1:1 dengan Sticky Phone
                 className="h-[60vh] lg:h-screen flex flex-col justify-center px-4 lg:px-24 py-10 lg:py-0 border-b border-white/5 last:border-0 group transition-colors duration-500 hover:bg-[#121212]"
               >
                 <span className="text-evory-gold text-[9px] lg:text-xs tracking-[0.2em] uppercase font-bold mb-2 lg:mb-4 block opacity-60 group-hover:opacity-100 transition-opacity">
                   {template.style}
                 </span>
                 <h2 className="text-2xl lg:text-7xl font-serif text-white mb-3 lg:mb-6 leading-tight group-hover:text-gold-shine transition-colors">
                   {template.name}
                 </h2>
                 <p className="text-gray-400 text-xs lg:text-xl leading-relaxed font-light mb-6 lg:mb-10 group-hover:text-gray-300 transition-colors">
                   {template.desc}
                 </p>
                 <Link href={`/portfolio/${template.id}`}>
                    <div className="inline-flex items-center gap-2 lg:gap-3 text-white border-b border-white/20 pb-1 lg:pb-2 hover:border-evory-gold transition-all cursor-pointer group/link">
                       <span className="uppercase tracking-widest text-[10px] lg:text-sm font-bold group-hover/link:text-evory-gold transition-colors">View Demo</span>
                       <ArrowRight size={14} className="lg:w-5 lg:h-5 group-hover/link:translate-x-2 group-hover/link:text-evory-gold transition-transform"/>
                    </div>
                 </Link>
               </div>
             ))}
             
             {/* SENSOR AUTO LOOP (INVISIBLE TRIGGER) */}
             {/* Height 1px cukup untuk trigger observer tanpa membuat space kosong besar */}
             <div 
               ref={footerRef}
               className="h-px w-full bg-transparent"
             />
          </div>

        </div>
      </section>
    </div>
  );
}