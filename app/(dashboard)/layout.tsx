import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppSidebar from "@/components/dashboard/AppSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    // Latar belakang diubah ke Ivory, teks ke Navy Blue
    <div className="min-h-screen bg-[#F9F8F4] text-[#07303F] flex w-full selection:bg-[#E5C185] selection:text-[#07303F] font-sans">
      
      {/* Sidebar sekarang menangani state lebar dan posisinya sendiri secara dinamis */}
      <AppSidebar userRole={session.user.role} />
      
      {/* LOGIKA FLEKSIBEL: 
        - flex-1: Memakan seluruh sisa layar yang tidak dipakai Sidebar.
        - min-w-0: Mencegah flex child meluber melebihi viewport.
        - pt-16 md:pt-0: Memberi ruang untuk navbar mobile.
      */}
      <main className="flex-1 w-full min-w-0 pt-16 md:pt-0 overflow-x-hidden flex flex-col">
        {/* Kontainer aman dengan margin auto dan max-width agar tidak melebar tak terbatas di layar ultra-wide */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">
          {children}
        </div>
      </main>
      
    </div>
  );
}