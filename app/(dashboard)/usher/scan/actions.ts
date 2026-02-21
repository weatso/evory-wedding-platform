// File: app/(dashboard)/usher/scan/actions.ts
'use server';

import { auth } from "@/auth"; 
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";

// Helper: Ambil Nama Acara & PIN (PIN tidak dikirim ke client demi keamanan, dicek di server)
export async function getEventDetail(invitationId: string) {
    return await prisma.invitation.findUnique({
        where: { id: invitationId },
        select: { groomNick: true, brideNick: true }
    });
}

// 1. CARI TAMU (Read Only)
export async function getGuestByCode(code: string, eventId: string) {
    const session = await auth();
    if (!session?.user) return { error: "Sesi habis." };

    const guest = await prisma.guest.findUnique({
        where: { guestCode: code },
        include: { invitation: { select: { id: true } } } // Cek relasi
    });

    if (!guest) return { error: "Kode Tamu tidak ditemukan." };
    if (guest.invitationId !== eventId) return { error: "⛔ SALAH ACARA!" };

    return { guest };
}

// 2. PROSES CHECK-IN (Write dengan Logic PIN)
// Mode: 'FIRST' (pertama kali) atau 'ADD' (susulan)
export async function processCheckIn(
    guestId: string, 
    inputPax: number, 
    mode: 'FIRST' | 'ADD',
    pin?: string
) {
    const session = await auth();
    // Validasi Role Usher/Admin
    if (!session?.user || (session.user.role !== "USHER" && session.user.role !== "ADMIN")) {
        return { error: "Akses Ditolak." };
    }

    const guest = await prisma.guest.findUnique({
        where: { id: guestId },
        include: { invitation: true }
    });

    if (!guest) return { error: "Data tamu hilang." };

    // --- HITUNG LOGIKA PAX ---
    let newPaxTotal = inputPax;
    
    // Jika Mode ADD (Susulan), pax dijumlahkan dengan yang sudah ada
    if (mode === 'ADD') {
        newPaxTotal = guest.pax + inputPax;
    }

    // --- LOGIKA VALIDASI PIN ---
    const isOverQuota = newPaxTotal > guest.totalPaxAllocated;
    const isUpdateData = mode === 'ADD'; // Sesuai request: Update data susulan butuh PIN

    // Jika Over Quota ATAU Update Data (Susulan), WAJIB pakai PIN
    if (isOverQuota || isUpdateData) {
        if (!pin) {
            return { error: "PIN diperlukan untuk aksi ini.", requirePin: true };
        }
        // Cek Kesesuaian PIN
        if (pin !== guest.invitation.checkInPin) {
            return { error: "PIN SALAH! Akses ditolak.", requirePin: true };
        }
    }

    try {
        const updated = await prisma.guest.update({
            where: { id: guestId },
            data: {
                isCheckedIn: true, 
                checkInTime: new Date(), // Update waktu checkin terakhir
                pax: newPaxTotal,
                checkedInBy: session.user.name || session.user.email // Audit Trail
            }
        });

        revalidatePath("/dashboard/live");
        return { 
            success: true, 
            guestName: updated.name, 
            totalPax: updated.pax,
            msg: mode === 'ADD' ? `Berhasil tambah +${inputPax} pax` : `Check-in Sukses (${inputPax} pax)`
        };
    } catch (e) {
        return { error: "Database Error" };
    }
}