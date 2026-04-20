import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Image as ImageIcon, ExternalLink, HardDrive, FolderKey } from "lucide-react";
import { Button } from "@/components/ui/button";
import SimpleUploadButton from "@/components/dashboard/SimpleUploadButton"; 

export default async function ProjectMediaPage({
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
            Modul Operasional
          </p>
          <h1 className="text-3xl font-serif text-[#07303F]">Evory Vault</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manajemen aset foto dan video untuk <span className="font-bold text-[#07303F]">{project.title}</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href={`/vault/${project.slug}`} target="_blank">
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:border-[#E5C185] hover:text-[#b59050]">
              <ExternalLink className="w-4 h-4 mr-2" /> Buka Galeri Publik
            </Button>
          </Link>
        </div>
      </div>

      {/* DASHBOARD KONTROL MEDIA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL UNGGAH (UPLOAD) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
              <FolderKey className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#07303F] mb-2">Unggah Aset</h3>
            <p className="text-sm text-slate-500 mb-6">
              File yang diunggah akan langsung tersedia di galeri publik klien. Pastikan ukuran file sudah dioptimasi.
            </p>
            
            {/* Komponen Unggah Cerdas Anda */}
            <SimpleUploadButton folder={project.slug} />
          </div>

          <div className="bg-[#07303F] border border-[#E5C185]/20 p-6 rounded-2xl shadow-lg text-[#F9F8F4]">
            <h3 className="text-sm font-bold text-[#E5C185] uppercase tracking-widest mb-2 flex items-center gap-2">
              <HardDrive className="w-4 h-4" /> Penyimpanan S3
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Semua file secara otomatis diunggah ke infrastruktur Cloudflare R2 yang terisolasi khusus untuk proyek ini.
            </p>
            <div className="text-[10px] uppercase tracking-widest font-bold text-white/30 border-t border-white/10 pt-4">
              Prefix: /{project.slug}/
            </div>
          </div>
        </div>

        {/* PANEL MANAJEMEN / PREVIEW FILE */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#07303F] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#E5C185]" /> Aset Tersimpan
            </h2>
          </div>
          
          {/* Untuk tahap ini, kita arahkan user langsung mengelola via VaultClient publik yang sudah canggih, 
              namun kita membingkainya di sini sebagai pengantar. */}
          <div className="p-12 text-center flex flex-col items-center justify-center flex-1 bg-slate-50/50">
            <ImageIcon className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-[#07303F] font-bold text-lg">Manajemen Visual</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-md mb-6">
              Manajemen file mendetail (hapus, sortir, batch download) dilakukan langsung melalui antarmuka Evory Vault demi kecepatan dan keandalan sistem.
            </p>
            <Link href={`/vault/${project.slug}`}>
              <Button className="bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] font-bold shadow-lg">
                Masuk ke Mode Manajemen Vault
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}