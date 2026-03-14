import { prisma } from "@/lib/prisma";
import { PackageTier } from "@prisma/client";
import Link from "next/link";
import FilterSidebar from "@/components/collection/FilterSidebar"; // IMPORT KOMPONEN
// Nanti Anda akan memanggil komponen Client untuk filter di sini

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 1. EKSTRAKSI PARAMETER URL (Sanitasi Input)
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const categorySlug = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const tierString = typeof searchParams.tier === 'string' ? searchParams.tier.toUpperCase() : undefined;
  
  // Validasi Enum Tier agar Prisma tidak crash jika user iseng memasukkan URL sembarangan
  const validTiers = Object.values(PackageTier);
  const tier = validTiers.includes(tierString as PackageTier) ? (tierString as PackageTier) : undefined;

  // 2. LOGIKA PAGINASI
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = 12; // Jangan muat lebih dari 12 gambar resolusi tinggi sekaligus
  const skip = (page - 1) * limit;

  // 3. MERAKIT KONDISI FILTER DINAMIS (The Engine)
  const whereCondition: any = {
    isActive: true, // Hanya tampilkan yang aktif
    ...(query && {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(tier && { tier: tier }),
  };

  // 4. EKSEKUSI QUERY PARALEL (Kecepatan Maksimal)
  // Kita gunakan Promise.all agar fetch data template, total count, dan list kategori berjalan bersamaan, bukan antre.
  const [templates, totalTemplates, categories] = await Promise.all([
    prisma.template.findMany({
      where: whereCondition,
      include: { category: true },
      skip,
      take: limit,
      orderBy: { name: 'asc' }, // Atau urutkan berdasarkan prioritas lain
    }),
    prisma.template.count({ where: whereCondition }),
    prisma.templateCategory.findMany({
      orderBy: { name: 'asc' },
    })
  ]);

  const totalPages = Math.ceil(totalTemplates / limit);

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#07303F] pt-32 pb-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* PANGGIL KOMPONEN DI SINI, LEPAR DATA CATEGORIES */}
        <div className="w-full md:w-64 shrink-0">
          <FilterSidebar categories={categories} />
        </div>

        {/* MAIN CONTENT: Area Etalase */}
        <main className="flex-1">
          <div className="mb-6 flex justify-between items-end">
            <h1 className="text-3xl font-serif italic">
              {totalTemplates} Masterpieces Found
            </h1>
          </div>

          {/* GRID TEMPLATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="aspect-[3/4] bg-slate-100 rounded-lg mb-4 relative overflow-hidden">
                  {/* Gunakan next/image dengan properti fill dan sizes yang benar di sini */}
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    Image: {template.thumbnail}
                  </div>
                </div>
                <h3 className="font-bold text-lg">{template.name}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest">{template.category.name}</p>
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROL KASAR */}
          <div className="mt-12 flex gap-4">
            {page > 1 && (
              <Link href={`/collection?page=${page - 1}`} className="px-4 py-2 bg-slate-200 rounded">Prev</Link>
            )}
            {page < totalPages && (
              <Link href={`/collection?page=${page + 1}`} className="px-4 py-2 bg-slate-200 rounded">Next</Link>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}