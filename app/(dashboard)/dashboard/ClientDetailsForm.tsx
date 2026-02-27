"use client";

import { useState, useTransition } from "react";
import { updateClientDetails } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function ClientDetailsForm({ invitation }: { invitation: any }) {
  const [isPending, startTransition] = useTransition();

  // Format tanggal untuk input type="date"
  const dateStr = invitation.eventDate 
    ? new Date(invitation.eventDate).toISOString().split('T')[0] 
    : '';
  
  // Memisahkan "08:00 WIB" menjadi "08:00" dan "WIB"
  const timeVal = invitation.eventTime?.substring(0, 5) || "08:00";
  const zoneVal = invitation.eventTime?.substring(6) || "WIB";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Gabungkan time dan zone untuk eventTimeDisplay
    const displayTime = `${formData.get("eventTime")} ${formData.get("eventZone")}`;
    formData.append("eventTimeDisplay", displayTime);

    startTransition(async () => {
      const result = await updateClientDetails(invitation.id, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Data berhasil disimpan! Undangan telah diperbarui.");
      }
    });
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg text-slate-800">Detail Acara & Mempelai</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Nama Lengkap Pria</Label>
              <Input name="groomName" defaultValue={invitation.groomName} required className="text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Panggilan Pria</Label>
              <Input name="groomNick" defaultValue={invitation.groomNick} required className="text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Nama Lengkap Wanita</Label>
              <Input name="brideName" defaultValue={invitation.brideName} required className="text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Panggilan Wanita</Label>
              <Input name="brideNick" defaultValue={invitation.brideNick} required className="text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t pt-4 mt-2 border-slate-100">
            <div className="space-y-1 col-span-1">
              <Label className="text-xs">Tanggal Acara</Label>
              <Input type="date" name="eventDate" defaultValue={dateStr} required className="text-sm" />
            </div>
            <div className="space-y-1 col-span-1">
              <Label className="text-xs">Jam Mulai</Label>
              <Input type="time" name="eventTime" defaultValue={timeVal} required className="text-sm" />
            </div>
            <div className="space-y-1 col-span-1">
              <Label className="text-xs">Zona</Label>
              <select name="eventZone" defaultValue={zoneVal} className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
                <option value="WIB">WIB</option><option value="WITA">WITA</option><option value="WIT">WIT</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Lokasi Acara</Label>
            <Input name="location" defaultValue={invitation.location} required className="text-sm" placeholder="Gedung, Alamat lengkap..." />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Link Google Maps</Label>
            <Input name="mapUrl" defaultValue={invitation.mapUrl || ""} className="text-sm" placeholder="https://maps.google.com/..." />
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-slate-900 text-white mt-4">
            {isPending ? "Menyimpan..." : <><Save className="w-4 h-4 mr-2"/> Simpan Perubahan</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}