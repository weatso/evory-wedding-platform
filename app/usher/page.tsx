import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, MonitorPlay, LogOut, Calendar } from "lucide-react";

export default async function UsherDashboard() {
  const session = await auth();
  
  // Security: Hanya Usher dan Admin yang boleh masuk
  if (!session || (session.user.role !== "USHER" && session.user.role !== "ADMIN")) {
      return <div className="p-10 text-center">Akses Ditolak. Halaman ini khusus Staff/Usher.</div>;
  }

  // Ambil semua undangan yang AKTIF
  const activeWeddings = await prisma.invitation.findMany({
      where: { isActive: true },
      select: {
          id: true,
          groomNick: true,
          brideNick: true,
          eventDate: true,
          eventTime: true,
          location: true
      },
      orderBy: { eventDate: 'asc' }
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-6">
            <div>
                <h1 className="text-2xl font-bold text-amber-500">Usher Dashboard</h1>
                <p className="text-xs text-slate-400">Halo, {session.user.name}</p>
            </div>
            
            {/* BUTTON LOGOUT / HOME */}
            <form action={async () => { 'use server'; await import("@/auth").then(m => m.signOut()); }}>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <LogOut className="w-4 h-4 mr-2" /> Keluar
                </Button>
            </form>
        </div>

        {/* MENU UTAMA: SCANNER GLOBAL */}
        <div className="mb-10">
            <Link href="/admin/scan">
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 rounded-xl shadow-lg flex items-center justify-between hover:scale-[1.02] transition-transform cursor-pointer border border-amber-500/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Buka Scanner</h2>
                        <p className="text-amber-100 text-sm">Scan QR Code Tamu untuk Check-in</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-full">
                        <QrCode className="w-10 h-10 text-white" />
                    </div>
                </div>
            </Link>
        </div>

        {/* DAFTAR PERNIKAHAN AKTIF */}
        <h3 className="text-lg font-bold mb-4 text-slate-300 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Daftar Acara Aktif
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeWeddings.length === 0 ? (
                <p className="text-slate-500 text-sm">Tidak ada acara aktif saat ini.</p>
            ) : (
                activeWeddings.map((wedding) => (
                    <Card key={wedding.id} className="bg-slate-800 border-slate-700 text-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white">
                                {wedding.groomNick} & {wedding.brideNick}
                            </CardTitle>
                            <p className="text-xs text-slate-400">
                                {new Date(wedding.eventDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-xs text-slate-500 space-y-1">
                                    <p>🕒 {wedding.eventTime}</p>
                                    <p>📍 {wedding.location}</p>
                                </div>
                                
                                {/* TOMBOL KE LIVE MONITOR */}
                                <Link href={`/dashboard/live?id=${wedding.id}`}>
                                    <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700 hover:text-white text-slate-300">
                                        <MonitorPlay className="w-4 h-4 mr-2 text-green-500" />
                                        Lihat Live Monitor
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    </div>
  );
}