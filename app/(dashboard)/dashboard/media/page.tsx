import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ClientAssetsForm from "../ClientAssetsForm"; // Import dari folder dashboard parent

type Props = {
  searchParams: Promise<{ viewAs?: string }>;
};

export default async function MediaPage(props: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const viewAsId = searchParams.viewAs;
  const userRole = session.user.role;
  
  // Logic Admin View As
  const targetUserId = (userRole === "ADMIN" && viewAsId) ? viewAsId : session.user.id; 

  const invitation = await prisma.invitation.findFirst({
    where: { userId: targetUserId },
  });

  if (!invitation) return <div className="p-8 text-center text-red-500">Data undangan tidak ditemukan.</div>;

  return (
    // Menggunakan max-w-5xl agar layout 2 kolom (Tabs) terlihat lega
    <div className="max-w-5xl mx-auto space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Media & Aset Digital</h1>
            <p className="text-slate-500">Kelola foto profil mempelai, cover utama, dan galeri prewedding.</p>
        </div>
        
        <ClientAssetsForm 
            invitationId={invitation.id}
            userId={targetUserId}
            initialCover={invitation.coverImageUrl}
            initialGroom={invitation.groomImageUrl} // [BARU] Foto Mempelai Pria
            initialBride={invitation.brideImageUrl} // [BARU] Foto Mempelai Wanita
            initialGallery={invitation.gallery}
        />
    </div>
  );
}