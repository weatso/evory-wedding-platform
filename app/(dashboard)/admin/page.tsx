import { prisma } from "@/lib/db";
import { Building2, Users, ShieldCheck, Database } from "lucide-react";

export default async function AdminOverviewPage() {
  // Anda tidak perlu lagi menulis logika `if role !== ADMIN redirect` di sini,
  // karena file layout.tsx di atas sudah menjadi penjaga mutlaknya.

  const totalWorkspaces = await prisma.workspace.count();
  const totalUsers = await prisma.user.count();
  const totalProjects = await prisma.project.count();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[#E5C185] uppercase mb-1">
          Superadmin Dashboard
        </p>
        <h1 className="text-3xl md:text-4xl font-serif text-[#07303F]">
          Evory Command Center
        </h1>
        <p className="text-slate-500 mt-2 max-w-xl text-sm">
          Pantau seluruh aktivitas Partner, kesehatan Workspace, dan skala ekosistem Evory dari atas sini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Building2 className="w-8 h-8 text-[#E5C185] mb-4" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Workspace</p>
          <h3 className="text-3xl font-bold text-[#07303F] mt-1">{totalWorkspaces}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Database className="w-8 h-8 text-[#E5C185] mb-4" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Proyek Aktif</p>
          <h3 className="text-3xl font-bold text-[#07303F] mt-1">{totalProjects}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Users className="w-8 h-8 text-[#E5C185] mb-4" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pengguna Terdaftar</p>
          <h3 className="text-3xl font-bold text-[#07303F] mt-1">{totalUsers}</h3>
        </div>
      </div>
      
      {/* Area ekspansi di masa depan (Tabel Tagihan Partner, dll) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center mt-8">
        <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-400">Infrastruktur Aman</h3>
        <p className="text-slate-400 text-sm mt-1">Modul manajemen partner sedang dalam tahap finalisasi arsitektur.</p>
      </div>
    </div>
  );
}