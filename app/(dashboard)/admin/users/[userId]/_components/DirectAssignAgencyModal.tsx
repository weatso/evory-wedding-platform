"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createAgencyForUser } from "../actions";

export default function DirectAssignAgencyModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append("userId", userId);
    
    const res = await createAgencyForUser(formData);
    
    setLoading(false);

    if (res?.error) {
        toast.error(res.error);
    } else {
        toast.success(res?.message || "Agensi berhasil dibuat!");
        setOpen(false); 
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] font-bold text-xs h-8">
            <Plus className="w-3 h-3 mr-1"/> Buat Agensi
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] bg-[#F9F8F4] border-slate-200">
        <DialogHeader>
          <div className="w-10 h-10 bg-[#07303F] rounded-lg flex items-center justify-center text-[#E5C185] mb-3">
             <Building2 className="w-5 h-5" />
          </div>
          <DialogTitle className="text-xl font-serif italic text-[#07303F]">Angkat Menjadi Agensi (WO)</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Sistem akan menciptakan sebuah Ruang Kerja (Workspace) baru di mana pengguna ini menjadi Pemilik Mutlak (OWNER).
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="agencyName" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Bisnis / Agensi</Label>
            <Input id="agencyName" name="agencyName" required placeholder="Contoh: Radeva Wedding Organizer" className="bg-white border-slate-200 focus-visible:ring-[#E5C185] h-10 rounded-sm" />
          </div>

          <div className="pt-4 border-t border-slate-200 mt-2">
            <Button type="submit" disabled={loading} className="w-full bg-[#07303F] text-white hover:bg-[#0a455a] font-bold uppercase tracking-widest text-xs h-10 rounded-sm transition-all shadow-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ciptakan Agensi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
