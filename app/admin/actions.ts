// app/admin/actions.ts

'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const UpdateInvitationSchema = z.object({
  groomName: z.string().min(1),
  groomNick: z.string().min(1),
  brideName: z.string().min(1),
  brideNick: z.string().min(1),
  slug: z.string().min(3),
  
  eventDate: z.string(),   
  selectedTime: z.string(), 
  selectedZone: z.string(), 
  
  location: z.string().min(1),
});

export async function updateInvitation(invitationId: string, prevState: any, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  const rawData = {
    groomName: formData.get("groomName"),
    groomNick: formData.get("groomNick"),
    brideName: formData.get("brideName"),
    brideNick: formData.get("brideNick"),
    slug: formData.get("slug"),
    
    eventDate: formData.get("eventDate"),
    selectedTime: formData.get("selectedTime"),
    selectedZone: formData.get("selectedZone"),
    
    location: formData.get("location"),
  };

  const validated = UpdateInvitationSchema.safeParse(rawData);
  if (!validated.success) return { error: "Data form tidak valid/lengkap." };

  const data = validated.data;

  // LOGIKA PENGGABUNGAN TANGGAL & JAM
  const displayTimeString = `${data.selectedTime} ${data.selectedZone}`;
  
  // Hati-hati: Pastikan format tanggal valid YYYY-MM-DD + T + HH:mm:00
  const combinedDateTimeString = `${data.eventDate}T${data.selectedTime}:00`;
  const realEventDate = new Date(combinedDateTimeString);

  // Validasi jika tanggal hasilnya Invalid (NaN)
  if (isNaN(realEventDate.getTime())) {
      return { error: "Format Tanggal/Jam tidak valid." };
  }

  try {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        groomName: data.groomName,
        groomNick: data.groomNick,
        brideName: data.brideName,
        brideNick: data.brideNick,
        slug: data.slug,
        location: data.location,
        
        eventDate: realEventDate,       
        eventTime: displayTimeString,   
      },
    });

    revalidatePath("/admin");
    revalidatePath(`/invitation/${data.slug}`);
  } catch (error: any) {
    console.error("Update Error:", error);
    
    // --- PERBAIKAN DI SINI ---
    // Cek apakah error karena SLUG duplikat (kode P2002 di Prisma)
    if (error.code === 'P2002') {
        return { error: "Gagal: URL Slug ini sudah dipakai orang lain." };
    }

    // Jika bukan slug, tampilkan error aslinya agar kita tahu masalahnya
    return { error: "System Error: " + error.message };
  }

  redirect("/admin");
}