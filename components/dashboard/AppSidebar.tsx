"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Users, Image as ImageIcon, LogOut, ShieldCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react"; 

export default function AppSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // LOGIC PINTAR: Tangkap viewAsId agar Admin tidak 'tertendang' saat navigasi
  const viewAsId = searchParams.get("viewAs");
  const query = viewAsId ? `?viewAs=${viewAsId}` : "";

  const menus = [
    { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Buku Tamu", href: "/dashboard/guests", icon: Users },
    { name: "Media & Aset", href: "/dashboard/media", icon: ImageIcon },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b">
        <h1 className="font-bold text-xl tracking-tight text-slate-900">Evory Platform</h1>
        {viewAsId && (
            <div className="mt-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3"/> Mode Pantau
            </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* MENU KHUSUS ADMIN (Hanya muncul jika login sebagai Admin) */}
        {userRole === "ADMIN" && (
            <div className="mb-6">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase px-3 mb-2 tracking-wider">Super Admin</p>
                <Link href="/admin">
                    <Button variant={pathname === "/admin" ? "secondary" : "ghost"} className="w-full justify-start text-slate-700">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Kelola Client
                    </Button>
                </Link>
                <Link href="/admin/templates">
                    <Button variant={pathname.includes("/admin/templates") ? "secondary" : "ghost"} className="w-full justify-start text-slate-700">
                        <ImageIcon className="mr-2 h-4 w-4" /> Template System
                    </Button>
                </Link>
            </div>
        )}

        {/* MENU CLIENT */}
        <p className="text-[10px] font-extrabold text-slate-400 uppercase px-3 mb-2 tracking-wider">Menu Undangan</p>
        {menus.map((menu) => {
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
      </nav>

      <div className="p-4 border-t bg-slate-50">
        <Button 
            variant="outline" 
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={() => signOut({ callbackUrl: "/login" })}
        >
            <LogOut className="mr-2 h-4 w-4" /> Keluar
        </Button>
      </div>
    </div>
  );
}