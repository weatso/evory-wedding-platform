import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import InviteTeamModal from "./_components/InviteTeamModal";

export default async function WorkspaceTeamPage({
    params
}: {
    params: Promise<{ workspaceSlug: string }>
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const resolvedParams = await params;
    const { workspaceSlug } = resolvedParams;

    const workspace = await prisma.workspace.findUnique({
        where: { slug: workspaceSlug },
        include: {
            members: {
                include: { user: true },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!workspace) redirect("/404");

    // Pastikan user ini adalah bagian dari workspace
    const currentUserMember = workspace.members.find(m => m.userId === session.user.id);
    if (!currentUserMember && session.user.systemRole !== "SUPERADMIN") redirect("/unauthorized");

    const isOwner = currentUserMember?.role === "OWNER" || session.user.systemRole === "SUPERADMIN";

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif italic font-bold text-[#07303F]">Tim Internal</h1>
                    <p className="text-slate-500 text-sm mt-1">Kelola staf dan usher yang memiliki akses ke ruang kerja Anda.</p>
                </div>
                {isOwner && (
                    <InviteTeamModal workspaceId={workspace.id} />
                )}
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-200">
                            <TableRow>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Nama</TableHead>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Email</TableHead>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px]">Peran (Role)</TableHead>
                                <TableHead className="font-bold text-[#07303F] uppercase tracking-widest text-[10px] text-right">Bergabung Pada</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workspace.members.map(member => (
                                <TableRow key={member.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-bold text-[#07303F]">{member.user.name || "Anonim"}</TableCell>
                                    <TableCell className="text-slate-600 text-sm">{member.user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            member.role === "OWNER" ? "bg-red-50 text-red-700 border-red-200 font-bold" :
                                            member.role === "STAFF" ? "bg-blue-50 text-blue-700 border-blue-200 font-bold" :
                                            "bg-slate-100 text-slate-600 border-slate-200 font-bold"
                                        }>
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs text-right font-medium">
                                        {new Date(member.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
