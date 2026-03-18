// components/dashboard/WeddingOverview.tsx
import { Project, Guest, Wish } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX, MessageSquare, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ClientAssetsForm from "./ClientAssetsForm";
import ClientDetailsForm from "./ClientDetailsForm";
import DeleteWishButton from "./DeleteWishButton";
import AutoRefresh from "./live/AutoRefresh"; 
import ClientTemplateGallery from "@/components/dashboard/ClientTemplateGallery"; 
import { cn } from "@/lib/utils"; // Diperlukan untuk komponen StatsCard baru

// Definisikan tipe gabungan karena kita melakukan include di Prisma
type ProjectWithDetails = Project & {
  guests: Guest[];
  wishes: Wish[];
};

export default function WeddingOverview({ project }: { project: ProjectWithDetails }) {
  // Pindahkan logika perhitungan tamu Anda ke sini
  const totalGuests = project.guests.length;
type Props = {
  searchParams: Promise<{ viewAs?: string }>;
};

export default async function DashboardPage(props: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  // ==========================================
  // 1. LOGIC ADMIN VIEW AS CLIENT (OTAK)
  // ==========================================
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
        <h1 className="text-2xl font-serif italic text-[#07303F]">The Vault is Empty</h1>
        <p className="text-slate-500">Akun ini belum memiliki data undangan pernikahan.</p>
        {userRole === "ADMIN" && (
           <Button className="bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] font-bold uppercase tracking-widest text-xs" asChild>
             <a href="/admin/create-invitation">Inisiasi Mahakarya</a>
           </Button>
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ringkasan Pernikahan</h1>
      return (
    <div className="space-y-8 lg:space-y-12 pb-20">
      <AutoRefresh intervalMs={10000} /> 

      {/* HEADER DASBOR PREMIUM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-[#07303F] border-[#07303F]/30 bg-transparent rounded-sm px-3 py-1">
                {invitation.slug}
             </Badge>
             {userRole === "ADMIN" && <Badge className="bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] rounded-sm text-[10px] font-bold uppercase tracking-widest">Observer Mode</Badge>}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-[#07303F] mb-1">
            {invitation.groomNick} & {invitation.brideNick}
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Executive Dashboard</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
            <Button variant="outline" className="flex-1 md:flex-none border-[#07303F]/20 text-[#07303F] hover:bg-[#07303F] hover:text-[#F9F8F4] text-xs font-bold uppercase tracking-widest h-12 rounded-sm transition-all" asChild>
                <a href={`/invitation/${invitation.slug}`} target="_blank">View Live</a>
            </Button>
            <Button className="flex-1 md:flex-none bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] text-xs font-bold uppercase tracking-widest h-12 rounded-sm transition-all shadow-lg shadow-[#E5C185]/20 border-0" asChild>
                <a href="/dashboard/guests">Guest Book</a>
            </Button>
        </div>
      </div>

      {/* STATISTIK KARTU PREMIUM */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard title="Total Invites" value={totalGuests.toString()} subValue={`${totalPaxAllocated} Seats`} desc="Registered" icon={<Users className="text-[#07303F] h-4 w-4" />} />
        <StatsCard title="Attending" value={totalAttendingPax.toString()} subValue={`${attendingGuests.length} Guests`} desc="Confirmed" icon={<UserCheck className="text-[#E5C185] h-4 w-4" />} highlight />
        <StatsCard title="Declined" value={declinedCount.toString()} subValue="Guests" desc="Unavailable" icon={<UserX className="text-slate-400 h-4 w-4" />} />
        <StatsCard title="Pending" value={pendingCount.toString()} subValue="Guests" desc="Awaiting RSVP" icon={<Clock className="text-amber-600 h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* KOLOM KIRI: Form Manajerial */}
        <div className="xl:col-span-2 space-y-8">
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

        {/* KOLOM KANAN: Ucapan & Doa */}
        <div className="space-y-4 sticky top-10">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#07303F]" />
                <h2 className="text-lg font-bold text-[#07303F]">Wishes & Greetings</h2>
            </div>
            <Badge variant="secondary" className="bg-slate-200 text-[#07303F] font-bold">
                {invitation.wishes.length}
            </Badge>
          </div>
          
          <Card className="border-slate-200 shadow-sm overflow-hidden h-[600px] flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                {invitation.wishes.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {invitation.wishes.map((wish) => (
                        <div key={wish.id} className="p-5 hover:bg-slate-50 transition group relative">
                        <div className="flex justify-between items-start mb-2 pr-6">
                            <div className="font-bold text-sm text-[#07303F]">
                                {wish.senderName || wish.guest?.name || "Anonim"}
                                {wish.guest?.category && (
                                    <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-[#E5C185] bg-[#07303F] px-1.5 py-0.5 rounded-sm">
                                        {wish.guest.category}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                {new Date(wish.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-serif italic">"{wish.message}"</p>
                        
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] font-bold uppercase tracking-widest text-center text-slate-400">
                Hapus ucapan yang mengandung SPAM
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

// KOMPONEN STATS CARD KHUSUS PREMIUM
function StatsCard({ title, value, subValue, desc, icon, highlight = false }: { title: string, value: string, subValue: string, desc: string, icon: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={cn(
      "p-6 rounded-xl border transition-all duration-300",
      highlight 
        ? "bg-[#07303F] text-[#F9F8F4] border-[#07303F] shadow-xl shadow-[#07303F]/10" 
        : "bg-white text-[#07303F] border-slate-200 shadow-sm hover:shadow-md hover:border-[#E5C185]/50"
    )}>
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className={cn("text-[10px] font-bold uppercase tracking-widest", highlight ? "text-[#E5C185]" : "text-slate-400")}>{title}</h3>
        <div className={cn("p-2 rounded-full", highlight ? "bg-[#F9F8F4]/10" : "bg-[#F9F8F4]")}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl md:text-4xl font-serif italic font-bold leading-none mb-2">{value}</div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
             <span className={cn("text-[10px] font-bold uppercase tracking-wider", highlight ? "text-white" : "text-slate-600")}>{subValue}</span>
             <span className={cn("text-[10px] uppercase tracking-wider", highlight ? "text-[#E5C185]/70" : "text-slate-400")}>• {desc}</span>
        </div>
      </div>
    </div>
  );
}
    </div>
  );
}