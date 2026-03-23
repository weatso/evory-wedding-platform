import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppSidebar from "@/components/dashboard/AppSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // GERBANG PENJAGA GLOBAL
  // Jika yang mencoba masuk bukan SUPERADMIN, kembalikan ke Traffic Controller
  if (session.user.systemRole !== "SUPERADMIN") {
    redirect("/dashboard"); 
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#07303F] flex w-full selection:bg-[#E5C185] selection:text-[#07303F] font-sans">
      
      {/* Sidebar Pusat Komando */}
      <AppSidebar 
        systemRole={session.user.systemRole} 
        workspaceSlug="Evory Global" 
      />
      
      <main className="flex-1 w-full min-w-0 pt-16 md:pt-0 overflow-x-hidden flex flex-col">
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">
          {children}
        </div>
      </main>
      
    </div>
  );
}