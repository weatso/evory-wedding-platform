import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import HybridShowcase from "@/components/landing/HybridShowcase";
import { Badge } from "@/components/ui/badge";
import DynamicNavbar from "@/components/navigation/DynamicNavbar";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // Mengambil HANYA kategori yang di-featured untuk Landing Page
  const categories = await prisma.templateCategory.findMany({
    where: { 
      isFeatured: true 
    },
    include: {
      templates: { 
        where: { 
          isActive: true,
          isFeatured: true // Hanya ambil template unggulan di dalam kategori tersebut
        },
        orderBy: { 
          // Jika Anda ingin mengontrol urutan template secara manual
          createdAt: "desc" 
        },
        take: 6 // Batasi maksimal 6 template per kategori agar DOM tidak meledak
      }
    },
    orderBy: { 
      sortOrder: "asc" // Urutkan kategori berdasarkan prioritas bisnis Anda
    }
  });

  return (
    <div className="font-sans relative selection:bg-[#E5C185] selection:text-[#07303F]">
      
      {/* Panggil Logo Interaktif di sini */}
      <DynamicNavbar />

      {/* SECTION 1: THE DARK VAULT (Dibuat Sticky agar tertutup oleh Gallery) */}
      <div className="relative h-screen sticky top-0 overflow-hidden bg-[#07303F] z-0">
        <section className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          
          {/* Efek Cahaya */}
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

            {/* GROUPING CTA - JELAS & TERARAH */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            {/* CTA 1: Mengarah ke Gudang Katalog */}
            <Link href="/collection" className="group">
              <div className="bg-[#E5C185] text-[#07303F] px-8 py-4 rounded-sm font-bold flex items-center justify-center gap-3 hover:bg-[#F9F8F4] transition-all shadow-xl uppercase tracking-widest text-xs">
                <span>Explore The Vault</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>

            {/* CTA 2: Mengarah ke Dashboard Login (Secondary) */}
            <Link href="/login" className="group">
              <div className="bg-transparent border border-[#E5C185]/30 text-[#E5C185] px-8 py-4 rounded-sm font-bold flex items-center justify-center gap-3 hover:bg-[#E5C185]/10 transition-all uppercase tracking-widest text-xs">
                <span>Login Dashboard</span>
              </div>
            </Link>
          </div>

          <Link href="/admin" className="mt-8 text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#E5C185] flex items-center gap-2 transition-colors font-bold">
            <Lock size={12} /> <span>Partner Access</span>
          </Link>
          </div>
        </section>
      </div>

      {/* SECTION 2: THE GALLERY (Z-Index lebih tinggi untuk menutupi Hero) */}
      <div className="relative z-20 bg-[#F9F8F4] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] min-h-screen rounded-t-3xl md:rounded-t-[3rem] overflow-hidden"> 
        {categories.length > 0 ? (
          <HybridShowcase categories={categories} />
        ) : (
          <section className="py-32 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center">
            <p className="text-xl font-sans font-bold mb-2 text-[#07303F]">The Vault is Empty.</p>
            <p className="text-sm">Sistem belum mendeteksi koleksi aktif di database Anda.</p>
          </section>
        )}
        
        {/* Tombol Penyambung ke Gudang di akhir Etalase (Selalu Tampil) */}
        <div className="pb-24 pt-12 flex justify-center relative z-30">
          <Link href="/collection" className="group">
            <div className="border border-[#07303F]/20 text-[#07303F] px-8 py-3 rounded-sm font-bold flex items-center justify-center gap-3 hover:bg-[#07303F] hover:text-[#F9F8F4] transition-all uppercase tracking-widest text-xs">
              <span>View Full Collection</span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        </div>

        <footer className="h-24 flex flex-col items-center justify-center text-slate-400 text-[10px] uppercase tracking-widest border-t border-slate-200 bg-[#F9F8F4]">
          <p>© 2026 Evory Platform</p>
        </footer>
      </div>

    </div>
  );
}