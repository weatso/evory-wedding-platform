import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { LayoutTemplate, ShieldCheck } from "lucide-react";
import ClientDetailsForm from "@/components/dashboard/project/ClientDetailsForm";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const { workspaceSlug, projectSlug } = resolvedParams;

  // 1. Penjaga Gerbang Multi-Tenancy
  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    include: { workspace: true },
  });

  if (!project || project.workspace.slug !== workspaceSlug) redirect("/404");

  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId: project.workspaceId } }
    });
    if (!isMember) redirect("/unauthorized");
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#E5C185] uppercase mb-1">
            Konfigurasi Sistem
          </p>
          <h1 className="text-3xl font-serif text-[#07303F]">Pengaturan Acara</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Modifikasi data dasar, lokasi venue, dan estetika undangan digital untuk <span className="font-bold text-[#07303F]">{project.title}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KOLOM KIRI: FORMULIR UTAMA (Lebar 7/12) */}
        <div className="lg:col-span-7 space-y-6">
           <ClientDetailsForm project={project} />
        </div>

        {/* KOLOM KANAN: PENGATURAN TEMPLATE & KEAMANAN (Lebar 5/12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Panel Template */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
             <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <LayoutTemplate className="w-5 h-5" />
             </div>
             <h3 className="text-lg font-bold text-[#07303F] mb-2">Desain Undangan</h3>
             <p className="text-sm text-slate-500 mb-6">
                Pilih tema visual yang akan digunakan untuk landing page undangan digital klien Anda.
             </p>
             
             {/* Area Penempatan ClientTemplateGallery di masa depan */}
             <div className="p-6 bg-[#07303F] rounded-xl border border-[#E5C185]/20 text-center shadow-inner">
                <p className="text-xs font-bold text-[#E5C185] uppercase tracking-widest animate-pulse">
                  Modul Template Registry Terkunci
                </p>
                <p className="text-[10px] text-white/50 mt-2">
                  Sedang dalam tahap sinkronisasi dengan database global.
                </p>
             </div>
          </div>

          {/* Panel Zona Bahaya / Info */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" /> Otoritas Proyek
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Proyek ini terikat secara permanen pada Workspace <span className="font-bold text-[#07303F]">{workspaceSlug}</span>. Hanya admin agensi dan Evory Pusat yang memiliki hak untuk mengubah konfigurasi ini atau menghapus proyek secara permanen.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}