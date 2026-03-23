import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Building2, Users, Briefcase, Plus, ShieldCheck } from "lucide-react";
import AddStaffModal from "./_components/AddStaffModal";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";
  const isPartner = session.user.role === "PARTNER";

  if (!isAdmin && !isPartner) {
    redirect("/dashboard");
  }

  // LOGIKA PENGAMBILAN DATA (Tidak Diubah, Menggunakan Inti Anda)
  const users = await prisma.user.findMany({
    where: isAdmin 
      ? { role: "PARTNER" } // Jika Admin -> Tampilkan semua WO/Partner
      : { partnerId: session.user.id, role: "CLIENT" }, // Jika Partner -> Tampilkan klien milik partner tersebut
    orderBy: { createdAt: "desc" },
    include: {
        _count: {
          select: {
            managedUsers: true,
            projects: true, // PERBAIKAN: Gunakan relasi tabel yang baru
          }
        }
      }
  });

  const totalUsers = users.length;
  // Jika Admin, hitung total klien dari semua partner. Jika Partner, itu sudah total klien.
  const totalSubUsers = isAdmin 
    ? users.reduce((sum, u) => sum + u._count.managedUsers, 0)
    : users.reduce((sum, u) => sum + u._count.projects, 0);

  return (
    <div className="space-y-8 lg:space-y-12 pb-20">
      
      {/* HEADER KOMANDO PREMIUM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="text-[10px] bg-[#07303F] text-[#E5C185] px-3 py-1 rounded-sm flex items-center gap-2 font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3"/> {isAdmin ? "Super Admin" : "Partner Access"}
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-[#07303F] mb-1">
            {isAdmin ? "Partner Network" : "Client Roster"}
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
            {isAdmin ? "Manajemen Entitas B2B & Wedding Organizer" : "Manajemen Portfolio Calon Pengantin"}
          </p>
        </div>
        
        <div className="shrink-0 mt-4 md:mt-0 w-full md:w-auto">
            {/* Modal bawaan Anda, kita bungkus dalam estetika tombol premium di dalam komponennya nanti jika perlu */}
            <AddStaffModal 
               roleOptions={isAdmin ? ["PARTNER"] : ["CLIENT"]} 
               partnerId={isPartner ? session.user.id : undefined} 
            />
        </div>
      </div>

      {/* STATISTIK JARINGAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
            title={isAdmin ? "Total Partners" : "Total Clients"} 
            value={totalUsers.toString()} 
            desc={isAdmin ? "Wedding Organizers Terdaftar" : "Calon Pengantin Terdaftar"} 
            icon={<Building2 className="text-[#07303F] h-4 w-4" />} 
        />
        <StatsCard 
            title={isAdmin ? "Total Global Clients" : "Total Invitations"} 
            value={totalSubUsers.toString()} 
            desc={isAdmin ? "Klien di bawah naungan Partner" : "Undangan digital aktif"} 
            icon={<Briefcase className="text-[#E5C185] h-4 w-4" />} 
            highlight 
        />
        <StatsCard 
            title="System Status" 
            value="Optimal" 
            desc="Semua server beroperasi normal" 
            icon={<ShieldCheck className="text-emerald-600 h-4 w-4" />} 
        />
      </div>

      {/* TABEL DATA PREMIUM */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#07303F]">
                {isAdmin ? "Daftar Mitra Aktif" : "Daftar Calon Pengantin"}
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-sm">
                {users.length} Records
            </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase tracking-widest text-slate-400 bg-[#F9F8F4] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">Identitas {isAdmin ? "Partner" : "Klien"}</th>
                <th className="px-6 py-4 font-bold">Kontak Akses</th>
                <th className="px-6 py-4 font-bold text-center">{isAdmin ? "Total Klien" : "Undangan"}</th>
                <th className="px-6 py-4 font-bold">Tgl. Registrasi</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="font-serif italic text-lg text-[#07303F]">Belum ada data terdaftar.</p>
                    </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#07303F]/5 flex items-center justify-center text-[#07303F] font-serif font-bold italic">
                            {u.name ? u.name.charAt(0).toUpperCase() : (u.companyName ? u.companyName.charAt(0).toUpperCase() : "?")}
                        </div>
                        <div>
                            <div className="font-bold text-[#07303F] group-hover:text-[#E5C185] transition-colors">
                                {u.companyName || u.name || "Unnamed Entity"}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                                ID: {u.id.substring(0,8)}...
                            </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-slate-600">{u.email || "-"}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 bg-[#F9F8F4] border border-slate-200 rounded-sm text-xs font-bold text-[#07303F]">
                            {isAdmin ? u._count.managedUsers : u._count.projects}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {new Date(u.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button className="text-[10px] font-bold uppercase tracking-widest text-[#07303F] hover:text-[#E5C185] transition-colors border border-transparent hover:border-[#E5C185] px-3 py-1.5 rounded-sm">
                            Manage
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// KOMPONEN STATS CARD KHUSUS PREMIUM
function StatsCard({ title, value, desc, icon, highlight = false }: { title: string, value: string, desc: string, icon: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={cn(
      "p-6 rounded-xl border transition-all duration-300",
      highlight 
        ? "bg-[#07303F] text-[#F9F8F4] border-[#07303F] shadow-xl shadow-[#07303F]/10" 
        : "bg-white text-[#07303F] border-slate-200 shadow-sm hover:shadow-md hover:border-[#E5C185]/50"
    )}>
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className={cn("text-[10px] font-bold uppercase tracking-widest", highlight ? "text-[#E5C185]" : "text-slate-400")}>{title}</h3>
        <div className={cn("p-2 rounded-full", highlight ? "bg-[#F9F8F4]/10" : "bg-[#F9F8F4]")}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl md:text-4xl font-serif italic font-bold leading-none mb-2">{value}</div>
        <div className="flex items-center mt-2">
             <span className={cn("text-[10px] uppercase tracking-wider", highlight ? "text-[#E5C185]/70" : "text-slate-400")}>{desc}</span>
        </div>
      </div>
    </div>
  );
}