// app/admin/page.tsx

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Pencil, 
  LayoutDashboard, 
  Plus, 
  Users,
  LogOut,
  QrCode,
  ShieldCheck
} from "lucide-react";

// Import Modal Tambah Staff yang sudah kita buat sebelumnya
import { AddStaffModal } from "./_components/AddStaffModal";

export default async function AdminDashboard() {
  const session = await auth();
  
  // 1. Security Check: Hanya Admin yang boleh masuk
  if (session?.user?.role !== "ADMIN") {
    redirect("/login");
  }

  // 2. Ambil data Client (Undangan)
  const invitations = await prisma.invitation.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  // 3. Ambil data Staff (Admin & Usher) -- BARU
  const staffUsers = await prisma.user.findMany({
    where: {
        role: { in: ["ADMIN", "USHER"] }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Control Center</h1>
           <p className="text-slate-500 mt-1">Kelola proyek undangan, user client, dan tim internal.</p>
        </div>
        
        <div className="flex gap-3 items-center">
            {/* Tombol ke Dashboard Usher */}
            <Link href="/usher">
                <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 gap-2">
                    <QrCode className="w-4 h-4" /> 
                    <span className="hidden md:inline">Mode Usher</span>
                </Button>
            </Link>

            {/* Tombol Logout */}
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
                <Button variant="ghost" className="border-red-200 text-red-600 hover:bg-red-50 gap-2">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                </Button>
            </form>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* KOLOM KIRI (2/3): MANAGEMENT CLIENT / UNDANGAN */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Header Section Client */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600"/> Daftar Client
                    </h2>
                    <p className="text-sm text-slate-500">Total Proyek Aktif: {invitations.length}</p>
                </div>
                {/* Tombol Tambah Client (Link ke Form Lama) */}
                <Link href="/admin/users">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-sm">
                        <Plus className="w-4 h-4" /> Tambah Client
                    </Button>
                </Link>
            </div>

            {/* TABEL UNDANGAN (Mempertahankan kode asli Anda) */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 w-[30%]">Mempelai & Client</th>
                          <th className="px-6 py-4 w-[20%]">Tanggal Acara</th>
                          <th className="px-6 py-4 w-[15%]">Status</th>
                          <th className="px-6 py-4 w-[35%] text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {invitations.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="bg-slate-100 p-3 rounded-full">
                                            <Users className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p>Belum ada proyek. Silakan tambah user baru.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : invitations.map((inv) => {
                          const isDone = new Date() > new Date(inv.eventDate);
                          
                          return (
                            <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                              
                              {/* Data Mempelai */}
                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-900 text-base">
                                    {inv.groomNick} & {inv.brideNick}
                                </div>
                                <div className="text-xs text-slate-500 flex flex-col gap-1 mt-1">
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                        {inv.user?.email}
                                    </span>
                                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 w-fit rounded border border-slate-200 text-slate-600">
                                        /{inv.slug}
                                    </span>
                                </div>
                              </td>

                              {/* Tanggal */}
                              <td className="px-6 py-4 text-slate-600 font-medium">
                                {new Date(inv.eventDate).toLocaleDateString('id-ID', {
                                  weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4">
                                {isDone ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                    SELESAI
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    AKAN DATANG
                                  </span>
                                )}
                              </td>

                              {/* Aksi */}
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end items-center gap-2 opacity-100 sm:opacity-90 sm:group-hover:opacity-100 transition-opacity">
                                    <a href={`/invitation/${inv.slug}`} target="_blank" rel="noreferrer">
                                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium text-slate-600 hover:text-slate-900" title="Lihat Website">
                                            <Eye className="w-3.5 h-3.5 mr-1.5"/> Web
                                        </Button>
                                    </a>
                                    
                                    <Link href={`/dashboard?viewAs=${inv.userId}`}>
                                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700" title="Pantau Dashboard Client">
                                            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5"/> Dash
                                        </Button>
                                    </Link>

                                    <Link href={`/admin/edit/${inv.id}`}>
                                        <Button variant="default" size="sm" className="h-8 px-3 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-sm" title="Edit Data Proyek">
                                            <Pencil className="w-3.5 h-3.5 mr-1.5"/> Edit
                                        </Button>
                                    </Link>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
            </Card>
        </div>

        {/* KOLOM KANAN (1/3): MANAGEMENT STAFF (BARU) */}
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-600"/> Internal Staff
                </h2>
                {/* BUTTON MODAL POPUP */}
                <AddStaffModal />
            </div>

            <div className="grid gap-3">
                {staffUsers.length === 0 ? (
                    <div className="p-4 bg-white rounded-lg border border-slate-200 text-center text-sm text-slate-500">
                        Belum ada staff tambahan.
                    </div>
                ) : staffUsers.map((user) => (
                    <Card key={user.id} className="p-4 flex items-center justify-between shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                                {user.role === 'ADMIN' ? 'AD' : 'US'}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-800">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${user.role === 'ADMIN' ? "border-purple-200 text-purple-700 bg-purple-50" : "border-amber-200 text-amber-700 bg-amber-50"}`}>
                            {user.role}
                        </span>
                    </Card>
                ))}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-xs text-blue-700">
                <p className="font-bold mb-1">💡 Info Role:</p>
                <ul className="list-disc ml-4 space-y-1">
                    <li><b>ADMIN:</b> Akses penuh ke dashboard ini dan pengaturan sistem.</li>
                    <li><b>USHER:</b> Hanya akses ke Dashboard Usher untuk scan tamu & monitoring.</li>
                </ul>
            </div>
        </div>

      </div>
    </div>
  );
}