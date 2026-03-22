import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ServiceModule } from "@prisma/client";
import WeddingOverview from "@/components/dashboard/WeddingOverview";
import WccOverview from "@/components/dashboard/WccOverview";

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  // 1. Ambil Proyek & Relasinya secara presisi
  const project = await prisma.project.findFirst({
    where: { 
      userId: session.user.id,
      isActive: true
    },
    include: {
      guests: true,
      wishes: {
        include: { guest: true } // WAJIB ADA: Agar UI bisa membaca nama tamu dari relasi
      }
    }
  });

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-serif italic text-[#07303F]">Ruang Kerja Belum Siap</h1>
        <p className="text-slate-500 mt-2">Belum ada proyek aktif yang ditugaskan ke akun Anda.</p>
      </div>
    );
  }

  // 2. Ambil Katalog Template untuk diserahkan ke WeddingOverview
  const availableTemplates = await prisma.template.findMany({
    where: { isActive: true },
    select: {
      id: true, name: true, slug: true, thumbnail: true, tier: true, 
      category: { select: { name: true } }
    },
    orderBy: { tier: 'desc' }
  });

  const activeModules = project.activeModules || [];

  // GATEKEEPER LOGIC
  if (activeModules.includes(ServiceModule.CONTENT_CREATION) && !activeModules.includes(ServiceModule.ONLINE_INVITATION)) {
    return <WccOverview project={project} />;
  }

  if (activeModules.includes(ServiceModule.ONLINE_INVITATION) || activeModules.includes(ServiceModule.RSVP_VENUE_SYSTEM)) {
    // Serahkan project dan templates ke komponen anak
    return <WeddingOverview project={project} templates={availableTemplates} />;
  }

  return <div className="p-8">Modul tidak terdeteksi. Hubungi Admin.</div>;
}