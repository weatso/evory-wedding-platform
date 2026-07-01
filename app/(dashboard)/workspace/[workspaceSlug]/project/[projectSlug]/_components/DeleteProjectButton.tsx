"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProject } from "../../../actions";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus proyek ini? Semua data tamu, buku tamu, dan pengaturan acara akan hilang permanen!")) {
      startTransition(async () => {
        const res = await deleteProject(projectId);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Proyek berhasil dihapus.");
          if (res.workspaceSlug) {
            router.push(`/workspace/${res.workspaceSlug}`);
          }
        }
      });
    }
  };

  return (
    <Button 
      onClick={handleDelete}
      disabled={isPending}
      variant="outline" 
      className="border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4 mr-2" />
      )}
      Hapus Proyek
    </Button>
  );
}
