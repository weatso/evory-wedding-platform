"use client";

import { useState, useTransition } from "react";
import { createPricingItem } from "../actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceModule } from "@prisma/client";

export function AddPricingModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await createPricingItem(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Item berhasil ditambahkan!");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 h-9 border-dashed border-slate-300 text-slate-600 hover:text-[#07303F] hover:bg-slate-50">
          <Plus className="w-4 h-4" /> Tambah Item Layanan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif italic font-bold text-[#07303F]">Layanan Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Kategori Modul</Label>
            <select 
              name="service" 
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
              required
            >
              <option value="">Pilih Modul Induk...</option>
              {Object.keys(ServiceModule).map((k) => (
                <option key={k} value={k}>{k.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nama Paket Layanan</Label>
            <Input name="name" placeholder="Misal: The Legacy (Custom)" required />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Deskripsi Pendek</Label>
            <Input name="description" placeholder="Penjelasan singkat fitur..." />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="isConsultation" name="isConsultation" className="w-4 h-4 rounded border-slate-300 text-[#07303F] focus:ring-[#07303F]" />
            <Label htmlFor="isConsultation" className="text-xs font-bold text-slate-600 cursor-pointer">Harga via Konsultasi (Tidak Fix)</Label>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isPending} className="bg-[#07303F] text-white hover:bg-[#07303F]/90">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Tambahkan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
