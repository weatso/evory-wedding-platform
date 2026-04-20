import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FolderGit2, Users, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const { workspaceSlug } = resolvedParams;

  // 1. Ambil data Workspace dan semua Proyek di dalamnya
  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { guests: true } }
        }
      }
    }
  });

  if (!workspace) redirect("/404");

  // 2. Multi-Tenancy Guard
  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId: workspace.id } }
    });
    if (!isMember) redirect("/unauthorized");
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER AGENSI */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#E5C185] uppercase mb-1">
            Workspace Overview
          </p>
          <h1 className="text-3xl font-serif text-[#07303F]">{workspace.name}</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Kelola seluruh portofolio proyek acara dan undangan digital klien Anda.
          </p>
        </div>
        
        <Link href={`/workspace/${workspaceSlug}/create-project`}>
          <Button className="bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] font-bold shadow-lg shadow-[#07303F]/20 h-12 px-6">
            <Plus className="w-5 h-5 mr-2" /> Ciptakan Proyek
          </Button>
        </Link>
      </div>

      {/* DAFTAR PROYEK (KAVLING ACARA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {workspace.projects.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
            <FolderGit2 className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-[#07303F] font-bold text-lg">Portofolio Kosong</h3>
            <p className="text-slate-400 text-sm mt-1 mb-6 max-w-md">
              Agensi Anda belum memiliki acara yang terdaftar. Mulai buat proyek pertama Anda untuk mendistribusikan undangan digital.
            </p>
            <Link href={`/workspace/${workspaceSlug}/create-project`}>
              <Button variant="outline" className="border-slate-200 text-[#07303F] hover:border-[#E5C185] hover:text-[#b59050]">
                Buat Proyek Pertama
              </Button>
            </Link>
          </div>
        ) : (
          workspace.projects.map((project) => (
            <Link key={project.id} href={`/workspace/${workspaceSlug}/project/${project.slug}`} className="group">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-[#E5C185]/50 transition-all cursor-pointer h-full flex flex-col relative overflow-hidden">
                {/* Efek Garis Dekoratif */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E5C185]/0 to-transparent group-hover:via-[#E5C185] transition-all duration-500" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-50 text-[#07303F] rounded-xl flex items-center justify-center group-hover:bg-[#07303F] group-hover:text-[#E5C185] transition-colors">
                    <CalendarClock className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest rounded-full">
                    {project.eventType}
                  </span>
                </div>
                
                <h3 className="text-xl font-serif text-[#07303F] mb-1 group-hover:text-[#b59050] transition-colors line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono mb-6">evory.id/invitation/{project.slug}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-slate-400" /> {project._count.guests} Tamu
                  </span>
                  <span className="text-[#E5C185] font-bold uppercase tracking-wider text-[10px]">
                    Masuk Command Center →
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}