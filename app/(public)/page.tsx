import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import HybridShowcase from "@/components/landing/HybridShowcase";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const categories = await prisma.templateCategory.findMany({
    include: {
      templates: { 
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="min-h-screen font-sans relative selection:bg-[#E5C185] selection:text-[#07303F]">

      {/* NAVBAR: Logo Emas (Karena Latar Belakang Gelap) */}
      <nav className="absolute top-0 w-full p-6 lg:px-12 z-50 flex justify-center md:justify-start items-center pointer-events-none">
        <div className="relative w-32 h-10 pointer-events-auto">
          <Image src="/logo/logo-gold.png" alt="Evory" fill className="object-contain object-center md:object-left" />
        </div>
      </nav>

      {/* SECTION 1: THE DARK VAULT (Hero Tiber Gelap) */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center z-10 pt-20 bg-[#07303F] overflow-hidden">
        
        {/* Pendaran Cahaya Emas & Pola Grid Arsitektur (Pengganti Hati 3D) */}
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#E5C185]/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <Badge variant="outline" className="mb-8 px-4 py-1.5 border-[#E5C185]/30 text-[#E5C185] uppercase tracking-widest text-[10px] font-bold bg-white/5 backdrop-blur-sm">
            Evory Access
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans font-bold leading-tight mb-8 text-[#F9F8F4] max-w-4xl tracking-tight">
            The Digital <span className="text-[#E5C185] italic font-serif font-normal pr-2">Vault.</span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-12 font-light">
            Ruang privat untuk mahakarya undangan Anda. Masuk ke Dasbor untuk mengelola buku tamu, RSVP, dan cerita abadi Anda.
          </p>

          <Link href="/login" className="group">
            <div className="bg-[#E5C185] text-[#07303F] px-10 py-4 rounded-sm font-bold flex items-center justify-center gap-3 hover:bg-[#F9F8F4] transition-all shadow-xl uppercase tracking-widest text-xs">
              <span>Login Dashboard</span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          <Link href="/admin" className="mt-8 text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#E5C185] flex items-center gap-2 transition-colors font-bold">
            <Lock size={12} /> <span>Partner Access</span>
          </Link>
        </div>
      </section>

      {/* SECTION 2: THE GALLERY (Ivory Terang - Transisi Hard Cut) */}
      <div className="relative z-30 bg-[#F9F8F4]"> 
        {categories.length > 0 ? (
          <HybridShowcase categories={categories} />
        ) : (
          <section className="py-32 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center">
            <p className="text-xl font-sans font-bold mb-2 text-[#07303F]">The Vault is Empty.</p>
            <p className="text-sm">Sistem belum mendeteksi koleksi aktif di database Anda.</p>
          </section>
        )}
      </div>

      <footer className="h-24 flex flex-col items-center justify-center text-slate-400 text-[10px] uppercase tracking-widest border-t border-slate-200 bg-[#F9F8F4] relative z-30">
        <p>© 2026 Evory Platform</p>
      </footer>

    </div>
  );
}