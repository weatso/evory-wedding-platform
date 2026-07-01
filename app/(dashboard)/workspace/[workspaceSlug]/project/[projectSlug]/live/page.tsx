import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users, CheckCircle2, Clock } from "lucide-react";
import LiveAttendanceClient from "./LiveAttendanceClient";

export default async function LiveAttendancePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const { workspaceSlug, projectSlug } = resolvedParams;

  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    include: { workspace: true },
  });

  if (!project || project.workspace.slug !== workspaceSlug) {
    redirect("/404");
  }

  // Multi-Tenancy Guard
  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId: project.workspaceId } }
    });
    if (!isMember) redirect("/unauthorized");
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase">Live Monitor</p>
          </div>
          <h1 className="text-3xl font-serif text-[#07303F]">Kehadiran Tamu</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau arus kedatangan tamu di <span className="font-bold text-[#07303F]">{project.title}</span> secara real-time.
          </p>
        </div>
      </div>

      <LiveAttendanceClient projectId={project.id} />
    </div>
  );
}