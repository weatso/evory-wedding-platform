"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setPricingOverride } from "../actions";
import { Edit2, Loader2, Save, EyeOff, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

interface MarkupFormProps {
  workspaceSlug: string;
  systemPricing: any;
  override: any;
  discountRate: number;
}

export default function MarkupForm({ workspaceSlug, systemPricing, override, discountRate }: MarkupFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const basePrice = systemPricing.publicPrice - (systemPricing.publicPrice * (discountRate / 100));
  
  const [markupPriceStr, setMarkupPriceStr] = useState((override?.markupPrice ?? systemPricing.publicPrice).toString());
  const [isPublished, setIsPublished] = useState(override ? override.isPublished : true);
  
  const currentMarkup = parseFloat(markupPriceStr.replace(/[^0-9]/g, "")) || 0;
  const currentProfit = currentMarkup - basePrice;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const customName = formData.get("customName") as string;
    
    // Parse price safely
    const priceStr = formData.get("markupPrice") as string;
    let markupPrice: number | null = parseFloat(priceStr.replace(/[^0-9]/g, ""));
    
    if (isNaN(markupPrice)) markupPrice = null;

    try {
      await setPricingOverride(workspaceSlug, { 
        systemPricingId: systemPricing.id,
        customName: customName || null,
        markupPrice: markupPrice,
        isPublished
      });
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-slate-200 text-[#07303F] hover:bg-slate-100 font-bold h-8">
            <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Harga & Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#07303F]">
            Konfigurasi Penjualan
          </DialogTitle>
          <p className="text-xs text-slate-500 mt-1">
            Produk Induk: <strong>{systemPricing.name}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="space-y-4">
              {/* PUBLISH TOGGLE */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                      <p className="text-sm font-bold text-[#07303F]">Tayangkan Layanan</p>
                      <p className="text-xs text-slate-500 mt-0.5">Tampilkan di Halaman Brosur Publik</p>
                  </div>
                  <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              </div>

              {/* CUSTOM NAME */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Alias (Opsional)</label>
                <Input name="customName" defaultValue={override?.customName || ""} placeholder={`Ganti nama ${systemPricing.name}...`} className="h-10 border-slate-200" />
                <p className="text-[10px] text-slate-400">Kosongkan jika ingin menggunakan nama asli dari Evory.</p>
              </div>

              {/* MARKUP PRICE */}
              <div className="space-y-2 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Harga Jual Klien (Rp)</label>
                <Input 
                    name="markupPrice" 
                    value={markupPriceStr}
                    onChange={(e) => setMarkupPriceStr(e.target.value)}
                    className="h-12 border-emerald-200 focus-visible:ring-emerald-500 font-bold text-lg font-mono bg-white" 
                />
                
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-emerald-200/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estimasi Margin Profit:</span>
                    <span className={`font-mono text-sm font-bold ${currentProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {currentProfit >= 0 ? '+' : ''}{formatIDR(currentProfit)}
                    </span>
                </div>
              </div>
              
              <div className="bg-[#07303F] text-white p-3 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#E5C185] uppercase tracking-widest">HPP (Modal Evory):</span>
                  <span className="font-mono text-sm font-bold">{formatIDR(basePrice)}</span>
              </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-slate-200">Batal</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] font-bold">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Konfigurasi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
