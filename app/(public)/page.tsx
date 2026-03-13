import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import HybridShowcase from "@/components/landing/HybridShowcase";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Memaksa halaman selalu mengambil data terbaru dari database
export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // DATA DIAMBIL 100% OTOMATIS DARI SISTEM (DATABASE)
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
    // PERINGATAN: Jangan pernah menambahkan 'overflow-hidden' di sini, itu membunuh CSS Sticky!
    <div className="min-h-screen bg-[#F9F8F4] font-sans relative selection:bg-[#E5C185] selection:text-[#07303F]">

      {/* NAVBAR SIMPLE (Logo Murni) */}
      <nav className="absolute top-0 w-full p-6 lg:px-12 z-50 flex justify-center md:justify-start items-center">
        <div className="relative w-32 h-10">
          <Image src="/logo/logo-blue.png" alt="Evory" fill className="object-contain object-center md:object-left" />
        </div>
      </nav>

      {/* SECTION 1: HERO PORTAL (Tipografi Eksklusif) */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 text-center z-10 pt-20 border-b border-slate-200/50">
        
        <Badge variant="outline" className="mb-6 px-4 py-1.5 border-[#E5C185] text-[#E5C185] uppercase tracking-widest text-[10px] font-bold bg-white/50 backdrop-blur-sm">
          Evory Platform
        </Badge>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans font-bold leading-tight mb-6 text-[#07303F] max-w-4xl tracking-tight">
          The Digital <span className="text-[#E5C185] italic font-serif font-normal pr-2">Vault.</span>
        </h1>

        <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-10">
          Pusat kendali eksklusif untuk mahakarya undangan Anda. Masuk ke Dasbor untuk mengelola buku tamu, RSVP, dan cerita abadi Anda.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/login" className="group w-full sm:w-auto">
            <div className="bg-[#07303F] text-[#F9F8F4] px-10 py-4 rounded-sm font-bold flex items-center justify-center gap-3 hover:bg-[#07303F]/90 transition-all shadow-xl uppercase tracking-widest text-xs">
              <span>Login Dashboard</span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform text-[#E5C185]" />
            </div>
          </Link>
        </div>

        {/* Akses Staff dipindah ke sudut bawah secara taktis */}
        <Link href="/admin" className="absolute bottom-10 text-[10px] uppercase tracking-widest text-slate-400 hover:text-[#E5C185] flex items-center gap-2 transition-colors font-bold">
          <Lock size={12} /> <span>Partner Access</span>
        </Link>
      </section>

      {/* SECTION 2: TEMPLATE CATALOG (Otomatis dari Database) */}
      <div className="relative z-30"> 
        {categories.length > 0 ? (
          <HybridShowcase categories={categories} />
        ) : (
          <section className="py-32 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center bg-[#F9F8F4]">
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