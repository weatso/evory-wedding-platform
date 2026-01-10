import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, MonitorPlay, LogOut, Calendar, MapPin, Clock } from "lucide-react";

export default async function UsherDashboard() {
  const session = await auth();
    
  // 1. Jika belum login sama sekali -> Lempar ke Login
  if (!session) {
      redirect("/login");
  }

  // 2. Jika sudah login TAPI bukan Usher/Admin -> Lempar ke Dashboard Client (atau 404)
  if (session.user.role !== "USHER" && session.user.role !== "ADMIN") {
      redirect("/dashboard"); 
      // Atau bisa return <div>Akses Ditolak</div> tapi redirect lebih UX friendly
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

        {/* DAFTAR PERNIKAHAN AKTIF */}
        <h3 className="text-lg font-bold mb-4 text-slate-300 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Pilih Acara Aktif
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeWeddings.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-slate-800 rounded-xl border border-dashed border-slate-700">
                    <p className="text-slate-500">Belum ada acara aktif hari ini.</p>
                </div>
            ) : (
                activeWeddings.map((wedding) => (
                    <Card key={wedding.id} className="bg-slate-800 border-slate-700 text-slate-200 overflow-hidden flex flex-col">
                        <CardHeader className="bg-slate-950/30 border-b border-slate-700/50 pb-3">
                            <CardTitle className="text-xl text-amber-500">
                                {wedding.groomNick} & {wedding.brideNick}
                            </CardTitle>
                            <p className="text-xs text-slate-400">
                                {new Date(wedding.eventDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                            </p>
                        </CardHeader>
                        <CardContent className="pt-4 flex-1 flex flex-col gap-4">
                            <div className="text-sm text-slate-400 space-y-2 flex-1">
                                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-600"/> {wedding.eventTime}</p>
                                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-600"/> {wedding.location}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                {/* TOMBOL SCANNER SPESIFIK */}
                                <Link href={`/usher/scan?id=${wedding.id}`}>
                                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold">
                                        <QrCode className="w-4 h-4 mr-2" />
                                        Scan Tamu
                                    </Button>
                                </Link>

                                {/* TOMBOL MONITOR */}
                                <Link href={`/dashboard/live?id=${wedding.id}`}>
                                    <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700 hover:text-white text-slate-300">
                                        <MonitorPlay className="w-4 h-4 mr-2 text-green-500" />
                                        Monitor
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