import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TemplateRenderer from "@/components/templates/TemplateRenderer";

export const revalidate = 60; 

export async function generateStaticParams() {
  const invitations = await prisma.invitation.findMany({
    where: { isActive: true },
    select: { slug: true },
    take: 100, 
  });
  return invitations.map((inv) => ({ slug: inv.slug }));
}

export default async function InvitationPage({ params }: { params: { slug: string } }) {
  // Tunggu parameter sebelum mengakses propertinya (Penting di Next.js 15/Turbo)
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const invitationData = await prisma.invitation.findUnique({
    where: { slug, isActive: true },
    include: {
      template: true, // Data template (jvn-01, dll) ditarik di sini
      wishes: {
        include: { guest: true },
        orderBy: { createdAt: 'desc' },
      }
    }
  });

  if (!invitationData || !invitationData.template) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-black w-full overflow-x-hidden">
      {/* PERBAIKAN: Mengirim data sesuai yang diminta antarmuka TemplateRenderer Anda */}
      <TemplateRenderer 
        invitation={invitationData as any} 
        guest={null} 
      />
    </main>
  );
}