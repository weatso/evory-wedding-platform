import { auth } from "@/auth";
import { prisma } from "@/lib/db";
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

  const invitation = await prisma.invitation.findFirst({
    where: { userId: targetUserId },
  });

  if (!invitation) return <div className="p-8 text-center text-red-500">Data undangan tidak ditemukan.</div>;

  // Ambil URL Wings dari themeConfig (jika ada)
  const themeConfig = (invitation.themeConfig as any) || {};
  const initialWings = themeConfig.desktopBackground || null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Media & Aset Digital</h1>
            <p className="text-slate-500">Kelola foto profil mempelai, cover utama, background desktop, dan galeri.</p>
        </div>
        
        <ClientAssetsForm 
            invitationId={invitation.id}
            userId={targetUserId}
            initialCover={invitation.coverImageUrl}
            initialGroom={invitation.groomImageUrl} 
            initialBride={invitation.brideImageUrl} 
            initialWings={initialWings} // [BARU] Kirim data wings ke form
            initialGallery={invitation.gallery}
        />
    </div>
  );
}