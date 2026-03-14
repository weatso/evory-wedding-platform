import { prisma } from "@/lib/prisma";
import { PackageTier } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import FilterSidebar from "@/components/collection/FilterSidebar"; 
import { ArrowLeft, LayoutDashboard } from "lucide-react";

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const categorySlug = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const tierString = typeof searchParams.tier === 'string' ? searchParams.tier.toUpperCase() : undefined;
  
  const validTiers = Object.values(PackageTier);
  const tier = validTiers.includes(tierString as PackageTier) ? (tierString as PackageTier) : undefined;

  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = 12; 
  const skip = (page - 1) * limit;

  const whereCondition: any = {
    isActive: true, 
    ...(query && {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(tier && { tier: tier }),
  };

  const [templates, totalTemplates, categories] = await Promise.all([
    prisma.template.findMany({
      where: whereCondition,
      include: { category: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }, 
    }),
    prisma.template.count({ where: whereCondition }),
    prisma.templateCategory.findMany({
      orderBy: { name: 'asc' },
    })
  ]);

  const totalPages = Math.ceil(totalTemplates / limit);

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#07303F] selection:bg-[#E5C185] selection:text-[#07303F]">
      
      {/* HEADER NAVIGASI KHUSUS GUDANG */}
      <header className="h-20 border-b border-slate-200 bg-[#F9F8F4]/80 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#07303F] transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="hidden sm:inline">Back to Vault</span>
        </Link>

        <div className="font-serif italic text-xl md:text-2xl font-bold text-[#07303F]">
          The Collection
        </div>

        <Link href="/login" className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#E5C185] transition-colors group">
          <span className="hidden sm:inline">Dashboard</span> 
          <LayoutDashboard size={14} className="group-hover:scale-110 transition-transform" />
        </Link>
      </header>

      {/* KONTEN UTAMA */}
      <div className="pt-12 pb-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 lg:gap-16">
          
          {/* SIDEBAR */}
          <div className="w-full md:w-64 shrink-0">
            <FilterSidebar categories={categories} />
          </div>

          {/* AREA ETALASE GRID */}
          <main className="flex-1">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-4 gap-4">
              <h1 className="text-3xl lg:text-4xl font-serif italic text-[#07303F]">
                {totalTemplates} Masterpieces
              </h1>
              {query && (
                <p className="text-sm text-slate-500">
                  Search results for: <span className="font-bold text-[#07303F]">"{query}"</span>
                </p>
              )}
            </div>

            {/* GRID TEMPLATE YANG DIPERBAIKI SECARA VISUAL */}
            {templates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {templates.map((template) => (
                  <Link href={`/preview/${template.slug}`} key={template.id} className="group block">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-2xl group-hover:-translate-y-2">
                      
                      {/* BINGKAI GAMBAR */}
                      <div className="aspect-[3/4] bg-slate-100 rounded-xl mb-4 relative overflow-hidden">
                        <Image 
                          src={template.thumbnail} 
                          alt={template.name} 
                          fill 
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* BADGE TIER */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#07303F] shadow-sm">
                          {template.tier}
                        </div>
                      </div>

                      {/* TIPOGRAFI KARTU */}
                      <div className="px-2 pb-2">
                        <h3 className="font-bold text-lg text-[#07303F] group-hover:text-[#E5C185] transition-colors">{template.name}</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5">{template.category.name}</p>
                      </div>

                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center text-slate-500 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 border-dashed">
                <p className="text-2xl font-serif italic font-bold mb-3 text-[#07303F]">No Masterpieces Found.</p>
                <p className="text-sm max-w-md">Koleksi yang Anda cari belum tersedia. Sesuaikan parameter filter Anda pada panel di sebelah kiri.</p>
              </div>
            )}

            {/* PAGINATION DINAMIS */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link href={`/collection?page=${page - 1}`} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#07303F] border border-slate-200 rounded-md hover:bg-[#07303F] hover:text-white transition-all">
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2.5 text-xs font-bold text-slate-400">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link href={`/collection?page=${page + 1}`} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#07303F] border border-slate-200 rounded-md hover:bg-[#07303F] hover:text-white transition-all">
                    Next
                  </Link>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}