import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Briefcase, FolderGit2, DollarSign, Building2, Settings2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

export default async function AdminDashboardPage() {
    const session = await auth();
    if (session?.user?.systemRole !== "SUPERADMIN") redirect("/dashboard");

    // 1. Kalkulasi Metrik Tingkat Tinggi (High-Level Analytics)
    const totalUsers = await prisma.user.count();
    const totalProjects = await prisma.project.count();
    
    // Total Pendapatan (Hanya dari project yang PAID)
    const paidProjects = await prisma.project.findMany({
        where: { paymentStatus: "PAID" },
        select: { agencyCost: true }
    });
    const totalRevenue = paidProjects.reduce((sum, p) => sum + p.agencyCost, 0);

    // 2. Data Agensi (Partner Network)
    const agencies = await prisma.workspace.findMany({
        include: {
            members: { select: { id: true } },
            projects: {
                select: {
                    id: true,
                    paymentStatus: true,
                    agencyCost: true,
                    packageTier: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    const totalWorkspaces = agencies.length;

    // Kalkulasi tambahan per agensi (Revenue & Dominant Tier)
    const processedAgencies = agencies.map(agency => {
        let revenue = 0;
        let eventCount = agency.projects.length;
        
        agency.projects.forEach(p => {
            if (p.paymentStatus === "PAID") revenue += p.agencyCost;
        });

        return {
            ...agency,
            totalRevenue: revenue,
            eventCount,
            memberCount: agency.members.length
        };
    });

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1400px]">
            {/* HEADER */}
            <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#07303F]">
                        <Building2 className="w-7 h-7" />
                        <h1 className="text-3xl md:text-4xl font-serif italic font-bold">
                            Partner Network & Agencies
                        </h1>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                        Pusat Kendali Ekosistem Evory Global
                    </p>
                </div>
            </div>

            {/* Metrik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Pengguna</p>
                            <p className="text-2xl font-bold text-[#07303F]">{totalUsers}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Agensi / WO</p>
                            <p className="text-2xl font-bold text-[#07303F]">{totalWorkspaces}</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Proyek</p>
                            <p className="text-2xl font-bold text-[#07303F]">{totalProjects}</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                            <FolderGit2 className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#07303F] text-white shadow-xl">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-[#E5C185] uppercase tracking-widest mb-1">Global Revenue</p>
                            <p className="text-2xl font-bold font-mono">{formatIDR(totalRevenue)}</p>
                        </div>
                        <div className="w-10 h-10 bg-white/10 text-[#E5C185] rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* TABEL AGENSI (PARTNER LEDGER) */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-[#07303F] text-lg">Direktori Agensi & WO</h3>
                        <p className="text-xs text-slate-500 mt-1">Daftar seluruh entitas bisnis yang tergabung sebagai mitra Evory.</p>
                    </div>
                </div>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                        <TableRow>
                            <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Profil Agensi</TableHead>
                            <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-center">Tim</TableHead>
                            <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-center">Total Proyek</TableHead>
                            <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-right">Total Kontribusi (Omzet)</TableHead>
                            <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-right">Aksi</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100">
                        {processedAgencies.length === 0 ? (
                            <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                                <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                                <p className="font-medium text-sm">Belum ada Agensi/WO yang terdaftar.</p>
                            </TableCell>
                            </TableRow>
                        ) : (
                            processedAgencies.map(agency => (
                            <TableRow key={agency.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-serif text-lg">
                                            {agency.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#07303F] text-sm">{agency.name}</p>
                                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">/{agency.slug}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 text-center">
                                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                        {agency.memberCount} Orang
                                    </span>
                                </TableCell>
                                <TableCell className="py-4 text-center">
                                     <span className="text-xs font-bold text-[#07303F]">
                                        {agency.eventCount} Acara
                                    </span>
                                </TableCell>
                                <TableCell className="text-right py-4">
                                    <span className={`text-sm font-bold font-mono ${agency.totalRevenue > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {formatIDR(agency.totalRevenue)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right py-4">
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-slate-200 text-[#07303F] hover:bg-slate-50" asChild>
                                        <Link href={`/workspace/${agency.slug}`}>
                                            <Settings2 className="w-3 h-3 mr-2" /> Kelola
                                        </Link>
                                    </Button>
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