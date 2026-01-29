"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    deleteGuest, 
    updateGuest 
} from "./actions"; 
import { toast } from "sonner";

// [FIX] Interface disesuaikan dengan Database Baru
export interface GuestData {
  id: string;
  name: string;
  guestCode: string;
  category: string | null;
  rsvpStatus: string; 
  totalPaxAllocated: number; // SUDAH DIGANTI dari maxPax
  whatsapp: string | null;   // SUDAH DITAMBAHKAN
}

export default function GuestRowActions({ guest }: { guest: GuestData }) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  // State Form Edit
  const [formData, setFormData] = useState({
    name: guest.name,
    whatsapp: guest.whatsapp || "",
    category: guest.category || "",
    totalPaxAllocated: guest.totalPaxAllocated // Mapping ke variable baru
  });

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteGuest(guest.id);
      toast.success("Tamu berhasil dihapus");
      setOpenDelete(false);
    } catch (error) {
      toast.error("Gagal menghapus tamu");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateGuest(guest.id, {
          name: formData.name,
          whatsapp: formData.whatsapp || null,
          category: formData.category || null,
          totalPaxAllocated: Number(formData.totalPaxAllocated) // Pastikan dikirim sebagai number
      });
      toast.success("Data tamu diperbarui");
      setOpenEdit(false);
    } catch (error) {
      toast.error("Gagal update data");
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationLink = () => {
    // Sesuaikan domain dengan environment (localhost atau production)
    const baseUrl = window.location.origin; 
    const link = `${baseUrl}/invitation/${guest.guestCode}`; 
    navigator.clipboard.writeText(link);
    toast.success("Link undangan disalin!");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Aksi Tamu</DropdownMenuLabel>
          <DropdownMenuItem onClick={copyInvitationLink} className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4 text-blue-500" /> Salin Link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenEdit(true)} className="cursor-pointer">
            <Pencil className="mr-2 h-4 w-4 text-amber-500" /> Edit Data
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- MODAL EDIT --- */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Data Tamu</DialogTitle>
            <DialogDescription>
              Perbarui informasi tamu di sini. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-xs uppercase font-bold text-slate-500">
                Nama
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="whatsapp" className="text-right text-xs uppercase font-bold text-slate-500">
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="col-span-3"
                placeholder="0812..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right text-xs uppercase font-bold text-slate-500">
                Kategori
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pax" className="text-right text-xs uppercase font-bold text-slate-500">
                Kursi
              </Label>
              <Input
                id="pax"
                type="number"
                min={1}
                value={formData.totalPaxAllocated}
                onChange={(e) => setFormData({ ...formData, totalPaxAllocated: parseInt(e.target.value) || 1 })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>Batal</Button>
            <Button onClick={handleUpdate} disabled={loading} className="bg-slate-900 text-white">
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DELETE --- */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Tamu?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <b>{guest.name}</b>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}