'use client';

import { useState } from "react";
import { deleteGuest, updateGuest } from "./actions"; // Import actions yang baru kita buat
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Tipe data yang diterima dari Prisma
type GuestData = {
    id: string;
    name: string;
    category: string | null;
    maxPax: number;
    whatsapp: string | null;
};

export default function GuestRowActions({ guest }: { guest: GuestData }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // --- LOGIKA HAPUS ---
    async function handleDelete() {
        if (!confirm(`Yakin ingin menghapus tamu "${guest.name}" selamanya?`)) return;
        
        setIsLoading(true);
        const res = await deleteGuest(guest.id);
        setIsLoading(false);

        if (res?.error) alert(res.error);
    }

    // --- LOGIKA EDIT (UPDATE) ---
    async function handleUpdate(formData: FormData) {
        setIsLoading(true);
        const res = await updateGuest(guest.id, formData);
        setIsLoading(false);
        
        if (res?.error) {
            alert(res.error);
        } else {
            setIsEditOpen(false); // Tutup modal jika sukses
        }
    }

    return (
        <div className="flex justify-end gap-2">
            {/* 1. TOMBOL EDIT */}
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setIsEditOpen(true)}
                title="Edit Tamu"
            >
                <Pencil className="w-4 h-4" />
            </Button>

            {/* 2. TOMBOL HAPUS */}
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleDelete}
                disabled={isLoading}
                title="Hapus Tamu"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
            </Button>

            {/* 3. MODAL EDIT (POPUP) */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Data Tamu</DialogTitle>
                    </DialogHeader>
                    
                    <form action={handleUpdate} className="grid gap-4 py-4">
                        {/* Nama */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Tamu</Label>
                            <Input id="name" name="name" defaultValue={guest.name} required />
                        </div>

                        {/* Kategori & Pax */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Kategori</Label>
                                <select 
                                    name="category" 
                                    id="category" 
                                    defaultValue={guest.category || "Regular"}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="Regular">Regular</option>
                                    <option value="VIP">VIP</option>
                                    <option value="Keluarga">Keluarga</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="maxPax">Jatah Kursi (Pax)</Label>
                                <Input id="maxPax" name="maxPax" type="number" min="1" defaultValue={guest.maxPax} required />
                            </div>
                        </div>

                        {/* WhatsApp */}
                        <div className="grid gap-2">
                            <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                            <Input id="whatsapp" name="whatsapp" type="tel" placeholder="Contoh: 62812345678" defaultValue={guest.whatsapp || ""} />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="bg-slate-900 text-white hover:bg-slate-800">
                                {isLoading ? "Menyimpan..." : <><Save className="w-4 h-4 mr-2"/> Simpan Perubahan</>}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}