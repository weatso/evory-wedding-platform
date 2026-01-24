'use server';

import { prisma } from "@/lib/prisma"; //
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * SCHEMA VALIDASI (ZOD)
 */
const RsvpSchema = z.object({
  guestId: z.string().min(1, "Guest ID wajib diisi"),
  status: z.enum(["ATTENDING", "DECLINED"]),
  pax: z.coerce.number().min(1, "Minimal 1 orang").max(10, "Maksimal 10 orang"),
  message: z.string().optional(),
});

export async function submitRsvp(formData: FormData) {
  const rawData = {
    guestId: formData.get("guestId"),
    status: formData.get("status"),
    pax: formData.get("pax"),
    message: formData.get("message"),
  };

  const validated = RsvpSchema.safeParse(rawData);

  // PERBAIKAN: Gunakan validated.error.issues untuk mengambil pesan error
  if (!validated.success) {
    return { 
      success: false, 
      error: validated.error.issues[0].message 
    };
  }

  const { guestId, status, pax, message } = validated.data;

  try {
    // SECURITY AUDIT: Ambil jatah kursi tamu
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { 
        id: true, 
        totalPaxAllocated: true, 
        invitationId: true,
        invitation: { select: { slug: true } }
      }
    });

    if (!guest) {
      return { success: false, error: "Data tamu tidak ditemukan." };
    }

    // CEK KUOTA: Cegah tamu membawa orang melebihi jatah
    if (status === "ATTENDING" && pax > guest.totalPaxAllocated) {
      return { 
        success: false, 
        error: `Maaf, jumlah tamu melebihi jatah kursi (${guest.totalPaxAllocated} pax).` 
      };
    }

    // UPDATE DATABASE
    await prisma.$transaction(async (tx) => {
      await tx.guest.update({
        where: { id: guestId },
        data: {
          rsvpStatus: status,
          pax: status === "ATTENDING" ? pax : 0,
          isCheckedIn: status === "ATTENDING" ? undefined : false,
          checkInTime: status === "ATTENDING" ? undefined : null,
        },
      });

      if (message && message.trim().length > 0) {
        await tx.wish.create({
          data: {
            message: message.trim(),
            guestId: guest.id,
            invitationId: guest.invitationId,
          },
        });
      }
    });

    revalidatePath(`/invitation/${guest.invitation.slug}`);
    
    return { success: true };

  } catch (error) {
    console.error("Critical RSVP Error:", error);
    return { 
      success: false, 
      error: "Gagal memproses RSVP. Silakan coba lagi." 
    };
  }
}