"use client";

import { useState, useTransition } from "react";
import { updateSystemPrice, deletePricingItem } from "../actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Trash2 } from "lucide-react";
import { EditPricingModal } from "./EditPricingModal";

interface PriceInputFormProps {
  pricingId: string;
  currentPublic: number;
  isConsultation?: boolean;
  item?: any; // To pass to EditPricingModal
}

export function PriceInputForm({ pricingId, currentPublic, isConsultation = false, item }: PriceInputFormProps) {
  const [publicPrice, setPublicPrice] = useState((currentPublic ?? 0).toString());
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const isChanged = publicPrice !== (currentPublic ?? 0).toString();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("basePrice", "0"); // Hardcode to 0 to satisfy actions.ts temporarily
    formData.append("publicPrice", publicPrice);

    startTransition(async () => {
      const res = await updateSystemPrice(pricingId, formData);
      if (res.error) {
        toast.error(res.error);
        setPublicPrice(currentPublic.toString());
      } else {
        toast.success("Harga berhasil diperbarui!");
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      startDeleteTransition(async () => {
        const res = await deletePricingItem(pricingId);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Item berhasil dihapus!");
        }
      });
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-wrap items-end gap-3 sm:gap-4 w-full">
      {isConsultation ? (
        <div className="flex-1 flex items-center justify-start h-9">
          <div className="bg-slate-100 text-slate-500 font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-md border border-slate-200">
            Harga Via Konsultasi
          </div>
        </div>
      ) : (
        <>
          {/* HARGA PUBLIK (B2C) */}
          <div className="flex flex-col gap-1 flex-1 min-w-[120px] sm:flex-none">
            <label className="text-[9px] font-bold uppercase tracking-widest text-[#07303F]">Harga Jual Publik (Retail)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">Rp</span>
              <Input 
                type="number" 
                value={publicPrice}
                onChange={(e) => setPublicPrice(e.target.value)}
                className="w-full sm:w-48 h-10 text-sm font-bold text-[#07303F] pl-8 border-slate-200 focus:border-[#07303F] bg-white transition-colors"
                min="0"
              />
            </div>
          </div>
        </>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex items-end gap-2 h-full pb-0.5 mt-auto">
        {!isConsultation && isChanged && (
          <Button 
            type="submit" 
            disabled={isPending || isDeleting}
            className="h-9 px-4 bg-[#07303F] hover:bg-black text-white transition-all shadow-md"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </Button>
        )}
        
        {item && <EditPricingModal item={item} />}

        <Button 
          type="button" 
          onClick={handleDelete}
          disabled={isPending || isDeleting}
          variant="outline"
          className="h-9 px-3 border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>
    </form>
  );
}
