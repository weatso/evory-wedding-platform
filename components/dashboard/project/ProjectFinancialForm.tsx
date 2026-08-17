"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Banknote, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { updateProjectInvoiceAmount } from "@/app/(dashboard)/workspace/[workspaceSlug]/actions";

export default function ProjectFinancialForm({ project }: { project: any }) {
  const [isPending, startTransition] = useTransition();
  const [invoiceAmount, setInvoiceAmount] = useState(project.clientInvoiceAmount || 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProjectInvoiceAmount(project.id, invoiceAmount);
      if (result.error) toast.error(result.error);
      else toast.success("Harga Jual Klien berhasil disimpan!");
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setInvoiceAmount(val ? parseInt(val, 10) : 0);
  };

  return (
    <Card className="border-emerald-100 bg-emerald-50/30">
      <CardHeader>
        <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Banknote className="w-5 h-5" />
            </div>
            <div>
                <CardTitle className="text-lg text-[#07303F]">Data Laba/Rugi Proyek</CardTitle>
                <CardDescription className="text-xs">Catat nominal yang dibayar klien untuk akuntansi agensi Anda.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  Harga Jual Aktual (Ke Klien) 
                  <span title="Nominal yang dibayar oleh klien kepada agensi Anda.">
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                  </span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                <Input 
                    name="clientInvoiceAmount" 
                    value={invoiceAmount === 0 ? '' : invoiceAmount.toLocaleString('id-ID')}
                    onChange={handleInputChange}
                    placeholder="Misal: 15.000.000" 
                    className="pl-9 font-mono font-bold text-lg h-12 border-emerald-200 focus-visible:ring-emerald-500 bg-white" 
                />
              </div>
            </div>
            
            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modal Proyek (Ke Evory)</Label>
                <p className="font-mono text-sm text-slate-500 font-bold">
                    Rp {project.agencyCost.toLocaleString('id-ID')}
                </p>
            </div>
          </div>
          
          {invoiceAmount > project.agencyCost && (
              <div className="p-3 bg-white border border-emerald-200 rounded-lg flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">Estimasi Laba Bersih:</span>
                  <span className="font-mono font-bold text-emerald-600 text-lg">
                      + Rp {(invoiceAmount - project.agencyCost).toLocaleString('id-ID')}
                  </span>
              </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] mt-2">
            {isPending ? "Menyimpan..." : <><Save className="w-4 h-4 mr-2"/> Simpan Data Finansial</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
