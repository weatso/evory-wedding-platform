'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// READ: Cari tamu by Kode Unik
export async function getGuestByCode(code: string) {
    const session = await auth();
    if (!session?.user) return { error: "Silakan login terlebih dahulu." };

    if (!code) return { error: "Kode kosong." };

    const guest = await prisma.guest.findUnique({
        where: { guestCode: code }
    });

    if (!guest) return { error: "Kode Tamu Tidak Ditemukan." };

    return { guest };
}

// WRITE: Check-in Tamu
export async function checkInGuest(guestId: string, actualPax: number) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        await prisma.guest.update({
            where: { id: guestId },
            data: {
                checkInTime: new Date(),
                actualPax: actualPax
            }
        });

        revalidatePath("/dashboard/live"); // Update dashboard monitoring
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Gagal menyimpan data." };
    }
}