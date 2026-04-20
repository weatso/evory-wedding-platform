import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminUsersPage() {
    const session = await auth();
    if (session?.user?.systemRole !== "SUPERADMIN") redirect("/dashboard");

    // Tarik data pengguna beserta jumlah keanggotaan workspace mereka
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
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
                    <p className="text-slate-500 text-sm mt-1">Pantau seluruh pengguna dalam ekosistem Evory.</p>
                </div>
                {/* Asumsikan Anda memiliki komponen modal untuk tambah staff cepat */}
                {/* <AddStaffModal roleOptions={["SUPERADMIN", "USER"]} /> */}
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-200">
                            <TableRow>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Nama</TableHead>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Email</TableHead>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Otoritas</TableHead>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Agensi/Workspace</TableHead>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-right">Terdaftar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-bold text-[#07303F]">{user.name || "Anonim"}</TableCell>
                                    <TableCell className="text-slate-600 text-sm">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            user.systemRole === "SUPERADMIN" ? "bg-red-50 text-red-700 border-red-200 font-bold" :
                                            "bg-slate-100 text-slate-600 border-slate-200 font-bold"
                                        }>
                                            {user.systemRole}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] border-0 font-bold">
                                            {user._count.workspaces} Workspace
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs text-right font-medium">
                                        {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}