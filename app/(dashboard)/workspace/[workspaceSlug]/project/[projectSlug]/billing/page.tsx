import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CreditCard, CheckCircle2, AlertCircle, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const { workspaceSlug, projectSlug } = resolvedParams;

  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    include: { workspace: true },
  });

  if (!project || project.workspace.slug !== workspaceSlug) {
    redirect("/404");
  }

  // Multi-Tenancy Guard
  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId: project.workspaceId } }
    });
    if (!isMember) redirect("/unauthorized");
  }

  const isPaid = project.paymentStatus === "PAID";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-[#07303F]">Billing & Layanan</h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola pembayaran dan status aktivasi untuk proyek <span className="font-bold">{project.title}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Status & Info Paket */}
        <div className="md:col-span-2 space-y-6">
          <div className={`p-6 rounded-2xl border-2 relative overflow-hidden ${isPaid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {isPaid ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                  <span className={`text-sm font-bold tracking-widest uppercase ${isPaid ? 'text-green-700' : 'text-red-700'}`}>
                    Status: {isPaid ? 'Aktif (Terbayar)' : 'Menunggu Pembayaran'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[#07303F] mb-2">{project.packageTier} Package</h2>
                <p className="text-sm text-slate-600 max-w-md">
                  {isPaid 
                    ? "Undangan ini sudah aktif sepenuhnya dan dapat diakses oleh tamu publik tanpa batasan." 
                    : "Tamu publik belum bisa mengakses undangan ini (terkunci Paywall). Segera selesaikan pembayaran untuk mengaktifkan."}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total Tagihan</p>
                <p className="text-3xl font-serif text-[#07303F]">
                  Rp {project.agencyCost.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            {/* Background Decor */}
            <CreditCard className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-5 ${isPaid ? 'text-green-900' : 'text-red-900'}`} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-[#07303F] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-400" /> Keamanan & Garansi
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>Pembayaran Anda dijamin aman. Aktivasi sistem dilakukan seketika (otomatis) setelah dana diverifikasi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>Tidak ada biaya tersembunyi. Harga yang tertera adalah harga final.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>Server Evory OS menjamin uptime 99.9% selama hari-H acara klien Anda.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Kolom Kanan: Aksi Pembayaran */}
        <div className="space-y-6">
          <div className="bg-[#07303F] text-white p-6 rounded-2xl shadow-xl">
            <h3 className="font-bold text-[#E5C185] mb-4">Metode Pembayaran</h3>
            
            {isPaid ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="font-bold">Lunas</p>
                <p className="text-xs text-slate-300 mt-1">Terima kasih atas pembayaran Anda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-center">
                  <p className="text-xs text-slate-300 mb-1">Transfer Bank (BCA)</p>
                  <p className="font-mono text-xl font-bold tracking-widest">8720 1928 33</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase">A/N PT Evory Teknologi Indonesia</p>
                </div>
                
                <div className="text-center p-4">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300">Sistem pembayaran otomatis pihak ketiga (Payment Gateway) sedang dalam tahap integrasi.</p>
                </div>

                <Button className="w-full bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] font-bold" disabled>
                  Konfirmasi Manual (Hubungi Admin)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
