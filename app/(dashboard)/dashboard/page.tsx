import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, MessageCircle, QrCode } from "lucide-react";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ viewAs?: string }>;
};

export default async function DashboardOverviewPage(props: Props) {
  // 1. Cek Login
  const session = await auth();
  if (!session?.user) redirect("/login");

  const searchParams = await props.searchParams;
  const viewAsId = searchParams.viewAs;
  const userRole = session.user.role;

  // 2. Logic Anti-Nyasar & Role Check
  if (userRole === "ADMIN" && !viewAsId) redirect("/admin");
  if (userRole === "USHER") redirect("/usher");

  // Tentukan Target User ID
  const targetUserId = (userRole === "ADMIN" && viewAsId) ? viewAsId : session.user.id; 
  const isAdminViewing = userRole === "ADMIN" && viewAsId;

  // 3. Ambil Data Undangan (SEKARANG SUDAH BISA INCLUDE TEMPLATE)
  const invitation = await prisma.invitation.findFirst({
    where: { userId: targetUserId },
    include: { 
      guests: true,
      template: true // <-- INI SUDAH TIDAK ERROR LAGI
    },
  });

  // 4. KONDISI: BELUM ADA DATA (TAMPILAN MENUNGGU)
  if (!invitation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-slate-50 rounded-xl m-4 border border-dashed border-slate-300">
        <div className="bg-amber-100 p-4 rounded-full mb-6">
          <Clock className="w-12 h-12 text-amber-600" />
        </div>
        
        <h1 className="text-3xl font-serif font-bold mb-2 text-slate-800">Menunggu Aktivasi</h1>
        <p className="text-slate-500 max-w-md mb-8">
          Halo, <strong>{session.user.name}</strong>. Akun Anda aktif, namun data pernikahan belum diinput oleh Admin.
          <br/><br/>
          Silakan hubungi kami untuk konsultasi template dan pengisian data.
        </p>
  
        <Button className="bg-green-600 hover:bg-green-700 gap-2" asChild>
          <a href="https://wa.me/6281234567890" target="_blank">
            <MessageCircle size={18} /> Hubungi Admin via WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  // 5. KONDISI: SUDAH ADA DATA (HITUNG STATISTIK)
  const totalGuests = invitation.guests.length;
  const totalPaxAllocated = invitation.guests.reduce((sum, g) => sum + g.totalPaxAllocated, 0);
  const confirmedGuests = invitation.guests.filter(g => g.rsvpStatus === "ATTENDING").length;
  
  // Hitung jumlah orang (pax) real yang akan datang
  const confirmedPaxActual = invitation.guests
    .filter(g => g.rsvpStatus === "ATTENDING")
    .reduce((sum, g) => sum + g.pax, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div>
               <h1 className="text-2xl font-bold text-slate-900">Ringkasan Acara</h1>
               <div className="text-slate-500 mt-1 flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${invitation.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                   <span className="font-medium">{invitation.groomNick} & {invitation.brideNick}</span>
                   <span className="text-xs text-slate-300">|</span>
                   <span className="text-xs text-slate-400">{invitation.template?.name || "No Template Selected"}</span>
               </div>
           </div>
           <div className="flex gap-2">
               <Link href={`/invitation/${invitation.slug}`} target="_blank">
                   <Button variant="outline" className="gap-2"><ExternalLink className="w-4 h-4"/> Lihat Web</Button>
               </Link>
               
               <Link href={`/dashboard/live${isAdminViewing ? `?id=${invitation.id}` : ''}`} target="_blank">
                   <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2"><QrCode className="w-4 h-4"/> Live Monitor</Button>
               </Link>
           </div>
       </div>

       {/* STATS CARDS */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           
           <Card className="border-l-4 border-l-slate-400 shadow-sm">
               <CardHeader className="pb-2">
                 <CardTitle className="text-xs font-bold uppercase text-slate-400">Total Undangan</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold text-slate-800">{totalGuests} <span className="text-sm font-normal text-slate-400">Grup</span></div>
               </CardContent>
           </Card>

           <Card className="border-l-4 border-l-blue-500 shadow-sm">
               <CardHeader className="pb-2">
                 <CardTitle className="text-xs font-bold uppercase text-slate-400">Total Kuota (Pax)</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold text-blue-600">{totalPaxAllocated} <span className="text-sm font-normal text-slate-400">Org</span></div>
               </CardContent>
           </Card>

           <Card className="border-l-4 border-l-green-500 shadow-sm bg-green-50/30 border-0">
               <CardHeader className="pb-2">
                 <CardTitle className="text-xs font-bold uppercase text-green-700">Tamu Hadir</CardTitle>
               </CardHeader>
               <CardContent>
                   <div className="text-3xl font-bold text-green-700">{confirmedGuests} <span className="text-sm font-normal opacity-70">Grup</span></div>
                   <p className="text-xs text-green-600 mt-1 font-medium">{confirmedPaxActual} Orang (Real)</p>
               </CardContent>
           </Card>

           <Card className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50/30 border-0">
               <CardHeader className="pb-2">
                 <CardTitle className="text-xs font-bold uppercase text-amber-700">Belum Respon</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold text-amber-700">{totalGuests - confirmedGuests} <span className="text-sm font-normal opacity-70">Grup</span></div>
                 <p className="text-xs text-amber-600 mt-1">Pending RSVP</p>
               </CardContent>
           </Card>

       </div>
    </div>
  );
}