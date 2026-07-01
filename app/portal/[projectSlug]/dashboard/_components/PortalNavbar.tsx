"use client";

import Link from "next/link";
import { LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutFromPortal } from "../../actions";

export default function PortalNavbar({ project, projectSlug }: { project: any, projectSlug: string }) {
    const meta = project.eventMetadata || {};
    
    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#07303F] rounded-lg flex items-center justify-center text-[#E5C185]">
                        <Heart className="w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="font-serif italic font-bold text-[#07303F] leading-tight">
                            {meta.groomNick || "The"} & {meta.brideNick || "Wedding"}
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Client Dashboard</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block text-right">
                        <p className="text-xs text-slate-500">Selamat datang,</p>
                        <p className="text-sm font-bold text-[#07303F]">{project.clientName || "Klien Yth"}</p>
                    </div>
                    <form action={() => logoutFromPortal(projectSlug)}>
                        <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <LogOut className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Keluar</span>
                        </Button>
                    </form>
                </div>

            </div>
        </header>
    );
}
