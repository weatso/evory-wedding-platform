import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Layers, Star, Zap, Image as ImageIcon, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddTemplateModal } from "./_components/AddTemplateModal"; // Sesuaikan jalur import Anda
import { AddCategoryModal } from "./_components/AddCategoryModal"; // Sesuaikan jalur import Anda
import Image from "next/image";

export default async function TemplateRegistryPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  // Ambil data secara paralel untuk performa maksimal
  const [templates, categories] = await Promise.all([
    prisma.template.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.templateCategory.findMany({
      include: {
        _count: { select: { templates: true } } // Hitung jumlah template per kategori
      },
      orderBy: { name: 'asc' }
    })
  ]);

  // Kalkulasi Metrik Dasbor
  const totalTemplates = templates.length;
  const royalCount = templates.filter(t => t.tier === "ROYAL").length;
  const featuredCount = templates.filter(t => t.isFeatured).length;

  return (
    <div className="space-y-8 lg:space-y-12 pb-20">
      
      {/* HEADER KOMANDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="text-[10px] bg-[#07303F] text-[#E5C185] px-3 py-1 rounded-sm flex items-center gap-2 font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3"/> Core System
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-[#07303F] mb-1">
            Template Registry
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
            Pusat Kendali Desain & Algoritma Hierarki Aset
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <AddCategoryModal />
          <AddTemplateModal categories={categories} />
        </div>
      </div>

      {/* STATISTIK INTELEJEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Masterpieces" value={totalTemplates.toString()} desc="Desain Terdaftar" icon={<ImageIcon className="text-[#07303F] h-4 w-4" />} />
        <StatsCard title="Royal Tier (Premium)" value={royalCount.toString()} desc="Aset Bernilai Tinggi" icon={<Star className="text-[#E5C185] h-4 w-4" />} highlight />
        <StatsCard title="Etalase Aktif" value={featuredCount.toString()} desc="Tampil di Landing Page" icon={<Zap className="text-amber-600 h-4 w-4" />} />
      </div>

      {/* KONTEN UTAMA: DUA KOLOM ASIMETRIS */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* KOLOM KIRI (1/4): MANAJEMEN KATEGORI */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-[#F9F8F4] border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
              <Layers className="w-5 h-5 text-[#07303F]" />
              <h2 className="font-bold text-[#07303F] text-lg">Categories</h2>
            </div>
            
            {categories.length === 0 ? (
               <p className="text-xs text-slate-400 text-center py-6">Belum ada kategori desain.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-slate-100 hover:border-[#E5C185] transition-colors group">
                    <div>
                      <p className="text-xs font-bold text-[#07303F] group-hover:text-[#E5C185] transition-colors">{cat.name}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">/{cat.slug}</p>
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold text-[10px]">
                      {cat._count.templates}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN (3/4): DAFTAR TEMPLATE (VISUAL GRID/TABLE) */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#F9F8F4]/30">
                <h2 className="text-lg font-bold text-[#07303F]">Katalog Desain Aktif</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-widest text-slate-400 bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold w-16">Visual</th>
                    <th className="px-6 py-4 font-bold">Identitas Desain</th>
                    <th className="px-6 py-4 font-bold">Kategori</th>
                    <th className="px-6 py-4 font-bold">Paket (Tier)</th>
                    <th className="px-6 py-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templates.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                            <ImageIcon className="w-8 h-8 mx-auto mb-3 opacity-20" />
                            <p className="font-serif italic text-lg text-[#07303F]">Vault Kosong.</p>
                        </td>
                    </tr>
                  ) : (
                    templates.map((t) => (
                      <tr key={t.id} className="hover:bg-[#F9F8F4] transition-colors group">
                        
                        {/* THUMBNAIL VISUAL */}
                        <td className="px-6 py-3">
                          <div className="w-12 h-16 rounded-md bg-slate-100 border border-slate-200 overflow-hidden relative shadow-sm">
                             {t.thumbnail ? (
                               <Image src={t.thumbnail} alt={t.name} fill className="object-cover" sizes="48px" />
                             ) : (
                               <ImageIcon className="w-4 h-4 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                             )}
                          </div>
                        </td>

                        {/* NAMA & SLUG */}
                        <td className="px-6 py-3">
                          <div className="font-bold text-[#07303F] text-sm group-hover:text-[#E5C185] transition-colors">
                              {t.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-1">
                              {t.slug}
                          </div>
                        </td>

                        {/* KATEGORI */}
                        <td className="px-6 py-3">
                          <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-sm font-medium">
                            {t.category?.name || "Uncategorized"}
                          </span>
                        </td>

                        {/* TIER */}
                        <td className="px-6 py-3">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border ${
                            t.tier === 'ROYAL' ? 'bg-[#07303F] text-[#E5C185] border-[#07303F]' :
                            t.tier === 'PRESTIGE' ? 'bg-[#E5C185]/20 text-amber-700 border-[#E5C185]/50' :
                            'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {t.tier}
                          </span>
                        </td>

                        {/* STATUS ETALASE & AKSI */}
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {t.isFeatured && (
                              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                <CheckCircle2 className="w-3 h-3" /> Etalase
                              </div>
                            )}
                            <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-sm">
                                Hapus
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// KOMPONEN KARTU METRIK LOKAL
function StatsCard({ title, value, desc, icon, highlight = false }: { title: string, value: string, desc: string, icon: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${highlight ? "bg-[#07303F] text-[#F9F8F4] border-[#07303F] shadow-xl" : "bg-white text-[#07303F] border-slate-200 shadow-sm"}`}>
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? "text-[#E5C185]" : "text-slate-400"}`}>{title}</h3>
        <div className={`p-2 rounded-full ${highlight ? "bg-[#F9F8F4]/10" : "bg-[#F9F8F4]"}`}>{icon}</div>
      </div>
      <div>
        <div className="text-3xl md:text-4xl font-serif italic font-bold leading-none mb-2">{value}</div>
        <div className="flex items-center mt-2">
             <span className={`text-[10px] uppercase tracking-wider ${highlight ? "text-[#E5C185]/70" : "text-slate-400"}`}>{desc}</span>
        </div>
      </div>
    </div>
  );
}