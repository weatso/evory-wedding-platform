"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- SKEMA PERTAHANAN ZOD (Karantina Data) ---
const RsvpSchema = z.object({
  invitationId: z.string().min(1, "ID Undangan tidak valid."),
  guestId: z.string().nullable(),
  // Transformasi: potong spasi awal/akhir, batasi maksimal 100 karakter
  name: z.string().max(100, "Nama maksimal 100 karakter.").transform((val) => val.trim()),
  // PERBAIKAN 1: Gunakan sintaks standar pesan error Zod
  // PERBAIKAN FINAL: Gunakan 'message' sesuai permintaan strict type Zod Anda
  status: z.enum(["ATTENDING", "DECLINED"], {
    message: "Status kehadiran wajib dipilih dan tidak boleh dimanipulasi."
  }),
  // Transformasi: batasi pesan maksimal 500 karakter untuk mencegah spam database
  message: z.string().max(500, "Ucapan maksimal 500 karakter.").transform((val) => val.trim()),
}).superRefine((data, ctx) => {
  // Aturan Mutlak: Jika tamu publik (guestId null), nama setelah di-trim tidak boleh kosong
  if (!data.guestId && data.name.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Nama wajib diisi dan tidak boleh hanya spasi.",
      path: ["name"]
    });
  }
});

// Helper sederhana untuk bikin kode unik acak (Format: PUB-XXXXXX)
function generateGuestCode() {
  return `PUB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// --- FUNGSI SUBMIT RSVP ---
export async function submitRsvp(
  invitationId: string,
  guestId: string | null,
  name: string,
  status: "ATTENDING" | "DECLINED", 
  message: string
) {
  try {
    // 1. Eksekusi Validasi Brutal
    const validatedData = RsvpSchema.safeParse({ invitationId, guestId, name, status, message });
    
    if (!validatedData.success) {
      // PERBAIKAN 2: Gunakan 'issues' alih-alih 'errors' agar TypeScript patuh
      throw new Error(validatedData.error.issues[0].message);
    }

    // Ambil data yang sudah dibersihkan (di-trim dan diverifikasi)
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
            invitationId: cleanData.invitationId,
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
            invitationId: cleanData.invitationId,
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