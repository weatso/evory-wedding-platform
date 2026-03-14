"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Users, Image as ImageIcon, LogOut, ShieldCheck, QrCode, Building2, Briefcase, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react"; 
import Image from "next/image";

export default function AppSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // STATE NAVIGASI
  const [isOpen, setIsOpen] = useState(false); // Mobile Drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop Collapse
  
  const viewAsId = searchParams.get("viewAs");
  const query = viewAsId ? `?viewAs=${viewAsId}` : "";

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const clientMenus = [
    { name: "The Vault", href: "/dashboard", icon: LayoutDashboard },
    { name: "Guest Book", href: "/dashboard/guests", icon: Users },
    { name: "Media & Assets", href: "/dashboard/media", icon: ImageIcon },
  ];

  const usherMenus = [
    { name: "Scan QR", href: "/usher/scan", icon: QrCode },
    { name: "Guest List", href: "/usher", icon: Users },
  ];

  return (
    <>
      {/* MOBILE HEADER (Tampil HANYA di layar kecil) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#F9F8F4] border-b border-slate-200 z-40 flex items-center justify-between px-6 shadow-sm">
        <div className="relative w-24 h-6">
          <Image src="/logo/logo-blue.png" alt="Evory" fill className="object-contain object-left" />
        </div>
        <button onClick={() => setIsOpen(true)} className="text-[#07303F]">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* OVERLAY MOBILE */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-[#07303F]/80 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR UTAMA
        Mobile: fixed, bergeser dari kiri.
        Desktop: sticky, tidak menindih konten, lebarnya transisi dinamis w-64 atau w-20.
      */}
      <div className={cn(
        "bg-[#07303F] border-r border-[#E5C185]/10 h-screen flex flex-col z-50 shadow-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        // Logika Responsif & Collapsible
        "fixed md:sticky top-0 left-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "w-20" : "w-64 shrink-0"
      )}>
        
        {/* HEADER SIDEBAR (LOGO & TOGGLE) */}
        <div className={cn("p-6 flex items-center mb-2", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed ? (
            <div className="flex flex-col gap-2">
              <div className="relative w-28 h-8">
                <Image src="/logo/logo-gold.png" alt="Evory" fill className="object-contain object-left" priority />
              </div>
              {viewAsId && (
                  <div className="text-[9px] bg-[#E5C185]/10 text-[#E5C185] px-2 py-1 rounded-sm border border-[#E5C185]/30 flex items-center gap-1.5 font-bold uppercase tracking-widest animate-pulse max-w-fit mt-2">
                      <ShieldCheck className="w-3 h-3"/> Observer
                  </div>
              )}
            </div>
          ) : (
            // Logo mini saat diringkas
            <div className="relative w-8 h-8 flex shrink-0 items-center justify-center bg-[#E5C185] rounded-full text-[#07303F] font-serif font-bold text-lg">
              E
            </div>
          )}

          {/* Tombol Tutup Mobile */}
          <button className="md:hidden text-[#E5C185]/50 hover:text-[#E5C185]" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MENU UTAMA */}
        <nav className="flex-1 py-4 flex flex-col gap-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
          
          {/* MENU SUPER ADMIN */}
          {userRole === "ADMIN" && (
            <div className="px-4">
                {!isCollapsed && <p className="text-[9px] font-bold text-[#E5C185]/50 uppercase mb-3 tracking-[0.2em] ml-2">Super Admin</p>}
                <div className="space-y-1">
                  {[
                    { name: "Partner Network", href: "/admin", icon: Building2 },
                    { name: "Global Users", href: "/admin/users", icon: Users },
                    { name: "Template Registry", href: "/admin/templates", icon: ImageIcon },
                    { name: "Asset Vault", href: "/admin/assets", icon: ShieldCheck },
                  ].map((menu) => {
                    // Gunakan exact match untuk /admin agar tidak bentrok dengan sub-route
                    const isActive = menu.href === "/admin" ? pathname === menu.href : pathname.includes(menu.href);
                    return (
                      <Link key={menu.href} href={menu.href}>
                          <Button variant="ghost" className={cn("w-full transition-all text-xs font-bold tracking-wide h-10", isCollapsed ? "justify-center px-0" : "justify-start px-4", isActive ? "bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074]" : "text-slate-300 hover:bg-[#E5C185]/10 hover:text-[#E5C185]")}>
                              <menu.icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-3", isActive ? "text-[#07303F]" : "text-slate-400")} /> 
                              {!isCollapsed && <span className="truncate">{menu.name}</span>}
                          </Button>
                      </Link>
                    );
                  })}
                </div>
            </div>
          )}

          {/* MENU PARTNER (WEDDING ORGANIZER) */}
          {userRole === "PARTNER" && (
            <div className="px-4">
                {!isCollapsed && <p className="text-[9px] font-bold text-[#E5C185]/50 uppercase mb-3 tracking-[0.2em] ml-2">Partner Workspace</p>}
                <div className="space-y-1">
                  {[
                    { name: "My Clients", href: "/admin", icon: Briefcase },
                    { name: "My Ushers", href: "/admin/users", icon: Users },
                  ].map((menu) => {
                    const isActive = menu.href === "/admin" ? pathname === menu.href : pathname.includes(menu.href);
                    return (
                      <Link key={menu.href} href={menu.href}>
                          <Button variant="ghost" className={cn("w-full transition-all text-xs font-bold tracking-wide h-10", isCollapsed ? "justify-center px-0" : "justify-start px-4", isActive ? "bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074]" : "text-slate-300 hover:bg-[#E5C185]/10 hover:text-[#E5C185]")}>
                              <menu.icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-3", isActive ? "text-[#07303F]" : "text-slate-400")} /> 
                              {!isCollapsed && <span className="truncate">{menu.name}</span>}
                          </Button>
                      </Link>
                    );
                  })}
                </div>
            </div>
          )}

          {/* MENU CLIENT / OBSERVER */}
          {(userRole === "CLIENT" || viewAsId) && (
            <div className="px-4">
                {!isCollapsed && <p className="text-[9px] font-bold text-[#E5C185]/50 uppercase mb-3 tracking-[0.2em] ml-2">Event Management</p>}
                <div className="space-y-1">
                  {clientMenus.map((menu) => {
                      const isActive = pathname === menu.href;
                      return (
                        <Link key={menu.href} href={`${menu.href}${query}`}>
                          <Button variant="ghost" className={cn("w-full transition-all text-xs font-bold tracking-wide h-10", isCollapsed ? "justify-center px-0" : "justify-start px-4", isActive ? "bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074]" : "text-slate-300 hover:bg-[#E5C185]/10 hover:text-[#E5C185]")}>
                            <menu.icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-3", isActive ? "text-[#07303F]" : "text-slate-400")} /> 
                            {!isCollapsed && <span className="truncate">{menu.name}</span>}
                          </Button>
                        </Link>
                      )
                  })}
                </div>
            </div>
          )}
        </nav>
        
        {/* FOOTER SIDEBAR (Akses & Tombol Lipat) */}
        <div className="border-t border-[#E5C185]/10 p-4">
          <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={cn("w-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#F9F8F4]/50 hover:text-[#E5C185] transition-colors h-10", isCollapsed ? "justify-center" : "justify-start px-4")}
              title="Terminate Session"
          >
              <LogOut className="h-4 w-4 shrink-0" /> 
              {!isCollapsed && <span>Terminate Session</span>}
          </button>

          {/* Tombol Collapse Desktop (Sembunyikan di Mobile) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-full items-center justify-center mt-4 text-slate-500 hover:text-[#E5C185] transition-colors py-2"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </>
  );
}