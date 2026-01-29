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
    desc: "Keanggunan budaya Jawa dalam balutan teknologi. Motif batik klasik berpadu dengan ornamen emas yang megah.",
    bgClass: "bg-[#1A1A1A]", 
    previewText: "JVN"
  },
  {
    id: "modern",
    style: "MODERN MINIMALIST",
    name: "Ethereal White",
    desc: "Kesederhanaan adalah bentuk kemewahan tertinggi. Desain bersih dengan tipografi modern dan ruang putih yang lega.",
    bgClass: "bg-[#8A8A8A]", 
    previewText: "MDR"
  },
  {
    id: "luxury",
    style: "LUXURY GOLD",
    name: "Golden Era",
    desc: "Kemewahan tanpa batas. Dominasi warna emas dan hitam pekat memberikan kesan eksklusif dan glamor.",
    bgClass: "bg-[#D4AF37]", 
    previewText: "LUX"
  }
];

export default function LandingPage() {
  const [activeTemplate, setActiveTemplate] = useState(0);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      sectionsRef.current.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            setActiveTemplate(index);
          }
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-evory-base text-evory-dark selection:bg-evory-gold selection:text-white font-sans overflow-x-hidden relative">
      
      {/* --- 1. HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 pt-20 lg:pt-0 overflow-hidden">
        
        {/* KIRI: Text & Login */}
        <div className="w-full lg:w-1/2 space-y-8 z-10 text-center lg:text-left mt-20 lg:mt-0 order-2 lg:order-1">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-evory-gold/30 bg-evory-gold/10 backdrop-blur-sm">
                <Star size={12} className="text-evory-gold fill-evory-gold" />
                <span className="text-evory-gold text-[10px] tracking-[0.3em] uppercase font-bold">
                  The Official Portal
                </span>
             </div>
             
             <h1 className="text-5xl lg:text-8xl font-serif leading-[1.0] mb-6 text-evory-dark">
               Timeless <br/> 
               <span className="text-gold-shine italic pr-2">Elegance.</span>
             </h1>
             
             <p className="text-evory-grey text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
               Platform undangan pernikahan digital premium. Wujudkan momen sakral Anda dengan perpaduan tradisi dan teknologi.
             </p>

             {/* BUTTONS */}
             <div className="flex flex-col items-center lg:items-start gap-6 pt-4">
                <Link href="/login" className="group w-full sm:w-auto">
                   <div className="bg-evory-dark text-white px-10 py-5 rounded-full font-bold flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-2xl border border-transparent hover:border-evory-gold/50">
                      <Heart size={20} className="fill-white" /> 
                      <span className="tracking-wide text-lg">LOGIN PORTAL</span>
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform"/>
                   </div>
                </Link>
                
                <Link href="/admin/login" className="text-xs text-evory-grey hover:text-evory-gold flex items-center gap-2 transition-colors opacity-70 hover:opacity-100">
                   <Lock size={12} /> <span>Staff / Admin Access</span>
                </Link>
             </div>
        </div>

        {/* KANAN: 3D Envelope */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-screen relative z-0 order-1 lg:order-2">
           <Envelope3D />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-evory-gold blur-[150px] opacity-20 -z-10 rounded-full" />
        </div>
      </section>

      {/* --- 2. MARQUEE SECTION --- */}
      <section className="py-6 bg-evory-dark text-evory-base overflow-hidden border-y border-evory-gold/50 relative z-20">
        <div className="flex whitespace-nowrap overflow-hidden w-full">
          <div className="flex animate-marquee min-w-full shrink-0 items-center gap-12 px-6">
             {/* Content 1 */}
             <span className="text-2xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">JAVANESE ROYAL</span>
             <span className="text-evory-gold text-2xl">•</span>
             <span className="text-2xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">MODERN MINIMALIST</span>
             <span className="text-evory-gold text-2xl">•</span>
             <span className="text-2xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">LUXURY GOLD</span>
             <span className="text-evory-gold text-2xl">•</span>
             <span className="text-2xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">FLORAL DREAM</span>
             <span className="text-evory-gold text-2xl">•</span>
          </div>
          {/* Duplicate for Loop */}
          <div className="flex animate-marquee min-w-full shrink-0 items-center gap-12 px-6" aria-hidden="true">
             <span className="text-2xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">JAVANESE ROYAL</span>
             <span className="text-evory-gold text-2xl">•</span>
             <span className="text-2xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">MODERN MINIMALIST</span>
             <span className="text-evory-gold text-2xl">•</span>
             <span className="text-2xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">LUXURY GOLD</span>
             <span className="text-evory-gold text-2xl">•</span>
             <span className="text-2xl lg:text-4xl font-serif italic tracking-widest text-evory-base/80">FLORAL DREAM</span>
             <span className="text-evory-gold text-2xl">•</span>
          </div>
        </div>
      </section>

      {/* --- 3. STICKY SCROLL PORTFOLIO (LUXURY BACKGROUND) --- */}
      <section className="relative bg-[#0F0F0F] text-evory-base"> {/* Background Gelap Mewah */}
        <div className="flex flex-col lg:flex-row">
          
          {/* KIRI: STICKY PHONE FRAME */}
          <div className="w-full lg:w-1/2 h-[80vh] lg:h-screen sticky top-0 flex items-center justify-center bg-[#141414] p-6 lg:p-0 border-r border-white/5 z-10 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
             
             {/* FRAME HP */}
             <div className="relative h-[60vh] aspect-[9/19] bg-black rounded-[3rem] shadow-[0_0_50px_rgba(212,175,55,0.15)] border-[8px] border-[#2a2a2a] ring-1 ring-white/10 overflow-hidden transform transition-all duration-700 ease-in-out z-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 bg-black rounded-b-xl z-20"></div>
                <div className={`w-full h-full flex items-center justify-center transition-colors duration-700 ${templates[activeTemplate].bgClass}`}>
                   <h3 className="text-white/20 text-6xl font-serif font-bold">{templates[activeTemplate].previewText}</h3>
                </div>
             </div>

             {/* Background Decoration di Belakang HP */}
             <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-gradient-to-b from-evory-gold/5 to-transparent rounded-full blur-[100px]" />
                <div className="absolute w-full h-full bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div> {/* Noise Texture jika ada */}
             </div>
          </div>

          {/* KANAN: TEXT (BACKGROUND MEWAH) */}
          <div className="w-full lg:w-1/2 relative z-20 bg-[#0F0F0F]">
             {templates.map((template, index) => (
               <div 
                 key={template.id} 
                 ref={(el) => { sectionsRef.current[index] = el; }}
                 className="min-h-screen flex flex-col justify-center px-10 lg:px-24 py-20 border-b border-white/5 last:border-0 group transition-colors duration-500 hover:bg-[#121212]"
               >
                 <span className="text-evory-gold text-xs tracking-[0.4em] uppercase font-bold mb-4 block opacity-60 group-hover:opacity-100 transition-opacity">
                   {template.style}
                 </span>
                 <h2 className="text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight group-hover:text-gold-shine transition-colors">
                   {template.name}
                 </h2>
                 <p className="text-gray-400 text-lg leading-relaxed font-light mb-10 group-hover:text-gray-300 transition-colors">
                   {template.desc}
                 </p>
                 <Link href={`/portfolio/${template.id}`}>
                    <div className="inline-flex items-center gap-3 text-white border-b border-white/20 pb-2 hover:border-evory-gold transition-all cursor-pointer group/link">
                       <span className="uppercase tracking-widest text-sm font-bold group-hover/link:text-evory-gold transition-colors">View Design</span>
                       <ArrowRight size={16} className="group-hover/link:translate-x-2 group-hover/link:text-evory-gold transition-transform"/>
                    </div>
                 </Link>
               </div>
             ))}
             
             {/* FOOTER CTA */}
             <div className="py-32 px-10 lg:px-24 text-center lg:text-left bg-black border-t border-evory-gold/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-evory-gold/10 blur-[150px] rounded-full pointer-events-none" />
                
                <h3 className="text-4xl font-serif mb-6 text-white relative z-10">Mulai Perjalanan Anda</h3>
                <p className="text-gray-400 mb-10 font-light max-w-md relative z-10">Bergabung dengan Evory dan buat momen Anda tak terlupakan dengan sentuhan kemewahan.</p>
                
                <Link href="/login" className="relative z-10">
                   <Button className="bg-evory-gold text-black rounded-full px-12 py-7 hover:bg-white hover:text-black transition-all font-bold tracking-widest shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]">
                     GET STARTED
                   </Button>
                </Link>
             </div>
          </div>

        </div>
      </section>
    </div>
  );
}