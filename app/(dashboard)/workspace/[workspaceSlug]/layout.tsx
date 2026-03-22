import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AppSidebar from "@/components/dashboard/AppSidebar";

export default async function WorkspaceLayout({ 
  children,
  params
}: { 
  children: React.ReactNode,
  params: Promise<{ workspaceSlug: string }>
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Mengekstrak slug dari URL (contoh: 'radeva-wo')
  const resolvedParams = await params;
  const { workspaceSlug } = resolvedParams;

  // =====================================================================
  // 1. VALIDASI EXISTENSI WORKSPACE DI DATABASE
  // =====================================================================
  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { id: true, name: true, isActive: true }
  });

  // Jika URL ngawur atau Workspace sudah dihapus
  if (!workspace) redirect("/404"); 
  
  // Jika pusat (Anda) membekukan akun agensi ini karena belum bayar
  if (!workspace.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07303F] text-[#F9F8F4]">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-2">Workspace Dinonaktifkan</h1>
          <p className="text-white/60">Silakan hubungi administrator Evory.</p>
        </div>
      </div>
    );
  }

  // =====================================================================
  // 2. OTORISASI ISOLASI DATA (MULTI-TENANCY GUARD)
  // =====================================================================
  // Jika yang login BUKAN Anda (Superadmin), cek apakah dia karyawan di agensi ini
  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: workspace.id,
        },
      },
    });

    // Jika dia bukan member, tendang dia keluar. Cegah peretasan URL silang.
    if (!isMember) redirect("/unauthorized"); 
  }

  // =====================================================================
  // 3. RENDER ENGINE (UI LAMA ANDA)
  // =====================================================================
  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#07303F] flex w-full selection:bg-[#E5C185] selection:text-[#07303F] font-sans">
      
      {/* PERHATIAN ARSITEK: 
        role lama diubah menjadi systemRole.
        Anda WAJIB menambahkan props 'workspaceSlug' ke dalam komponen AppSidebar Anda nanti, 
        karena sidebar harus tahu ia sedang merender menu untuk workspace yang mana. 
      */}
      <AppSidebar 
        userRole={session.user.systemRole} 
        workspaceSlug={workspaceSlug} 
      />
      
      <main className="flex-1 w-full min-w-0 pt-16 md:pt-0 overflow-x-hidden flex flex-col">
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">
          {children}
        </div>
      </main>
      
    </div>
  );
}