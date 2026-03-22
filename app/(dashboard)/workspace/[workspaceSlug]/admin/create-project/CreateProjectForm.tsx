"use client";

import { useTransition } from "react";
import { createProjectAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CreateProjectForm({ clients, templates }: { clients: any[], templates: any[] }) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            const res = await createProjectAction(formData);
            if (res?.error) {
                toast.error(res.error); // Menampilkan error spesifik dari server
            }
            // Jika sukses, fungsi redirect di server action akan otomatis membawa Anda ke halaman admin
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- IDENTITAS PROYEK --- */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b pb-2">1. Identitas Proyek</h3>
                
                <div className="space-y-2">
                    <Label className="text-[#07303F] font-bold">Judul Proyek / Campaign</Label>
                    <Input name="title" placeholder="Contoh: Pernikahan Budi & Siti, atau Campaign Bank BCA" required className="bg-slate-50 border-slate-200" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[#07303F] font-bold">Kategori Acara</Label>
                        <select name="eventType" required className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#E5C185]">
                            <option value="WEDDING">Wedding (Pernikahan)</option>
                            <option value="CORPORATE">Corporate (B2B / Brand)</option>
                            <option value="BIRTHDAY">Birthday / Anniversary</option>
                            <option value="CUSTOM">Custom Event</option>
                        </select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-[#07303F] font-bold">Kepemilikan Klien</Label>
                        <select name="userId" required className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#E5C185]">
                            <option value="">-- Pilih Akun Klien --</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* --- ALOKASI LAYANAN --- */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b pb-2">2. Alokasi Layanan SaaS</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="checkbox" name="activeModules" value="ONLINE_INVITATION" className="w-5 h-5 accent-[#07303F]" />
                        <div>
                            <div className="font-bold text-sm text-[#07303F]">Online Invitation</div>
                            <div className="text-[10px] text-slate-500">Website undangan digital interaktif</div>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="checkbox" name="activeModules" value="RSVP_VENUE_SYSTEM" className="w-5 h-5 accent-[#07303F]" />
                        <div>
                            <div className="font-bold text-sm text-[#07303F]">RSVP & QR Check-in</div>
                            <div className="text-[10px] text-slate-500">Sistem buku tamu dan manajemen venue</div>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="checkbox" name="activeModules" value="CONTENT_CREATION" className="w-5 h-5 accent-[#E5C185]" />
                        <div>
                            <div className="font-bold text-sm text-[#07303F]">Content Creation (WCC)</div>
                            <div className="text-[10px] text-slate-500">Akses ke ruang kerja media (The Vault)</div>
                        </div>
                    </label>
                </div>
            </div>

            {/* --- SETUP INFRASTRUKTUR --- */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b pb-2">3. Konfigurasi Infrastruktur</h3>
                
                <div className="space-y-2">
                    <Label className="text-[#07303F] font-bold">Routing Path (Slug / URL)</Label>
                    <div className="flex items-center shadow-sm">
                        <span className="bg-[#07303F] text-white px-4 py-2.5 rounded-l-md text-xs font-mono">
                            evory.id/
                        </span>
                        <Input name="slug" placeholder="bca-campaign-2026" required className="rounded-l-none border-l-0 bg-slate-50 focus-visible:ring-0 focus-visible:border-slate-300" />
                    </div>
                    <p className="text-[10px] text-slate-500">Wajib huruf kecil dan strip. Contoh: andi-siti-2026</p>
                </div>

                <div className="space-y-2 pt-2">
                    <Label className="text-[#07303F] font-bold">Template Desain (Opsional)</Label>
                    <select name="templateId" className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#E5C185]">
                        <option value="">-- Kosongkan jika Klien WCC --</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>
                        ))}
                    </select>
                </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full bg-[#E5C185] hover:bg-[#d4b074] text-[#07303F] font-bold uppercase tracking-widest text-xs py-6 shadow-lg shadow-[#E5C185]/20">
                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sedang Membangun Proyek...</> : "Eksekusi Pembuatan Proyek"}
            </Button>
        </form>
    );
}