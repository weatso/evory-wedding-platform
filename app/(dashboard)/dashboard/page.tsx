import { auth } from "@/auth";
import { prisma } from "@/lib/db"; // Ganti menjadi "@/lib/prisma" jika Anda menggunakan file itu
import { redirect } from "next/navigation";
import { Clock, XCircle, ShieldAlert } from "lucide-react";

export default async function DashboardTrafficController() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = session.user.systemRole;

  // 1. KASTA GLOBAL: SUPERADMIN
  if (userRole === "SUPERADMIN") {
    redirect("/admin");
  }

  // 2. KASTA AGENSI: PARTNER & STAF (Cari Kavling Mereka)
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: { workspace: true }
  });

  if (memberships.length > 0) {
    // Jika mereka punya kavling, langsung lempar ke Lobi Agensi mereka
    // (Jika suatu saat 1 orang punya banyak agensi, kita bisa buatkan halaman pemilih. Untuk sekarang, lempar ke yang pertama).
    redirect(`/workspace/${memberships[0].workspace.slug}`);
  }

  // 3. KASTA TAK BERTUAN: Pelamar yang belum disetujui
  const application = await prisma.partnerApplication.findUnique({
    where: { userId: session.user.id }
  });

  if (application) {
     if (application.status === "PENDING") {
         return (
           <div className="min-h-[80vh] flex items-center justify-center">
             <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
               <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
               <h1 className="text-2xl font-serif text-[#07303F] mb-2">Aplikasi Sedang Ditinjau</h1>
               <p className="text-slate-500 text-sm leading-relaxed">
                 Akun Anda sedang dalam proses peninjauan oleh Evory Pusat. Anda akan otomatis dialihkan ke Workspace Anda setelah aplikasi ini disetujui.
               </p>
             </div>
           </div>
         );
     } else if (application.status === "REJECTED") {
         return (
           <div className="min-h-[80vh] flex items-center justify-center">
             <div className="bg-white border border-red-100 p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
               <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
               <h1 className="text-2xl font-serif text-red-600 mb-2">Aplikasi Ditolak</h1>
               <p className="text-slate-600 text-sm leading-relaxed mb-4">
                 {application.notes || "Mohon maaf, agensi Anda belum memenuhi kriteria kemitraan kami saat ini."}
               </p>
             </div>
           </div>
         );
     }
  }

  // 4. ANOMALI (User tanpa aplikasi dan tanpa workspace)
  return (
     <div className="min-h-[80vh] flex items-center justify-center">
         <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
            <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#07303F] mb-2">Akses Terbatas</h1>
            <p className="text-slate-500 text-sm">
              Sistem tidak menemukan otoritas akses untuk akun Anda. Silakan hubungi Administrator.
            </p>
         </div>
     </div>
  );
}