import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Percent, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AutoRefresh from "./AutoRefresh"; // Komponen Client kecil untuk refresh otomatis

export default async function LiveDashboard({ searchParams }: { searchParams: { id?: string } }) {
    const session = await auth();
    if (!session) redirect("/login");

    // 1. Tentukan Event Mana yang Mau Dipantau
    let eventId = searchParams.id;

    // Jika tidak ada ID di URL, cari event aktif milik user ini
    if (!eventId) {
        const activeEvent = await prisma.invitation.findFirst({
            where: {
                userId: session.user.id, // Sesuaikan logika jika USER ROLE = ADMIN bisa lihat semua
                isActive: true
            },
            select: { id: true }
        });
        if (activeEvent) eventId = activeEvent.id;
    }

    // Jika masih tidak ketemu (User tidak punya event aktif)
    if (!eventId) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-800">Tidak ada acara aktif.</h2>
                <Link href="/dashboard"><Button className="mt-4">Kembali ke Dashboard</Button></Link>
            </div>
        );
    }

    // 2. Ambil Data Detail Event & Statistik
    const event = await prisma.invitation.findUnique({
        where: { id: eventId },
        include: {
            guests: {
                where: { isCheckedIn: true },
                orderBy: { checkInTime: 'desc' },
                take: 10 // Ambil 10 tamu terakhir yang masuk
            }
        }
    });

    if (!event) return <div>Acara tidak ditemukan.</div>;

    // 3. Hitung Statistik via Prisma Aggregate (Lebih Cepat daripada loop manual)
    const stats = await prisma.guest.aggregate({
        where: { invitationId: eventId },
        _sum: {
            totalPaxAllocated: true, // Total Undangan (Kapasitas)
            pax: true,               // Total Orang Hadir (Actual)
        },
        _count: {
            id: true,                // Total Baris Tamu
            checkInTime: true        // Total Transaksi Check-in (yang tidak null)
        }
    });

    const totalInvitedPax = stats._sum.totalPaxAllocated || 0;
    const totalActualPax = stats._sum.pax || 0;
    // LOGIKA BARU: Sisa Kuota
    const remainingQuota = totalInvitedPax - totalActualPax;
    const isOverCapacity = remainingQuota < 0;
    const totalGuests = stats._count.id || 0;
    const checkedInCount = stats._count.checkInTime || 0;

    // Persentase Kehadiran (Berdasarkan Pax)
    const occupancyRate = totalInvitedPax > 0
        ? Math.round((totalActualPax / totalInvitedPax) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">

            {/* HEADER NAVIGASI */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Live Monitor</h1>
                        <p className="text-sm text-slate-500">{event.groomNick} & {event.brideNick} • {event.location}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-green-700 uppercase">Live Update</span>
                    <AutoRefresh />
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Hadir (Pax)"
                    value={totalActualPax.toString()}
                    sub={`Dari total ${totalInvitedPax} kursi`}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                />
                <StatCard
                    title="Check-in Count"
                    value={checkedInCount.toString()}
                    sub={`Dari total ${totalGuests} undangan`}
                    icon={<UserCheck className="w-5 h-5 text-green-600" />}
                />
                <StatCard
                    title="Occupancy"
                    // Jika > 100%, beri warna Merah
                    value={
                        <span className={occupancyRate > 100 ? "text-red-600" : "text-slate-900"}>
                            {occupancyRate}%
                        </span>
                    }
                    sub="Persentase kursi terisi"
                    icon={<Percent className="w-5 h-5 text-amber-600" />}
                />

                <StatCard
                    title={isOverCapacity ? "Over Capacity" : "Sisa Kuota"}
                    value={
                        isOverCapacity
                            ? <span className="text-red-600">+{Math.abs(remainingQuota)}</span> // Tampilkan "+1" merah
                            : remainingQuota.toString() // Tampilkan angka biasa
                    }
                    sub={isOverCapacity ? "Melebihi total kursi tersedia" : "Kursi kosong tersedia"}
                    icon={<Clock className={`w-5 h-5 ${isOverCapacity ? "text-red-600" : "text-slate-600"}`} />}
                />
            </div>

            {/* RECENT ACTIVITY TABLE */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-white border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-400" />
                        Aktivitas Terkini (10 Terakhir)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead>Waktu</TableHead>
                                <TableHead>Nama Tamu</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead className="text-center">Jumlah (Pax)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {event.guests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-slate-400">Belum ada tamu yang check-in.</TableCell>
                                </TableRow>
                            ) : (
                                event.guests.map((guest) => (
                                    <TableRow key={guest.id} className="animate-in fade-in slide-in-from-left-2 duration-500">
                                        <TableCell className="font-mono text-xs text-slate-500">
                                            {guest.checkInTime ? new Date(guest.checkInTime).toLocaleTimeString('id-ID') : '-'}
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-800">
                                            {guest.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={guest.category === 'VIP' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600'}>
                                                {guest.category || 'Reguler'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-slate-900">
                                            {guest.pax}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ title, value, sub, icon }: any) {
    return (
        <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                    {icon}
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
                <p className="text-[10px] text-slate-400">{sub}</p>
            </CardContent>
        </Card>
    )
}