'use client';

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateInvitation } from "../../actions"; 
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

// Generator List Jam (07:00 - 21:00)
const HOURS = Array.from({ length: 15 }, (_, i) => {
    const h = i + 7; // Mulai jam 07:00
    return `${h.toString().padStart(2, '0')}:00`;
});

const TIMEZONES = ["WIB", "WITA", "WIT"];

export default function EditInvitationForm({ invitation }: { invitation: any }) {
  const [state, formAction, isPending] = useActionState(
    updateInvitation.bind(null, invitation.id),
    null
  );

  // Parsing Data Lama
  const dateStr = invitation.eventDate 
    ? new Date(invitation.eventDate).toISOString().split('T')[0] 
    : '';

  // Mencoba menebak jam lama dari string "08:00 WIB" agar dropdown terpilih otomatis
  // Jika format lama tidak standar, default ke "08:00"
  const defaultTime = invitation.eventTime?.slice(0, 5) || "08:00"; 
  const defaultZone = invitation.eventTime?.slice(6, 9) || "WIB";

  return (
    <form action={formAction} className="space-y-6">
            
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-200">
          ⚠️ {state.error}
        </div>
      )}

      {/* --- MEMPELAI --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label>Nama Lengkap Pria</Label>
              <Input name="groomName" defaultValue={invitation.groomName} required />
          </div>
          <div className="space-y-2">
              <Label>Nama Panggilan Pria</Label>
              <Input name="groomNick" defaultValue={invitation.groomNick} required />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label>Nama Lengkap Wanita</Label>
              <Input name="brideName" defaultValue={invitation.brideName} required />
          </div>
          <div className="space-y-2">
              <Label>Nama Panggilan Wanita</Label>
              <Input name="brideNick" defaultValue={invitation.brideNick} required />
          </div>
      </div>

      <div className="space-y-2">
          <Label>Slug URL</Label>
          <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm font-mono bg-slate-100 px-2 py-2 rounded-l border border-r-0 border-slate-200">/invitation/</span>
              <Input name="slug" defaultValue={invitation.slug} required className="rounded-l-none" />
          </div>
      </div>

      {/* --- BAGIAN TANGGAL & WAKTU (UPDATED UX) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div className="space-y-2">
            <Label>Tanggal Acara</Label>
            <Input type="date" name="eventDate" defaultValue={dateStr} required className="bg-white" />
        </div>
        
        {/* DROPDOWN JAM */}
        <div className="space-y-2">
            <Label>Jam Mulai</Label>
            <select name="selectedTime" defaultValue={defaultTime} className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {HOURS.map(h => (
                    <option key={h} value={h}>{h}</option>
                ))}
            </select>
        </div>

        {/* DROPDOWN ZONA */}
        <div className="space-y-2">
            <Label>Zona Waktu</Label>
            <select name="selectedZone" defaultValue={defaultZone} className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {TIMEZONES.map(z => (
                    <option key={z} value={z}>{z}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="space-y-2">
          <Label>Lokasi Acara</Label>
          <Input name="location" defaultValue={invitation.location} required />
      </div>

      <div className="flex gap-3 pt-6 border-t border-slate-100 mt-6">
          <Link href="/admin" className="w-1/3">
              <Button type="button" variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" /> Batal
              </Button>
          </Link>
          <Button type="submit" disabled={isPending} className="w-2/3 bg-slate-900 hover:bg-slate-800 text-white gap-2">
              {isPending ? "Menyimpan..." : <><Save className="w-4 h-4"/> Simpan Data</>}
          </Button>
      </div>

    </form>
  );
}