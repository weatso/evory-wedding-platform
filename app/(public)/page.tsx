import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Heart, Lock } from "lucide-react";

// --- KOMPONEN UTAMA ---
import Heart3D from "@/components/landing/Heart3D";
import HybridShowcase from "@/components/landing/HybridShowcase"; // <--- Komponen Final
import { Badge } from "@/components/ui/badge";

// Agar halaman selalu update jika ada data baru di DB
export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // 1. FETCH DATA (Kategori & Template)
  // Mengambil kategori beserta template di dalamnya
  const categories = await prisma.templateCategory.findMany({
    include: {
      templates: { 
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { name: "asc" }
  });

  // 2. Persiapan Data Marquee (Menggabungkan semua template jadi satu array flat)
  const allTemplates = categories.flatMap(c => c.templates);

  return (
    <div className="min-h-screen bg-[linear-gradient(150deg,#F9F8F4_0%,#F9F8F4_55vh,#000000_120vh)] font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-white">

      {/* =========================================
          SECTION 1: HERO (Judul & Hati 3D)
      ========================================= */}
      <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 pt-20 lg:pt-0 overflow-hidden z-10 text-stone-950">
        
        {/* KIRI: Text & Login CTA */}
        <div className="w-full lg:w-1/2 space-y-6 lg:space-y-8 z-10 text-center lg:text-left mt-8 lg:mt-0 order-2 lg:order-1">
          
          <Badge variant="outline" className="mb-4 px-4 py-1 border-amber-600/50 text-amber-700 uppercase tracking-widest text-[10px] font-medium bg-white/50 backdrop-blur-sm">
            The New Standard of Wedding Invitation
          </Badge>

          <h1 className="text-5xl lg:text-8xl font-serif leading-[1.0] mb-4 lg:mb-6 text-stone-950 drop-shadow-sm">
            Timeless <br />
            <span className="text-amber-600 italic pr-2">Elegance.</span>
          </h1>

          <p className="text-stone-700 text-base lg:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
            Platform undangan pernikahan digital premium. Wujudkan momen sakral Anda dengan perpaduan tradisi dan teknologi.
          </p>

          <div className="flex flex-col items-center lg:items-start gap-4 pt-4 lg:pt-8">
            <Link href="/login" className="group w-full sm:w-auto">
              <div className="bg-stone-950 text-white px-8 py-4 lg:px-10 lg:py-5 rounded-full font-bold flex items-center justify-center gap-3 hover:scale-105 hover:bg-black transition-all shadow-2xl shadow-stone-900/20">
                <Heart size={16} className="fill-white" />
                <span className="tracking-wide text-sm lg:text-lg">LOGIN PORTAL</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>

            <Link href="/admin" className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-2 transition-colors font-medium">
              <Lock size={12} /> <span>Staff / Admin Access</span>
            </Link>
          </div>
        </div>

        {/* KANAN: 3D HEART MODEL */}
        <div className="w-full lg:w-1/2 h-[50vh] min-h-[400px] lg:h-screen relative z-0 order-1 lg:order-2 flex items-center justify-center">
          <div className="w-full h-full relative flex items-center justify-center">
            <Heart3D />
            {/* Glow Amber Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] lg:w-[500px] h-[200px] lg:h-[500px] bg-amber-500 blur-[90px] lg:blur-[160px] opacity-25 -z-10 rounded-full" />
          </div>
        </div>
      </section>


      {/* =========================================
          SECTION 2: MARQUEE (Teks Berjalan)
      ========================================= */}
      <section className="py-8 border-y border-stone-200/50 overflow-hidden relative z-20 bg-white/5 backdrop-blur-[1px]">
        <div className="flex whitespace-nowrap overflow-hidden w-full">
          {[0, 1].map((i) => (
            <div key={i} className="flex animate-marquee min-w-full shrink-0 items-center gap-12 px-6" aria-hidden={i === 1}>
              {allTemplates.length > 0 ? (
                allTemplates.map((tpl) => (
                  <div key={`${tpl.id}-${i}`} className="flex items-center gap-12">
                    <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-stone-900/40 uppercase hover:text-amber-600 transition-colors cursor-default mix-blend-multiply">
                      {tpl.name}
                    </span>
                    <span className="text-amber-600 text-xl lg:text-2xl">•</span>
                  </div>
                ))
              ) : (
                // Fallback jika database kosong
                <>
                  <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-stone-900/30">JAVANESE ROYAL</span>
                  <span className="text-amber-600/50 text-xl lg:text-2xl">•</span>
                  <span className="text-xl lg:text-4xl font-serif italic tracking-widest text-stone-900/30">MODERN MINIMALIST</span>
                  <span className="text-amber-600/50 text-xl lg:text-2xl">•</span>
                </>
              )}
            </div>
          ))}
        </div>
      </section>


      {/* =========================================
          SECTION 3: PORTFOLIO SHOWCASE (Hybrid)
          Menggunakan Komponen HybridShowcase
      ========================================= */}
      <div className="text-white relative z-30 bg-black"> 
        {categories.length > 0 ? (
          <HybridShowcase categories={categories} />
        ) : (
          <section className="py-32 text-center text-stone-500 min-h-[50vh] flex flex-col items-center justify-center">
            <p className="text-xl font-serif italic mb-4">Belum ada koleksi template yang tersedia.</p>
            <p className="text-sm">Silakan hubungi admin atau jalankan seed database.</p>
          </section>
        )}
      </div>


      {/* =========================================
          FOOTER
      ========================================= */}
      <footer className="h-24 flex flex-col items-center justify-center text-stone-500 text-xs uppercase tracking-widest border-t border-white/10 bg-black relative z-30">
        <p>© 2026 Evory Platform</p>
        <p className="text-[10px] mt-1 opacity-50">Crafted with Precision</p>
      </footer>


      {/* Styles untuk Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}