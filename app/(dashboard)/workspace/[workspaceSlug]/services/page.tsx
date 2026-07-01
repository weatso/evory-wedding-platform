import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tags, Share2, PackageOpen, Check, BadgePercent, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { calculateWorkspaceDiscount, calculateBasePrice } from "@/lib/pricing";
import MarkupForm from "./_components/MarkupForm";

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

export default async function AgencyServicesPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const { workspaceSlug } = resolvedParams;

  // 1. Ambil data Workspace beserta Override Harga
  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      pricingOverrides: true
    }
  });

  if (!workspace) redirect("/404");

  // 2. Multi-Tenancy Guard
  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId: workspace.id } }
    });
    if (!isMember) redirect("/unauthorized");
  }

  // 3. Ambil Katalog Resmi Evory
  const systemPricings = await prisma.systemPricing.findMany({
    orderBy: [
      { isBundle: 'asc' },
      { service: 'asc' }
    ]
  });

  // 4. Kalkulasi Diskon Agensi
  const discountRate = await calculateWorkspaceDiscount(workspace.id);

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* HEADER KOMANDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="text-[10px] bg-[#07303F] text-[#E5C185] px-3 py-1 rounded-sm flex items-center gap-2 font-bold uppercase tracking-widest shadow-sm">
                <Tags className="w-3 h-3"/> Katalog Produk
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-[#07303F] mb-1">
            Layanan Jualan
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 max-w-lg leading-relaxed">
            Atur margin profit Anda dari produk-produk resmi Evory
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="border-slate-200 text-[#07303F] hover:bg-slate-50 font-bold w-full sm:w-auto h-10" asChild>
                <Link href={`/agency/${workspaceSlug}`} target="_blank">
                    <Share2 className="w-4 h-4 mr-2" /> Lihat Halaman Publik
                </Link>
            </Button>
        </div>
      </div>

      {/* PANEL DISKON DINAMIS */}
      <div className="bg-gradient-to-r from-[#07303F] to-[#0a465c] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex items-start gap-4">
                <div className="bg-[#E5C185] text-[#07303F] p-3 rounded-xl">
                    <BadgePercent className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-[#E5C185]">Diskon Modal Bulan Ini: {discountRate}%</h3>
                    <p className="text-sm text-slate-300 mt-1 max-w-md leading-relaxed">
                        Anda mendapatkan potongan {discountRate}% dari Harga Publik bawaan Evory. 
                        {discountRate < 15 && !workspace.customDiscountRate && " Raih 4 klien bulan ini untuk menaikkan diskon menjadi 15%!"}
                        {workspace.customDiscountRate && " Anda memiliki Hak Istimewa Diskon Khusus dari Superadmin."}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* BENTO GRID LAYOUT */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <PackageOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#07303F]">Katalog Produk & Paket</h2>
              <p className="text-xs text-slate-500 mt-1">Gunakan harga default atau naikkan harga jual (markup) sesuai margin yang Anda inginkan.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {systemPricings.map(sp => {
            const override = workspace.pricingOverrides.find(o => o.systemPricingId === sp.id);
            const isPublished = override ? override.isPublished : true;
            const retailPrice = override?.markupPrice ?? sp.publicPrice;
            const displayName = override?.customName ?? sp.name;
            const basePrice = calculateBasePrice(sp.publicPrice, discountRate);
            const profit = retailPrice - basePrice;

            return (
              <Card key={sp.id} className={`border border-slate-200 shadow-sm transition-all duration-300 overflow-hidden flex flex-col group ${!isPublished ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md'}`}>
                <CardContent className="p-0 flex flex-col h-full relative bg-white">
                  {/* Status Indicator */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${isPublished ? "bg-emerald-500" : "bg-red-400"}`}></div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        {override?.customName && (
                          <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                             <Check className="w-3 h-3" /> Nama Kustom (Asli: {sp.name})
                          </div>
                        )}
                        <h3 className="font-bold text-lg text-[#07303F]">
                          {displayName}
                        </h3>
                        {sp.tier && <span className="inline-block mt-1 text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{sp.tier}</span>}
                      </div>
                      {!isPublished && (
                        <div className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Disembunyikan
                        </div>
                      )}
                    </div>

                    <div className="flex-1 mb-6">
                      {sp.description ? (
                         <p className="text-xs text-slate-500 leading-relaxed">{sp.description}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Layanan sistem standar.</p>
                      )}
                    </div>

                    {/* Pricing Block */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modal Anda (Ke Evory)</span>
                            <span className="font-mono text-sm font-bold text-slate-600">{formatIDR(basePrice)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Harga Jual Klien</span>
                            <div className="flex items-center gap-2">
                                {override?.markupPrice && (
                                   <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">MARKUP</span>
                                )}
                                <span className="font-mono text-lg font-bold text-[#07303F]">{formatIDR(retailPrice)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimasi Profit</span>
                            <span className="font-mono text-xs font-bold text-emerald-600">+{formatIDR(profit)}</span>
                        </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border-t border-slate-100 p-3 flex justify-end">
                     <MarkupForm 
                        workspaceSlug={workspaceSlug}
                        systemPricing={sp}
                        override={override}
                        discountRate={discountRate}
                     />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

    </div>
  );
}
