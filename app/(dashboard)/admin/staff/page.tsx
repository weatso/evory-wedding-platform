import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCog } from "lucide-react";

export default async function GlobalStaffPage() {
  const session = await auth();
  if (!session || session.user.systemRole !== "SUPERADMIN") redirect("/dashboard");

  // Ambil hanya user yang memiliki role SUPERADMIN
  const staffMembers = await prisma.user.findMany({
    where: { systemRole: "SUPERADMIN" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#07303F]">
            <ShieldCheck className="w-6 h-6" />
            <h1 className="text-3xl md:text-4xl font-serif italic font-bold">
              Tim Internal (Pusat)
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Manajemen Staf & Akses Level Evory Global
          </p>
        </div>
        
        <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-white rounded-md shadow-sm">
                <UserCog className="w-5 h-5 text-slate-500" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Staf</p>
                <p className="text-lg font-bold text-[#07303F]">{staffMembers.length} Orang</p>
            </div>
        </div>
      </div>

      {/* TABEL STAF */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#F9F8F4] border-b border-slate-200">
              <TableRow>
                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] py-4">Nama Staf</TableHead>
                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] py-4">Email Akses</TableHead>
                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] py-4">Otoritas</TableHead>
                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] py-4 text-right">Bergabung Sejak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {staffMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                    <p className="font-medium text-sm">Belum ada staf terdaftar.</p>
                  </TableCell>
                </TableRow>
              ) : (
                staffMembers.map(staff => (
                  <TableRow key={staff.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-[#07303F] py-4">
                        {staff.name || "Anonim"}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm font-mono py-4">
                        {staff.email}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className="bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] font-bold tracking-widest text-[9px] uppercase border border-[#E5C185]/30">
                        Global Admin
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs text-right font-medium py-4">
                      {new Date(staff.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
