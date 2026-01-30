import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import GuestForm from "../GuestForm"; // Import dari folder dashboard
import GuestRowActions from "../GuestRowActions"; // Import dari folder dashboard
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

type Props = {
  searchParams: Promise<{ viewAs?: string }>;
};

export default async function GuestsPage(props: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const viewAsId = searchParams.viewAs;
  const userRole = session.user.role;
  const targetUserId = (userRole === "ADMIN" && viewAsId) ? viewAsId : session.user.id; 

  const invitation = await prisma.invitation.findFirst({
    where: { userId: targetUserId },
    include: { guests: { orderBy: { createdAt: 'desc' } } },
  });

  if (!invitation) return <div>Data tidak ditemukan</div>;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* KOLOM KIRI: FORM */}
        <div className="lg:col-span-1 lg:sticky lg:top-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Tambah Tamu</h2>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-1 rounded-xl shadow-xl">
                <div className="bg-slate-50 text-slate-900 rounded-lg">
                        <GuestForm invitationId={invitation.id} />
                </div>
            </div>
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-xs border border-blue-100">
                <p className="font-bold mb-1">💡 Tips:</p>
                Setelah tamu disimpan, kirim link undangan via WhatsApp.
            </div>
        </div>

        {/* KOLOM KANAN: TABEL */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Daftar Tamu</h2>
                <Badge variant="outline">{invitation.guests.length} Data</Badge>
            </div>

            <Card className="border-slate-200 shadow-md overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b">
                                <tr>
                                    <th className="px-6 py-4">Nama & Kontak</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Kursi</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {invitation.guests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                                            <Users className="w-10 h-10 mb-3 opacity-20" />
                                            <p>Belum ada tamu.</p>
                                        </td>
                                    </tr>
                                ) : invitation.guests.map((g) => (
                                    <tr key={g.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{g.name}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                {g.whatsapp || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded text-[10px] font-bold border bg-slate-50 border-slate-100 text-slate-600">
                                                {g.category || "Umum"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold ${g.rsvpStatus === 'ATTENDING' ? 'text-green-600' : 'text-slate-400'}`}>
                                                {g.rsvpStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono">
                                            {g.totalPaxAllocated}
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
  );
}