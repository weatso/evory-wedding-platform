// app/admin/page.tsx

import { auth,signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Pencil, 
  LayoutDashboard, 
  Plus, 
  Users,
  LogOut 
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  
  // 1. Security Check: Hanya Admin yang boleh masuk
  if (session?.user?.role !== "ADMIN") {
    redirect("/login");
  }

  // 2. Ambil semua undangan + data user pemiliknya
  // Diurutkan dari yang terbaru dibuat
  const invitations = await prisma.invitation.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Control Center</h1>
           <p className="text-slate-500 mt-1">Kelola semua proyek undangan, user, dan status acara.</p>
        </div>
        
        <div className="flex gap-3 items-center">
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hidden md:block">
                <span className="text-sm text-slate-500">Total Proyek:</span>
                <span className="ml-2 font-bold text-slate-900">{invitations.length}</span>
            </div>
            
            {/* Tombol Tambah User/Proyek */}
            <Link href="/admin/users">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> 
                    <span>Tambah User</span>
                </Button>
            </Link>

            {/* Tombol Logout (BARU) */}
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 gap-2">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                </Button>
            </form>

        </div>
      </div>

      {/* TABLE SECTION */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 px-6 py-4">
          <CardTitle className="text-base font-bold text-slate-800">Daftar Proyek Undangan</CardTitle>
        </CardHeader>
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
                  // Logika Status Selesai/Belum
                  const isDone = new Date() > new Date(inv.eventDate);
                  
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                      
                      {/* KOLOM 1: DATA MEMPELAI */}
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

                      {/* KOLOM 2: TANGGAL */}
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {new Date(inv.eventDate).toLocaleDateString('id-ID', {
                          weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>

                      {/* KOLOM 3: STATUS */}
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

                      {/* KOLOM 4: TOMBOL AKSI (SERAGAM) */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2 opacity-100 sm:opacity-90 sm:group-hover:opacity-100 transition-opacity">
                            
                            {/* 1. Tombol Lihat Web */}
                            <a href={`/invitation/${inv.slug}`} target="_blank" rel="noreferrer">
                                <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium text-slate-600 hover:text-slate-900" title="Lihat Website">
                                    <Eye className="w-3.5 h-3.5 mr-1.5"/> Web
                                </Button>
                            </a>

                            {/* 2. Tombol Masuk Dashboard Client */}
                            <Link href={`/dashboard?viewAs=${inv.userId}`}>
                                <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700" title="Pantau Dashboard Client">
                                    <LayoutDashboard className="w-3.5 h-3.5 mr-1.5"/> Dash
                                </Button>
                            </Link>

                            {/* 3. Tombol Edit Data */}
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
  );
}