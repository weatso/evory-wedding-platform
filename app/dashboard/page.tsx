import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import GuestForm from "./GuestForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink, QrCode, LogOut } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import GuestRowActions from "./GuestRowActions";

type Props = {
  searchParams: Promise<{ viewAs?: string }>;
};

export default async function DashboardPage(props: Props) {
  const session = await auth();
  
  // 1. Cek Login Dasar
  if (!session) redirect("/login");

  // 2. Baca Params DULU (Penting untuk pengecualian Admin)
  const searchParams = await props.searchParams;
  const viewAsId = searchParams.viewAs;
  const userRole = session.user.role;

  // =========================================================
  // 3. SISTEM ANTI-NYASAR (DIPERBAIKI)
  // =========================================================
  
  if (userRole === "ADMIN") {
      // PERBAIKAN: Hanya tendang Admin jika TIDAK sedang mode "View As"
      if (!viewAsId) {
          redirect("/admin");
      }
      // Jika ada viewAsId, Admin BOLEH lanjut (untuk mengintip)
  } 
  
  if (userRole === "USHER") {
      redirect("/usher"); // Usher tetap tidak boleh masuk sini sama sekali
  }
  // =========================================================

  
  // 4. Tentukan User ID Siapa yang Mau Dilihat
  // Jika Admin & ada viewAsId -> Pakai ID Client tersebut
  // Jika Client biasa -> Pakai ID sendiri
  const targetUserId = (userRole === "ADMIN" && viewAsId) ? viewAsId : session.user.id; 

  // 5. Ambil Data Undangan
  const invitation = await prisma.invitation.findFirst({
    where: { userId: targetUserId },
    include: { 
        guests: {
            orderBy: { createdAt: 'desc' }
        } 
    },
  });

  // 6. Tampilan Jika Data Belum Ada
  if (!invitation) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Data Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-6 text-sm">
                {userRole === "ADMIN" 
                    ? "User Client ini belum membuat data pernikahan." 
                    : "Akun Anda belum memiliki data pernikahan."}
            </p>
            
            <Link href={userRole === "ADMIN" ? "/admin" : "/login"}>
                <Button variant="outline">Kembali</Button>
            </Link>
        </div>
      </div>
    );
  }

  // 7. Hitung Statistik
  const totalGuests = invitation.guests.length;
  const totalPax = invitation.guests.reduce((sum, guest) => sum + guest.maxPax, 0);
  const confirmedGuests = invitation.guests.filter(g => g.rsvpStatus === "ATTENDING").length;
  const confirmedPax = invitation.guests
    .filter(g => g.rsvpStatus === "ATTENDING")
    .reduce((sum, g) => sum + g.maxPax, 0);

  // Jika Admin sedang mengintip, tampilkan Banner Peringatan
  const isAdminViewing = userRole === "ADMIN" && viewAsId;

  return (
     <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
       
       {/* BANNER MODE INTIP ADMIN */}
       {isAdminViewing && (
         <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded shadow-sm flex justify-between items-center">
            <div>
                <p className="font-bold">Mode Pantau Admin</p>
                <p className="text-xs">Anda sedang melihat dashboard milik client: <b>{invitation.groomNick} & {invitation.brideNick}</b></p>
            </div>
            <Link href="/admin">
                <Button size="sm" variant="outline" className="border-amber-300 hover:bg-amber-200 text-amber-800">
                    Kembali ke Admin
                </Button>
            </Link>
         </div>
       )}

       <div className="max-w-6xl mx-auto space-y-8">
            
            {/* HEADER DASHBOARD */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Wedding Dashboard</h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Halo, {invitation.groomNick} & {invitation.brideNick}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Link href={`/invitation/${invitation.slug}`} target="_blank" className="flex-1 md:flex-none">
                        <Button variant="outline" className="gap-2 w-full border-slate-300 hover:bg-slate-50 text-slate-700">
                            <ExternalLink className="w-4 h-4"/> 
                            <span className="hidden sm:inline">Lihat</span> Web
                        </Button>
                    </Link>
                    <Link href={`/dashboard/live${isAdminViewing ? `?id=${invitation.id}` : ''}`} className="flex-1 md:flex-none">
                         <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2 w-full shadow-amber-900/10 shadow-lg">
                            <QrCode className="w-4 h-4"/> 
                            Live <span className="hidden sm:inline">Monitor</span>
                         </Button>
                    </Link>
                    
                    {!isAdminViewing && (
                        <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" title="Logout">
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </form>
                    )}
                </div>
            </div>

            {/* KARTU STATISTIK */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="col-span-2 md:col-span-1 border-l-4 border-l-slate-400 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Undangan</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-slate-800">{totalGuests} <span className="text-sm font-normal text-slate-400">Grup</span></div></CardContent>
                </Card>
                <Card className="col-span-2 md:col-span-1 border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Kursi (Pax)</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-blue-600">{totalPax} <span className="text-sm font-normal text-slate-400">Org</span></div></CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 shadow-sm bg-green-50/50 border-0">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-green-700 tracking-wider">Siap Hadir</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">{confirmedGuests} <span className="text-sm font-normal opacity-70">Grup</span></div>
                        <p className="text-xs text-green-600 mt-1">{confirmedPax} Pax terkonfirmasi</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50/50 border-0">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-amber-700 tracking-wider">Menunggu</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-amber-700">{totalGuests - confirmedGuests} <span className="text-sm font-normal opacity-70">Grup</span></div></CardContent>
                </Card>
            </div>

            <Separator />

            {/* AREA UTAMA: FORM & TABEL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* KOLOM KIRI: FORM TAMBAH TAMU */}
                <div className="lg:col-span-1 lg:sticky lg:top-8">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-1 rounded-xl shadow-xl">
                        <div className="bg-slate-50 text-slate-900 rounded-lg">
                             <GuestForm invitationId={invitation.id} />
                        </div>
                    </div>
                    {/* Tips hanya muncul buat pemilik asli, admin ga perlu */}
                    {!isAdminViewing && (
                        <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-xs border border-blue-100">
                            <p className="font-bold mb-1">💡 Tips:</p>
                            Setelah tamu disimpan, kirim link undangan ke WhatsApp mereka.
                        </div>
                    )}
                </div>

                {/* KOLOM KANAN: TABEL DATA */}
                <div className="lg:col-span-2">
                    <Card className="border-slate-200 shadow-md overflow-hidden">
                        <CardHeader className="bg-white border-b border-slate-100 flex flex-row justify-between items-center">
                            <CardTitle className="text-lg text-slate-800">Daftar Buku Tamu</CardTitle>
                            <Badge variant="outline" className="text-slate-500">{invitation.guests.length} Data</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
        <tr>
            <th className="px-6 py-4">Nama Tamu</th>
            <th className="px-6 py-4">Kategori</th>
            <th className="px-6 py-4">Status RSVP</th>
            <th className="px-6 py-4 text-center">Jatah Kursi</th>
            <th className="px-6 py-4 text-right">Aksi</th> {/* TAMBAHAN KOLOM AKSI */}
        </tr>
    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {invitation.guests.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-12 text-center text-slate-400 flex flex-col items-center">
                                                    <Users className="w-10 h-10 mb-3 opacity-20" />
                                                    <p>Belum ada tamu yang ditambahkan.</p>
                                                </td>
                                            </tr>
                                        ) : invitation.guests.map((g) => (
                                            <tr key={g.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800">{g.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                                        <span className="bg-slate-100 px-1 rounded">#{g.guestCode}</span>
                                                        <span className="hidden group-hover:inline text-slate-300">• {g.whatsapp}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${g.category === 'VIP' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                                        {g.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {g.rsvpStatus === 'ATTENDING' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Hadir
                                                        </span>
                                                    )}
                                                    {g.rsvpStatus === 'PENDING' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span> Belum Respon
                                                        </span>
                                                    )}
                                                    {g.rsvpStatus === 'DECLINED' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Maaf, Absen
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center font-mono text-slate-600">
                                                    {g.maxPax}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                    <GuestRowActions guest={g} />
                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
       </div>
     </div>
  );
}