"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Trash2, Save } from "lucide-react";
import { updateUserProfile, deleteUser } from "../actions";

export default function IdentityForm({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    async function handleSave(formData: FormData) {
        setLoading(true);
        formData.append("userId", user.id);
        const res = await updateUserProfile(formData);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Profil berhasil diperbarui!");
        }
    }

    async function handleDelete() {
        const confirmDelete = confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus akun ${user.name}? \n\nIni akan menghapus seluruh data yang terkait secara permanen!`);
        if (!confirmDelete) return;

        setDeleteLoading(true);
        const res = await deleteUser(user.id);
        setDeleteLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Akun berhasil dihapus.");
        }
    }

    return (
        <form action={handleSave} className="space-y-4">
            <div>
                <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Lengkap</Label>
                <Input id="name" name="name" defaultValue={user.name} className="mt-1" />
            </div>
            
            <div>
                <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Alamat Email</Label>
                <Input id="email" name="email" type="email" defaultValue={user.email} className="mt-1" />
            </div>

            <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="w-full bg-[#07303F] text-white hover:bg-[#0a455a]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Simpan</>}
                </Button>
                
                <Button type="button" onClick={handleDelete} disabled={deleteLoading} variant="outline" className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 px-3">
                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
            </div>
        </form>
    );
}
