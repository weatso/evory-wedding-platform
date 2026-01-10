import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, QrCode, LogOut, Settings } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-evory-dark font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 flex flex-col fixed h-full bg-evory-dark text-white z-20 hidden md:flex">
         <div className="h-24 flex items-center px-8">
            <h1 className="text-3xl font-serif font-bold tracking-tighter text-white">
               Evory<span className="text-evory-gold">.</span>
            </h1>
         </div>
         
         <nav className="flex-1 px-4 space-y-2 py-4">
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Menu</p>
            <SidebarItem href="/dashboard" icon={<LayoutDashboard size={18}/>} label="Overview" />
            <SidebarItem href="/dashboard/live" icon={<QrCode size={18}/>} label="Live Monitor" />
            <SidebarItem href="/admin/users" icon={<Users size={18}/>} label="User Management" />
            
            <div className="pt-8">
                <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">System</p>
                <SidebarItem href="/settings" icon={<Settings size={18}/>} label="Settings" />
            </div>
         </nav>

         <div className="p-6 border-t border-white/5">
            <form action={async () => { 'use server'; await import("@/auth").then(m => m.signOut({ redirectTo: "/login" })); }}>
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                <LogOut size={18} className="mr-3"/> Sign Out
                </Button>
            </form>
         </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 md:ml-64 bg-evory-base min-h-screen relative transition-all duration-300">
         {/* Dekorasi Lengkungan di Kiri Atas (Hanya tampil di Desktop) */}
         <div className="hidden md:block absolute top-0 left-0 w-8 h-8 bg-evory-dark z-10">
            <div className="w-full h-full bg-evory-base rounded-tl-[32px]"></div>
         </div>
         <div className="hidden md:block absolute bottom-0 left-0 w-8 h-8 bg-evory-dark z-10">
             <div className="w-full h-full bg-evory-base rounded-bl-[32px]"></div>
         </div>

         {/* Content Wrapper */}
         <div className="h-full w-full overflow-y-auto p-4 md:p-8 md:pt-12">
            {children}
         </div>
      </main>
    </div>
  )
}

function SidebarItem({ href, icon, label }: any) {
    return (
        <Link href={href}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200 group">
                <div className="text-gray-500 group-hover:text-evory-gold transition-colors">
                    {icon}
                </div>
                <span className="text-sm font-medium">{label}</span>
            </div>
        </Link>
    )
}