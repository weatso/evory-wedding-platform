"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, RefreshCw, Key, Link as LinkIcon, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { updateProjectCrm } from "@/app/(dashboard)/workspace/[workspaceSlug]/actions";

export default function CrmPortalConfigForm({ project, workspaceSlug }: { project: any, workspaceSlug: string }) {
  const [isPending, startTransition] = useTransition();
  const [pin, setPin] = useState(project.clientPin || "");

  const generatePin = () => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(newPin);
  };

  const copyPortalLink = () => {
    const url = `${window.location.origin}/portal/${project.slug}/login`;
    navigator.clipboard.writeText(url);
    toast.success("Link Portal berhasil disalin!");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("clientPin", pin); // ensure pin is sent even if input is disabled

    startTransition(async () => {
      const result = await updateProjectCrm(project.id, formData);
      if (result.error) toast.error(result.error);
      else toast.success("Konfigurasi CRM dan Portal berhasil disimpan!");
    });
  };

  return (
    <Card className="border-slate-200 mt-6 bg-[#F9F8F4]">
      <CardHeader className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#07303F] text-[#E5C185] rounded-xl flex items-center justify-center">
                <UserCircle className="w-5 h-5" />
            </div>
            <div>
                <CardTitle className="text-lg text-[#07303F] font-bold">Data Klien & Akses Portal</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                    Buku kontak pengantin dan gerbang akses ke dasbor RSVP mandiri.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* CRM Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Nama Pemesan</Label>
                <Input name="clientName" defaultValue={project.clientName || ""} placeholder="Contoh: Budi Susanto" className="bg-white text-sm" />
            </div>
            <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Nomor WhatsApp</Label>
                <Input name="clientPhone" defaultValue={project.clientPhone || ""} placeholder="08123456789" className="bg-white text-sm" />
            </div>
            <div className="space-y-1 md:col-span-2">
                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Alamat Email</Label>
                <Input name="clientEmail" type="email" defaultValue={project.clientEmail || ""} placeholder="budi@email.com" className="bg-white text-sm" />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
             <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 block">Akses Dasbor Klien</Label>
             
             <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                
                {/* Link Portal */}
                <div className="flex flex-col space-y-1">
                    <span className="text-xs text-slate-500">Tautan Rahasia Klien:</span>
                    <div className="flex gap-2">
                        <Input readOnly value={`evory.id/portal/${project.slug}/login`} className="bg-slate-50 text-xs font-mono text-slate-600 h-9" />
                        <Button type="button" onClick={copyPortalLink} variant="outline" size="sm" className="h-9 shrink-0 px-3">
                            <LinkIcon className="w-4 h-4 mr-2" /> Salin Link
                        </Button>
                    </div>
                </div>

                {/* PIN Code */}
                <div className="flex flex-col space-y-1">
                    <span className="text-xs text-slate-500">PIN 6-Digit:</span>
                    <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input readOnly value={pin} placeholder="Belum diatur" className="pl-9 h-11 text-lg font-mono font-bold tracking-[0.25em] text-[#07303F] bg-slate-50" />
                        </div>
                        <Button type="button" onClick={generatePin} variant="outline" className="h-11 shrink-0 px-4">
                            <RefreshCw className="w-4 h-4 mr-2" /> Generate PIN
                        </Button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Klien wajib memasukkan PIN ini untuk membuka Dasbor Undangan mereka.</p>
                </div>

             </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] font-bold h-11 mt-4">
            {isPending ? "Menyimpan Konfigurasi..." : <><Save className="w-4 h-4 mr-2"/> Simpan Konfigurasi</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
