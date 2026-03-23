import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Settings, Users, Image as ImageIcon, Video, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const { workspaceSlug, projectSlug } = resolvedParams;

  // 1. Validasi Keamanan & Ambil Data Proyek
  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    include: {
      workspace: true,
      _count: { select: { guests: true, wishes: true } },
    },
  });

  // Pastikan proyek ada dan memang milik Workspace ini
  if (!project || project.workspace.slug !== workspaceSlug) redirect("/404");

  // Multi-Tenancy Guard
  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId: project.workspaceId } }
    });
    if (!isMember) redirect("/unauthorized");
  }

  const meta = (project.eventMetadata as any) || {};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER Navigasi Balik */}
      <div className="flex items-center gap-2 text-sm">
        <Link href={`/workspace/${workspaceSlug}`} className="text-slate-400 hover:text-[#E5C185] flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Workspace
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-[#07303F] font-bold">{project.title}</span>
      </div>

      {/* IDENTITAS PROYEK */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-[#07303F] text-[#E5C185] text-[10px] font-bold uppercase tracking-widest rounded-full">
              {project.eventType}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
              Tier: {project.packageTier}
            </span>
          </div>
          <h1 className="text-3xl font-serif text-[#07303F]">{project.title}</h1>
          <p className="text-slate-500 mt-2 text-sm flex items-center gap-2">
            URL Publik: <span className="font-mono text-slate-700 font-bold">evory.id/invitation/{project.slug}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/invitation/${project.slug}`} target="_blank">
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:border-[#E5C185] hover:text-[#b59050]">
              <ExternalLink className="w-4 h-4 mr-2" /> Lihat Undangan
            </Button>
          </Link>
        </div>
      </div>

      {/* MENU OPERASIONAL PROYEK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Modul: Buku Tamu */}
        <Link href={`/workspace/${workspaceSlug}/project/${projectSlug}/guests`} className="group">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#E5C185]/50 transition-all h-full flex flex-col">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#07303F] mb-1">Guest Book & RSVP</h3>
            <p className="text-sm text-slate-500 mb-4 flex-1">Kelola daftar tamu, sebar undangan WhatsApp, dan pantau status RSVP secara real-time.</p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="font-bold text-[#07303F]">{project._count.guests} Tamu</span>
              <span className="text-[#E5C185] font-bold">Kelola →</span>
            </div>
          </div>
        </Link>

        {/* Modul: Media & Galeri */}
        <Link href={`/workspace/${workspaceSlug}/project/${projectSlug}/media`} className="group">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#E5C185]/50 transition-all h-full flex flex-col">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#07303F] mb-1">Evory Vault</h3>
            <p className="text-sm text-slate-500 mb-4 flex-1">Manajemen aset foto dan video. Bagikan momen resolusi tinggi langsung kepada tamu dan klien.</p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end text-sm">
              <span className="text-[#E5C185] font-bold">Buka Vault →</span>
            </div>
          </div>
        </Link>

        {/* Modul: Pengaturan Acara (Client Details Form pindah ke sini nanti) */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#E5C185]/50 transition-all h-full flex flex-col cursor-pointer group">
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#07303F] mb-1">Pengaturan Acara</h3>
          <p className="text-sm text-slate-500 mb-4 flex-1">Ubah nama pengantin, tanggal, lokasi venue, dan desain template undangan digital.</p>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end text-sm">
            <span className="text-[#E5C185] font-bold">Konfigurasi →</span>
          </div>
        </div>

      </div>
    </div>
  );
}