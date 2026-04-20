import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import CreateProjectForm from "./CreateProjectForm"; // Import otot pengirim data kita

export default async function AdminCreateProjectPage() {
    const session = await auth();
    if (session?.user?.systemRole !== "SUPERADMIN") redirect("/");

    const clients = await prisma.user.findMany({
        where: { systemRole: "USER" },
        select: { id: true, name: true, email: true } 
    });

    const templates = await prisma.template.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true }
    });

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center">
            <Card className="w-full max-w-3xl shadow-lg h-fit border-0">
                <CardHeader className="bg-[#07303F] text-[#F9F8F4] rounded-t-xl">
                    <CardTitle className="text-xl font-serif italic">Inisiasi Ruang Kerja Klien</CardTitle>
                    <p className="text-sm text-slate-300">Alokasikan hak akses layanan SaaS untuk klien baru Anda.</p>
                </CardHeader>

                <CardContent className="p-6 md:p-8 bg-white rounded-b-xl border border-t-0 border-slate-200">
                    <CreateProjectForm clients={clients} templates={templates} />
                </CardContent>
            </Card>
        </div>
    );
}