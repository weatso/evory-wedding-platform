import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BadgeCheck, Store, MapPin, Building2, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { calculateWorkspaceDiscount, calculateBasePrice } from "@/lib/pricing";

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

export default async function PublicAgencyPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const resolvedParams = await params;
  
  const workspace = await prisma.workspace.findUnique({
    where: { slug: resolvedParams.workspaceSlug },
    include: {
      pricingOverrides: true
    }
  });

  if (!workspace || !workspace.isActive) notFound();

  // Ambil Katalog Resmi Evory
  const systemPricings = await prisma.systemPricing.findMany({
    orderBy: [
      { isBundle: 'asc' },
      { service: 'asc' }
    ]
  });

  // Filter layanan yang tayang (default tayang, kecuali di-unpublish lewat override)
  const visiblePricings = systemPricings.filter(sp => {
      const override = workspace.pricingOverrides.find(o => o.systemPricingId === sp.id);
      return override ? override.isPublished : true;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#07303F] selection:text-[#E5C185]">
        
        {/* HERO SECTION */}
        <section className="relative bg-[#07303F] text-white overflow-hidden py-20 lg:py-32">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/20 to-transparent"></div>
            
            <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-2xl flex items-center justify-center p-2 shrink-0">
                    {workspace.logo ? (
                        <Image src={workspace.logo} alt={workspace.name} width={120} height={120} className="object-contain" />
                    ) : (
                        <Building2 className="w-12 h-12 text-[#07303F]" />
                    )}
                </div>
                
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] bg-[#E5C185] text-[#07303F] px-2.5 py-1 rounded-sm font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <BadgeCheck className="w-3 h-3" />
                            Official Partner
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif italic font-bold mb-4">{workspace.name}</h1>
                    <p className="text-slate-300 max-w-xl text-lg leading-relaxed">
                        Kami adalah penyelenggara acara profesional yang siap mewujudkan momen impian Anda dengan teknologi digital terdepan.
                    </p>
                </div>
            </div>
        </section>

        {/* CATALOG SECTION */}
        <section className="py-16 lg:py-24 container mx-auto px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-[#07303F] mb-4">Katalog Layanan Digital</h2>
                <p className="text-slate-500">Pilih paket layanan digital premium yang dikurasi khusus untuk melengkapi acara spesial Anda. Didukung penuh oleh teknologi Evory Global.</p>
            </div>

            {visiblePricings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                    <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">Belum Ada Layanan</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {visiblePricings.map(sp => {
                        const override = workspace.pricingOverrides.find(o => o.systemPricingId === sp.id);
                        const retailPrice = override?.markupPrice ?? sp.publicPrice;
                        const displayName = override?.customName ?? sp.name;

                        return (
                        <div key={sp.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                            <div className="p-8 flex-1 flex flex-col relative">
                                {/* Dekorasi Pojok */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <h3 className="text-2xl font-bold text-[#07303F] pr-8 mb-2">{displayName}</h3>
                                {sp.tier && <span className="inline-block mt-1 mb-4 text-[9px] bg-[#07303F] text-white px-2 py-0.5 rounded uppercase tracking-widest w-max">{sp.tier}</span>}

                                <div className="mt-2 mb-8 flex-1">
                                    <div className="mb-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Didukung Oleh</p>
                                        <div className="flex items-start gap-2.5">
                                            <BadgeCheck className="w-4 h-4 text-[#E5C185] mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-sm text-[#07303F] font-bold">Evory {sp.name}</span>
                                                {sp.description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{sp.description}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-6 border-t border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Investasi</p>
                                    <p className="text-3xl font-mono font-bold text-[#07303F]">{formatIDR(retailPrice)}</p>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-slate-50 border-t border-slate-100">
                                <Link 
                                    href={`https://wa.me/6281234567890?text=Halo%20${workspace.name},%20saya%20tertarik%20dengan%20paket%20${displayName}`} 
                                    target="_blank"
                                    className="block w-full py-3 px-4 bg-[#E5C185] hover:bg-[#d4b074] text-[#07303F] font-bold rounded-xl text-center transition-colors"
                                >
                                    Pesan Sekarang
                                </Link>
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </section>
        
        {/* FOOTER */}
        <footer className="bg-[#07303F] text-white py-12 border-t border-white/10">
            <div className="container mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="text-xl font-serif italic font-bold text-[#E5C185] mb-2">{workspace.name}</h3>
                    <p className="text-slate-400 text-sm">Powered by Evory Global Digital Ecosystem.</p>
                </div>
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E5C185] hover:text-[#07303F] transition-colors"><Mail className="w-4 h-4" /></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E5C185] hover:text-[#07303F] transition-colors"><Phone className="w-4 h-4" /></a>
                </div>
            </div>
        </footer>

    </div>
  );
}
