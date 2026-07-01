import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Wallet, BadgeCheck, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayProjectButton, RefundProjectButton } from "./_components/BillingActionButtons";

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

export default async function AgencyBillingPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const { workspaceSlug } = resolvedParams;

  // 1. Ambil data Workspace beserta Projects
  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    include: {
      walletTransactions: {
        orderBy: { createdAt: "desc" },
        take: 10
      },
      projects: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          agencyCost: true,
          clientInvoiceAmount: true,
          paymentStatus: true,
          packageTier: true
        }
      }
    }
  });

  if (!workspace) redirect("/404");

  // 2. Multi-Tenancy Guard
  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId: workspace.id } }
    });
    if (!isMember) redirect("/unauthorized");
  }

  // 3. Kalkulasi Billing
  let totalUnpaid = 0;
  let totalPaid = 0;
  let totalGrossProfit = 0;
  
  workspace.projects.forEach(project => {
      if (project.paymentStatus === "UNPAID") {
          totalUnpaid += project.agencyCost;
      } else if (project.paymentStatus === "PAID") {
          totalPaid += project.agencyCost;
          if (project.clientInvoiceAmount > project.agencyCost) {
            totalGrossProfit += (project.clientInvoiceAmount - project.agencyCost);
          }
      }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px]">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#07303F]">
            <CreditCard className="w-7 h-7" />
            <h1 className="text-3xl md:text-4xl font-serif italic font-bold">
              Billing & Keuangan
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Status Keuangan & Tagihan {workspace.name}
          </p>
        </div>
      </div>

      {/* METRIK KEUANGAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#07303F] text-white shadow-xl relative overflow-hidden">
            {/* Dekorasi BG */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            
            <CardContent className="p-6 relative z-10 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-[#E5C185] uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Wallet className="w-3 h-3" /> Saldo Dompet Agensi
                    </p>
                    <p className="text-3xl font-serif mt-2">{formatIDR(workspace.walletBalance)}</p>
                    <p className="text-xs text-white/50 mt-2 font-mono">
                        Gunakan saldo ini untuk mengaktifkan proyek klien.
                    </p>
                </div>
            </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm relative overflow-hidden bg-white">
            <CardContent className="p-6 relative z-10">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Total Laba Bersih (P&L)
                </p>
                <p className="text-3xl font-serif text-[#07303F] mt-2">+ {formatIDR(totalGrossProfit)}</p>
                <p className="text-xs text-slate-500 mt-2 font-mono">
                    Total keuntungan dari selisih Harga Jual dan Modal Evory.
                </p>
            </CardContent>
            <div className="absolute right-0 bottom-0 p-4 opacity-[0.03]">
                <BadgeCheck className="w-24 h-24" />
            </div>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-slate-50">
            <CardContent className="p-6 flex flex-col justify-center h-full">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <BadgeCheck className="w-3 h-3 text-red-500" /> Total Tagihan Belum Dibayar
                </p>
                <p className="text-3xl font-serif text-[#07303F] mt-2">{formatIDR(totalUnpaid)}</p>
            </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6 flex flex-col justify-center h-full">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Status Paket Agensi
                </p>
                <div className="flex items-center gap-3 mt-2">
                    <span className="bg-[#E5C185]/20 text-[#b59050] px-4 py-2 rounded-lg font-bold font-mono tracking-widest text-lg">
                        Status Keanggotaan Aktif
                    </span>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                        AKTIF
                    </span>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* INVOICE LEDGER */}
      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white mt-8">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-[#07303F] text-lg">Riwayat Transaksi Acara</h3>
            </div>
            <div className="flex items-center gap-2">
                <Button className="bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] font-bold h-9 text-xs" asChild>
                    <a href={`https://wa.me/6281234567890?text=Halo%20Admin%20Evory,%20saya%20dari%20agensi%20${workspace.name}%20ingin%20melakukan%20Top%20Up%20Saldo.`} target="_blank" rel="noreferrer">
                        Top Up Saldo
                    </a>
                </Button>
            </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
            <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                    <TableRow>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Nama Acara</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Tanggal Dibuat</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-center">Tipe Sistem</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-right">Modal & Pemasukan</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-center">Status</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                    {workspace.projects.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                <p className="font-medium text-sm">Belum ada transaksi tercatat.</p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        workspace.projects.map(project => (
                            <TableRow key={project.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="py-4">
                                    <p className="font-bold text-[#07303F] text-sm">{project.title}</p>
                                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {project.id.slice(0,8)}</p>
                                </TableCell>
                                <TableCell className="py-4 text-xs text-slate-500">
                                    {new Date(project.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </TableCell>
                                <TableCell className="py-4 text-center">
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        {project.packageTier}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right py-4 font-mono font-bold text-sm">
                                    <div className="flex flex-col items-end">
                                        <span className="text-slate-400 text-xs">Modal: {formatIDR(project.agencyCost)}</span>
                                        <span className="text-emerald-600">Jual: {formatIDR(project.clientInvoiceAmount)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center py-4">
                                    {project.paymentStatus === "PAID" ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                                            <CheckCircle2 className="w-3 h-3" /> LUNAS
                                        </span>
                                    ) : project.paymentStatus === "CANCELLED" ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                                            DIBATALKAN
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                            BELUM DIBAYAR
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right py-4">
                                    {project.paymentStatus === "UNPAID" && (
                                        <PayProjectButton projectId={project.id} amount={project.agencyCost} />
                                    )}
                                    {project.paymentStatus === "PAID" && (
                                        <RefundProjectButton projectId={project.id} amount={project.agencyCost} />
                                    )}
                                    {project.paymentStatus === "CANCELLED" && (
                                        <span className="text-[10px] font-bold text-slate-400">REFUNDED</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* WALLET TRANSACTIONS LEDGER */}
      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white mt-8">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-[#07303F] text-lg">Mutasi Saldo Dompet</h3>
            </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
            <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                    <TableRow>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Tanggal</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Deskripsi</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-center">Tipe</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-right">Nominal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                    {workspace.walletTransactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                                <p className="font-medium text-sm">Belum ada mutasi saldo tercatat.</p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        workspace.walletTransactions.map(tx => (
                            <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="py-4 text-xs text-slate-500">
                                    {new Date(tx.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </TableCell>
                                <TableCell className="py-4">
                                    <p className="font-bold text-[#07303F] text-sm">{tx.description || "-"}</p>
                                    {tx.projectId && <p className="text-[10px] font-mono text-slate-400 mt-0.5">Project ID: {tx.projectId.slice(0,8)}</p>}
                                </TableCell>
                                <TableCell className="py-4 text-center">
                                    {tx.type === "TOPUP" ? (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">TOP UP</span>
                                    ) : tx.type === "REFUND" ? (
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">REFUND</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">PAYMENT</span>
                                    )}
                                </TableCell>
                                <TableCell className={`text-right py-4 font-mono font-bold text-sm ${tx.amount > 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    {tx.amount > 0 ? "+" : ""}{formatIDR(tx.amount)}
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
