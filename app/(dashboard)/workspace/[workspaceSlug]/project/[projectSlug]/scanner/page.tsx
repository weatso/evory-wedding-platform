import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ScannerClient from "./ScannerClient"; // force reload
import { QrCode } from "lucide-react";

export default async function ScannerPage({
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
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-[#07303F] text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
          <QrCode className="w-6 h-6" />
        </div>
        <p className="text-[10px] font-bold tracking-widest text-[#E5C185] uppercase">Portal Usher</p>
        <h1 className="text-2xl font-serif text-[#07303F]">Pemindai E-Ticket</h1>
        <p className="text-slate-500 text-sm">Arahkan kamera ke QR Code tamu.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <ScannerClient projectId={project.id} />
      </div>
    </div>
  );
}
