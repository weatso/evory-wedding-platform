'use server';

import { auth } from "@/auth"; 
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";

// Helper: Ambil Nama Acara untuk Judul Scanner
export async function getEventDetail(invitationId: string) {
    const inv = await prisma.invitation.findUnique({
        where: { id: invitationId },
        select: { groomNick: true, brideNick: true }
    });
    return inv;
}

// 1. CARI TAMU (Dengan Validasi Event ID)
export async function getGuestByCode(code: string, eventId?: string) {
    const session = await auth();
    if (!session?.user) return { error: "Sesi habis, silakan login ulang." };
    if (!code) return { error: "Kode kosong" };

    const guest = await prisma.guest.findUnique({
        where: { guestCode: code } 
    });

    if (!guest) return { error: "Kode Tamu tidak ditemukan." };

    // Validasi Acara
    if (eventId && guest.invitationId !== eventId) {
        return { 
            error: "⛔ SALAH ACARA! Tamu ini terdaftar di undangan lain." 
        };
    }

    return { guest };
}

// 2. CHECK-IN
export async function checkInGuest(guestId: string, actualPax: number) {
    const session = await auth();
    // Validasi Role
    if (!session?.user || (session.user.role !== "USHER" && session.user.role !== "ADMIN")) {
        return { error: "Akses Ditolak: Anda bukan Usher." };
    }

    try {
        const updated = await prisma.guest.update({
            where: { id: guestId },
            data: {
                isCheckedIn: true, 
                checkInTime: new Date(),
                // PERBAIKAN DI SINI:
                // Nama kolom di database adalah 'pax', bukan 'actualPax'
                pax: actualPax 
            }
        });

        revalidatePath("/dashboard/live");
        return { success: true, guestName: updated.name };
    } catch (e) {
        console.error("Checkin Error:", e);
        return { error: "Gagal menyimpan data ke database." };
    }
}