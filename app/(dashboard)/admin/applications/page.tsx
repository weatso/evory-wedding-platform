import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Building2, MapPin, Globe, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import ApplicationActions from "./ApplicationActions"; // Komponen Client yang akan kita buat sebentar lagi

export default async function WaitingRoomPage() {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") redirect("/dashboard");

  // Tarik semua aplikasi, urutkan yang PENDING di atas, lalu berdasarkan tanggal terbaru
  const applications = await prisma.partnerApplication.findMany({
    include: { user: true },
    orderBy: [
      { status: 'asc' }, // PENDING (P) comes before APPROVED (A) and REJECTED (R) - wait, alphabetical 'A' is first. 
                         // Better to sort by createdAt for simplicity, we will group them visually.
      { createdAt: 'desc' }
    ]
  });

  const pendingApps = applications.filter(app => app.status === "PENDING");
  const processedApps = applications.filter(app => app.status !== "PENDING");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[#E5C185] uppercase mb-1">
          Pusat Kendali Otoritas
        </p>
        <h1 className="text-3xl md:text-4xl font-serif text-[#07303F] mb-2">
          Ruang Tunggu Kemitraan
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Tinjau, setujui, atau tolak pendaftaran agensi baru. Menyetujui aplikasi secara otomatis akan membangun infrastruktur Workspace mereka.
        </p>
      </div>

      {/* SEGMEN 1: ANTRIAN PENDING */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#07303F] flex items-center gap-2 border-b border-slate-200 pb-2">
          <Clock className="w-4 h-4 text-amber-500" /> Menunggu Keputusan ({pendingApps.length})
        </h2>
        
        {pendingApps.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-slate-400 text-sm">
            Tidak ada agensi baru di ruang tunggu.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingApps.map((app) => (
              <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#07303F]">{app.agencyName}</h3>
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center shrink-0">👤</div>
                      {app.user.name} ({app.user.email})
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> {app.location}
                    </p>
                    {app.portfolioUrl && (
                      <Link href={app.portfolioUrl} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-2">
                        <Globe className="w-4 h-4 shrink-0" /> Lihat Portofolio
                      </Link>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <ApplicationActions applicationId={app.id} agencyName={app.agencyName} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEGMEN 2: RIWAYAT KEPUTUSAN */}
      <div className="space-y-4 pt-8">
        <h2 className="text-sm font-bold text-[#07303F] flex items-center gap-2 border-b border-slate-200 pb-2">
          <Building2 className="w-4 h-4 text-slate-400" /> Riwayat Keputusan
        </h2>
        
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-bold">Agensi</th>
                <th className="px-6 py-4 font-bold">Pemohon</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Tanggal Proses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedApps.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-[#07303F]">{app.agencyName}</td>
                  <td className="px-6 py-4 text-slate-500">{app.user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${
                      app.status === "APPROVED" ? "text-green-600" : "text-red-600"
                    }`}>
                      {app.status === "APPROVED" ? <CheckCircle2 className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(app.updatedAt).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
              {processedApps.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Belum ada riwayat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}