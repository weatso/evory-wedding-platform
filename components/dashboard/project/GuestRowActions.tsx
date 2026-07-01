"use client";

import { Button } from "@/components/ui/button";
import { Copy, MoreHorizontal, Pencil, Trash2, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { deleteGuest, updateGuest } from "@/app/(dashboard)/workspace/[workspaceSlug]/actions";
import { processCheckIn } from "@/app/(dashboard)/workspace/[workspaceSlug]/project/[projectSlug]/scanner/actions";

export interface GuestData {
    id: string;
    name: string;
    guestCode: string;
    category: string | null;
    rsvpStatus: string;
    totalPaxAllocated: number;
    whatsapp: string | null;
}

// PERBAIKAN: Komentar dipindahkan, deklarasi bersih.
export default function GuestRowActions({ guest, projectSlug }: { guest: any; projectSlug: string; }) {
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openCheckIn, setOpenCheckIn] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [paxInput, setPaxInput] = useState<string>(guest.totalPaxAllocated.toString());

    const [editData, setEditData] = useState({
        name: guest.name,
        whatsapp: guest.whatsapp || "",
        category: guest.category || "",
        totalPaxAllocated: guest.totalPaxAllocated.toString()
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
            const paxValue = parseInt(editData.totalPaxAllocated);
            if (isNaN(paxValue) || paxValue < 1) {
                toast.warning("Jumlah kursi minimal 1");
                setLoading(false);
                return;
            }

            await updateGuest(guest.id, {
                name: editData.name,
                whatsapp: editData.whatsapp || null,
                category: editData.category || null,
                totalPaxAllocated: paxValue
            });

            toast.success("Data tamu diperbarui");
            setOpenEdit(false);
        } catch (error) {
            toast.error("Gagal update data");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC BARU: GENERATE LINK MENGGUNAKAN PROJECT SLUG ---
    const getInvitationLink = () => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/invitation/${projectSlug}?to=${guest.guestCode}`;
    };

    const copyInvitationLink = () => {
        navigator.clipboard.writeText(getInvitationLink());
        toast.success("Link undangan disalin!");
    };

    // --- LOGIC BARU: KIRIM WHATSAPP ---
    const sendWhatsapp = () => {
        if (!guest.whatsapp) {
            toast.error("Nomor WhatsApp belum diisi!");
            return;
        }

        let phone = guest.whatsapp.trim();
        if (phone.startsWith("0")) {
            phone = "62" + phone.slice(1);
        }

        const link = getInvitationLink();
        const message = `Halo ${guest.name},\n\nKami mengundang Anda untuk hadir di pernikahan kami. Silakan buka undangan digital berikut untuk info lengkapnya:\n\n${link}\n\nTerima kasih.`;
        
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    // --- LOGIC BARU: CHECK-IN MANUAL ---
    const handleManualCheckIn = async () => {
        setLoading(true);
        try {
            const paxValue = parseInt(paxInput);
            if (isNaN(paxValue) || paxValue < 1) {
                toast.warning("Jumlah pax minimal 1");
                setLoading(false);
                return;
            }

            const res = await processCheckIn(guest.guestCode, projectSlug, paxValue);
            if (res.success) {
                toast.success(`${guest.name} berhasil Check-In!`);
                setOpenCheckIn(false);
            } else if (res.alreadyCheckedIn) {
                toast.error(`${guest.name} sudah Check-In sebelumnya.`);
                setOpenCheckIn(false);
            } else {
                toast.error(res.error || "Gagal Check-In");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan.");
        } finally {
            setLoading(false);
        }
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
                    
                    <DropdownMenuItem onClick={copyInvitationLink} className="cursor-pointer font-medium">
                        <Copy className="mr-2 h-4 w-4 text-blue-600" /> Salin Link
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={sendWhatsapp} className="cursor-pointer font-medium">
                        <Send className="mr-2 h-4 w-4 text-green-600" /> Kirim WhatsApp
                    </DropdownMenuItem>

                    {!guest.isCheckedIn && (
                        <DropdownMenuItem onClick={() => setOpenCheckIn(true)} className="cursor-pointer font-medium text-emerald-600 focus:text-emerald-700">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Check-In Manual
                        </DropdownMenuItem>
                    )}

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
                        <DialogDescription>Perbarui informasi tamu di sini.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-xs font-bold text-slate-500">Nama</Label>
                            <Input id="name" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="whatsapp" className="text-right text-xs font-bold text-slate-500">WhatsApp</Label>
                            <Input id="whatsapp" value={editData.whatsapp} onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })} className="col-span-3" placeholder="08..." />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right text-xs font-bold text-slate-500">Kategori</Label>
                            <Input id="category" value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="pax" className="text-right text-xs font-bold text-slate-500">Kursi</Label>
                            <Input id="pax" type="number" min={1} value={editData.totalPaxAllocated} onChange={(e) => setEditData({ ...editData, totalPaxAllocated: e.target.value })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenEdit(false)}>Batal</Button>
                        <Button onClick={handleUpdate} disabled={loading} className="bg-slate-900 text-white">{loading ? "Menyimpan..." : "Simpan"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MODAL DELETE --- */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Tamu?</DialogTitle>
                        <DialogDescription>Yakin ingin menghapus <b>{guest.name}</b>?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDelete(false)}>Batal</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? "..." : "Hapus"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MODAL CHECK-IN MANUAL --- */}
            <Dialog open={openCheckIn} onOpenChange={setOpenCheckIn}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Check-In Manual</DialogTitle>
                        <DialogDescription>
                            Anda akan melakukan check-in untuk <b>{guest.name}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="paxActual" className="text-sm font-bold text-slate-700 mb-2 block">
                            Jumlah Tamu Aktual (Pax) yang Hadir
                        </Label>
                        <Input 
                            id="paxActual" 
                            type="number" 
                            min={1} 
                            value={paxInput} 
                            onChange={(e) => setPaxInput(e.target.value)} 
                            className="h-12 text-lg font-bold"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Alokasi undangan untuk tamu ini adalah: {guest.totalPaxAllocated} Pax.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenCheckIn(false)}>Batal</Button>
                        <Button onClick={handleManualCheckIn} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {loading ? "Memproses..." : "Konfirmasi Check-In"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}