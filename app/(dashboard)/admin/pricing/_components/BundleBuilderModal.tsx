"use client";

import { useState, useTransition } from "react";
import { createBundlePackage } from "../actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackageOpen, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BundleBuilderModalProps {
  availableItems: {
    id: string;
    name: string;
    service: string | null;
    publicPrice: number;
  }[];
}

export function BundleBuilderModal({ availableItems }: BundleBuilderModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const totalPublic = availableItems
    .filter(i => selectedIds.includes(i.id))
    .reduce((acc, curr) => acc + curr.publicPrice, 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedIds.length < 2) {
      toast.error("Pilih minimal 2 layanan untuk dijadikan paket bundle!");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("selectedItems", JSON.stringify(selectedIds));
    
    startTransition(async () => {
      const res = await createBundlePackage(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Bundle berhasil dibuat!");
        setOpen(false);
        setSelectedIds([]);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 h-9 bg-[#E5C185] hover:bg-[#d4b074] text-[#07303F]">
          <PackageOpen className="w-4 h-4" /> Buat Paket Bundle Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif italic font-bold text-[#07303F]">Bundle Builder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nama Bundle</Label>
              <Input name="name" placeholder="Misal: Paket Sultan All-in-One" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Deskripsi Singkat</Label>
              <Input name="description" placeholder="Undangan + WCC + Guestbook" />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex justify-between">
              <span>Pilih Komponen Layanan</span>
              <span className="text-amber-600">{selectedIds.length} Terpilih</span>
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
              {availableItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={`p-3 rounded-lg border cursor-pointer flex items-start gap-3 transition-all ${
                      isSelected ? "border-[#E5C185] bg-[#F9F8F4] shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-[#E5C185] border-[#E5C185]" : "border-slate-300"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-[#07303F]" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#07303F]">{item.name}</div>
                      <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-1">
                        Rp {item.publicPrice.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIMULATOR NILAI */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Nilai Asli</div>
              <div className="flex gap-4">
                <div><span className="text-xs text-slate-500">Publik Asli:</span> <span className="font-bold text-[#07303F]">Rp {totalPublic.toLocaleString('id-ID')}</span></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isConsultation" name="isConsultation" className="w-4 h-4 rounded border-slate-300 text-[#07303F] focus:ring-[#07303F]" />
              <Label htmlFor="isConsultation" className="text-xs font-bold text-slate-600 cursor-pointer">Harga via Konsultasi</Label>
            </div>
            <Button type="submit" disabled={isPending} className="bg-[#07303F] text-white hover:bg-[#07303F]/90 px-8">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan Bundle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
