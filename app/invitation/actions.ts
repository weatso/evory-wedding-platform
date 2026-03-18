"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- SKEMA PERTAHANAN ZOD (Karantina Data) ---
const RsvpSchema = z.object({
  projectId: z.string().min(1, "ID Proyek tidak valid."), // PERBAIKAN: invitationId -> projectId
  guestId: z.string().nullable(),
  name: z.string().max(100, "Nama maksimal 100 karakter.").transform((val) => val.trim()),
  status: z.enum(["ATTENDING", "DECLINED"], {
    message: "Status kehadiran wajib dipilih dan tidak boleh dimanipulasi."
  }),
  message: z.string().max(500, "Ucapan maksimal 500 karakter.").transform((val) => val.trim()),
}).superRefine((data, ctx) => {
  if (!data.guestId && data.name.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Nama wajib diisi dan tidak boleh hanya spasi.",
      path: ["name"]
    });
  }
});

function generateGuestCode() {
  return `PUB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// --- FUNGSI SUBMIT RSVP ---
export async function submitRsvp(
  projectId: string, // PERBAIKAN: invitationId -> projectId
  guestId: string | null,
  name: string,
  status: "ATTENDING" | "DECLINED", 
  message: string
) {
  try {
    const validatedData = RsvpSchema.safeParse({ projectId, guestId, name, status, message });
    
    if (!validatedData.success) {
      throw new Error(validatedData.error.issues[0].message);
    }

    const cleanData = validatedData.data;
    let finalGuestId = cleanData.guestId;

    // 2. LOGIKA DATABASE (TRANSACTION)
    await prisma.$transaction(async (tx) => {
      
     // KASUS A: TAMU LAMA (Punya ID Unik dari Link)
      if (cleanData.guestId) {
        const existingGuest = await tx.guest.findUnique({
          where: { id: cleanData.guestId }
        });

        if (!existingGuest) throw new Error("Data tamu tidak ditemukan.");

        // PERTAHANAN IDOR MUTLAK
        if (existingGuest.projectId !== cleanData.projectId) { // PERBAIKAN: invitationId -> projectId
          throw new Error("Security Breach: ID Tamu tidak memiliki otoritas pada acara ini.");
        }

        await tx.guest.update({
          where: { id: cleanData.guestId },
          data: {
            rsvpStatus: cleanData.status,
            pax: cleanData.status === "ATTENDING" ? existingGuest.totalPaxAllocated : 0,
            isCheckedIn: cleanData.status === "ATTENDING" ? undefined : false,
            name: cleanData.name && cleanData.name !== existingGuest.name ? cleanData.name : undefined, 
          }
        });
        finalGuestId = cleanData.guestId;
      }
      
      // KASUS B: TAMU BARU (Publik / Link Umum)
      else {
        const newGuest = await tx.guest.create({
          data: {
            projectId: cleanData.projectId, // PERBAIKAN: invitationId -> projectId
            name: cleanData.name,
            guestCode: generateGuestCode(), 
            category: "Public", 
            rsvpStatus: cleanData.status, 
            totalPaxAllocated: 1, 
            pax: cleanData.status === "ATTENDING" ? 1 : 0
          }
        });
        finalGuestId = newGuest.id;
      }

      // 3. SIMPAN UCAPAN (WISH)
      if (cleanData.message.length > 0 && finalGuestId) {
        await tx.wish.create({
          data: {
            message: cleanData.message,
            guestId: finalGuestId,
            projectId: cleanData.projectId, // PERBAIKAN: invitationId -> projectId
          }
        });
      }
    });

    // 4. REFRESH HALAMAN
    revalidatePath("/dashboard");
    revalidatePath(`/invitation/[slug]`, "page"); 
    
    return { success: true };

  } catch (error) {
    console.error("RSVP Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menyimpan data." };
  }
}