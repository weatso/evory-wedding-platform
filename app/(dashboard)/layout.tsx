import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppSidebar from "@/components/dashboard/AppSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR FIXED */}
      <AppSidebar userRole={session.user.role} />
      
      {/* MAIN CONTENT AREA (Digeser 64 unit ke kanan karena sidebar) */}
      <main className="flex-1 ml-64 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}