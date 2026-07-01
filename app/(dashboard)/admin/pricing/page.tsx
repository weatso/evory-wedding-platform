import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ShieldCheck, Layers, Sparkles, Building2, Store, PackageOpen, LayoutGrid, Check } from "lucide-react";
import { PriceInputForm } from "./_components/PriceInputForm";
import { AddPricingModal } from "./_components/AddPricingModal";
import { BundleBuilderModal } from "./_components/BundleBuilderModal";

export default async function PricingRegistryPage() {
  const session = await auth();
  if (!session || session.user.systemRole !== "SUPERADMIN") redirect("/dashboard");

  // Ambil semua harga sistem
  const pricings = await prisma.systemPricing.findMany({
    orderBy: [
      { isBundle: 'asc' }, // Tampilkan non-bundle dulu
      { service: 'asc' },
    ]
  });

  // Pisahkan Data
  const individualItems = pricings.filter(p => !p.isBundle);
  const bundleItems = pricings.filter(p => p.isBundle);

  // Fungsi helper untuk menghitung "Total Nilai Asli" dari sebuah bundle
  const getBundleOriginalValue = (bundle: any) => {
    if (!bundle.bundleItems || !Array.isArray(bundle.bundleItems)) return { public: 0 };
    
    const childIds = bundle.bundleItems as string[];
    const children = individualItems.filter(i => childIds.includes(i.id));
    
    return {
      public: children.reduce((acc, curr) => acc + curr.publicPrice, 0)
    };
  };

  return (
    <div className="space-y-8 lg:space-y-12 pb-20">
      
      {/* HEADER KOMANDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="text-[10px] bg-[#07303F] text-[#E5C185] px-3 py-1 rounded-sm flex items-center gap-2 font-bold uppercase tracking-widest shadow-sm">
                <ShieldCheck className="w-3 h-3"/> CPQ System
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-[#07303F] mb-1">
            Product Catalog
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 max-w-lg leading-relaxed">
            Configure, Price, Quote. Buat layanan individu dan rangkai menjadi paket komplit B2B2C.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href="/catalog" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#07303F] rounded-lg text-sm font-bold transition-colors">
            Lihat Brosur Digital (Klien)
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>

      {/* STATISTIK INTELEJEN */}
      <div className="grid grid-cols-1 gap-6">
        <StatsCard 
          title="B2C Market Default" 
          desc="Harga Jual Publik (Suggested Retail Price) yang akan terlihat oleh Klien Akhir jika Partner tidak merubahnya. Harga Modal (B2B) untuk Agensi akan dihitung sebagai persentase diskon dinamis dari Harga Publik ini." 
          icon={<Store className="text-[#E5C185] h-5 w-5" />} 
          highlight 
        />
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="space-y-12">

        {/* SECTION 1: LAYANAN INDIVIDU (A La Carte) - DIKELOMPOKKAN PER KATEGORI */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                <LayoutGrid className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#07303F]">Individual Services (A La Carte)</h2>
                <p className="text-xs text-slate-500 mt-1">Layanan mandiri yang dikelompokkan berdasarkan modul utama</p>
              </div>
            </div>
            <AddPricingModal />
          </div>

          {individualItems.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada layanan individu</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(
                individualItems.reduce((acc, item) => {
                  const key = item.service || "CUSTOM_SERVICE";
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(item);
                  return acc;
                }, {} as Record<string, typeof individualItems>)
              ).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  {/* PEMBATAS / SEKAT KATEGORI */}
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
                      {category.replace(/_/g, ' ')}
                    </h3>
                    <div className="flex-1 h-px bg-slate-200"></div>
                  </div>

                  {/* DAFTAR ITEM DI KATEGORI INI */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {items.map((p) => (
                      <div key={p.id} className="rounded-2xl border border-slate-200 transition-all duration-300 hover:shadow-md overflow-hidden bg-white flex flex-col md:flex-row md:items-center">
                        {/* Kiri: Info Layanan */}
                        <div className="p-5 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 md:w-1/3 flex flex-col justify-center h-full">
                           <h3 className="font-bold text-[#07303F] pr-6">{p.name}</h3>
                           {p.description && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{p.description}</p>}
                        </div>

                        {/* Kanan: Pricing Inputs */}
                        <div className="p-5 md:w-2/3">
                           <PriceInputForm pricingId={p.id} currentPublic={p.publicPrice} isConsultation={p.isConsultation} item={p} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: BUNDLE PACKAGES */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                <PackageOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#07303F]">Bundle Packages (Sultan Deals)</h2>
                <p className="text-xs text-slate-500 mt-1">Gabungan beberapa layanan individu menjadi 1 paket dengan potongan khusus</p>
              </div>
            </div>
            <BundleBuilderModal availableItems={individualItems} />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {bundleItems.map((bundle) => {
              const originalValues = getBundleOriginalValue(bundle);
              const childIds = (bundle.bundleItems || []) as string[];
              const children = individualItems.filter(i => childIds.includes(i.id));

              return (
                <div key={bundle.id} className="rounded-2xl border border-[#E5C185] ring-1 ring-[#E5C185]/50 transition-all duration-300 hover:shadow-xl overflow-hidden bg-white">
                  
                  {/* HEADER BUNDLE */}
                  <div className="p-5 border-b border-[#E5C185]/20 bg-[#F9F8F4] flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h3 className="font-bold text-lg text-[#07303F]">{bundle.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500">{bundle.description || "Paket Bundling Premium"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row">
                    {/* KIRI: ISI BUNDLE */}
                    <div className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Isi Paket (Termasuk)</h4>
                      <ul className="space-y-3">
                        {children.map(child => (
                          <li key={child.id} className="flex items-start gap-2 text-sm text-[#07303F] font-medium">
                            <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            {child.name}
                          </li>
                        ))}
                        {children.length === 0 && <li className="text-xs text-slate-400 italic">Custom Bundle</li>}
                      </ul>

                      {/* DISKON CALCULATOR */}
                      {!bundle.isConsultation && children.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-200">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Nilai Asli (A La Carte)</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-amber-600">Jual Publik Asli:</span>
                              <span className="font-bold text-slate-400 line-through decoration-red-400">Rp {originalValues.public.toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* KANAN: HARGA BUNDLE BARU */}
                    <div className="p-6 lg:w-2/3 flex flex-col justify-center bg-white">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#07303F] mb-4">Set Harga Paket Bundle</h4>
                      <div className="scale-105 transform origin-left">
                        <PriceInputForm pricingId={bundle.id} currentPublic={bundle.publicPrice} isConsultation={bundle.isConsultation} item={bundle} />
                      </div>
                    </div>
                  </div>
                  
                </div>
              );
            })}
            {bundleItems.length === 0 && (
              <div className="py-12 text-center border-2 border-dashed border-amber-200 bg-amber-50/30 rounded-xl">
                <PackageOpen className="w-8 h-8 mx-auto text-amber-300 mb-3" />
                <p className="text-amber-600 font-bold uppercase tracking-widest text-xs">Belum ada paket bundling (Sultan Deals)</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

// KOMPONEN KARTU METRIK LOKAL
function StatsCard({ title, desc, icon, highlight = false }: { title: string, desc: string, icon: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 ${highlight ? "bg-[#07303F] border-[#07303F] shadow-xl" : "bg-white border-slate-200 shadow-sm"}`}>
      <div className="flex flex-row items-center gap-4 mb-3">
        <div className={`p-3 rounded-xl ${highlight ? "bg-[#F9F8F4]/10" : "bg-slate-50"}`}>{icon}</div>
        <h3 className={`text-sm font-bold uppercase tracking-widest ${highlight ? "text-[#E5C185]" : "text-[#07303F]"}`}>{title}</h3>
      </div>
      <p className={`text-xs leading-relaxed ${highlight ? "text-[#E5C185]/70" : "text-slate-500"}`}>
        {desc}
      </p>
    </div>
  );
}
