import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import GuestForm from "@/components/dashboard/project/GuestForm"; // Sesuaikan path jika error
import ExportGuestsButton from "@/components/dashboard/project/ExportGuestsButton"; // Sesuaikan path jika error
import GuestRowActions from "@/components/dashboard/project/GuestRowActions"; // Sesuaikan path jika error
import { Users, QrCode, MessageSquare, CheckCircle2, Clock } from "lucide-react";

export default async function ProjectGuestsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const { workspaceSlug, projectSlug } = resolvedParams;

  // 1. Validasi Keamanan Mutlak
  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    include: {
      workspace: true,
      guests: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project || project.workspace.slug !== workspaceSlug) {
    redirect("/404");
  }

  // Multi-Tenancy Guard
  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId: project.workspaceId } }
    });
    if (!isMember) redirect("/unauthorized");
  }

  const guests = project.guests;
  
  // Kalkulasi Statistik
  const totalGuests = guests.length;
  const totalPaxAllocated = guests.reduce((sum, g) => sum + g.totalPaxAllocated, 0);
  const checkedInPax = guests.filter(g => g.isCheckedIn).reduce((sum, g) => sum + g.pax, 0); // pax adalah jumlah yang benar-benar hadir
  const pendingCount = guests.filter(g => g.rsvpStatus === "PENDING").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#E5C185] uppercase mb-1">
            Modul Operasional
          </p>
          <h1 className="text-3xl font-serif text-[#07303F]">Guest Book & RSVP</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Kelola daftar tamu untuk <span className="font-bold text-[#07303F]">{project.title}</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Form Tambah Tamu (Client Component) */}
          <GuestForm projectId={project.id} />
          
          <ExportGuestsButton 
             guests={guests.map(g => ({
               name: g.name,
               whatsapp: g.whatsapp,
               category: g.category || "-",
               pax: g.pax,
               totalPaxAllocated: g.totalPaxAllocated,
               rsvpStatus: g.rsvpStatus,
               isCheckedIn: g.isCheckedIn
             }))} 
             slug={project.slug} 
          />
        </div>
      </div>

      {/* KARTU STATISTIK */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Undangan</p>
            <p className="text-2xl font-bold text-[#07303F]">{totalGuests}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Alokasi Pax</p>
            <p className="text-2xl font-bold text-[#07303F]">{totalPaxAllocated}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Hadir (Pax)</p>
            <p className="text-2xl font-bold text-[#07303F]">{checkedInPax}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Pending RSVP</p>
            <p className="text-2xl font-bold text-[#07303F]">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* TABEL DATA TAMU */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {guests.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <QrCode className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-[#07303F] font-bold text-lg">Belum Ada Tamu</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">
              Tambahkan tamu secara manual atau impor dari file Excel untuk mulai mendistribusikan QR Code undangan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F9F8F4]/50 border-b border-slate-100 text-[#07303F]">
                <tr>
                  <th className="px-6 py-4 font-bold">Nama Tamu</th>
                  <th className="px-6 py-4 font-bold">Kategori</th>
                  <th className="px-6 py-4 font-bold">WhatsApp</th>
                  <th className="px-6 py-4 font-bold">QR Code</th>
                  <th className="px-6 py-4 font-bold">RSVP</th>
                  <th className="px-6 py-4 font-bold">Kehadiran</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#07303F]">{guest.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        {guest.category || "Regular"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {guest.whatsapp || "-"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                      {guest.guestCode}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        guest.rsvpStatus === "ATTENDING" ? "bg-green-100 text-green-700" :
                        guest.rsvpStatus === "DECLINED" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {guest.rsvpStatus}
                      </span>
                      <span className="ml-2 text-xs text-slate-400">({guest.totalPaxAllocated} Pax)</span>
                    </td>
                    <td className="px-6 py-4">
                      {guest.isCheckedIn ? (
                        <div className="flex flex-col">
                          <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Hadir
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {guest.checkInTime ? new Date(guest.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ""} • {guest.pax} Pax
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {/* Komponen interaktif untuk Edit/Hapus */}
<GuestRowActions guest={guest} projectSlug={project.slug} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}