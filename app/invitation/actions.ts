"use server";

import { prisma } from "@/lib/prisma"; // Pastikan path ini benar (bisa @/lib/db)
import { revalidatePath } from "next/cache";

// Helper sederhana untuk bikin kode unik acak (Format: PUB-XXXXXX)
function generateGuestCode() {
  return `PUB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// --- FUNGSI SUBMIT RSVP ---
export async function submitRsvp(
  invitationId: string,
  guestId: string | null, // Bisa NULL jika tamu umum
  name: string,
  status: "ATTENDING" | "DECLINED", 
  message: string
) {
  try {
    // 1. Validasi Input Dasar
    if (!status) throw new Error("Status kehadiran wajib dipilih.");
    
    // Jika Tamu Umum, Nama Wajib Diisi
    if (!guestId && !name) throw new Error("Nama wajib diisi untuk tamu umum.");

    let finalGuestId = guestId;

    // 2. LOGIKA DATABASE (TRANSACTION)
    await prisma.$transaction(async (tx) => {
      
      // KASUS A: TAMU LAMA (Punya ID Unik dari Link) -> Logic Kode Lama Anda
      if (guestId) {
        const existingGuest = await tx.guest.findUnique({
          where: { id: guestId }
        });

        if (!existingGuest) throw new Error("Data tamu tidak ditemukan.");

        // Update data tamu (Hanya update status & pax, tidak perlu guestCode baru)
        await tx.guest.update({
          where: { id: guestId },
          data: {
            rsvpStatus: status,
            pax: status === "ATTENDING" ? existingGuest.totalPaxAllocated : 0,
            isCheckedIn: status === "ATTENDING" ? undefined : false,
            // Update nama jika user mengeditnya
            name: name && name !== existingGuest.name ? name : undefined, 
          }
        });
        finalGuestId = guestId;
      } 
      
      // KASUS B: TAMU BARU (Publik / Link Umum) -> Logic Baru
      else {
        // Kita WAJIB generate guestCode karena di Schema Prisma field ini Required
        const newGuest = await tx.guest.create({
          data: {
            invitationId: invitationId,
            name: name,
            guestCode: generateGuestCode(), // <--- SOLUSI ERROR: Generate kode unik
            category: "Public", 
            rsvpStatus: status, 
            totalPaxAllocated: 1, // Default 1 orang
            pax: status === "ATTENDING" ? 1 : 0
          }
        });
        finalGuestId = newGuest.id;
      }

      // 3. SIMPAN UCAPAN (WISH)
      if (message && message.trim().length > 0 && finalGuestId) {
        await tx.wish.create({
          data: {
            message: message.trim(),
            guestId: finalGuestId,
            invitationId: invitationId,
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