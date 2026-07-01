import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, XCircle, Clock, BookOpen } from "lucide-react";

export default async function ClientPortalDashboard({
    params
}: {
    params: Promise<{ projectSlug: string }>
}) {
    const resolvedParams = await params;
    const { projectSlug } = resolvedParams;

    const project = await prisma.project.findUnique({
        where: { slug: projectSlug },
        include: { guests: true }
    });

    if (!project) redirect(`/portal/${projectSlug}/login`);

    const guests = project.guests;
    const totalGuests = guests.length;
    const totalPax = guests.reduce((sum, g) => sum + g.totalPaxAllocated, 0);

    const rsvpHadir = guests.filter(g => g.rsvpStatus === "ATTENDING").reduce((sum, g) => sum + g.pax, 0);
    const rsvpTolak = guests.filter(g => g.rsvpStatus === "DECLINED").length;
    const rsvpPending = guests.filter(g => g.rsvpStatus === "PENDING").length;

    const checkedInGuests = guests.filter(g => g.isCheckedIn).reduce((sum, g) => sum + g.pax, 0);
    const dietaryCount = guests.filter(g => g.dietaryNotes && g.dietaryNotes.trim().length > 0).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* Header Ringkasan */}
            <div>
                <h2 className="text-2xl font-serif text-[#07303F] mb-1">Ringkasan Kehadiran</h2>
                <p className="text-sm text-slate-500">Pantau respons tamu undangan Anda secara *real-time*.</p>
            </div>

            {/* Statistik Kartu */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-serif text-[#07303F]">{totalGuests}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Undangan Disebar</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200 shadow-sm bg-green-50">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-green-200 text-green-700 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-serif text-green-700">{rsvpHadir} <span className="text-sm font-sans font-normal">pax</span></p>
                        <p className="text-xs text-green-600 font-bold uppercase tracking-widest mt-1">Konfirmasi Hadir</p>
                    </CardContent>
                </Card>

                <Card className="border-red-200 shadow-sm bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-red-200 text-red-700 rounded-xl flex items-center justify-center">
                                <XCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-serif text-red-700">{rsvpTolak}</p>
                        <p className="text-xs text-red-600 font-bold uppercase tracking-widest mt-1">Tidak Hadir</p>
                    </CardContent>
                </Card>

                <Card className="border-amber-200 shadow-sm bg-amber-50">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-amber-200 text-amber-700 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-serif text-amber-700">{rsvpPending}</p>
                        <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mt-1">Belum Merespons</p>
                    </CardContent>
                </Card>
            </div>

            {/* Notifikasi Catatan Makanan */}
            {dietaryCount > 0 && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-700">
                    <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                        <span className="font-bold text-lg">!</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-orange-800">Perhatian Katering</h4>
                        <p className="text-sm text-orange-700 mt-1">
                            Terdapat <strong>{dietaryCount} tamu</strong> yang memiliki preferensi makanan khusus atau alergi. Harap sampaikan daftar ini ke vendor katering Anda untuk menghindari komplikasi.
                        </p>
                    </div>
                </div>
            )}

            {/* Check-in Progress */}
            <Card className="border-[#E5C185]/30 bg-[#07303F] text-white shadow-xl">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <p className="text-xs text-[#E5C185] font-bold uppercase tracking-widest mb-2">Kedatangan Fisik (Check-In)</p>
                            <h3 className="text-4xl font-serif">{checkedInGuests} <span className="text-lg font-sans font-normal text-white/60">/ {rsvpHadir} Pax</span></h3>
                            <p className="text-sm text-white/70 mt-2">Tamu yang sudah lolos *scan barcode* di pintu masuk.</p>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full md:w-1/2 bg-white/10 h-6 rounded-full overflow-hidden border border-white/20">
                            <div 
                                className="h-full bg-gradient-to-r from-[#E5C185] to-amber-300 transition-all duration-1000"
                                style={{ width: `${rsvpHadir > 0 ? (checkedInGuests / rsvpHadir) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Buku Tamu (Guest Book) */}
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <CardTitle className="text-lg text-[#07303F] flex items-center gap-2">
                        <BookOpen className="w-5 h-5" /> Daftar Tamu Anda
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {guests.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-500">Belum ada tamu yang didaftarkan. Hubungi WO Anda untuk mengimpor daftar tamu.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-bold tracking-widest">Nama Tamu</th>
                                        <th className="px-6 py-4 font-bold tracking-widest">Kategori</th>
                                        <th className="px-6 py-4 font-bold tracking-widest">Catatan Makanan</th>
                                        <th className="px-6 py-4 font-bold tracking-widest">RSVP</th>
                                        <th className="px-6 py-4 font-bold tracking-widest text-right">Kehadiran Fisik</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guests.slice(0, 50).map((guest) => (
                                        <tr key={guest.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-bold text-[#07303F]">{guest.name}</td>
                                            <td className="px-6 py-4 text-slate-500">{guest.category}</td>
                                            <td className="px-6 py-4">
                                                {guest.dietaryNotes ? (
                                                    <span className="inline-flex px-2 py-1 text-[10px] font-bold text-orange-700 bg-orange-100 rounded-md border border-orange-200 truncate max-w-[150px]" title={guest.dietaryNotes}>
                                                        {guest.dietaryNotes}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${
                                                    guest.rsvpStatus === 'ATTENDING' ? 'bg-green-100 text-green-700' :
                                                    guest.rsvpStatus === 'DECLINED' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {guest.rsvpStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {guest.isCheckedIn ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs">
                                                        <CheckCircle2 className="w-3 h-3" /> Hadir ({guest.pax} pax)
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {guests.length > 50 && (
                                <div className="p-4 text-center border-t border-slate-100 text-xs text-slate-500">
                                    Menampilkan 50 tamu pertama.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
