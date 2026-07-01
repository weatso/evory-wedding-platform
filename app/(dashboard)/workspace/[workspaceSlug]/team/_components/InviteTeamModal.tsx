"use client";

import { useState } from "react";
import { inviteTeamMember } from "../actions";
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
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InviteTeamModal({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append("workspaceId", workspaceId);
    
    const res = await inviteTeamMember(formData);
    
    setLoading(false);

    if (res?.error) {
        toast.error(res.error);
    } else {
        toast.success("Anggota tim berhasil ditambahkan!");
        setOpen(false); 
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] font-bold uppercase tracking-widest text-[10px] h-10 px-6 rounded-sm transition-all shadow-sm">
            <UserPlus className="w-4 h-4 mr-2"/> Tambah Anggota Tim
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] bg-[#F9F8F4] border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif italic text-[#07303F]">Undang Tim</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Anggota tim akan mendapatkan akses ke ruang kerja ini sesuai dengan peran yang dipilih.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Lengkap</Label>
            <Input id="name" name="name" required placeholder="Contoh: Budi Santoso" className="bg-white border-slate-200 focus-visible:ring-[#E5C185] h-10 rounded-sm" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Alamat Email (Login)</Label>
            <Input id="email" name="email" type="email" required placeholder="budi@domain.com" className="bg-white border-slate-200 focus-visible:ring-[#E5C185] h-10 rounded-sm" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Peran (Role)</Label>
            <select name="role" className="flex h-10 w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C185] text-[#07303F] font-medium">
                <option value="STAFF">STAFF (Bisa mengelola tamu & sistem)</option>
                <option value="USHER">USHER (Hanya bisa scan QR & Check-in)</option>
            </select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Kata Sandi (Password)</Label>
            <Input id="password" name="password" type="password" required placeholder="Minimal 6 karakter" className="bg-white border-slate-200 focus-visible:ring-[#E5C185] h-10 rounded-sm" />
          </div>

          <div className="pt-4 border-t border-slate-200 mt-2">
            <Button type="submit" disabled={loading} className="w-full bg-[#07303F] text-white hover:bg-[#0a455a] font-bold uppercase tracking-widest text-xs h-10 rounded-sm transition-all shadow-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambahkan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
