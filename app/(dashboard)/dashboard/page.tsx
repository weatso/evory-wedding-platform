import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, MessageSquare, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ClientAssetsForm from "./ClientAssetsForm";
import ClientDetailsForm from "./ClientDetailsForm";
import DeleteWishButton from "./DeleteWishButton";
import AutoRefresh from "./live/AutoRefresh"; 
// PERBAIKAN: Import mutlak untuk komponen galeri
import ClientTemplateGallery from "@/components/dashboard/ClientTemplateGallery"; 

type Props = {
  searchParams: Promise<{ viewAs?: string }>;
};

export default async function DashboardPage(props: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  // 1. LOGIC ADMIN VIEW AS CLIENT
  const searchParams = await props.searchParams;
  const viewAsId = searchParams.viewAs;
  const userRole = session.user.role;
  
  const targetUserId = (userRole === "ADMIN" && viewAsId) ? viewAsId : session.user.id;

  // 2. FETCH DATA KOMPLIT UNDANGAN
  const invitation = await prisma.invitation.findFirst({
    where: { userId: targetUserId },
    include: {
      guests: true,
      wishes: { 
        orderBy: { createdAt: "desc" },
        include: { guest: true } 
      }
    }
  });

  if (!invitation) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Undangan Belum Dibuat</h1>
        <p className="text-slate-500">Akun ini belum memiliki data undangan pernikahan.</p>
        {userRole === "ADMIN" && (
           <Button asChild><a href="/admin/create-invitation">Buat Undangan</a></Button>
        )}
      </div>
    );
  }

  // 3. FETCH DAFTAR TEMPLATE AKTIF DARI DATABASE
  const availableTemplates = await prisma.template.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
      tier: true,
      category: { select: { name: true } }
    },
    orderBy: { tier: 'desc' }
  });

  // 4. STATISTIK (Server Side Calculation)
  const totalGuests = invitation.guests.length;
  const totalPaxAllocated = invitation.guests.reduce((sum, g) => sum + g.totalPaxAllocated, 0);
  
  const attendingGuests = invitation.guests.filter(g => g.rsvpStatus === "ATTENDING");
  const totalAttendingPax = attendingGuests.reduce((sum, g) => sum + (g.pax || g.totalPaxAllocated), 0);
  
  const declinedCount = invitation.guests.filter(g => g.rsvpStatus === "DECLINED").length;
  const pendingCount = invitation.guests.filter(g => g.rsvpStatus === "PENDING").length;

  // 5. PARSE THEME CONFIG
  const themeConfig = invitation.themeConfig as any || {};
  const initialWings = themeConfig.desktopBackground || null;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <AutoRefresh intervalMs={10000} /> 

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Badge variant="outline" className="text-xs uppercase tracking-wider text-slate-500">
                {invitation.slug}
             </Badge>
             {userRole === "ADMIN" && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Mode Admin</Badge>}
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">
            {invitation.groomNick} & {invitation.brideNick}
          </h1>
          <p className="text-slate-500 text-sm">Dashboard Pernikahan</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <a href={`/invitation/${invitation.slug}`} target="_blank">Lihat Website</a>
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" asChild>
                <a href="/dashboard/guests">Buku Tamu</a>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Undangan" value={totalGuests.toString()} subValue={`${totalPaxAllocated} Kursi`} desc="Tamu Terdaftar" icon={<Users className="text-blue-600 h-4 w-4" />} />
        <StatsCard title="Konfirmasi Hadir" value={totalAttendingPax.toString()} subValue={`${attendingGuests.length} Tamu`} desc="Pax Terkonfirmasi" icon={<UserCheck className="text-green-600 h-4 w-4" />} trend="positive" />
        <StatsCard title="Berhalangan" value={declinedCount.toString()} subValue="Tamu" desc="Menolak Hadir" icon={<UserX className="text-red-500 h-4 w-4" />} trend="negative" />
        <StatsCard title="Belum Respon" value={pendingCount.toString()} subValue="Tamu" desc="Menunggu RSVP" icon={<Clock className="text-amber-500 h-4 w-4" />} trend="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 space-y-6">
          <ClientDetailsForm invitation={invitation} />
           <ClientAssetsForm 
              invitationId={invitation.id}
              userId={invitation.userId!}
              initialCover={invitation.coverImageUrl}
              initialGroom={invitation.groomImageUrl}
              initialBride={invitation.brideImageUrl}
              initialWings={initialWings}
              initialGallery={invitation.gallery}
           />
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-4 lg:sticky lg:top-8">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-800" />
                <h2 className="text-lg font-bold text-slate-800">Ucapan & Doa</h2>
            </div>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                {invitation.wishes.length}
            </Badge>
          </div>
          
          <Card className="border-slate-200 shadow-sm overflow-hidden h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                {invitation.wishes.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {invitation.wishes.map((wish) => (
                        <div key={wish.id} className="p-4 hover:bg-slate-50 transition group relative">
                        <div className="flex justify-between items-start mb-1 pr-6">
                            <div className="font-bold text-sm text-slate-800">
                                {wish.senderName || wish.guest?.name || "Anonim"}
                                {wish.guest?.category && (
                                    <span className="ml-2 text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {wish.guest.category}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(wish.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-serif">"{wish.message}"</p>
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DeleteWishButton wishId={wish.id} />
                        </div>
                        </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm p-8 text-center bg-slate-50/50">
                    <MessageSquare className="w-10 h-10 mb-3 opacity-10" />
                    <p>Belum ada ucapan masuk.</p>
                    <p className="text-xs mt-1 opacity-70">Bagikan undangan untuk menerima doa.</p>
                  </div>
                )}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-center text-slate-400">
                Hapus ucapan yang mengandung SPAM atau kata kasar.
            </div>
          </Card>
        </div>
      </div>

      {/* GALERI TEMPLATE KLIEN */}
      <ClientTemplateGallery 
        invitationId={invitation.id}
        currentTemplateId={invitation.templateId}
        clientTier={invitation.packageTier}
        templates={availableTemplates}
      />

    </div>
  );
}

function StatsCard({ title, value, subValue, desc, icon, trend }: { title: string, value: string, subValue: string, desc: string, icon: React.ReactNode, trend?: 'positive' | 'negative' | 'neutral' }) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        <div className="flex items-center gap-2 mt-1">
             <span className="text-xs font-medium text-slate-600">{subValue}</span>
             <span className="text-[10px] text-slate-400">• {desc}</span>
        </div>
      </CardContent>
    </Card>
  );
}