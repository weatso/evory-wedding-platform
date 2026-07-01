import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TemplateRenderer from "@/components/templates/TemplateRenderer";

export const revalidate = 60; 

export async function generateMetadata({ params, searchParams }: any) {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({
    where: { slug: resolvedParams.slug, isActive: true },
    select: { title: true, eventMetadata: true }
  });

  if (!project) return { title: "Undangan Tidak Ditemukan | Evory" };

  const meta = project.eventMetadata as any || {};
  const coverUrl = meta.coverImageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"; // Fallback image

  return {
    title: `The Wedding of ${project.title}`,
    description: "Kami mengundang Anda untuk hadir di momen bahagia kami. Buka tautan ini untuk melihat detail acara.",
    openGraph: {
      title: `The Wedding of ${project.title}`,
      description: "Kami mengundang Anda untuk hadir di momen bahagia kami. Buka tautan ini untuk melihat detail acara.",
      images: [
        {
          url: coverUrl,
          width: 1200,
          height: 630,
          alt: `The Wedding of ${project.title}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `The Wedding of ${project.title}`,
      description: "Kami mengundang Anda untuk hadir di momen bahagia kami.",
      images: [coverUrl],
    },
  };
}

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
        guestCode: guestCode,
        projectId: projectData.id
      }
    });
  }

  // 3. PAYWALL GUARD & SECURITY
  const { auth } = await import("@/auth");
  const session = await auth();
  const user = session?.user as any;
  let hasAccess = false;
  
  if ((projectData as any).paymentStatus === "PAID") {
    hasAccess = true;
  } else if (user) {
    if (user.systemRole === "SUPERADMIN") {
      hasAccess = true;
    } else {
      const isMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: projectData.workspaceId,
          }
        }
      });
      if (isMember) hasAccess = true;
    }
  }

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Undangan Terkunci</h1>
          <p className="text-slate-500 text-sm">
            Maaf, halaman undangan ini belum diaktifkan. Silakan hubungi pihak agensi untuk informasi lebih lanjut.
          </p>
        </div>
      </main>
    );
  }

  // 4. Render Template
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