import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"; // Pastikan menggunakan instance prisma yang benar
import { redirect } from "next/navigation";
import ClientAssetsForm from "../ClientAssetsForm"; 

type Props = {
  searchParams: Promise<{ viewAs?: string }>;
};

export default async function MediaPage(props: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const viewAsId = searchParams.viewAs;
  const userRole = session.user.role;
  
  const targetUserId = (userRole === "ADMIN" && viewAsId) ? viewAsId : session.user.id; 

  // 1. Ubah pencarian menggunakan tabel Project
  const project = await prisma.project.findFirst({
    where: { userId: targetUserId, isActive: true },
  });

  if (!project) return <div className="p-8 text-center text-red-500">Data proyek tidak ditemukan.</div>;

  // 2. Ekstrak data JSON untuk Background
  const themeConfig = (project.themeConfig as any) || {};
  const initialWings = themeConfig.desktopBackground || null;

  // 3. Ekstrak data JSON untuk Aset Gambar Mempelai & Cover
  const meta = (project.eventMetadata as any) || {};
  const coverImageUrl = meta.coverImageUrl || null;
  const groomImageUrl = meta.groomImageUrl || null;
  const brideImageUrl = meta.brideImageUrl || null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Media & Aset Digital</h1>
            <p className="text-slate-500">Kelola foto profil, cover utama, background desktop, dan galeri.</p>
        </div>
        
        {/* 4. Ubah invitationId menjadi projectId dan oper variabel JSON yang diekstrak */}
        <ClientAssetsForm 
            projectId={project.id}
            userId={targetUserId}
            initialCover={coverImageUrl}
            initialGroom={groomImageUrl} 
            initialBride={brideImageUrl} 
            initialWings={initialWings} 
            initialGallery={project.gallery}
        />
    </div>
  );
}