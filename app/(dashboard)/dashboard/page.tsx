import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, QrCode } from "lucide-react";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ viewAs?: string }>;
};

export default async function DashboardOverviewPage(props: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const viewAsId = searchParams.viewAs;
  const userRole = session.user.role;

  // Logic Anti-Nyasar
  if (userRole === "ADMIN" && !viewAsId) redirect("/admin");
  if (userRole === "USHER") redirect("/usher");

  const targetUserId = (userRole === "ADMIN" && viewAsId) ? viewAsId : session.user.id; 
  const isAdminViewing = userRole === "ADMIN" && viewAsId;

  // Ambil Data Ringkas
  const invitation = await prisma.invitation.findFirst({
    where: { userId: targetUserId },
    include: { guests: true },
  });

  if (!invitation) return <div className="p-10 text-center">Data undangan belum siap.</div>;

  // Hitung Statistik
  const totalGuests = invitation.guests.length;
  const totalPax = invitation.guests.reduce((sum, g) => sum + g.totalPaxAllocated, 0);
  const confirmedGuests = invitation.guests.filter(g => g.rsvpStatus === "ATTENDING").length;
  const confirmedPax = invitation.guests
    .filter(g => g.rsvpStatus === "ATTENDING")
    .reduce((sum, g) => sum + g.totalPaxAllocated, 0);

  return (
     <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Ringkasan Acara</h1>
                <p className="text-slate-500 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {invitation.groomNick} & {invitation.brideNick}
                </p>
            </div>
            <div className="flex gap-2">
                <Link href={`/invitation/${invitation.slug}`} target="_blank">
                    <Button variant="outline" className="gap-2"><ExternalLink className="w-4 h-4"/> Lihat Web</Button>
                </Link>
                <Link href={`/dashboard/live${isAdminViewing ? `?id=${invitation.id}` : ''}`}>
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2"><QrCode className="w-4 h-4"/> Live Monitor</Button>
                </Link>
            </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-slate-400 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-400">Total Undangan</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold text-slate-800">{totalGuests} <span className="text-sm font-normal text-slate-400">Grup</span></div></CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-400">Total Kursi (Pax)</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold text-blue-600">{totalPax} <span className="text-sm font-normal text-slate-400">Org</span></div></CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500 shadow-sm bg-green-50/50 border-0">
                <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-green-700">Hadir</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-green-700">{confirmedGuests} <span className="text-sm font-normal opacity-70">Grup</span></div>
                    <p className="text-xs text-green-600 mt-1">{confirmedPax} Pax Confirm</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50/50 border-0">
                <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-amber-700">Menunggu</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold text-amber-700">{totalGuests - confirmedGuests} <span className="text-sm font-normal opacity-70">Grup</span></div></CardContent>
            </Card>
        </div>
     </div>
  );
}