import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { PlusCircle, Users, Image as ImageIcon, LayoutDashboard, Briefcase } from "lucide-react";
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

  // 1. Ambil data Workspace beserta statistik proyeknya
  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { guests: true },
          },
        },
      },
      _count: {
        select: {
          members: true,
          projects: true,
        }
      }
    },
  });

  if (!workspace) redirect("/404");

  const recentProjects = workspace.projects.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#E5C185] uppercase mb-1">
            Workspace Overview
          </p>
          <h1 className="text-3xl md:text-4xl font-serif text-[#07303F]">
            {workspace.name}
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-xl">
            Pantau dan kelola semua acara klien Anda dari satu pusat komando. 
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href={`/workspace/${workspaceSlug}/create-project`}>
            <Button className="bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] font-bold shadow-lg shadow-[#07303F]/20">
              <PlusCircle className="w-4 h-4 mr-2" />
              Buat Proyek Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Acara", value: workspace._count.projects, icon: Briefcase },
          { label: "Total Klien / Tamu", value: workspace.projects.reduce((acc, curr) => acc + curr._count.guests, 0), icon: Users },
          { label: "Anggota Tim", value: workspace._count.members, icon: LayoutDashboard },
          { label: "Paket Aktif", value: workspace.tier, icon: ImageIcon, isBadge: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[#F9F8F4] rounded-lg text-[#07303F]">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            {stat.isBadge ? (
              <span className="inline-block px-3 py-1 bg-[#E5C185]/20 text-[#b59050] text-xs font-bold rounded-full uppercase tracking-widest">
                {stat.value}
              </span>
            ) : (
              <h3 className="text-2xl font-bold text-[#07303F]">{stat.value}</h3>
            )}
          </div>
        ))}
      </div>

      {/* RECENT PROJECTS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#07303F]">Acara Terbaru</h2>
          <Link href={`/workspace/${workspaceSlug}/projects`} className="text-xs font-bold text-[#E5C185] hover:text-[#c4a162] uppercase tracking-wider">
            Lihat Semua
          </Link>
        </div>
        
        {recentProjects.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#F9F8F4] rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-600 font-bold mb-1">Belum Ada Proyek</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              Workspace ini belum memiliki acara aktif. Buat proyek pertama Anda untuk mulai mengelola tamu dan undangan.
            </p>
            <Link href={`/workspace/${workspaceSlug}/create-project`}>
              <Button variant="outline" className="border-[#E5C185] text-[#b59050] hover:bg-[#E5C185]/10">
                <PlusCircle className="w-4 h-4 mr-2" /> Buat Proyek
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F8F4]/50 text-[10px] uppercase tracking-widest text-slate-400">
                  <th className="p-4 font-bold">Nama Acara</th>
                  <th className="p-4 font-bold">Tipe</th>
                  <th className="p-4 font-bold">Tamu Terdaftar</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-[#07303F]">{project.title}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-medium">
                        {project.eventType}
                      </span>
                    </td>
                    <td className="p-4">{project._count.guests} Tamu</td>
                    <td className="p-4">
                      {project.isActive ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Aktif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" /> Selesai
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/workspace/${workspaceSlug}/project/${project.slug}`}>
                        <Button variant="ghost" size="sm" className="text-[#E5C185] hover:bg-[#E5C185]/10 hover:text-[#b59050]">
                          Kelola
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}