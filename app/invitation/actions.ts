'use server';

import { prisma } from "@/lib/prisma"; // Pastikan path ini sesuai dengan file prisma client Anda
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema Validasi Input
const RsvpSchema = z.object({
  guestId: z.string().min(1),
  status: z.enum(["ATTENDING", "DECLINED"]),
  pax: z.coerce.number().min(1).max(10).default(1), // Pastikan angka valid
  message: z.string().optional(),
});

export async function submitRsvp(formData: FormData) {
  // 1. Parsing data dari FormData
  const rawData = {
    guestId: formData.get("guestId"),
    status: formData.get("status"),
    pax: formData.get("pax"),
    message: formData.get("message"),
  };

  // 2. Validasi menggunakan Zod
  const validated = RsvpSchema.safeParse(rawData);

  if (!validated.success) {
    console.error("Validation Error:", validated.error);
    return { success: false, error: "Input data tidak valid." };
  }

  const { guestId, status, pax, message } = validated.data;

  try {
    // 3. Update Status Tamu & Ambil Slug Undangan (untuk revalidate)
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        rsvpStatus: status,
        // Jika status DECLINED (tidak hadir), pax otomatis jadi 0 di database
        pax: status === "ATTENDING" ? pax : 0, 
        checkInTime: status === "ATTENDING" ? undefined : null, // Reset check-in jika batal hadir
      },
      include: {
        invitation: {
          select: { slug: true } // Ambil slug agar refresh halaman akurat
        }
      }
    });

    // 4. Simpan Ucapan (Hanya jika ada pesan & status HADIR/DECLINED sukses)
    if (message && message.trim().length > 0) {
      await prisma.wish.create({
        data: {
          message: message,
          guestId: updatedGuest.id,
          invitationId: updatedGuest.invitationId,
        },
      });
    }

    // 5. Refresh Halaman Spesifik
    // Ini lebih akurat daripada sekadar revalidatePath('/invitation')
    revalidatePath(`/invitation/${updatedGuest.invitation.slug}`);
    
    return { success: true };

  } catch (error) {
    console.error("Database Error saat RSVP:", error);
    return { success: false, error: "Terjadi kesalahan sistem. Silakan coba lagi." };
  }
}