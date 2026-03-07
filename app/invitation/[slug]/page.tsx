import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TemplateRenderer from "@/components/templates/TemplateRenderer";

export const revalidate = 60; 

export default async function InvitationPage({ 
  params,
  searchParams
}: { 
  params: { slug: string };
  searchParams: { to?: string };
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { slug } = resolvedParams;
  const guestId = resolvedSearchParams.to; 

  // 1. Tarik Data Undangan (Publik bisa melihat)
  const invitationData = await prisma.invitation.findUnique({
    where: { slug, isActive: true },
    include: {
      template: true,
      wishes: {
        include: { guest: true },
        orderBy: { createdAt: 'desc' },
      }
    }
  });

  if (!invitationData || !invitationData.template) {
    return notFound();
  }

  // 2. Validasi Tamu Spesifik (Hanya yang punya KTP Valid yang dikenali)
  let guestData = null;
  if (guestId) {
    guestData = await prisma.guest.findFirst({
      where: { 
        id: guestId,
        invitationId: invitationData.id 
      }
    });
  }

  // 3. Render Template (Jika guestData null, template masuk mode Read-Only)
  return (
    <main className="min-h-screen bg-black w-full overflow-x-hidden">
      <TemplateRenderer 
        invitation={invitationData as any} 
        guest={guestData} 
      />
    </main>
  );
}