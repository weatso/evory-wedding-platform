import { prisma } from "@/lib/prisma";
import { AddTemplateModal } from "./_components/AddTemplateModal";
import { AddCategoryModal } from "./_components/AddCategoryModal"; // PASTIKAN FILE INI SUDAH ANDA BUAT
import { DeleteButton } from "./_components/DeleteButton"; // PASTIKAN FILE INI SUDAH ANDA BUAT
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic"; 

export default async function AdminTemplatesPage() {
  // 1. Ambil Data
  const templates = await prisma.template.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.templateCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 space-y-8">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Katalog Template</h1>
          <p className="text-gray-500">Kelola desain undangan dan kategori.</p>
        </div>
        
        {/* DUA TOMBOL UTAMA */}
        <div className="flex gap-3">
          <AddCategoryModal />
          <AddTemplateModal categories={categories} />
        </div>
      </div>

      {/* STATISTIK */}
      <div className="flex gap-4 text-sm text-gray-500">
        <div className="bg-gray-100 px-3 py-1 rounded-md">
          Total Template: <span className="font-bold text-black">{templates.length}</span>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-md">
          Total Kategori: <span className="font-bold text-black">{categories.length}</span>
        </div>
      </div>

      {/* GRID TEMPLATE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((tpl) => (
          <div key={tpl.id} className="group relative border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
            
            {/* THUMBNAIL AREA */}
            <div className="relative aspect-[4/5] bg-gray-100 border-b">
               {tpl.thumbnail ? (
                 <img 
                   src={tpl.thumbnail} 
                   alt={tpl.name} 
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
               )}
               
               {/* Badge Kategori */}
               <div className="absolute top-3 left-3">
                 <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm shadow-sm">
                   {tpl.category.name}
                 </Badge>
               </div>

               {/* Overlay Action */}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a 
                    href={`/preview/${tpl.slug}`} 
                    target="_blank" 
                    className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100"
                  >
                    Lihat Demo
                  </a>
               </div>
            </div>

            {/* INFO AREA */}
            <div className="p-4">
              <div className="mb-3">
                <h3 className="font-bold text-gray-900 truncate" title={tpl.name}>{tpl.name}</h3>
                <p className="text-xs text-gray-500 font-mono truncate">{tpl.slug}</p>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${tpl.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {tpl.isActive ? 'Active' : 'Draft'}
                </span>
                
                <DeleteButton id={tpl.id} />
              </div>
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {templates.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-gray-50/50">
            <p className="text-gray-500 font-medium">Belum ada template.</p>
            <p className="text-sm text-gray-400 mb-4">Buat kategori dulu, baru tambahkan template.</p>
          </div>
        )}
      </div>
    </div>
  );
}