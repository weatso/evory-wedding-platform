import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function DashboardGateway() {
  const session = await auth();
  
  // Jika tidak ada sesi, tendang kembali ke login
  if (!session?.user) redirect("/login");

  // 1. JALUR SUPERADMIN (Pusat)
  if (session.user.systemRole === "SUPERADMIN") {
    redirect("/admin");
  }

  // 2. JALUR PARTNER / STAF (Cari kavling mereka)
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: { workspace: true }
  });

  // 3. JIKA TIDAK PUNYA WORKSPACE (Akun mengambang)
  if (memberships.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07303F] text-[#F9F8F4] p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-serif text-[#E5C185]">Akses Ditolak</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Akun Anda valid, tetapi belum terikat pada Workspace/Agensi manapun di dalam ekosistem Evory.
          </p>
          <p className="text-xs text-white/40 border-t border-white/10 pt-4 mt-4">
            Silakan hubungi Pusat untuk meminta penugasan Workspace.
          </p>
        </div>
      </div>
    );
  }

  // 4. JIKA PUNYA WORKSPACE
  // Ambil workspace pertama sebagai default. 
  // (Jika kelak 1 user bisa punya banyak agensi, kita ubah halaman ini menjadi UI "Pilih Workspace")
  const defaultWorkspace = memberships[0].workspace;
  
  if (!defaultWorkspace.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07303F] text-[#F9F8F4]">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-2 text-red-400">Workspace Dibekukan</h1>
          <p className="text-white/60 text-sm">Agensi Anda saat ini dinonaktifkan oleh sistem pusat.</p>
        </div>
      </div>
    );
  }

  // Lempar otomatis ke Dashboard Workspace mereka
  redirect(`/workspace/${defaultWorkspace.slug}`);
}