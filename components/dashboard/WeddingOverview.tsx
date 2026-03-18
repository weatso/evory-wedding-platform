import { Project, Guest, Wish } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX, MessageSquare, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

// PERBAIKAN IMPORT PATH
import ClientAssetsForm from "@/app/(dashboard)/dashboard/ClientAssetsForm"; 
import ClientDetailsForm from "@/app/(dashboard)/dashboard/ClientDetailsForm"; 
import DeleteWishButton from "@/app/(dashboard)/dashboard/DeleteWishButton";
import AutoRefresh from "@/app/(dashboard)/dashboard/live/AutoRefresh"; 
import ClientTemplateGallery from "@/components/dashboard/ClientTemplateGallery"; 

// PERBAIKAN TIPE DATA (Tambahkan tipe relasi tamu di dalam ucapan)
type ProjectWithDetails = Project & {
  guests: Guest[];
  wishes: (Wish & { guest: Guest | null })[]; 
};

// PERBAIKAN PROPS (Terima templates dari halaman induk)
export default function WeddingOverview({ project, templates }: { project: ProjectWithDetails, templates: any[] }) {
  
  const meta = (project.eventMetadata as any) || {};
  const groomNick = meta.groomNick || "Groom";
  const brideNick = meta.brideNick || "Bride";
  const groomImageUrl = meta.groomImageUrl || "";
  const brideImageUrl = meta.brideImageUrl || "";
  const coverImageUrl = meta.coverImageUrl || "";

  const themeConfig = (project.themeConfig as any) || {};
  const initialWings = themeConfig.desktopBackground || null;

  const totalGuests = project.guests.length;
  const totalPaxAllocated = project.guests.reduce((sum, g) => sum + g.totalPaxAllocated, 0);
  
  const attendingGuests = project.guests.filter(g => g.rsvpStatus === "ATTENDING");
  const totalAttendingPax = attendingGuests.reduce((sum, g) => sum + (g.pax || g.totalPaxAllocated), 0);
  
  const declinedCount = project.guests.filter(g => g.rsvpStatus === "DECLINED").length;
  const pendingCount = project.guests.filter(g => g.rsvpStatus === "PENDING").length;

  return (
    <div className="space-y-8 lg:space-y-12 pb-20">
      <AutoRefresh intervalMs={10000} /> 

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-[#07303F] border-[#07303F]/30 bg-transparent rounded-sm px-3 py-1">
                {project.slug}
             </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-[#07303F] mb-1">
            {groomNick} & {brideNick}
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Wedding Dashboard</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
            <Button variant="outline" className="flex-1 md:flex-none border-[#07303F]/20 text-[#07303F] hover:bg-[#07303F] hover:text-[#F9F8F4] text-xs font-bold uppercase tracking-widest h-12 rounded-sm transition-all" asChild>
                <Link href={`/invitation/${project.slug}`} target="_blank">View Live</Link>
            </Button>
            <Button className="flex-1 md:flex-none bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] text-xs font-bold uppercase tracking-widest h-12 rounded-sm transition-all shadow-lg shadow-[#E5C185]/20 border-0" asChild>
                <Link href="/dashboard/guests">Guest Book</Link>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard title="Total Invites" value={totalGuests.toString()} subValue={`${totalPaxAllocated} Seats`} desc="Registered" icon={<Users className="text-[#07303F] h-4 w-4" />} />
        <StatsCard title="Attending" value={totalAttendingPax.toString()} subValue={`${attendingGuests.length} Guests`} desc="Confirmed" icon={<UserCheck className="text-[#E5C185] h-4 w-4" />} highlight />
        <StatsCard title="Declined" value={declinedCount.toString()} subValue="Guests" desc="Unavailable" icon={<UserX className="text-slate-400 h-4 w-4" />} />
        <StatsCard title="Pending" value={pendingCount.toString()} subValue="Guests" desc="Awaiting RSVP" icon={<Clock className="text-amber-600 h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 space-y-8">
          <ClientDetailsForm project={project} />
          <ClientAssetsForm 
              projectId={project.id}
              userId={project.userId!}
              initialCover={coverImageUrl}
              initialGroom={groomImageUrl}
              initialBride={brideImageUrl}
              initialWings={initialWings}
              initialGallery={project.gallery}
          />
        </div>

        <div className="space-y-4 sticky top-10">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#07303F]" />
                <h2 className="text-lg font-bold text-[#07303F]">Wishes & Greetings</h2>
            </div>
            <Badge variant="secondary" className="bg-slate-200 text-[#07303F] font-bold">
                {project.wishes.length}
            </Badge>
          </div>
          
          <Card className="border-slate-200 shadow-sm overflow-hidden h-[600px] flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                {project.wishes.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {project.wishes.map((wish) => (
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
                  </div>
                )}
            </div>
          </Card>
        </div>
      </div>

      <ClientTemplateGallery 
        projectId={project.id}
        currentTemplateId={project.templateId}
        clientTier={project.packageTier}
        templates={templates} // PERBAIKAN: Suntikkan data dari halaman induk
      />
    </div>
  );
}

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