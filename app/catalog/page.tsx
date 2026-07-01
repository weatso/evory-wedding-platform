import { prisma } from "@/lib/db";
import { Layers, Sparkles, Check } from "lucide-react";
import Image from "next/image";

// Revalidate katalog setiap 1 jam atau ketika ada build baru,
// namun karena harga ini dinamis bisa menggunakan const dynamic
export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const pricings = await prisma.systemPricing.findMany({
    where: { isActive: true },
    orderBy: [
      { isBundle: 'asc' },
      { service: 'asc' },
    ]
  });

  const individualItems = pricings.filter(p => !p.isBundle);
  const bundleItems = pricings.filter(p => p.isBundle);

  // Group Individual items by Service
  const groupedIndividuals = individualItems.reduce((acc, item) => {
    const key = item.service || "ADD ONS & SERVICES";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof individualItems>);

  return (
    <div className="min-h-screen bg-[#F9F8F4] selection:bg-[#E5C185] selection:text-[#07303F]">
      
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#07303F]">
          {/* Subtle pattern or gradient could go here */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07303F] to-[#0A4053] opacity-90"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F9F8F4] to-transparent z-10"></div>
        </div>

        <div className="relative z-20 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5C185]/30 bg-[#E5C185]/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-[#E5C185]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5C185]">Official Pricelist</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif italic font-bold text-white tracking-tight">
            Layanan & Produk
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Eksplorasi jajaran produk eksklusif kami. Dirancang untuk memberikan pengalaman digital tanpa batas untuk momen paling berharga Anda.
          </p>
        </div>
      </section>

      {/* MAIN CATALOG CONTENT */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-24 relative z-30 -mt-12">

        {/* BUNDLE PACKAGES (Featured first) */}
        {bundleItems.length > 0 && (
          <section>
            <div className="text-center mb-12">
               <h2 className="text-3xl md:text-4xl font-serif italic font-bold text-[#07303F]">Premium Packages</h2>
               <p className="text-sm text-slate-500 mt-3 max-w-xl mx-auto">Gabungan layanan komprehensif kami dalam satu paket eksklusif dengan penawaran terbaik.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bundleItems.map((bundle) => {
                const childIds = (bundle.bundleItems || []) as string[];
                const children = individualItems.filter(i => childIds.includes(i.id));

                return (
                  <div key={bundle.id} className="group relative bg-white rounded-3xl p-8 border border-[#E5C185]/40 shadow-xl shadow-[#E5C185]/5 hover:shadow-2xl hover:shadow-[#E5C185]/10 transition-all duration-500 flex flex-col h-full overflow-hidden">
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E5C185] to-amber-300"></div>

                    <div className="mb-6 flex-1">
                      <h3 className="text-2xl font-bold text-[#07303F] mb-2">{bundle.name}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed min-h-[40px]">
                        {bundle.description || "Paket layanan eksklusif."}
                      </p>
                    </div>

                    <div className="mb-8">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#E5C185] mb-4">Yang Anda Dapatkan</div>
                      <ul className="space-y-3">
                        {children.map(child => (
                          <li key={child.id} className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-[#07303F] font-medium">{child.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-end justify-between">
                      {bundle.isConsultation ? (
                        <div className="w-full text-center py-3 bg-[#07303F] text-[#E5C185] rounded-xl font-bold text-sm tracking-wide">
                          Hubungi Kami
                        </div>
                      ) : (
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Investasi</div>
                          <div className="text-3xl font-serif italic font-bold text-[#07303F]">
                            <span className="text-lg font-sans font-normal text-slate-400 mr-1">Rp</span>
                            {bundle.publicPrice.toLocaleString('id-ID')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* INDIVIDUAL SERVICES BY CATEGORY */}
        {Object.entries(groupedIndividuals).map(([category, items]) => (
          <section key={category}>
            <div className="flex items-center gap-6 mb-10">
              <h2 className="text-2xl md:text-3xl font-serif italic font-bold text-[#07303F] shrink-0">
                {category.replace(/_/g, ' ')}
              </h2>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#07303F] transition-colors duration-300 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[#07303F] mb-2">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-slate-500 mb-6 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    {item.isConsultation ? (
                      <span className="text-sm font-bold text-[#E5C185] uppercase tracking-widest">Harga via Konsultasi</span>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rp</span>
                        <span className="text-xl font-bold text-[#07303F]">{item.publicPrice.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

      </div>

      {/* FOOTER */}
      <footer className="bg-[#07303F] py-12 mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Hak Cipta Dilindungi. Harga dapat berubah sewaktu-waktu.
          </p>
        </div>
      </footer>

    </div>
  );
}
