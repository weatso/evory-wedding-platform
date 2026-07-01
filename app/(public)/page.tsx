import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock } from "lucide-react";
import HybridShowcase from "@/components/landing/HybridShowcase";
import { Badge } from "@/components/ui/badge";
import DynamicNavbar from "@/components/navigation/DynamicNavbar";
import Hero from "@/components/landing/Hero";

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

      {/* SECTION 1: TRUE SANCTUARY HERO (Matched with evory.id) */}
      <Hero />

      {/* SECTION 2: THE GALLERY (Z-Index lebih tinggi untuk menutupi Hero) */}
      <div id="highlight-section" className="relative z-20 bg-[#F9F8F4] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] min-h-screen rounded-t-3xl md:rounded-t-[3rem] overflow-hidden"> 
        
        {/* PORTFOLIO SLOGAN */}
        <div className="text-center pt-24 pb-8 px-6">
          <p className="text-sm md:text-base text-[#E5C185] font-bold tracking-[0.2em] uppercase mb-4">Portofolio</p>
          <h2 className="text-3xl md:text-5xl font-serif text-[#07303F] max-w-3xl mx-auto leading-relaxed">
            Where Timeless Memories <br/>
            <span className="italic font-light">Find Their Sanctuary</span>
          </h2>
        </div>

        {categories.length > 0 ? (
          <HybridShowcase categories={categories} />
        ) : (
          <section className="py-32 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center">
            <p className="text-xl font-sans font-bold mb-2 text-[#07303F]">The Vault is Empty.</p>
            <p className="text-sm">Sistem belum mendeteksi koleksi aktif di database Anda.</p>
          </section>
        )}
        


        <footer className="h-24 flex flex-col items-center justify-center text-slate-400 text-[10px] uppercase tracking-widest border-t border-slate-200 bg-[#F9F8F4]">
          <p>© 2026 Evory Platform</p>
        </footer>
      </div>

    </div>
  );
}