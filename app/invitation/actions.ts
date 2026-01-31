"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- FUNGSI UTAMA RSVP (Dipanggil dari Template) ---
export async function submitRsvp(
  guestId: string, 
  status: "ATTENDING" | "DECLINED", 
  message?: string
) {
  try {
    // 1. Validasi Input Dasar
    if (!guestId) throw new Error("Guest ID wajib diisi.");
    if (!status) throw new Error("Status kehadiran wajib dipilih.");

    // 2. Ambil Data Tamu (Untuk Cek Kuota & ID Undangan)
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { 
        id: true, 
        totalPaxAllocated: true, 
        invitationId: true,
        invitation: { select: { slug: true } }
      }
    });

    if (!guest) throw new Error("Data tamu tidak ditemukan.");

    // 3. Tentukan Jumlah Pax (Kursi yang terpakai)
    // Jika Hadir -> Pakai jatah maksimal (atau bisa diubah nanti jika ada input manual)
    // Jika Tidak Hadir -> 0
    const paxToUpdate = status === "ATTENDING" ? guest.totalPaxAllocated : 0;

    // 4. Eksekusi Database (Transaction)
    await prisma.$transaction(async (tx) => {
      // A. Update Status Tamu
      await tx.guest.update({
        where: { id: guestId },
        data: {
          rsvpStatus: status,
          pax: paxToUpdate,
          // Reset status check-in jika tamu batal hadir
          isCheckedIn: status === "ATTENDING" ? undefined : false,
          checkInTime: status === "ATTENDING" ? undefined : null,
        },
      });

      // B. Simpan Ucapan (Jika ada pesan)
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

    // 5. Refresh Halaman (Agar data terbaru muncul)
    revalidatePath(`/invitation/${guest.invitation.slug}`); // Refresh Halaman Undangan
    revalidatePath(`/dashboard`); // Refresh Dashboard Admin/Client
    
    return { success: true };

  } catch (error) {
    console.error("RSVP Error:", error);
    // Kembalikan error sebagai string agar bisa ditangkap di frontend
    throw new Error(error instanceof Error ? error.message : "Gagal menyimpan RSVP.");
  }
}

// --- FUNGSI TAMBAHAN (Opsional) ---
export async function sendWish(invitationId: string, message: string) {
  if (!message || message.trim() === "") return;
  
  await prisma.wish.create({
    data: {
      message: message.trim(),
      invitationId,
    }
  });
  revalidatePath(`/invitation`);
}