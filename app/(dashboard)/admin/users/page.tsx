import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AddStaffModal from "../_components/AddStaffModal"; 
import AssignAgencyModal from "../_components/AssignAgencyModal"; 
import RoleManager from "../_components/RoleManager";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getEntityLabel(workspaces: { role: string }[], systemRole: string) {
    if (systemRole === "SUPERADMIN") return { label: "Superadmin Pusat", color: "bg-red-100 text-red-800" };
    if (systemRole === "WAITING") return { label: "Pelamar (Pending)", color: "bg-amber-100 text-amber-800" };
    
    if (workspaces.length === 0) return { label: "Independen / Tamu", color: "bg-slate-100 text-slate-600" };
    
    const roles = workspaces.map(w => w.role);
    if (roles.includes("OWNER")) return { label: "Pemilik Agensi", color: "bg-purple-100 text-purple-800" };
    if (roles.includes("ADMIN")) return { label: "Manajer Agensi", color: "bg-blue-100 text-blue-800" };
    if (roles.includes("STAFF")) return { label: "Staf Agensi", color: "bg-cyan-100 text-cyan-800" };
    if (roles.includes("USHER")) return { label: "Usher (Penerima Tamu)", color: "bg-emerald-100 text-emerald-800" };
    
    return { label: "Anggota Agensi", color: "bg-slate-100 text-slate-800" };
}

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const session = await auth();
    if (session?.user?.systemRole !== "SUPERADMIN") redirect("/");

    const resolvedParams = await searchParams;
    const currentPage = parseInt(resolvedParams.page || "1", 10);
    const pageSize = 10;
    const skip = (currentPage - 1) * pageSize;

    const totalUsers = await prisma.user.count();
    const totalPages = Math.ceil(totalUsers / pageSize);

    const users = await prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
            workspaces: {
                select: { role: true }
            },
            _count: {
                select: { workspaces: true } 
            }
        }
    });

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif italic font-bold text-[#07303F]">Manajemen Klien & Tim</h1>
                    <p className="text-slate-500 text-sm mt-1">Kelola hak akses, entitas, dan alokasi ruang kerja.</p>
                </div>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-sm font-medium text-slate-500">
                    Total: <span className="text-[#07303F] font-bold">{totalUsers} Pengguna</span>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-200">
                            <TableRow>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Nama & Kontak</TableHead>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Kategori Entitas</TableHead>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">System Role</TableHead>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-right">Terdaftar</TableHead>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => {
                                const entity = getEntityLabel(user.workspaces, user.systemRole);
                                
                                return (
                                <TableRow key={user.id} className="hover:bg-slate-50/50">
                                    <TableCell>
                                        <div className="font-bold text-[#07303F]">{user.name || "Anonim"}</div>
                                        <div className="text-slate-500 text-xs">{user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={`${entity.color} border-0 font-bold hover:${entity.color}`}>
                                            {entity.label}
                                        </Badge>
                                        {user._count.workspaces > 1 && (
                                            <span className="text-[10px] text-slate-400 ml-2">({user._count.workspaces} Agensi)</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            user.systemRole === "SUPERADMIN" ? "bg-red-50 text-red-700 border-red-200 font-bold" :
                                            user.systemRole === "WAITING" ? "bg-amber-50 text-amber-700 border-amber-200 font-bold animate-pulse" :
                                            "bg-slate-100 text-slate-600 border-slate-200 font-bold"
                                        }>
                                            {user.systemRole === "WAITING" ? "BUTUH PERSETUJUAN" : user.systemRole}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs text-right font-medium">
                                        {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            <RoleManager 
                                                userId={user.id} 
                                                currentRole={user.systemRole} 
                                                userEmail={user.email ?? undefined} 
                                                isAgency={user._count.workspaces > 0}
                                            />
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button size="sm" variant="ghost" className="h-7 px-2 text-slate-500 hover:text-[#07303F]">
                                                    Detail
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                            <div className="text-xs text-slate-500 font-medium">
                                Halaman <span className="font-bold text-[#07303F]">{currentPage}</span> dari {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Link href={currentPage > 1 ? `/admin/users?page=${currentPage - 1}` : '#'}>
                                    <Button variant="outline" size="sm" disabled={currentPage <= 1} className="h-8">
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                    </Button>
                                </Link>
                                <Link href={currentPage < totalPages ? `/admin/users?page=${currentPage + 1}` : '#'}>
                                    <Button variant="outline" size="sm" disabled={currentPage >= totalPages} className="h-8">
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}