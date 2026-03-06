import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TemplateRenderer from "@/components/templates/TemplateRenderer";

export const revalidate = 60; 

// Tambahkan searchParams untuk menangkap ?to=id_tamu
export default async function InvitationPage({ 
  params,
  searchParams
}: { 
  params: { slug: string };
  searchParams: { to?: string };
}) {
  // Resolusi parameter (wajib di Next.js 15)
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { slug } = resolvedParams;
  const guestId = resolvedSearchParams.to; // Menangkap ID dari URL

  // 1. Ambil Data Undangan
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

  // 2. Ambil Data Tamu (Jika URL memiliki parameter ?to=...)
  let guestData = null;
  if (guestId) {
    // HARUS menggunakan findFirst, bukan findUnique, karena kita memfilter berdasarkan 2 parameter
    guestData = await prisma.guest.findFirst({
      where: { 
        id: guestId,
        invitationId: invitationData.id // Validasi ganda: Pastikan tamu ini benar diundang ke acara ini
      }
    });
  }

  return (
    <main className="min-h-screen bg-black w-full overflow-x-hidden">
      {/* SEKARANG DATA TAMU DIKIRIMKAN, BUKAN NULL LAGI */}
      <TemplateRenderer 
        invitation={invitationData as any} 
        guest={guestData} 
      />
    </main>
  );
}