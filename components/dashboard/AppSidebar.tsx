"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { 
  LayoutDashboard, Users, Image as ImageIcon, LogOut, ShieldCheck, 
  Building2, Briefcase, Menu, X, ChevronLeft, ChevronRight, 
  MonitorPlay, FolderGit2, ArrowLeft, CreditCard, ScanLine, Settings, Tags
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react"; 
import Image from "next/image";
import { SystemRole } from "@prisma/client";

interface AppSidebarProps {
  systemRole: SystemRole;
  workspaceSlug: string; 
}

export default function AppSidebar({ systemRole, workspaceSlug }: AppSidebarProps) {
  const pathname = usePathname();
  const params = useParams(); // Mengambil parameter URL secara dinamis dari Next.js
  
  // Mengekstrak projectSlug dari URL jika user sedang berada di dalam sebuah proyek
  const projectSlug = params.projectSlug as string | undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // 1. MENU SUPER ADMIN (Pusat)
  const adminMenus = [
    { name: "Dashboard Overview", href: "/admin/overview", icon: LayoutDashboard },
    { name: "Revenue & Finance", href: "/admin/finance", icon: CreditCard },
    { name: "Tim Internal", href: "/admin/staff", icon: Users },
    { name: "Partner Network", href: "/admin", icon: Building2 },
    { name: "Global Users", href: "/admin/users", icon: Users },
    { name: "Template Registry", href: "/admin/templates", icon: ImageIcon },
    { name: "Pricing & Tiers", href: "/admin/pricing", icon: Tags },
    { name: "Digital Catalog", href: "/catalog", icon: MonitorPlay },
    { name: "Asset Vault", href: "/admin/assets", icon: ShieldCheck },
  ];

  // 2. MENU WORKSPACE (Level Agensi)
  const workspaceMenus = workspaceSlug !== "Evory Global" ? [
    { name: "Dashboard Overview", href: `/workspace/${workspaceSlug}`, icon: LayoutDashboard },
    { name: "Tim Internal", href: `/workspace/${workspaceSlug}/team`, icon: Users },
    { name: "Billing & Keuangan", href: `/workspace/${workspaceSlug}/billing`, icon: CreditCard },
    { name: "Katalog Layanan", href: `/workspace/${workspaceSlug}/services`, icon: Tags },
  ] : [];

  // 3. MENU KLIEN (Level Acara - Hanya muncul jika masuk ke dalam dashboard klien)
  const projectMenus = projectSlug ? [
    { name: "Command Center", href: `/workspace/${workspaceSlug}/project/${projectSlug}`, icon: FolderGit2 },
    { name: "Guest Book & RSVP", href: `/workspace/${workspaceSlug}/project/${projectSlug}/guests`, icon: Users },
    { name: "QR Scanner", href: `/workspace/${workspaceSlug}/project/${projectSlug}/scanner`, icon: ScanLine },
    { name: "Evory Vault", href: `/workspace/${workspaceSlug}/project/${projectSlug}/media`, icon: ImageIcon },
    { name: "Live Display", href: `/workspace/${workspaceSlug}/project/${projectSlug}/live`, icon: MonitorPlay },
    { name: "Billing & Paket", href: `/workspace/${workspaceSlug}/project/${projectSlug}/billing`, icon: CreditCard },
    { name: "Pengaturan Klien", href: `/workspace/${workspaceSlug}/project/${projectSlug}/settings`, icon: Settings },
  ] : [];

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#F9F8F4] border-b border-slate-200 z-40 flex items-center justify-between px-6 shadow-sm">
        <div className="relative w-24 h-6">
          <Image src="/logo/logo-blue.png" alt="Evory" fill className="object-contain object-left" />
        </div>
        <button onClick={() => setIsOpen(true)} className="text-[#07303F]">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-[#07303F]/80 z-40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
      )}

      <div className={cn(
        "bg-[#07303F] border-r border-[#E5C185]/10 h-screen flex flex-col z-50 shadow-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "fixed md:sticky top-0 left-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "w-20" : "w-64 shrink-0"
      )}>
        
        {/* HEADER */}
        <div className={cn("p-6 flex items-center mb-2", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed ? (
            <div className="flex flex-col gap-2">
              <div className="relative w-28 h-8">
                <Image src="/logo/logo-gold.png" alt="Evory" fill className="object-contain object-left" priority />
              </div>
              <div className="text-[10px] bg-white/5 text-white/50 px-2 py-1 rounded-sm border border-white/10 flex items-center gap-1.5 font-bold uppercase tracking-widest max-w-fit mt-2 truncate">
                  <Briefcase className="w-3 h-3"/> {workspaceSlug}
              </div>
            </div>
          ) : (
            <div className="relative w-8 h-8 flex shrink-0 items-center justify-center bg-[#E5C185] rounded-full text-[#07303F] font-serif font-bold text-lg">E</div>
          )}
          <button className="md:hidden text-[#E5C185]/50 hover:text-[#E5C185]" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* NAVIGASI SCROLLABLE */}
        <nav className="flex-1 py-4 flex flex-col gap-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
          
          {/* BLOK 1: GLOBAL ADMIN */}
          {systemRole === "SUPERADMIN" && (
            <div className="px-4">
                {!isCollapsed && <p className="text-[9px] font-bold text-[#E5C185]/50 uppercase mb-3 tracking-[0.2em] ml-2">Evory Global</p>}
                <div className="space-y-1">
                  {adminMenus.map((menu) => {
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

          {/* BLOK 2: MENU KLIEN AKTIF (Hanya muncul jika sedang di dalam rute Proyek/Klien) */}
          {projectSlug && (
            <div className="px-4 relative">
              {/* Indikator visual bahwa ini adalah sub-menu */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E5C185]/20 rounded-r-full" />
              
              {!isCollapsed && (
                <div className="flex flex-col mb-3 ml-2">
                  <p className="text-[9px] font-bold text-[#E5C185] uppercase tracking-[0.2em]">Klien Aktif</p>
                  <p className="text-xs text-white/70 font-bold truncate mt-1">{projectSlug.replace(/-/g, ' ')}</p>
                </div>
              )}
              <div className="space-y-1">
                {projectMenus.map((menu) => {
                    // Penanda aktif eksak untuk rute Command Center
                    const isActive = menu.href === `/workspace/${workspaceSlug}/project/${projectSlug}` 
                      ? pathname === menu.href 
                      : pathname.includes(menu.href);
                      
                    return (
                      <Link key={menu.href} href={menu.href}>
                        <Button variant="ghost" className={cn("w-full transition-all text-xs font-bold tracking-wide h-10", isCollapsed ? "justify-center px-0" : "justify-start px-4", isActive ? "bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074]" : "text-white/60 hover:bg-white/5 hover:text-white")}>
                          <menu.icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-3", isActive ? "text-[#07303F]" : "text-white/40")} /> 
                          {!isCollapsed && <span className="truncate">{menu.name}</span>}
                        </Button>
                      </Link>
                    )
                })}
              </div>
            </div>
          )}

          {/* BLOK 3: WORKSPACE ROOT */}
          {workspaceMenus.length > 0 && (
            <div className="px-4 border-t border-white/5 pt-4 mt-2">
                {!isCollapsed && <p className="text-[9px] font-bold text-white/30 uppercase mb-3 tracking-[0.2em] ml-2">Area Workspace</p>}
                
                {/* Jika sedang di dalam proyek, berikan tombol khusus untuk kembali ke Workspace */}
              {projectSlug && !isCollapsed && (
                <Link href={`/workspace/${workspaceSlug}`}>
                  <Button variant="ghost" className="w-full justify-start px-4 h-9 text-[11px] text-slate-400 hover:text-white hover:bg-white/5 mb-2 border border-white/5 border-dashed">
                    <ArrowLeft className="w-3 h-3 mr-2" /> Kembali ke Induk
                  </Button>
                </Link>
              )}

              <div className="space-y-1">
                {workspaceMenus.map((menu) => {
                    const isActive = pathname === menu.href;
                    return (
                      <Link key={menu.href} href={menu.href}>
                        <Button variant="ghost" className={cn("w-full transition-all text-xs font-bold tracking-wide h-10", isCollapsed ? "justify-center px-0" : "justify-start px-4", isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
                          <menu.icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-3", isActive ? "text-white" : "text-slate-400")} /> 
                          {!isCollapsed && <span className="truncate">{menu.name}</span>}
                        </Button>
                      </Link>
                    )
                  })}
                </div>
            </div>
          )}
        </nav>
        
        {/* PROFILE FOOTER */}
        <div className="border-t border-[#E5C185]/10 p-4">
          <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={cn("w-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#F9F8F4]/50 hover:text-red-400 transition-colors h-10", isCollapsed ? "justify-center" : "justify-start px-4")}
          >
              <LogOut className="h-4 w-4 shrink-0" /> 
              {!isCollapsed && <span>Keluar Sistem</span>}
          </button>

          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex w-full items-center justify-center mt-4 text-slate-500 hover:text-[#E5C185] transition-colors py-2">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </>
  );
}