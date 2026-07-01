"use client";

import { useState } from "react";
import { promoteToSuperadmin, demoteToUser, approveUser } from "../actions";
import { assignWorkspaceToUser } from "../users/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, CheckCircle2, Building2, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RoleManager({ userId, currentRole, userEmail, isAgency }: { userId: string, currentRole: string, userEmail?: string, isAgency?: boolean }) {
    const [loading, setLoading] = useState(false);

    const handleApprove = async () => {
        setLoading(true);
        const res = await approveUser(userId);
        setLoading(false);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Pengguna disetujui sebagai USER.");
        }
    };

    const handleCreateAgency = async () => {
        if (!userEmail) {
            toast.error("Email user tidak ditemukan.");
            return;
        }
        const agencyName = window.prompt(`Masukkan nama Agensi/WO untuk ${userEmail}:`, `Agensi Baru`);
        if (!agencyName) return; // Dibatalkan oleh user

        setLoading(true);
        const formData = new FormData();
        formData.append("email", userEmail);
        formData.append("agencyName", agencyName);

        const res = await assignWorkspaceToUser(formData);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else if (res.success) {
            toast.success(res.message);
        }
    };

    const handlePromote = async () => {
        if (!confirm("Jadikan pengguna ini SUPERADMIN? Mereka akan memiliki akses penuh ke sistem.")) return;
        setLoading(true);
        const res = await promoteToSuperadmin(userId);
        setLoading(false);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Berhasil diangkat menjadi SUPERADMIN");
        }
    };

    const handleDemote = async () => {
        if (!confirm("Turunkan jabatan pengguna ini menjadi USER biasa?")) return;
        setLoading(true);
        const res = await demoteToUser(userId);
        setLoading(false);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Berhasil diturunkan menjadi USER");
        }
    };

    return (
        <div className="flex gap-2 justify-end items-center">
            {currentRole === "WAITING" ? (
                <Button onClick={handleApprove} disabled={loading} size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white px-3">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Setujui
                </Button>
            ) : currentRole === "USER" ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button disabled={loading} size="sm" variant="outline" className="h-7 text-xs px-2 border-slate-200">
                            Aksi <MoreHorizontal className="w-3 h-3 ml-1 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 shadow-md">
                        <DropdownMenuItem onClick={handleCreateAgency} className="text-[#07303F] font-bold text-xs focus:bg-slate-50 cursor-pointer p-2">
                            <Building2 className="w-4 h-4 mr-2 text-[#E5C185]" /> Buat Agensi / WO
                        </DropdownMenuItem>
                        {!isAgency && (
                            <DropdownMenuItem onClick={handlePromote} className="text-amber-700 font-bold text-xs focus:bg-amber-50 cursor-pointer p-2 border-t border-slate-100">
                                <ShieldCheck className="w-4 h-4 mr-2" /> Angkat Superadmin
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button onClick={handleDemote} disabled={loading} size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-50 px-3">
                    <ShieldOff className="w-3 h-3 mr-1" /> Turunkan
                </Button>
            )}
        </div>
    );
}
