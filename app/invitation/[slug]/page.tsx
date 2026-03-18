import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TemplateRenderer from "@/components/templates/TemplateRenderer";

export const revalidate = 60; 

export default async function InvitationPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { slug } = resolvedParams;
  const guestCode = resolvedSearchParams.to; // PERBAIKAN: Menggunakan variabel yang tepat

  // 1. Tarik Data Proyek (Dahulu Undangan)
  const projectData = await prisma.project.findUnique({
    where: { slug, isActive: true },
    include: {
      template: true,
      wishes: {
        include: { guest: true },
        orderBy: { createdAt: 'desc' },
      }
    }
  });

  if (!projectData || !projectData.template) {
    return notFound();
  }

  // 2. Validasi Tamu Spesifik (Mencocokkan Kode Tamu, bukan ID)
  let guestData = null;
  if (guestCode) {
    guestData = await prisma.guest.findFirst({
      where: { 
        guestCode: guestCode, // PERBAIKAN BUG BISU: Cocokkan dengan guestCode dari URL
        projectId: projectData.id  // PERBAIKAN ARSITEKTUR: invitationId menjadi projectId
      }
    });
  }

  // 3. Render Template
  return (
    <main className="min-h-screen bg-black w-full overflow-x-hidden">
      <TemplateRenderer 
        // Tetap menggunakan properti 'invitation' agar tidak memutus struktur komponen TemplateRenderer Anda, 
        // namun mesin di dalamnya murni menggunakan 'projectData'.
        invitation={projectData as any} 
        guest={guestData} 
      />
    </main>
  );
}