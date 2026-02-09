import Envelope3D from "@/components/landing/Envelope3D";
import TemplateSection from "@/components/landing/TemplateSection";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Heart, Lock } from "lucide-react";
import Link from "next/link";

export default async function LandingPage() {
  // FETCH DATA DYNAMICALLY
  const categories = await prisma.templateCategory.findMany({
    include: {
      items: {
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  // Extract all template names for Marquee
  const allTemplates = categories.flatMap(c => c.items);

  return (
    // 'snap-y snap-mandatory' active on the root container for full page section snapping
    <div className="min-h-screen bg-[linear-gradient(135deg,#F9F8F4_0%,#1a1a1a_22%,#000000_80%)] text-evory-base selection:bg-evory-gold selection:text-white font-sans relative overflow-x-hidden scrollbar-hide">

      {/* --- 1. HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 pt-24 lg:pt-0 overflow-hidden z-10">

        {/* KIRI: Text & Login */}
        <div className="w-full lg:w-1/2 space-y-6 lg:space-y-8 z-10 text-center lg:text-left mt-8 lg:mt-0 order-2 lg:order-1">

          <h1 className="text-5xl lg:text-8xl font-serif leading-[1.0] mb-4 lg:mb-6 text-white">
            Timeless <br />
            <span className="text-evory-gold italic pr-2">Elegance.</span>
          </h1>

          <p className="text-gray-400 text-base lg:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
            Platform undangan pernikahan digital premium. Wujudkan momen sakral Anda dengan perpaduan tradisi dan teknologi.
          </p>

          <div className="flex flex-col items-center lg:items-start gap-4 pt-4 lg:pt-8">
            <Link href="/login" className="group w-full sm:w-auto">
              <div className="bg-white text-black px-8 py-4 lg:px-10 lg:py-5 rounded-full font-bold flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-transparent">
                <Heart size={16} className="fill-black" />
                <span className="tracking-wide text-sm lg:text-lg">LOGIN PORTAL</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>

            <Link href="/admin/login" className="text-xs text-gray-500 hover:text-white flex items-center gap-2 transition-colors opacity-70 hover:opacity-100">
              <Lock size={12} /> <span>Staff / Admin Access</span>
            </Link>
          </div>
        </div>

        {/* KANAN: 3D Envelope */}
        <div className="w-full lg:w-1/2 h-[40vh] min-h-[350px] lg:h-screen relative z-0 order-1 lg:order-2 flex items-center justify-center">
          <div className="w-full h-full relative">
            <Envelope3D />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] lg:w-[500px] h-[200px] lg:h-[500px] bg-evory-gold blur-[80px] lg:blur-[180px] opacity-10 -z-10 rounded-full" />
          </div>
        </div>
      </section>

      {/* --- 2. MARQUEE SECTION --- */}
      {/* Not snap-start because it's a divider, usually part of previous or just scrolled past quickly */}
      <section className="py-4 lg:py-6 bg-[#141414] text-white overflow-hidden border-y border-white/5 relative z-20">
        <div className="flex whitespace-nowrap overflow-hidden w-full">
          {/* DYNAMIC MARQUEE */}
          {[0, 1].map((i) => (
            <div key={i} className="flex animate-marquee min-w-full shrink-0 items-center gap-8 lg:gap-12 px-6" aria-hidden={i === 1}>
              {allTemplates.length > 0 ? allTemplates.map((tpl) => (
                <div key={tpl.id} className="flex items-center gap-8 lg:gap-12">
                  <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-white/80 uppercase">{tpl.name}</span>
                  <span className="text-evory-gold text-xl lg:text-2xl">•</span>
                </div>
              )) : (
                // Fallback if no templates
                <>
                  <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-white/80">JAVANESE ROYAL</span>
                  <span className="text-evory-gold text-xl lg:text-2xl">•</span>
                  <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-white/80">MODERN MINIMALIST</span>
                  <span className="text-evory-gold text-xl lg:text-2xl">•</span>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --- 3. TEMPLATE SECTIONS (Interactive) --- */}
      {categories.map((category, index) => (
        // @ts-ignore - mismatch prisma types vs frontend types slightly but compatible
        <TemplateSection key={category.id} category={category} index={index} />
      ))}

      {/* FOOTER SPACER FOR SCROLL LOOP (Optional) */}
      <div className="h-24 flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">
        © 2024 Evory Platform
      </div>

    </div>
  );
}