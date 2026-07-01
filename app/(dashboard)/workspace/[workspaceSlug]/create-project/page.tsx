import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import CreateProjectForm from "./CreateProjectForm";

export default async function CreateProjectPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const { workspaceSlug } = resolvedParams;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-[#E5C185]" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {workspaceSlug} Workspace
          </p>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-[#07303F]">
          Registrasi Klien Baru
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Buat akun untuk klien Anda. URL yang Anda pilih di sini akan menjadi tautan permanen untuk undangan digital dan sistem manajemen tamu milik klien tersebut.
        </p>
      </div>

      <CreateProjectForm workspaceSlug={workspaceSlug} />
    </div>
  );
}