import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppSidebar from "@/components/dashboard/AppSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 flex w-full">
      <AppSidebar userRole={session.user.role} />
      
      {/* LOGIKA ABSOLUT: 
        flex-1: Ambil seluruh sisa ruang.
        md:ml-64: Beri jarak selebar sidebar di Desktop.
        min-w-0: JANGAN PERNAH menembus batas lebar viewport.
        overflow-x-hidden: Matikan gulir horizontal selamanya.
      */}
      <main className="flex-1 w-full min-w-0 md:ml-64 pt-16 md:pt-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}