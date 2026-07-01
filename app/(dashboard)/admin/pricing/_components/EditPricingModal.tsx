"use client";

import { useState, useTransition } from "react";
import { updatePricingItemMetadata } from "../actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceModule } from "@prisma/client";

interface EditPricingModalProps {
  item: {
    id: string;
    name: string;
    description: string | null;
    service: string | null;
    isConsultation: boolean;
    isBundle: boolean;
  };
}

export function EditPricingModal({ item }: EditPricingModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await updatePricingItemMetadata(item.id, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Informasi berhasil diperbarui!");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline"
          className="h-9 px-3 border-slate-200 text-slate-400 hover:text-[#07303F] hover:bg-slate-50 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif italic font-bold text-[#07303F]">Edit Informasi Layanan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {!item.isBundle && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Kategori Modul</Label>
              <select 
                name="service" 
                defaultValue={item.service || ""}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                required
              >
                <option value="">Pilih Modul Induk...</option>
                {Object.keys(ServiceModule).map((k) => (
                  <option key={k} value={k}>{k.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nama Paket Layanan</Label>
            <Input name="name" defaultValue={item.name} placeholder="Misal: The Legacy (Custom)" required />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Deskripsi Pendek</Label>
            <Input name="description" defaultValue={item.description || ""} placeholder="Penjelasan singkat fitur..." />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id={`isConsultation-${item.id}`} name="isConsultation" defaultChecked={item.isConsultation} className="w-4 h-4 rounded border-slate-300 text-[#07303F] focus:ring-[#07303F]" />
            <Label htmlFor={`isConsultation-${item.id}`} className="text-xs font-bold text-slate-600 cursor-pointer">Harga via Konsultasi (Tidak Fix)</Label>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isPending} className="bg-[#07303F] text-white hover:bg-[#07303F]/90">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
