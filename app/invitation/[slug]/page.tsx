import { prisma } from "@/lib/prisma"; // Pastikan path ini benar (bisa @/lib/db)
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ u?: string }>; // Menangkap parameter ?u=... dari URL
}

// 1. GENERATE METADATA (Untuk SEO & Preview WA)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    select: { groomNick: true, brideNick: true, location: true, eventDate: true }
  });

  if (!invitation) return { title: "Undangan Tidak Ditemukan" };

  return {
    title: `The Wedding of ${invitation.groomNick} & ${invitation.brideNick}`,
    description: `Kami mengundang Anda untuk hadir pada ${new Date(invitation.eventDate).toLocaleDateString('id-ID')} di ${invitation.location}.`,
  };
}

// 2. HALAMAN UTAMA (Server Component)
export default async function InvitationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { u: guestCode } = await searchParams; // Ambil kode tamu dari URL (?u=...)

  // A. Fetch Data Undangan Lengkap
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: {
      template: true, // Ambil info template untuk menentukan desain
      wishes: { // Ambil ucapan untuk ditampilkan
        orderBy: { createdAt: "desc" },
        include: { guest: true } 
      } 
    },
  });

  // Jika tidak ketemu, tampilkan 404
  if (!invitation) return notFound();

  // Jika undangan dinonaktifkan oleh Admin
  if (!invitation.isActive) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50 text-center p-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Acara Telah Selesai</h1>
          <p className="text-stone-600">Undangan ini sudah tidak aktif.</p>
        </div>
      </div>
    );
  }

  // B. Cek Data Tamu (Jika ada kode ?u= di URL)
  let guestData = null;
  
  if (guestCode) {
    guestData = await prisma.guest.findUnique({
      where: { 
        guestCode: guestCode,
        invitationId: invitation.id // Pastikan kode ini milik undangan yang benar
      }
    });
  }

  // C. Render Template
  // Kita kirim data undangan & data tamu ke TemplateRenderer
  return <TemplateRenderer invitation={invitation} guest={guestData} />;
}