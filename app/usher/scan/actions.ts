'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
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
    if (!session?.user) return { error: "Login required" };
    if (!code) return { error: "Kode kosong" };

    // Cari tamu by Code atau Token
    const guest = await prisma.guest.findFirst({
        where: {
            OR: [
                { guestCode: code }, 
                { token: code }
            ]
        }
    });

    if (!guest) return { error: "Tamu tidak ditemukan." };

    // VALIDASI PENTING: Cek apakah tamu ini milik acara yang sedang discan?
    if (eventId && guest.invitationId !== eventId) {
        return { 
            error: "SALAH ACARA! Tamu ini terdaftar di undangan lain, bukan acara ini." 
        };
    }

    return { guest };
}

// 2. CHECK-IN
export async function checkInGuest(guestId: string, actualPax: number) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const updated = await prisma.guest.update({
            where: { id: guestId },
            data: {
                checkInTime: new Date(),
                actualPax: actualPax
            }
        });

        revalidatePath("/dashboard/live");
        return { success: true, guestName: updated.name };
    } catch (e) {
        console.error(e);
        return { error: "Gagal menyimpan data." };
    }
}