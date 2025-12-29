'use client';

import { useState } from "react";
import { addStaff } from "../actions"; // Import server action yang baru kita buat
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

export function AddStaffModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await addStaff(formData);
    setLoading(false);

    if (res?.error) {
        alert(res.error); // Simple alert, bisa diganti toast
    } else {
        setOpen(false); // Tutup modal jika sukses
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2"/> + User Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Staff Internal</DialogTitle>
          <DialogDescription>
            Buat akun untuk Admin tambahan atau Usher (Penerima Tamu).
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" required placeholder="Ex: Staff Usher 1" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Login</Label>
            <Input id="email" name="email" type="email" required placeholder="usher@event.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <select name="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="USHER">USHER (Penerima Tamu)</option>
                <option value="ADMIN">ADMIN (Full Akses)</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}