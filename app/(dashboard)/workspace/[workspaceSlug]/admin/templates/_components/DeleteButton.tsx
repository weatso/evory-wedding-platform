"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteTemplate } from "../actions";
import { Trash2 } from "lucide-react";

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Yakin ingin menghapus template ini selamanya?")) {
      startTransition(async () => {
        await deleteTemplate(id);
      });
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete} 
      disabled={isPending}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
    >
      {isPending ? "..." : <Trash2 className="w-4 h-4" />}
    </Button>
  );
}