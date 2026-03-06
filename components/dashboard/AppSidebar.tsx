"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Users, Image as ImageIcon, LogOut, ShieldCheck, QrCode, Building2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react"; 

export default function AppSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const viewAsId = searchParams.get("viewAs");
  const query = viewAsId ? `?viewAs=${viewAsId}` : "";

  // Definisi Menu Per Entitas
  const clientMenus = [
    { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Buku Tamu", href: "/dashboard/guests", icon: Users },
    { name: "Media & Aset", href: "/dashboard/media", icon: ImageIcon },
  ];

  const usherMenus = [
    { name: "Scan QR Tamu", href: "/usher/scan", icon: QrCode },
    { name: "Daftar Hadir", href: "/usher", icon: Users },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col fixed left-0 top-0 z-50 shadow-sm">
      <div className="p-6 border-b">
        <h1 className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-2">
          Evory <span className="text-blue-600">Platform</span>
        </h1>
        {viewAsId && (
            <div className="mt-3 text-xs bg-amber-100 text-amber-800 px-2 py-1.5 rounded-md border border-amber-300 flex items-center gap-1 font-semibold animate-pulse">
                <ShieldCheck className="w-3.5 h-3.5"/> Mode Pantau Aktif
            </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        
        {/* 1. BLOK ADMIN (Hanya Super Admin) */}
        {userRole === "ADMIN" && (
            <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase px-3 mb-2 tracking-wider">Super Admin Pusat</p>
                <div className="space-y-1">
                  <Link href="/admin">
                      <Button variant={pathname === "/admin" ? "secondary" : "ghost"} className="w-full justify-start text-slate-700">
                          <Building2 className="mr-2 h-4 w-4" /> Kelola WO / Partner
                      </Button>
                  </Link>
                  <Link href="/admin/clients">
                      <Button variant={pathname.includes("/admin/clients") ? "secondary" : "ghost"} className="w-full justify-start text-slate-700">
                          <Users className="mr-2 h-4 w-4" /> Semua Client Global
                      </Button>
                  </Link>
                  <Link href="/admin/templates">
                      <Button variant={pathname.includes("/admin/templates") ? "secondary" : "ghost"} className="w-full justify-start text-slate-700">
                          <ImageIcon className="mr-2 h-4 w-4" /> Manajemen Template
                      </Button>
                  </Link>
                  {/* TAMBAHKAN KODE INI */}
                  <Link href="/admin/assets">
                      <Button variant={pathname.includes("/admin/assets") ? "secondary" : "ghost"} className="w-full justify-start text-slate-700">
                          <ImageIcon className="mr-2 h-4 w-4" /> Brankas Aset
                      </Button>
                  </Link>
                </div>
            </div>
        )}

        {/* KASTA 2: PARTNER / WO (Hanya melihat asetnya sendiri) */}
        {userRole === "PARTNER" && (
            <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase px-3 mb-2 tracking-wider">Ruang Kerja Partner</p>
                <div className="space-y-1">
                  <Link href="/admin">
                      <Button variant={pathname === "/admin" ? "secondary" : "ghost"} className="w-full justify-start text-slate-700">
                          <Briefcase className="mr-2 h-4 w-4" /> Client Saya
                      </Button>
                  </Link>
                  <Link href="/admin/ushers">
                      <Button variant={pathname.includes("/admin/ushers") ? "secondary" : "ghost"} className="w-full justify-start text-slate-700">
                          <Users className="mr-2 h-4 w-4" /> Tim Usher Saya
                      </Button>
                  </Link>
                </div>
            </div>
        )}

        {/* KASTA 3: CLIENT (Asli, atau Admin/Partner yang sedang Mode Pantau) */}
        {(userRole === "CLIENT" || ((userRole === "ADMIN" || userRole === "PARTNER") && viewAsId)) && (
            <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase px-3 mb-2 tracking-wider">
                  {viewAsId ? "Menu Undangan (Pantau)" : "Menu Undangan"}
                </p>
                <div className="space-y-1">
                  {clientMenus.map((menu) => {
                      const isActive = pathname === menu.href;
                      return (
                        <Link key={menu.href} href={`${menu.href}${query}`}>
                          <Button 
                              variant={isActive ? "secondary" : "ghost"} 
                              className={cn(
                                  "w-full justify-start transition-all", 
                                  isActive ? "bg-slate-100 text-slate-900 font-bold shadow-sm" : "text-slate-600 hover:bg-slate-50"
                              )}
                          >
                            <menu.icon className={cn("mr-2 h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} /> 
                            {menu.name}
                          </Button>
                        </Link>
                      )
                  })}
                </div>
            </div>
        )}

        {/* KASTA 4: USHER (Hanya operasi lapangan) */}
        {(userRole === "USHER" || ((userRole === "ADMIN" || userRole === "PARTNER") && viewAsId)) && (
            <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase px-3 mb-2 tracking-wider">Operasional Lapangan</p>
                <div className="space-y-1">
                  {usherMenus.map((menu) => {
                      const isActive = pathname === menu.href;
                      return (
                        <Link key={menu.href} href={`${menu.href}${query}`}>
                          <Button 
                              variant={isActive ? "secondary" : "ghost"} 
                              className={cn(
                                  "w-full justify-start transition-all", 
                                  isActive ? "bg-slate-100 text-slate-900 font-bold shadow-sm" : "text-slate-600 hover:bg-slate-50"
                              )}
                          >
                            <menu.icon className={cn("mr-2 h-4 w-4", isActive ? "text-emerald-600" : "text-slate-400")} /> 
                            {menu.name}
                          </Button>
                        </Link>
                      )
                  })}
                </div>
            </div>
        )}

      </nav>

      <div className="p-4 border-t bg-slate-50">
        <div className="flex flex-col gap-3 mb-4 px-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                Akses: {userRole}
            </span>
        </div>
        <Button 
            variant="outline" 
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shadow-sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
        >
            <LogOut className="mr-2 h-4 w-4" /> Keluar Sistem
        </Button>
      </div>
    </div>
  );
}