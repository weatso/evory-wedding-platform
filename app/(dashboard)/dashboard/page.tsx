import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ServiceModule } from "@prisma/client";
import WeddingOverview from "@/components/dashboard/WeddingOverview";
import WccOverview from "@/components/dashboard/WccOverview";

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session || !session.user) redirect("/login");

  // Cari proyek klien ini (Gunakan findFirst untuk menyederhanakan jika 1 user = 1 project aktif)
  const project = await prisma.project.findFirst({
    where: { 
      userId: session.user.id,
      isActive: true
    },
    include: {
      guests: true,
      wishes: true
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

  const activeModules = project.activeModules || [];

  // GATEKEEPER LOGIC

  // 1. Jika Klien murni WCC
  if (activeModules.includes(ServiceModule.CONTENT_CREATION) && !activeModules.includes(ServiceModule.ONLINE_INVITATION)) {
    return <WccOverview project={project} />;
  }

  // 2. Jika Klien Pernikahan
  if (activeModules.includes(ServiceModule.ONLINE_INVITATION) || activeModules.includes(ServiceModule.RSVP_VENUE_SYSTEM)) {
    return <WeddingOverview project={project} />;
  }

  // 3. Fallback
  return <div className="p-8">Modul tidak terdeteksi. Hubungi Admin.</div>;
}