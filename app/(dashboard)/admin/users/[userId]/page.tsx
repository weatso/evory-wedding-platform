import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, QrCode, Briefcase, DollarSign, ShieldAlert } from "lucide-react";
import Link from "next/link";
import RoleManager from "../../_components/RoleManager";
import IdentityForm from "./_components/IdentityForm";
import DirectAssignAgencyModal from "./_components/DirectAssignAgencyModal";

export default async function UserDetailPage({
    params
}: {
    params: Promise<{ userId: string }>
}) {
    const session = await auth();
    if (session?.user?.systemRole !== "SUPERADMIN") redirect("/dashboard");

    const resolvedParams = await params;
    const { userId } = resolvedParams;

    const userProfile = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            checkInsPerformed: true,
            workspaces: {
                include: {
                    workspace: {
                        include: {
                            projects: true
                        }
                    }
                }
            }
        }
    });

    if (!userProfile) redirect("/404");

    // Identifikasi Kasta Entitas
    const isSuperadmin = userProfile.systemRole === "SUPERADMIN";
    const isWaiting = userProfile.systemRole === "WAITING";
    const isOwner = userProfile.workspaces.some(w => w.role === "OWNER");
    const isUsher = userProfile.workspaces.some(w => w.role === "USHER");
    const isIndependent = userProfile.workspaces.length === 0 && !isSuperadmin && !isWaiting;

    // Kalkulasi Statistik Dasar
    const totalScans = userProfile.checkInsPerformed.length;
    
    // Kalkulasi Billing Khusus OWNER
    const ownedWorkspaces = userProfile.workspaces.filter(w => w.role === "OWNER").map(w => w.workspace);
    const ownedProjects = ownedWorkspaces.flatMap(w => w.projects);
    
    const totalBilling = ownedProjects.reduce((sum, p) => sum + p.agencyCost, 0);
    const unpaidBilling = ownedProjects.filter(p => p.paymentStatus !== "PAID").reduce((sum, p) => sum + p.agencyCost, 0);

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/users" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-3xl font-serif italic font-bold text-[#07303F]">Profil Pengguna</h1>
                    <p className="text-slate-500 text-sm mt-1">Detail entitas: {isSuperadmin ? "Superadmin Pusat" : isOwner ? "Pemilik Agensi" : isUsher ? "Penerima Tamu (Usher)" : isWaiting ? "Pelamar (Pending)" : "Staf/Klien"}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Kolom Kiri: Identitas Utama (Ditampilkan untuk SEMUA ROLE) */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="h-24 bg-[#07303F] relative">
                            <div className="absolute -bottom-8 left-6 w-16 h-16 bg-[#E5C185] rounded-full flex items-center justify-center border-4 border-white text-2xl font-serif font-bold text-[#07303F]">
                                {userProfile.name?.[0]?.toUpperCase() || "A"}
                            </div>
                        </div>
                        <CardContent className="pt-12 px-6 pb-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-[#07303F]">{userProfile.name || "Anonim"}</h2>
                                    <p className="text-sm text-slate-500">{userProfile.email}</p>
                                </div>
                                <Badge variant="outline" className={
                                    isSuperadmin ? "bg-red-50 text-red-700 border-red-200" :
                                    isWaiting ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" :
                                    "bg-slate-100 text-slate-600 border-slate-200"
                                }>
                                    {userProfile.systemRole}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Kontrol Akses Pusat</p>
                                    <RoleManager userId={userProfile.id} currentRole={userProfile.systemRole} />
                                </div>
                                <hr className="border-slate-100" />
                                <IdentityForm user={userProfile} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metrik Usher: HANYA DITAMPILKAN UNTUK USHER */}
                    {isUsher && !isSuperadmin && (
                        <Card className="border-slate-200 shadow-sm animate-in zoom-in-95 duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <QrCode className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tamu Di-Scan</p>
                                        <p className="text-2xl font-serif text-[#07303F]">{totalScans} <span className="text-sm font-sans text-slate-400 font-normal">tamu</span></p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Kolom Kanan: Keanggotaan & Billing */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Ringkasan Billing: HANYA DITAMPILKAN UNTUK PEMILIK AGENSI */}
                    {isOwner && !isSuperadmin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-500">
                            <Card className="bg-[#07303F] text-white shadow-xl">
                                <CardContent className="p-6">
                                    <p className="text-xs font-bold text-[#E5C185] uppercase tracking-widest mb-1">Total Nilai Proyek</p>
                                    <p className="text-3xl font-serif">Rp {totalBilling.toLocaleString('id-ID')}</p>
                                    <p className="text-xs text-white/50 mt-2">Dari {ownedProjects.length} acara yang dibuat.</p>
                                </CardContent>
                            </Card>
                            <Card className={unpaidBilling > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
                                <CardContent className="p-6">
                                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${unpaidBilling > 0 ? "text-red-600" : "text-green-600"}`}>
                                        Tagihan Tertunggak (Unpaid)
                                    </p>
                                    <p className={`text-3xl font-serif ${unpaidBilling > 0 ? "text-red-700" : "text-green-700"}`}>
                                        Rp {unpaidBilling.toLocaleString('id-ID')}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Jika Dia Adalah Superadmin */}
                    {isSuperadmin && (
                        <Card className="border-amber-200 bg-amber-50 shadow-sm">
                            <CardContent className="p-8 text-center text-amber-800">
                                <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-amber-500 opacity-50" />
                                <h3 className="font-bold text-lg mb-2">Profil Administrator Pusat</h3>
                                <p className="text-sm">Pengguna ini adalah Superadmin yang memiliki otoritas tidak terbatas atas semua entitas. Metrik level agensi dinonaktifkan untuk profil ini.</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tabel Keanggotaan Workspace: DITAMPILKAN JIKA BUKAN SUPERADMIN */}
                    {!isSuperadmin && (
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-[#07303F] flex items-center gap-2">
                                        <Briefcase className="w-5 h-5" /> Keterlibatan Agensi
                                    </CardTitle>
                                    <DirectAssignAgencyModal userId={userProfile.id} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isIndependent || isWaiting ? (
                                    <div className="p-8 text-center text-slate-500 text-sm bg-slate-50/50">
                                        Pengguna ini belum terikat dengan agensi/ruang kerja manapun. Anda dapat mengeklik "Buat Agensi" di atas untuk memberinya sebuah *Workspace* mandiri.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="font-bold text-[#07303F] text-xs">Agensi</TableHead>
                                                <TableHead className="font-bold text-[#07303F] text-xs">Peran (Role)</TableHead>
                                                <TableHead className="font-bold text-[#07303F] text-xs text-right">Jumlah Proyek</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {userProfile.workspaces.map(w => (
                                                <TableRow key={w.id}>
                                                    <TableCell className="font-bold text-[#07303F]">{w.workspace.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={
                                                            w.role === "OWNER" ? "bg-red-50 text-red-700 border-red-200 font-bold" :
                                                            "bg-blue-50 text-blue-700 border-blue-200 font-bold"
                                                        }>
                                                            {w.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-slate-600">
                                                        {w.workspace.projects.length}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Tabel Laporan Proyek: HANYA UNTUK OWNER */}
                    {isOwner && !isSuperadmin && (
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
                                <CardTitle className="text-lg font-bold text-[#07303F] flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" /> Laporan Tagihan Proyek
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {ownedProjects.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm">
                                        Agensi ini belum memiliki proyek sama sekali.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="font-bold text-[#07303F] text-xs">Nama Acara</TableHead>
                                                <TableHead className="font-bold text-[#07303F] text-xs">Dibuat</TableHead>
                                                <TableHead className="font-bold text-[#07303F] text-xs">Status Pembayaran</TableHead>
                                                <TableHead className="font-bold text-[#07303F] text-xs text-right">Tagihan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ownedProjects.map(project => (
                                                <TableRow key={project.id}>
                                                    <TableCell className="font-bold text-[#07303F]">{project.title}</TableCell>
                                                    <TableCell className="text-slate-500 text-xs">
                                                        {new Date(project.createdAt).toLocaleDateString('id-ID')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={
                                                            project.paymentStatus === "PAID" ? "bg-green-50 text-green-700 border-green-200 font-bold" :
                                                            "bg-red-50 text-red-700 border-red-200 font-bold"
                                                        }>
                                                            {project.paymentStatus}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-[#07303F]">
                                                        Rp {project.agencyCost.toLocaleString('id-ID')}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
