import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, TrendingUp, Building2, Package, Banknote } from "lucide-react";
import PaymentStatusDropdown from "./_components/PaymentStatusDropdown";
import PeriodFilter from "./_components/PeriodFilter";

// Fungsi format rupiah
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

export default async function RevenueFinancePage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();
  if (!session || session.user.systemRole !== "SUPERADMIN") redirect("/dashboard");

  const resolvedParams = await searchParams;
  const period = (resolvedParams.period as string) || "all";
  const customFrom = resolvedParams.from as string;
  const customTo = resolvedParams.to as string;
  const filterMonth = resolvedParams.month ? parseInt(resolvedParams.month as string) : new Date().getMonth();
  const filterYear = resolvedParams.year ? parseInt(resolvedParams.year as string) : new Date().getFullYear();

  // Konfigurasi Filter Waktu (Date Range)
  let dateFilter = {};
  
  if (period === "month") {
    dateFilter = {
      gte: new Date(filterYear, filterMonth, 1),
      lte: new Date(filterYear, filterMonth + 1, 0, 23, 59, 59)
    };
  } else if (period === "year") {
    dateFilter = {
      gte: new Date(filterYear, 0, 1),
      lte: new Date(filterYear, 11, 31, 23, 59, 59)
    };
  } else if (period === "custom" && customFrom && customTo) {
    dateFilter = {
      gte: new Date(`${customFrom}T00:00:00`),
      lte: new Date(`${customTo}T23:59:59`)
    };
  }

  // Ambil semua proyek dengan info harga dan status, filter berdasarkan waktu jika ada
  const projects = await prisma.project.findMany({
    where: period !== "all" ? { createdAt: dateFilter } : {},
    include: {
      workspace: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" }
  });

  const allWorkspaces = await prisma.workspace.findMany({
    select: { walletBalance: true }
  });
  
  const totalLiability = allWorkspaces.reduce((sum, w) => sum + w.walletBalance, 0);

  const walletTransactions = await prisma.walletTransaction.findMany({
    where: period !== "all" ? { createdAt: dateFilter } : {},
    include: {
      workspace: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  // ==========================================
  // KALKULASI METRIK
  // ==========================================
  
  // 1. Total Revenue (PAID) & Piutang (UNPAID/PENDING)
  let totalRevenue = 0;
  let totalReceivable = 0;
  
  // 2. Statistik Berdasarkan Kategori Tier
  const tierStats: Record<string, { count: number, revenue: number }> = {
    ESSENTIAL: { count: 0, revenue: 0 },
    PRESTIGE: { count: 0, revenue: 0 },
    ROYAL: { count: 0, revenue: 0 },
    CUSTOM: { count: 0, revenue: 0 },
  };

  // 3. Statistik Top Agensi (WO)
  const agencyStats: Record<string, { name: string, totalProjects: number, totalRevenue: number }> = {};

  projects.forEach(p => {
    const price = p.agencyCost || 0;
    
    // Hitung Revenue / Piutang
    if (p.paymentStatus === "PAID") {
      totalRevenue += price;
      
      // Hitung per Tier (hanya yang sudah bayar)
      if (tierStats[p.packageTier]) {
        tierStats[p.packageTier].count += 1;
        tierStats[p.packageTier].revenue += price;
      }
      
      // Hitung per Agensi (hanya yang sudah bayar)
      if (!agencyStats[p.workspaceId]) {
        agencyStats[p.workspaceId] = { name: p.workspace.name, totalProjects: 0, totalRevenue: 0 };
      }
      agencyStats[p.workspaceId].totalProjects += 1;
      agencyStats[p.workspaceId].totalRevenue += price;

    } else {
      totalReceivable += price;
    }
  });

  // Urutkan Agensi (Top 5)
  const topAgencies = Object.values(agencyStats)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500 max-w-[1400px]">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div className="w-full lg:w-auto">
          <div className="flex items-center gap-2 mb-2 text-[#07303F]">
            <Wallet className="w-7 h-7" />
            <h1 className="text-3xl md:text-4xl font-serif italic font-bold">
              Revenue & Finance
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Pusat Visibilitas Keuangan B2B Evory
          </p>
        </div>
        
        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 w-full lg:w-auto overflow-x-auto flex-shrink-0">
            <PeriodFilter />
        </div>
      </div>

      {/* METRIK KEUANGAN UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOTAL REVENUE */}
        <div className="lg:col-span-2 bg-[#07303F] rounded-2xl p-8 relative overflow-hidden shadow-lg border border-[#07303F]">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#E5C185]/80 mb-2">Total Pendapatan Bersih (Paid)</p>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">{formatIDR(totalRevenue)}</h3>
            <p className="text-xs text-slate-300 font-medium">Diakumulasi dari seluruh acara yang telah berstatus Lunas.</p>
          </div>
          <TrendingUp className="absolute -bottom-8 -right-4 w-48 h-48 text-[#E5C185] opacity-10" />
        </div>

        {/* PIUTANG */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-50 rounded-lg">
                    <Banknote className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Saldo Mengendap (Liability)</p>
            </div>
            <h3 className="text-2xl font-bold text-[#07303F]">{formatIDR(totalLiability)}</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Nilai saldo agensi yang belum dibelanjakan (Kewajiban).</p>
        </div>

        {/* TOP TIER */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <Package className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Penjualan Paket</p>
            </div>
            <div className="space-y-2 mt-1">
                <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#07303F]">Royal</span>
                    <span className="text-slate-500">{tierStats.ROYAL.count} Acara</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#07303F]">Prestige</span>
                    <span className="text-slate-500">{tierStats.PRESTIGE.count} Acara</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#07303F]">Essential</span>
                    <span className="text-slate-500">{tierStats.ESSENTIAL.count} Acara</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: DAFTAR TRANSAKSI/PENAGIHAN (Tabel Lebar) */}
        <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-[#07303F] flex items-center gap-2">
                Buku Penagihan (Billing Ledger)
            </h2>
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-0 overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                    <TableRow>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Tanggal</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Agensi</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Deskripsi Transaksi</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-right">Tipe</TableHead>
                        <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-right">Nominal</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                    {walletTransactions.length === 0 ? (
                        <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                            <p className="font-medium text-sm">Belum ada transaksi terekam.</p>
                        </TableCell>
                        </TableRow>
                    ) : (
                        walletTransactions.map(tx => (
                        <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="py-3 text-xs text-slate-500">
                                {tx.createdAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell className="py-3">
                                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{tx.workspace.name}</span>
                            </TableCell>
                            <TableCell className="py-3">
                                <span className="text-xs text-slate-700">{tx.description}</span>
                            </TableCell>
                            <TableCell className="text-right py-3">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${tx.type === 'TOPUP' ? 'bg-indigo-50 text-indigo-700' : tx.type === 'PAYMENT' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {tx.type}
                                </span>
                            </TableCell>
                            <TableCell className="text-right py-3">
                                <span className={`text-sm font-bold font-mono ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {tx.amount > 0 ? '+' : ''}{formatIDR(tx.amount)}
                                </span>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>

        {/* KOLOM KANAN: STATISTIK AGENSI TERATAS */}
        <div className="space-y-4">
             <h2 className="text-lg font-bold text-[#07303F] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#E5C185]" /> Top Spender Agencies
            </h2>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 divide-y divide-slate-100">
                {topAgencies.length === 0 ? (
                     <p className="text-xs text-center text-slate-400 py-4">Belum ada data pendapatan agensi.</p>
                ) : (
                    topAgencies.map((agency, index) => (
                        <div key={index} className="py-4 first:pt-1 last:pb-1 flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${
                                    index === 0 ? 'bg-[#E5C185] text-[#07303F]' : 
                                    index === 1 ? 'bg-slate-200 text-slate-600' :
                                    index === 2 ? 'bg-amber-700/20 text-amber-800' : 'bg-slate-50 text-slate-400'
                                }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-[#07303F] line-clamp-1">{agency.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{agency.totalProjects} Acara Selesai</p>
                                </div>
                            </div>
                            <p className="font-bold text-sm font-mono text-emerald-600 group-hover:scale-105 transition-transform">
                                {formatIDR(agency.totalRevenue)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>

    </div>
  );
}
