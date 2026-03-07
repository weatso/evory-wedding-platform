import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createInvitationAction } from "../../../(dashboard)/admin/actions";

export default async function AdminCreateInvitationPage() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/");

    // 1. Ambil Data User (Hanya Client) & Template untuk Dropdown
    const clients = await prisma.user.findMany({
        where: { role: "CLIENT" },
        select: { id: true, name: true, email: true } // Ambil yg perlu aja
    });

    const templates = await prisma.template.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true }
    });

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex justify-center">
            <Card className="w-full max-w-2xl shadow-lg h-fit">
                <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                    <CardTitle>Buat Undangan Baru (Admin Mode)</CardTitle>
                    <p className="text-sm text-slate-400">Input data klien untuk mengaktifkan dashboard mereka.</p>
                </CardHeader>

                <CardContent className="p-6">
                    <form action={async (formData) => {
                        "use server";
                        await createInvitationAction(formData);
                    }} className="space-y-6">

                        {/* --- BAGIAN 1: PILIH KLIEN & TEMPLATE --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-100 rounded-lg">
                            <div className="space-y-2">
                                <Label>Pilih Client</Label>
                                <select
                                    name="userId"
                                    className="w-full p-2 border rounded-md text-sm bg-white"
                                    required
                                >
                                    <option value="">-- Pilih User --</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Pilih Template</Label>
                                <select
                                    name="templateId"
                                    className="w-full p-2 border rounded-md text-sm bg-white"
                                    required
                                >
                                    <option value="">-- Pilih Desain --</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.slug})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* --- BAGIAN 2: URL SLUG --- */}
                        <div className="space-y-2">
                            <Label>URL Undangan (Slug)</Label>
                            <div className="flex items-center gap-2">
                                <span className="bg-slate-200 px-3 py-2 rounded-l-md text-sm border border-r-0 border-slate-300">
                                    evory.id/invitation/
                                </span>
                                <Input
                                    name="slug"
                                    placeholder="romeo-juliet"
                                    className="rounded-l-none"
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Gunakan huruf kecil dan tanda strip (-). Contoh: andi-budi</p>
                        </div>

                        {/* --- BAGIAN 3: DATA MEMPELAI --- */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nama Panggilan Pria</Label>
                                <Input name="groomNick" placeholder="Romeo" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Nama Lengkap Pria</Label>
                                <Input name="groomName" placeholder="Romeo Montague" required />
                            </div>

                            <div className="space-y-2">
                                <Label>Nama Panggilan Wanita</Label>
                                <Input name="brideNick" placeholder="Juliet" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Nama Lengkap Wanita</Label>
                                <Input name="brideName" placeholder="Juliet Capulet" required />
                            </div>
                        </div>

                        {/* --- BAGIAN 4: ACARA --- */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tanggal Acara</Label>
                                <Input type="date" name="eventDate" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Lokasi (Kota/Gedung)</Label>
                                <Input name="location" placeholder="Gedung Arsip Nasional, Jakarta" required />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-6">
                            Simpan & Aktifkan Undangan
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}