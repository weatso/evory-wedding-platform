import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users, Building2, ImageIcon, FolderGit2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GlobalOverviewPage() {
  const session = await auth();
  if (!session || session.user.systemRole !== "SUPERADMIN") redirect("/dashboard");

  // Tarik data agregat secara paralel
  const [totalAgencies, totalProjects, totalTemplates, waitingUsers] = await Promise.all([
    prisma.workspace.count(),
    prisma.project.count(),
    prisma.template.count(),
    prisma.user.findMany({
      where: { systemRole: "WAITING" },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-[#07303F] mb-1">
          Global Overview
        </h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
          Pusat Komando & Pemantauan Evory Ecosystem
        </p>
      </div>

      {/* STATISTIK UTAMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Agensi (WO)" 
          value={totalAgencies.toString()} 
          desc="Workspace Aktif" 
          icon={<Building2 className="w-5 h-5" />} 
          color="bg-[#07303F]" 
          textColor="text-white"
        />
        <StatsCard 
          title="Total Acara" 
          value={totalProjects.toString()} 
          desc="Proyek Berjalan" 
          icon={<FolderGit2 className="w-5 h-5 text-[#07303F]" />} 
          color="bg-white"
        />
        <StatsCard 
          title="Template Registry" 
          value={totalTemplates.toString()} 
          desc="Desain Tersedia" 
          icon={<ImageIcon className="w-5 h-5 text-[#07303F]" />} 
          color="bg-white"
        />
        <StatsCard 
          title="Waiting Room" 
          value={waitingUsers.length.toString()} 
          desc="Butuh Persetujuan" 
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />} 
          color="bg-amber-50"
          border="border-amber-200"
        />
      </div>

      {/* ANTREAN WAITING ROOM */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#F9F8F4]/30">
          <div>
            <h2 className="text-lg font-bold text-[#07303F] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Antrean Verifikasi Klien
            </h2>
            <p className="text-xs text-slate-500 mt-1">Daftar pengguna yang baru mendaftar dan menunggu persetujuan (5 Terbaru).</p>
          </div>
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="text-xs font-bold border-slate-200">
              Lihat Semua
            </Button>
          </Link>
        </div>
        
        <div className="divide-y divide-slate-100">
          {waitingUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm font-medium">Tidak ada pengguna di ruang tunggu.</p>
            </div>
          ) : (
            waitingUsers.map(user => (
              <div key={user.id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-[#07303F] text-sm">{user.name || "Anonim"}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
                </div>
                <Link href="/admin/users">
                  <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white">
                    Tinjau Akun
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
}

// KOMPONEN KARTU STATISTIK
function StatsCard({ title, value, desc, icon, color, textColor = "text-[#07303F]", border = "border-slate-200" }: { title: string, value: string, desc: string, icon: React.ReactNode, color: string, textColor?: string, border?: string }) {
  return (
    <div className={`p-6 rounded-xl border ${border} ${color} shadow-sm relative overflow-hidden group`}>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{title}</p>
          <h3 className={`text-4xl font-serif font-bold ${textColor}`}>{value}</h3>
          <p className={`text-xs mt-2 font-medium ${textColor === 'text-white' ? 'text-slate-300' : 'text-slate-500'}`}>{desc}</p>
        </div>
        <div className={`p-3 rounded-xl ${textColor === 'text-white' ? 'bg-white/10' : 'bg-slate-50'}`}>
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-[0.03] transform scale-150 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
    </div>
  );
}
